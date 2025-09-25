require('dotenv').config(); // Load environment variables
const sqlite3 = require('sqlite3').verbose(); // Import sqlite3

// Ambil nama/path database dari .env, fallback ke "db.sqlite" jika tidak ada
const DBSOURCE = process.env.DB_SOURCE || "db.sqlite";

// Buat koneksi ke database SQLite
const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    } else {
        console.log('Connected to the SQLite database.');

        // Buat tabel movies jika belum ada
        db.run(
            `CREATE TABLE IF NOT EXISTS movies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL, 
                director TEXT NOT NULL,
                year INTEGER NOT NULL
            )`,
            (err) => {
                if (!err) {
                    console.log("Table 'movies' created. Seeding initial data...");

                    const insert =
                        'INSERT INTO movies (title, director, year) VALUES (?,?,?)';

                    db.run(insert, ["The Lord of the Rings", "Peter Jackson", 2001]);
                    db.run(insert, ["The Avengers", "Joss Whedon", 2012]);
                    db.run(insert, ["Spider-Man", "Sam Raimi", 2002]);
                } else {
                    console.log("Table 'movies' already exists.");
                }
            }
        );
    }
});

module.exports = db; // Export koneksi database
