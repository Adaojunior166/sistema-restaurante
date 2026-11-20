const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();

app.set('view engine', 'ejs');                                  // usa EJS para as páginas
app.set('views', path.join(__dirname, 'views'));                // pasta das páginas
app.use(express.urlencoded({ extended: true }));                // lê dados dos formulários
app.use(express.static(path.join(__dirname, 'public')));        // arquivos CSS

// =============================================
// MESAS (página inicial)
// =============================================

// Lista todas as mesas e o pedido aberto de cada uma (se houver)
app.get('/', async (req, res) => {
  const [mesas] = await db.query(`
    SELECT mesa.*, pedido.id AS pedido_id
    FROM mesa
    LEFT JOIN pedido ON pedido.mesa_id = mesa.id AND pedido.status = 'aberto'
    ORDER BY mesa.numero
  `);
  res.render('mesas', { mesas, erro: req.query.erro });
});

// Cadastra uma nova mesa
app.post('/mesas', async (req, res) => {
  try {
    await db.query('INSERT INTO mesa (numero) VALUES (?)', [req.body.numero]);
    res.redirect('/');
  } catch (e) {
    res.redirect('/?erro=Essa mesa já existe');
  }
});

// Abre um pedido para a mesa e marca a mesa como ocupada
app.post('/mesas/:id/abrir', async (req, res) => {
  const mesaId = req.params.id;
  const [resultado] = await db.query('INSERT INTO pedido (mesa_id) VALUES (?)', [mesaId]);
  await db.query("UPDATE mesa SET status = 'ocupada' WHERE id = ?", [mesaId]);
  res.redirect('/pedidos/' + resultado.insertId);
});

// =============================================
// PEDIDOS
// =============================================

// Histórico de todos os pedidos
app.get('/pedidos', async (req, res) => {
  const [pedidos] = await db.query(`
    SELECT pedido.*, mesa.numero AS mesa_numero,
           COALESCE(SUM(item_pedido.quantidade * produto.preco), 0) AS total
    FROM pedido
    JOIN mesa ON mesa.id = pedido.mesa_id
    LEFT JOIN item_pedido ON item_pedido.pedido_id = pedido.id
    LEFT JOIN produto ON produto.id = item_pedido.produto_id
    GROUP BY pedido.id
    ORDER BY pedido.data_hora DESC
  `);
  res.render('pedidos', { pedidos });
});

// Mostra um pedido com seus itens e o total
app.get('/pedidos/:id', async (req, res) => {
  const [[pedido]] = await db.query(`
    SELECT pedido.*, mesa.numero AS mesa_numero
    FROM pedido JOIN mesa ON mesa.id = pedido.mesa_id
    WHERE pedido.id = ?
  `, [req.params.id]);

  if (!pedido) return res.redirect('/');

  const [itens] = await db.query(`
    SELECT item_pedido.*, produto.nome, produto.preco,
           (item_pedido.quantidade * produto.preco) AS subtotal
    FROM item_pedido
    JOIN produto ON produto.id = item_pedido.produto_id
    WHERE item_pedido.pedido_id = ?
  `, [req.params.id]);

  const [produtos] = await db.query('SELECT * FROM produto ORDER BY categoria, nome');

  // Total calculado na hora: soma dos subtotais
  const total = itens.reduce((soma, item) => soma + Number(item.subtotal), 0);

  res.render('pedido', { pedido, itens, produtos, total });
});

// Adiciona um item ao pedido
app.post('/pedidos/:id/itens', async (req, res) => {
  const { produto_id, quantidade, observacao } = req.body;
  await db.query(
    'INSERT INTO item_pedido (pedido_id, produto_id, quantidade, observacao) VALUES (?, ?, ?, ?)',
    [req.params.id, produto_id, quantidade, observacao]
  );
  res.redirect('/pedidos/' + req.params.id);
});

// Remove um item do pedido
app.post('/itens/:id/remover', async (req, res) => {
  await db.query('DELETE FROM item_pedido WHERE id = ?', [req.params.id]);
  res.redirect('/pedidos/' + req.body.pedido_id);
});

// Fecha o pedido e libera a mesa
app.post('/pedidos/:id/fechar', async (req, res) => {
  const [[pedido]] = await db.query('SELECT * FROM pedido WHERE id = ?', [req.params.id]);
  await db.query("UPDATE pedido SET status = 'fechado' WHERE id = ?", [req.params.id]);
  await db.query("UPDATE mesa SET status = 'livre' WHERE id = ?", [pedido.mesa_id]);
  res.redirect('/');
});

// =============================================
// PRODUTOS (cardápio)
// =============================================

// Lista os produtos
app.get('/produtos', async (req, res) => {
  const [produtos] = await db.query('SELECT * FROM produto ORDER BY categoria, nome');
  res.render('produtos', { produtos, erro: req.query.erro });
});

// Cadastra um produto
app.post('/produtos', async (req, res) => {
  const { nome, preco, categoria } = req.body;
  await db.query('INSERT INTO produto (nome, preco, categoria) VALUES (?, ?, ?)', [nome, preco, categoria]);
  res.redirect('/produtos');
});

// Abre o formulário de edição
app.get('/produtos/:id/editar', async (req, res) => {
  const [[produto]] = await db.query('SELECT * FROM produto WHERE id = ?', [req.params.id]);
  if (!produto) return res.redirect('/produtos');
  res.render('editar-produto', { produto });
});

// Salva a edição
app.post('/produtos/:id/editar', async (req, res) => {
  const { nome, preco, categoria } = req.body;
  await db.query('UPDATE produto SET nome = ?, preco = ?, categoria = ? WHERE id = ?',
    [nome, preco, categoria, req.params.id]);
  res.redirect('/produtos');
});

// Exclui um produto (não deixa excluir se já foi usado em algum pedido)
app.post('/produtos/:id/excluir', async (req, res) => {
  try {
    await db.query('DELETE FROM produto WHERE id = ?', [req.params.id]);
    res.redirect('/produtos');
  } catch (e) {
    res.redirect('/produtos?erro=Esse produto já está em um pedido e não pode ser excluído');
  }
});

// =============================================
// INICIA O SERVIDOR
// =============================================
// Testa a conexão com o MySQL antes de iniciar
db.query('SELECT 1')
  .then(() => {
    app.listen(3000, () => {
      console.log('Conectado ao MySQL!');
      console.log('Servidor rodando em http://localhost:3000');
    });
  })
  .catch((erro) => {
    console.log('\n❌ Não foi possível conectar ao MySQL.');
    console.log('Motivo:', erro.message);
    console.log('Confira o usuário e a senha no arquivo db.js e se o banco "restaurante" foi criado (database.sql).\n');
  });
