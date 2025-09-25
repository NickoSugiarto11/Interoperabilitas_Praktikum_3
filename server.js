require('dotenv').config(); //Memanggil file .env
const express = require('express'); //Mengimpor library express
const cors = require('cors'); //Mengimpor library cors
const db = require('./database'); //Mengimpor koneksi database
const app = express(); //Membuat aplikasi express
const port = process.env.PORT || 3100; //Mengambil nilai dari variabel PORT di .env atau default 3100

// const port = 3100;

let idSeq = 3;

//Middleware data
app.use(express.json());

//Untuk menjalankan server
// app.listen(port, () => {
//   console.log(`Server berjalan di http://localhost:${port}`);
// });


// PRAKTIKUM 3

// ##########################################################################################

app.get('/status', (req, res) => {  // Endpoint status
    res.json({status: 'OK', message: 'Server is Running', timestamp: new Date()});
});

//MOVIES API

//GET /movies - Mendapatkan semua film
app.get('/movies', (req, res) => {  // Endpoint untuk mendapatkan semua film
    const sql = "SELECT * FROM movies ORDER BY id ASC";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.json({"message":"success", "data":rows});
    });
});

// GET /movies/:id - Mendapatkan film berdasarkan ID
app.get('/movies/:id', (req, res) => {  // Endpoint untuk mendapatkan film berdasarkan ID
    const sql = "SELECT * FROM movies WHERE id = ?";
    const params = [req.params.id];
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.json({"message":"success", "data":row});
    });
});

// POST /movies - Menambahkan film baru
app.post('/movies', (req, res) => {
    const { title, director, year } = req.body || {};
    if (!title || !director || !year) {
        return res.status(400).json({ error: 'title, director, dan year wajib diisi' });
    }
    const newMovie = { id: ++idSeq, title, director, year };
    movies.push(newMovie);
    res.status(201).json(newMovie);
});

// PUT /movies/:id - Memperbarui data film
app.put('/movies/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const movieIndex = movies.findIndex(m => m.id === id);
    if (movieIndex === -1) {
        return res.status(404).json({ error: 'Movie tidak ditemukan' });
    }
    const { title, director, year } = req.body || {};
    const updatedMovie = { id, title, director, year };
    movies[movieIndex] = updatedMovie;
    res.json(updatedMovie);
});

// DELETE /movies/:id - Menghapus film
app.delete('/movies/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const movieIndex = movies.findIndex(m => m.id === id);
    if (movieIndex === -1) {
        return res.status(404).json({ error: 'Movie tidak ditemukan' });
    }
    movies.splice(movieIndex, 1);
    res.status(204).send();
});

//DIRECTORS API

//GET /directors - Mendapatkan semua directors
app.get('/directors', (req, res) => {  // Endpoint untuk mendapatkan semua directors
    const sql = "SELECT * FROM directors ORDER BY id ASC";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.json({"message":"success", "data":rows});
    });
});

//GET /directors/:id - Mendapatkan director berdasarkan ID
app.get('/directors/:id', (req, res) => {  // Endpoint untuk mendapatkan director berdasarkan ID
    const sql = "SELECT * FROM directors WHERE id = ?";
    const params = [req.params.id];
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.json({"message":"success", "data":row});
    });
});

//POST menambahkan directors baru
app.post('/directors', (req, res) => {
    const { name, birthYear } = req.body || {};
    if (!name || !birthYear) {
        return res.status(400).json({ error: 'name dan birthYear wajib diisi' });
    }
    const newDirector = { id: ++idSeq, name, birthYear };
    directors.push(newDirector);
    res.status(201).json(newDirector);
});

//PUT memperbarui directors
app.put('/directors/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const directorIndex = directors.findIndex(d => d.id === id);
    if (directorIndex === -1) {
        return res.status(404).json({ error: 'Director tidak ditemukan' });
    }
    const { name, birthYear } = req.body || {};
    const updatedDirector = { id, name, birthYear };
    directors[directorIndex] = updatedDirector;
    res.json(updatedDirector);
});

//DELETE menghapus directors
app.delete('/directors/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const directorIndex = directors.findIndex(d => d.id === id);
    if (directorIndex === -1) {
        return res.status(404).json({ error: 'Director tidak ditemukan' });
    }
    directors.splice(directorIndex, 1);
    res.status(204).send();
});

//ERROR HANDLER

//Handle error 404 - Not Found
app.use((req, res) => {
    res.status(404).json({error: 'Endpoint not found'});
});

//Informasi server listening
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
})


// ##########################################################################################

//PRAKTIKUM 2

//Array movies
// let movies = [
//     {id: 1, title: 'The Shawshank Redemption', director: 'Nicko Sugiarto', year: 1994},
//     {id: 2, title: 'The Godfather', director: 'Ferdy Sambo', year: 1972}, 
//     {id: 3, title: 'The Dark Knight', director: 'Ultraman', year: 2008},
// ];

//Jika membuka localhost:3100 akan menampilkan pesan berikut

// app.get('/', (req, res) => {
//     res.send('Selamat datang di API Movies');
// });

// app.get('/movies', (req, res) => {
//     res.json(movies);
// });

// //Array directors   
// let directors = [
//     {id: 1, name: 'Frank Darabont', birthYear: 1959},
//     {id: 2, name: 'Francis Ford Coppola', birthYear: 1939},
//     {id: 3, name: 'Christopher Nolan', birthYear: 1970},
// ];

// //Error handler terpusat
// app.use((err, req, res, next) => {
//     console.error('[ERROR]', err);
//     res.status(500).json({ error: 'Terjadi kesalahan pada server' });
// });

// ############################################################################################