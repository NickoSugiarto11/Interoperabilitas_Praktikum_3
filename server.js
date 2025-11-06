require('dotenv').config(); // Memanggil file .env
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const authenticateToken = require('./middleware/authMiddleware'); // Middleware autentikasi JWT
const express = require('express');
const cors = require('cors');
const db = require('./database'); // Koneksi database SQLite

const app = express();
const port = process.env.PORT || 3100;

// Middleware
app.use(cors());
app.use(express.json());

// =======================================================
// STATUS API
// =======================================================
app.get('/status', (req, res) => {
  res.json({ status: 'OK', message: 'Server is Running', timestamp: new Date() });
});

// =======================================================
// MOVIES API (dengan autentikasi di POST, PUT, DELETE)
// =======================================================

// GET semua movies (tanpa token)
app.get('/movies', (req, res) => {
  const sql = "SELECT * FROM movies ORDER BY id ASC";
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: "success", data: rows });
  });
});

// GET movie by ID (tanpa token)
app.get('/movies/:id', (req, res) => {
  const sql = "SELECT * FROM movies WHERE id = ?";
  const params = [req.params.id];
  db.get(sql, params, (err, row) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: "success", data: row });
  });
});

// POST tambah movie (dengan token)
app.post('/movies', authenticateToken, (req, res) => {
  console.log('Request POST /movies oleh user:', req.user.username);
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

// PUT update movie (dengan token)
app.put('/movies/:id', authenticateToken, (req, res) => {
  console.log('Request PUT /movies oleh user:', req.user.username);
  const { title, director, year } = req.body;
  const sql = "UPDATE movies SET title = ?, director = ?, year = ? WHERE id = ?";
  const params = [title, director, year, req.params.id];

  db.run(sql, params, function (err) {
    if (err) return res.status(400).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Movie tidak ditemukan" });
    res.json({ message: "success", data: { id: req.params.id, title, director, year } });
  });
});

// DELETE movie (dengan token)
app.delete('/movies/:id', authenticateToken, (req, res) => {
  console.log('Request DELETE /movies oleh user:', req.user.username);
  const sql = "DELETE FROM movies WHERE id = ?";
  const params = [req.params.id];

  db.run(sql, params, function (err) {
    if (err) return res.status(400).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Movie tidak ditemukan" });
    res.status(204).send();
  });
});

// =======================================================
// AUTH ROUTES (REGISTER, LOGIN, PROFILE)
// =======================================================

// REGISTER
app.post('/auth/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password || password.length < 6) {
    return res.status(400).json({ error: 'Username dan password (min 6 karakter) wajib diisi' });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: 'Gagal memproses pendaftaran' });

    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    const params = [username.toLowerCase(), hashedPassword];

    db.run(sql, params, function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint')) {
          return res.status(409).json({ error: 'Username sudah digunakan' });
        }
        return res.status(500).json({ error: 'Gagal menyimpan pengguna' });
      }

      res.status(201).json({
        message: 'Registrasi berhasil',
        userId: this.lastID
      });
    });
  });
});

// LOGIN
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password harus diisi' });
  }

  const sql = "SELECT * FROM users WHERE username = ?";
  db.get(sql, [username.toLowerCase()], (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Kredensial tidak valid' });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(401).json({ error: 'Kredensial tidak valid' });
      }

      const payload = {
        user: {
          id: user.id,
          username: user.username
        }
      };

      jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
        if (err) return res.status(500).json({ error: 'Gagal membuat token' });
        res.json({ message: 'Login berhasil', token });
      });
    });
  });
});

// PROFILE (dengan token)
app.get("/auth/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Profil pengguna berhasil diambil",
    user: req.user,
  });
});

// =======================================================
// DIRECTORS API
// =======================================================

// GET semua directors (tanpa token)
app.get('/directors', (req, res) => {
  const sql = "SELECT * FROM directors ORDER BY id ASC";
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: "success", data: rows });
  });
});

// GET director by ID (tanpa token)
app.get('/directors/:id', (req, res) => {
  const sql = "SELECT * FROM directors WHERE id = ?";
  const params = [req.params.id];
  db.get(sql, params, (err, row) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: "success", data: row });
  });
});

// POST tambah director (dengan token)
app.post('/directors', authenticateToken, (req, res) => {
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

// PUT update director (dengan token)
app.put('/directors/:id', authenticateToken, (req, res) => {
  const { name, birth_year } = req.body;
  const sql = "UPDATE directors SET name = ?, birth_year = ? WHERE id = ?";
  const params = [name, birth_year, req.params.id];
  db.run(sql, params, function (err) {
    if (err) return res.status(400).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Director tidak ditemukan" });
    res.json({ message: "success", data: { id: req.params.id, name, birth_year } });
  });
});

// DELETE director (dengan token)
app.delete('/directors/:id', authenticateToken, (req, res) => {
  const sql = "DELETE FROM directors WHERE id = ?";
  const params = [req.params.id];
  db.run(sql, params, function (err) {
    if (err) return res.status(400).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Director tidak ditemukan" });
    res.status(204).send();
  });
});

// =======================================================
// ERROR HANDLER
// =======================================================
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// =======================================================
// START SERVER
// =======================================================
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
