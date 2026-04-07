CREATE DATABASE gestao_livros;
USE  gestao_livros;

CREATE TABLE book (
	id_livro int primary key auto_increment,
    title varchar(50),
    isbn varchar(50),
    genre varchar(50),
    review int,
    synopsis varchar(500),
    pages int,
    price int,
    published date,
    comments varchar(500)
);

insert into book (title, isbn, genre, review, synopsis, pages, price, published, comments)
values ('Harry Potter e a Pedra Filosofal', '978-0439708180', 'Fantasia', 5, 'Um jovem bruxo descobre os seus poderes e entra para a escola de magia Hogwarts', 309, 15, '1997-06-26', '[]'),
('O Codigo Da Vinci', '978-0307474278', 'Misterio', 4, 'Um simbologista descobre um misterio religioso escondido numa obra de arte', 454, 12, '2003-03-18', '[]'),
('O Senhor dos Aneis', '978-0261103573', 'Fantasia', 5, 'Uma jornada epica para destruir o Um Anel e salvar a Terra Media', 1178, 20, '1954-07-29', '[]')