const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// 1. Konfiguracja bazy danych
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) console.error(err.message);
    console.log('Połączono z bazą danych SQLite.');
});

// Inicjalizacja bazy i danych startowych
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        price TEXT,
        location TEXT,
        image_url TEXT,
        date TEXT
    )`);

    db.get("SELECT count(*) as count FROM items", [], (err, row) => {
        if (!err && row.count === 0) {
            console.log("Baza pusta. Dodaję przykładowe ogłoszenia...");
            const insert = db.prepare("INSERT INTO items (title, price, location, image_url, date) VALUES (?,?,?,?,?)");
            insert.run("iPhone 13 Pro stan idealny", "3 200", "Warszawa", "https://placehold.co/600x400/png?text=iPhone+13", "Dzisiaj");
            insert.run("Rower górski Kross Hexagon", "950", "Kraków", "https://placehold.co/600x400/png?text=Rower", "Wczoraj");
            insert.run("Sofa rozkładana szara, wygodna", "Oddam za darmo", "Gdańsk", "https://placehold.co/600x400/png?text=Sofa", "2 dni temu");
            insert.run("Audi A4 B8 2.0 TDI", "28 900", "Poznań", "https://placehold.co/600x400/png?text=Auto", "Dzisiaj");
            insert.finalize();
        }
    });
});

app.use(bodyParser.json());

// --- WAŻNE: API MUSI BYĆ PRZED PLIKAMI STATYCZNYMI ---

// API: Pobierz ogłoszenia
app.get('/api/items', (req, res) => {
    const searchQuery = req.query.q;
    let sql = "SELECT * FROM items ORDER BY id DESC";
    let params = [];

    if (searchQuery) {
        sql = "SELECT * FROM items WHERE title LIKE ? ORDER BY id DESC";
        params = [`%${searchQuery}%`];
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "data": rows });
    });
});

// API: Dodaj ogłoszenie
app.post('/api/items', (req, res) => {
    const { title, price, location, image_url } = req.body;
    const date = new Date().toLocaleDateString('pl-PL');

    const sql = "INSERT INTO items (title, price, location, image_url, date) VALUES (?,?,?,?,?)";
    const params = [title, price, location, image_url, date];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "success", "id": this.lastID });
    });
});

// --- DOPIERO TERAZ PLIKI STATYCZNE ---
// Serwowanie plików (HTML, CSS, JS) z głównego folderu
app.use(express.static(__dirname));

// Obsługa strony głównej (dla pewności)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start serwera
app.listen(PORT, () => {
    console.log(`Serwer działa na http://localhost:${PORT}`);
});