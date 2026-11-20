// Conexão com o MySQL
// Altere usuário e senha conforme o seu MySQL
const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',          // coloque aqui a senha do seu MySQL
  database: 'restaurante'
});

module.exports = db;
