const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// ===========================
// Middleware Autentikasi
// ===========================
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // ambil setelah "Bearer "

  if (!token) {
    return res.status(401).json({ error: 'Token tidak ditemukan' });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedPayload) => {
    if (err) {
      return res.status(403).json({ error: 'Token tidak valid' });
    }

    // Simpan data user dari token ke req.user
    req.user = decodedPayload.user; // { id, username, role }
    next();
  });
}

// ===========================
// Middleware Autorisasi (BARU)
// ===========================
function authorizeRole(role) {
  return (req, res, next) => {
    // Middleware ini dijalankan SETELAH authenticateToken
    if (req.user && req.user.role === role) {
      next(); // Role cocok, lanjut ke handler berikutnya
    } else {
      return res.status(403).json({
        error: 'Akses Dilarang: Peran tidak memadai',
      });
    }
  };
}

module.exports = {
  authenticateToken,
  authorizeRole,
};
