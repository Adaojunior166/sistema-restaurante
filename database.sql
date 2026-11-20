-- =============================================
-- Banco de dados do Sistema de Restaurante
-- Rode este arquivo no MySQL (Workbench ou terminal)
-- ATENÇÃO: ele apaga o banco e cria tudo do zero
-- (pode rodar quantas vezes quiser)
-- =============================================

DROP DATABASE IF EXISTS restaurante;
CREATE DATABASE restaurante;
USE restaurante;

-- Itens do cardápio
CREATE TABLE IF NOT EXISTS produto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  categoria VARCHAR(50) NOT NULL
);

-- Mesas do restaurante
CREATE TABLE IF NOT EXISTS mesa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero INT NOT NULL UNIQUE,
  status ENUM('livre', 'ocupada') NOT NULL DEFAULT 'livre'
);

-- Pedidos (cada pedido pertence a uma mesa)
CREATE TABLE IF NOT EXISTS pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mesa_id INT NOT NULL,
  data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('aberto', 'fechado') NOT NULL DEFAULT 'aberto',
  FOREIGN KEY (mesa_id) REFERENCES mesa(id)
);

-- Itens de cada pedido (liga pedido ao produto)
CREATE TABLE IF NOT EXISTS item_pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  produto_id INT NOT NULL,
  quantidade INT NOT NULL DEFAULT 1,
  observacao VARCHAR(255),
  FOREIGN KEY (pedido_id) REFERENCES pedido(id) ON DELETE CASCADE,
  FOREIGN KEY (produto_id) REFERENCES produto(id)
);

-- =============================================
-- Dados de exemplo
-- =============================================

INSERT INTO produto (nome, preco, categoria) VALUES
  ('X-Burguer', 22.00, 'Prato'),
  ('Batata Frita', 15.00, 'Prato'),
  ('Prato Feito', 25.00, 'Prato'),
  ('Refrigerante Lata', 6.00, 'Bebida'),
  ('Suco Natural', 8.00, 'Bebida'),
  ('Pudim', 10.00, 'Sobremesa');

INSERT INTO mesa (numero) VALUES (1), (2), (3), (4), (5);
