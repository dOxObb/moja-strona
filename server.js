const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// 1. Konfiguracja bazy danych
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) console.error("Błąd bazy danych:", err.message);
    else console.log('Połączono z bazą danych SQLite.');
});

// Inicjalizacja bazy
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        price TEXT,
        location TEXT,
        image_url TEXT,
        date TEXT
    )`);

    // Przykładowe dane (tylko jeśli baza jest pusta)
    db.get("SELECT count(*) as count FROM items", [], (err, row) => {
        if (!err && row.count === 0) {
            console.log("Baza pusta. Dodaję przykładowe ogłoszenia...");
            const insert = db.prepare("INSERT INTO items (title, price, location, image_url, date) VALUES (?,?,?,?,?)");
            insert.run("iPhone 13 Pro stan idealny", "3 200", "Warszawa", "https://placehold.co/600x400/png?text=iPhone+13", "Dzisiaj");
            insert.run("Rower górski Kross", "950", "Kraków", "https://placehold.co/600x400/png?text=Rower", "Wczoraj");
            insert.finalize();
        }
    });
});

// WAŻNE: Zamiast body-parser używamy wbudowanego express.json()
app.use(express.json());
// Odblokowanie CORS (pozwala Live Serverowi łączyć się z API)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // Pozwalamy każdemu (Live Server też)
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

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
    console.log("Otrzymano żądanie dodania:", req.body); // Logowanie dla debugowania

    const { title, price, location, image_url } = req.body;
    
    // Prosta walidacja
    if (!title || !price || !location) {
        console.log("Błąd: Brak wymaganych pól");
        return res.status(400).json({ "error": "Wypełnij wszystkie wymagane pola!" });
    }

    const date = new Date().toLocaleDateString('pl-PL');
    const sql = "INSERT INTO items (title, price, location, image_url, date) VALUES (?,?,?,?,?)";
    const params = [title, price, location, image_url, date];

    db.run(sql, params, function (err) {
        if (err) {
            console.error("Błąd zapisu do bazy:", err.message);
            res.status(400).json({ "error": err.message });
            return;
        }
        console.log(`Dodano ogłoszenie ID: ${this.lastID}`);
        res.json({ "message": "success", "id": this.lastID });
    });
});

// Serwowanie plików statycznych
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Serwer działa na http://localhost:${PORT}`);
});