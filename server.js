const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json());

// liga à base de dados
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Caovermelho1.',
    database: 'gestao_livros'
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao ligar à base de dados:', err);
        return;
    }
    console.log('Ligado à base de dados MySQL!');
});

// listar os livros
app.get('/books', (req, res) => {
    const query = 'SELECT * FROM Book';
    
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro ao obter livros' });
        }
        res.status(200).json(results);
    });
});

// adicionar um livro
app.post('/books', (req, res) => {
    const { title, isbn, genre, review, synopsis, pages, price, published, comment } = req.body;

    if (!title || !isbn || !genre || !review || !synopsis || !pages || !price || !published) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
    }

    const query = 'INSERT INTO Book (title, isbn, genre, review, synopsis, pages, price, published, comment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [title, isbn, genre, review, synopsis, pages, price, published, comment || '[]'];

    db.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro ao adicionar livro' });
        }
        res.status(201).json({ mensagem: 'Livro adicionado com sucesso!', id: result.insertId });
    });
});

//listar livros por género
app.get('/books/genre/:genre', (req, res) => {
    const { genre } = req.params;

    const query = 'SELECT * FROM Book WHERE genre = ?';

    db.query(query, [genre], (err, results) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro ao obter livros' });
        }
        if (results.length === 0) {
            return res.status(404).json({ erro: 'Nenhum livro encontrado para este género' });
        }
        res.status(200).json(results);
    });
});

// aplica desconto
app.patch('/books/discount/:id', (req, res) => {
    const { id } = req.params;
    const { desconto } = req.query;

    if (!desconto || isNaN(desconto) || desconto < 0 || desconto > 100) {
        return res.status(400).json({ erro: 'Desconto inválido. Deve ser um número entre 0 e 100' });
    }

    const querySelect = 'SELECT * FROM Book WHERE id = ?';

    db.query(querySelect, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro ao obter livro' });
        }
        if (results.length === 0) {
            return res.status(404).json({ erro: 'Livro não encontrado' });
        }

        const precoAtual = results[0].price;
        const novoPreco = Math.round(precoAtual - (precoAtual * desconto / 100));

        const queryUpdate = 'UPDATE Book SET price = ? WHERE id = ?';

        db.query(queryUpdate, [novoPreco, id], (err) => {
            if (err) {
                return res.status(500).json({ erro: 'Erro ao atualizar preço' });
            }
            res.status(200).json({ mensagem: 'Desconto aplicado com sucesso!', precoAntigo: precoAtual, novoPreco: novoPreco });
        });
    });
});

// inicia o servidor
app.listen(3000, () => {
    console.log('Servidor a correr na porta 3000');
});