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

app.get('/books', (req, res) => {
    db.query('Select * FROM book', (err, results) => {
        if (err) return res.status(500).json({erro:'Erro ao obter livros'});
        res.status(200).json(results);
    });
});

app.post ('/books', (req,res) =>{
    const{title, isbn, genre, review, synopsis, pages, price, published, comments} = req.body;
    if(!title || !isbn || !genre || !review || !synopsis || !pages || !price || !published){
        return res.status(400).json({erro: 'Todos os campos são obrigatórios'})
    }

    const query = 'INSERT INTO book (title, isbn, genre, review, synopsis, pages, price, published, comments) VALUES (?,?,?,?,?,?,?,?,?)';
    db.query (query, [title, isbn, genre, review, synopsis, pages, price, published, comments ||'[]'] , (err, results) => {
        if (err){
            return res.status(500).json({erro: 'Erro ao adicionar livro'});
        }
        res.status(201).json({mensagem: 'Livro adicionado com sucesso', id: results.insertId});
    });
});

app.get ('/books/genre/:genre', (req,res)=>{
    db.query('SELECT * FROM book WHERE genre=?', [req.params.genre], (err, results) =>{
        if (err) return res.status(500).json({erro: 'Erro ao obter livros'});
        if (results.length === 0) return res.status(404).json({erro: 'Nenhum livro encontrado para este género'});
        res.status(200).json(results);
    });
});

app.patch ('/books/discount/:id', (req, res) => {
    const {desconto} = req.query;
    if (!desconto || isNaN(desconto) || desconto < 0 || desconto > 100) {
    return res.status(400).json ({erro: 'Desconto inválido. Deve de ser um valor entre 0 e 100.'});
    };

    const query = 'UPDATE book SET price = ROUND(price - (price*?/100)) WHERE id_livro = ?';
    db.query(query, [desconto, req.params.id], (err, results) =>{
    
    if (err) return res.status(500).json ({erro: 'Erro ao atualizar preço.'});
    if (results.affectedRows === 0) return res.status(404).json({erro: 'Livro não encontrado.'});

    res.status(200).json({mensagem: 'Preço atualizado com sucesso.'});
    });
});

app.get ('/books/before/:published', (req, res) =>{
    db.query('SELECT * from book WHERE published < ?', [req.params.published], (err,results) => {
        if (err) return res.status(500).json({erro: 'Erro ao obter livros'});
        if (results.length === 0) return res.status(404).json({erro: 'Nenhum livro encontrado antes da data.'});
        
        res.status(200).json(results);
    });
});

app.get ('/book', (req, res) => { 
    if (!req.query.id) return res.status(400).json({erro: 'O id é obrigatório.'});

    db.query('SELECT * FROM book WHERE id_livro = ?', [req.query.id], (err, results) =>{
        if (err) return res.status(500).json({erro: 'Erro ao obter livro.'});
        res.status(200).json(results[0]);
    });
});

app.delete ('/books/:id', (req, res)  =>{
    db.query('DELETE FROM book WHERE id_livro = ?', [req.params.id], (err,result) =>{
        if (err) return res.status(500).json({erro: 'Erro ao apagar livro.'});
        if (result.affectedRows === 0) return res.status(404).json({erro: 'O id não existe'});

        res.status(200).json({mensagem: 'Livro apagado com sucesso.'});
    });
});

app.post ('/books/search', (req, res) => {
    if (!req.body.keyword) return res.status(400).json({erro: 'Palavra-chave (keyword) é obrigatória no body.'});

    db.query('SELECT * FROM book WHERE synopsis LIKE ?', [`%${req.body.keyword}%`], (err, results) => {
        if (err) return res.status(500).json({erro: 'Erro na pesquisa.'});
        res.status(200).json(results);
    });
});

app.put ('/books/comment', (req, res) => {
    if (!req.query.id) return res.status(400).json({erro: 'O id é obrigatório.'});
    if (!req.body.novoComentario) return res.status(400).json({erro: 'O campo novoComentario é obrigatório.'});

    db.query('SELECT comments FROM book WHERE id_livro=?', [req.query.id], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({erro: 'Livro não encontrado'});

        const comments = JSON.parse(results[0].comments || '[]');
        comments.push(req.body.novoComentario);

        db.query('UPDATE book SET comments = ? WHERE id_livro = ?', [JSON.stringify(comments), req.query.id], (err) => {
            if (err) return res.status(500).json({ erro: 'Erro ao guardar comentário' });

            db.query('SELECT * FROM book WHERE id_livro = ?', [req.query.id], (err, finalResult) => {
                res.status(200).json(finalResult[0]);
        
            });
        });
    });
});

app.get ('/books/sort/price', (req, res) => {
    db.query('SELECT * FROM book', (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro ao obter livros' });

        const sortedBooks = results.sort((a, b) => a.price - b.price);
        res.status(200).json(sortedBooks);
    });
});

// Iniciar o servidor
app.listen(3000, () => {
    console.log('Servidor a correr na porta 3000');
});
