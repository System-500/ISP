const express = require('express');
const mysql = require('mysql2/promise');
const yaml = require('yaml');
const cors = require('cors');
const convert = require('xml-js');
const XLSX = require('xlsx');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { cleanAndSortData } = require("./dataUtils");
const auth = require("./middleware/auth");

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const IMG_DIR = process.env.IMG_DIR || '/app/uploads';
if (!fs.existsSync(IMG_DIR)) {
    fs.mkdirSync(IMG_DIR, { recursive: true });
}

app.use('/img', express.static(IMG_DIR));
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, IMG_DIR);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const username = req.user?.user_name || req.body.name || 'user';
        const now = new Date();
        const dateStr = now.toISOString ? now.toISOString().split('T')[0].replace(/-/g, '') : 'date';
        const randomDigits = Math.floor(1000 + Math.random() * 9000);
        const finalName = `${username}_${dateStr}_${randomDigits}${ext}`;
        
        cb(null, finalName);
    }
});
const upload = multer({ storage: storage });

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    port : parseInt(process.env.DB_PORT)
});

pool.getConnection()
    .then(connection => {
        console.log(" Pomyślnie połączono z bazą danych!");
        connection.release();
    })
    .catch(err => {
        console.error("Błąd połączenia z bazą:", err.message);
    });
async function getStatsData(source) {
    if (source === 'api') {
        const downloadUrl = "https://api.dane.gov.pl/resources/1840218,liczba-zgonow-zarejestrowanych-w-rejestrze-stanu-cywilnego-w-okresie-od-1-wrzesnia-2015-r-dane-tygodniowe/file";
        const response = await fetch(downloadUrl);
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows = XLSX.utils.sheet_to_json(worksheet);
        return cleanAndSortData(rawRows);
    } else {
        const [rows] = await pool.query('SELECT rok, tydzien, zgony FROM statystyki_zgony WHERE id > 1');
        return rows;
    }
}

app.get('/api/stats/:format', auth, async (req, res) => {
    const { format } = req.params;
    const source = req.query.source || 'db';
    try {
        const data = await getStatsData(source);
        if (format === 'chart' || format === 'json') {
            res.json(data);
        } else if (format === 'yaml') {
            res.setHeader('Content-Type', 'text/yaml');
            res.send(yaml.stringify(data));
        } else if (format === 'xml') {
            const xmlObject = { root: { statystyka: data } };
            res.setHeader('Content-Type', 'application/xml');
            res.send(convert.js2xml(xmlObject, { compact: true, spaces: 2 }));
        } else {
            res.status(400).send('Invalid format');
        }
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];
        const isMatch = user ? await bcrypt.compare(password, user.password) : false;
        if (!user || !isMatch) return res.status(401).json({ message: 'Nieprawidłowy email lub hasło' });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWTPRIVATEKEY, { expiresIn: '5h' });
        res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

app.post("/register", async (req, res) => {
    const { email, password, username } = req.body;
    try {
        const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(409).json({ message: 'Email zajęty' });
        await pool.query('INSERT INTO users (email, password, avatar_url, user_name, role) VALUES (?, ?, ?, ?, ?)', 
            [email, await bcrypt.hash(password, 10), 'avatar.png', username, 'user']);
        res.status(201).json({ message: 'Zarejestrowano pomyślnie' });
    } catch (err) {
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

app.get('/auth/me', auth, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, email, user_name, role, avatar_url FROM users WHERE id = ?', [req.user.id]);
        if (!rows[0]) return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
        res.json({ loggedIn: true, user: rows[0] });
    } catch (err) {
        res.status(500).json({ message: 'Błąd serwera' });
    }
});
app.post('/update-profile', auth, upload.single('avatar'), async (req, res) => {
    const { name, email, deleteAvatar } = req.body;
    
    try {
        const [users] = await pool.query('SELECT avatar_url FROM users WHERE id = ?', [req.user.id]);
        let oldAvatar = users[0].avatar_url;
        let newAvatarUrl = oldAvatar;
        if (deleteAvatar === 'true') {
            if (oldAvatar && oldAvatar !== 'avatar.png') {
                const oldPath = path.join(IMG_DIR, oldAvatar);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            newAvatarUrl = 'avatar.png';
        } 
        else if (req.file) {
            newAvatarUrl = req.file.filename;
            if (oldAvatar && oldAvatar !== 'avatar.png') {
                const oldPath = path.join(IMG_DIR, oldAvatar);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
        }

        await pool.query('UPDATE users SET user_name = ?, email = ?, avatar_url = ? WHERE id = ?', 
                         [name, email, newAvatarUrl, req.user.id]);

        res.json({ message: 'Profil zaktualizowany' });
    } catch (err) {
        res.status(500).json({ message: 'Błąd' });
    }
});app.post('/update-profile', auth, upload.single('avatar'), async (req, res) => {
    const { name, email, deleteAvatar } = req.body;
    
    try {
        const [users] = await pool.query('SELECT avatar_url FROM users WHERE id = ?', [req.user.id]);
        let oldAvatar = users[0].avatar_url;
        let newAvatarUrl = oldAvatar;
        if (deleteAvatar === 'true') {
            if (oldAvatar && oldAvatar !== 'avatar.png') {
                const oldPath = path.join(IMG_DIR, oldAvatar);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            newAvatarUrl = 'avatar.png';
        } 
        else if (req.file) {
            newAvatarUrl = req.file.filename;
            if (oldAvatar && oldAvatar !== 'avatar.png') {
                const oldPath = path.join(IMG_DIR, oldAvatar);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
        }

        await pool.query('UPDATE users SET user_name = ?, email = ?, avatar_url = ? WHERE id = ?', 
                         [name, email, newAvatarUrl, req.user.id]);

        res.json({ message: 'Profil zaktualizowany' });
    } catch (err) {
        res.status(500).json({ message: 'Błąd' });
    }
});

app.get('/users', auth, async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Brak dostępu' });
    }
    try {
        const [rows] = await pool.query('SELECT id, user_name, avatar_url, email, role FROM users');
        res.json(rows);
    } catch (err) {
        console.error("Błąd bazy danych:", err);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

app.delete('/users/:id', auth, async (req, res) => {
     const userId = req.params.id;
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Brak dostępu' });
    }
     if (userId == req.user.id) {
            return res.status(400).json({ message: 'Nie można usunąć własnego konta' });
        }
   
    try {
        await pool.query('DELETE FROM users WHERE id = ?', [userId]);
       

        res.json({ message: 'Użytkownik usunięty' });
    } catch (err) {
        console.error("Błąd bazy danych:", err);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});


app.listen(3000, () => console.log('Server running on port 3000'));