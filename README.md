# Sistema de Restaurante (Express + MySQL)

Sistema simples para controlar mesas, cardápio e pedidos.

## Como rodar

1. **Crie o banco**: abra o arquivo `database.sql` no MySQL Workbench (ou terminal) e execute tudo.
2. **Configure a senha**: no arquivo `db.js`, coloque o usuário e a senha do seu MySQL.
3. **Instale as dependências** (no terminal, dentro da pasta do projeto):
   ```
   npm install
   ```
4. **Inicie o servidor**:
   ```
   npm start
   ```
5. Abra no navegador: http://localhost:3000

## Estrutura

```
app.js          → todas as rotas do sistema
db.js           → conexão com o MySQL
database.sql    → criação das tabelas + dados de exemplo
views/          → páginas (EJS)
public/style.css→ visual
```

## Tabelas

- **produto**: itens do cardápio (nome, preço, categoria)
- **mesa**: número e status (livre / ocupada)
- **pedido**: pedido de uma mesa (aberto / fechado)
- **item_pedido**: produtos de cada pedido, com quantidade e observação

## Funcionalidades

- Ver mesas livres e ocupadas
- Abrir pedido para uma mesa
- Adicionar e remover itens do pedido
- Total calculado automaticamente
- Fechar pedido e liberar a mesa
- Cadastrar, editar e excluir produtos
- Histórico de pedidos
