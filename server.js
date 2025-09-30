require('dotenv').config(); // Memanggil file .env
const express = require('express');
const cors = require('cors');
const db = require('./database'); // koneksi database SQLite

const app = express();
const port = process.env.PORT || 3100;

// Middleware
app.use(cors());
app.use(express.json());

// STATUS API
app.get('/status', (req, res) => {
    res.json({ status: 'OK', message: 'Server is Running', timestamp: new Date() });
});

// =================================================================
// MOVIES API
// =================================================================

// GET semua movies
app.get('/movies', (req, res) => {
    const sql = "SELECT * FROM movies ORDER BY id ASC";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "success", data: rows });
    });
});

// GET movie by ID
app.get('/movies/:id', (req, res) => {
    const sql = "SELECT * FROM movies WHERE id = ?";
    const params = [req.params.id];
    db.get(sql, params, (err, row) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "success", data: row });
    });
});

// POST tambah movie baru
app.post('/movies', (req, res) => {
    const { title, director, year } = req.body;
    if (!title || !director || !year) {
        return res.status(400).json({ error: 'title, director, dan year wajib diisi' });
    }
    const sql = "INSERT INTO movies (title, director, year) VALUES (?, ?, ?)";
    const params = [title, director, year];
    db.run(sql, params, function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.status(201).json({
            message: "success",
            data: { id: this.lastID, title, director, year }
        });
    });
});

// PUT update movie
app.put('/movies/:id', (req, res) => {
    const { title, director, year } = req.body;
    const sql = "UPDATE movies SET title = ?, director = ?, year = ? WHERE id = ?";
    const params = [title, director, year, req.params.id];
    db.run(sql, params, function (err) {
        if (err) return res.status(400).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Movie tidak ditemukan" });
        res.json({ message: "success", data: { id: req.params.id, title, director, year } });
    });
});

// DELETE movie
app.delete('/movies/:id', (req, res) => {
    const sql = "DELETE FROM movies WHERE id = ?";
    const params = [req.params.id];
    db.run(sql, params, function (err) {
        if (err) return res.status(400).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Movie tidak ditemukan" });
        res.status(204).send();
    });
});

// =================================================================
// DIRECTORS API
// =================================================================

// GET semua directors
app.get('/directors', (req, res) => {
    const sql = "SELECT * FROM directors ORDER BY id ASC";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "success", data: rows });
    });
});

// GET director by ID
app.get('/directors/:id', (req, res) => {
    const sql = "SELECT * FROM directors WHERE id = ?";
    const params = [req.params.id];
    db.get(sql, params, (err, row) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "success", data: row });
    });
});

// POST tambah director baru
app.post('/directors', (req, res) => {
    const { name, birth_year } = req.body;
    if (!name || !birth_year) {
        return res.status(400).json({ error: 'name dan birth_year wajib diisi' });
    }
    const sql = "INSERT INTO directors (name, birth_year) VALUES (?, ?)";
    const params = [name, birth_year];
    db.run(sql, params, function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.status(201).json({
            message: "success",
            data: { id: this.lastID, name, birth_year }
        });
    });
});

// PUT update director
app.put('/directors/:id', (req, res) => {
    const { name, birth_year } = req.body;
    const sql = "UPDATE directors SET name = ?, birth_year = ? WHERE id = ?";
    const params = [name, birth_year, req.params.id];
    db.run(sql, params, function (err) {
        if (err) return res.status(400).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Director tidak ditemukan" });
        res.json({ message: "success", data: { id: req.params.id, name, birth_year } });
    });
});

// DELETE director
app.delete('/directors/:id', (req, res) => {
    const sql = "DELETE FROM directors WHERE id = ?";
    const params = [req.params.id];
    db.run(sql, params, function (err) {
        if (err) return res.status(400).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Director tidak ditemukan" });
        res.status(204).send();
    });
});

// =================================================================
// ERROR HANDLER
// =================================================================
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Jalankan server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
