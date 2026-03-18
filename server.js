const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // Boshqa domenlardan ulanish uchun

const app = express();

// Railway portni avtomatik beradi, agar bermasa 3000 ni ishlatadi
const PORT = process.env.PORT || 3000; 
const DATA_FILE = path.join(__dirname, 'results.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Fayl mavjudligini tekshirish va bo'sh bo'lsa yaratish
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Reytingni olish (GET)
app.get('/api/ranking', (req, res) => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error("Reytingni o'qishda xato:", error);
        res.status(500).json({ error: "Ma'lumotni yuklab bo'lmadi" });
    }
});

// Natijani saqlash (POST)
app.post('/api/save', (req, res) => {
    const { name, score } = req.body;
    
    // Oddiy validatsiya
    if (!name || score === undefined) {
        return res.status(400).json({ error: "Ism yoki ball kiritilmadi" });
    }

    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        let results = JSON.parse(data);

        results.push({ 
            name, 
            score: parseInt(score), 
            date: new Date().toISOString() 
        });

        // Faqat eng yaxshi 50 ta natijani saqlash (fayl juda kattalashib ketmasligi uchun)
        results.sort((a, b) => b.score - a.score);
        results = results.slice(0, 50);

        fs.writeFileSync(DATA_FILE, JSON.stringify(results, null, 2));
        res.json({ success: true });
    } catch (error) {
        console.error("Saqlashda xato:", error);
        res.status(500).json({ error: "Natijani saqlab bo'lmadi" });
    }
});

app.listen(PORT, () => {
    console.log(`Server ${PORT}-portda muvaffaqiyatli ishga tushdi`);
});