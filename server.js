const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json());

// Liga à base de dados
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'gestao_livros'
});

db.connect((err) => {
    if (err) return console.error('Erro ao ligar à base de dados:', err);
    console.log('Ligado à base de dados MySQL!');
});

// Listar os livros
app.get('/books', (req, res) => {
    db.query('SELECT * FROM Book', (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro ao obter livros' });
        res.status(200).json(results);
    });
});

// Adicionar um livro
app.post('/books', (req, res) => {
    const { title, isbn, genre, review, synopsis, pages, price, published, comment } = req.body;

    if (!title || !isbn || !genre || !review || !synopsis || !pages || !price || !published) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
    }

    const query = 'INSERT INTO Book (title, isbn, genre, review, synopsis, pages, price, published, comment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [title, isbn, genre, review, synopsis, pages, price, published, comment || '[]'], (err, result) => {
        if (err) return res.status(500).json({ erro: 'Erro ao adicionar livro' });
        res.status(201).json({ mensagem: 'Livro adicionado com sucesso!', id: result.insertId });
    });
});

// Listar livros por género
app.get('/books/genre/:genre', (req, res) => {
    db.query('SELECT * FROM Book WHERE genre = ?', [req.params.genre], (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro ao obter livros' });
        if (results.length === 0) return res.status(404).json({ erro: 'Nenhum livro encontrado para este género' });
        
        res.status(200).json(results);
    });
});

// Aplica desconto (Simplificado com cálculo direto no SQL)
app.patch('/books/discount/:id', (req, res) => {
    const { desconto } = req.query;

    if (!desconto || isNaN(desconto) || desconto < 0 || desconto > 100) {
        return res.status(400).json({ erro: 'Desconto inválido. Deve ser um número entre 0 e 100' });
    }

    // O próprio SQL calcula o novo preço (ROUND arredonda para número inteiro, como tinhas no JS)
    const query = 'UPDATE Book SET price = ROUND(price - (price * ? / 100)) WHERE id = ?';

    db.query(query, [desconto, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ erro: 'Erro ao atualizar preço' });
        
        // Verifica se o ID existia na base de dados
        if (result.affectedRows === 0) return res.status(404).json({ erro: 'Livro não encontrado' });
        
        res.status(200).json({ mensagem: 'Desconto aplicado com sucesso!' });
    });
});

//Listar livros antes da data
app.get('/books/before/:published', (req, res) => {
    db.query('SELECT * FROM Book WHERE published < ?', [req.params.published], (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro ao obter livros' });
        if (results.length === 0) return res.status(404).json({ erro: 'Nenhum livro encontrado antes desta data' });
        
        res.status(200).json(results);
    });
});





// Iniciar o servidor
app.listen(3000, () => {
    console.log('Servidor a correr na porta 3000');
});