const express = require('express');
const cors = require('cors');
const axios = require('axios');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const rawData = require('./database/raw_database.json');
const app = express();
app.use(cors());
app.use(express.json());

// Global Cache Variables
let cachedExchangeRate = null;
let lastFetchTime = null;

const CLIENT_ID = 'eyJvcmciOiI2NzM1NzgwZWM4YzFlYjAwMDEyYTM3NzEiLCJpZCI6IjFlYjViZTYzZDk1ZjQ4NWM5MjI3ZDQzN2MzYmUwYTUyIiwiaCI6Im11cm11cjEyOCJ9'; 
let db;

// 1. ปรับปรุงการ Init Database ให้มี Error Handling
async function initDatabase() {
    try {
        db = await open({
            filename: './server/database/first.sqlite',
            driver: sqlite3.Database
        });
        await db.exec(`
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_name TEXT, address TEXT, phone TEXT,
                tax_id TEXT, contact_person TEXT, email TEXT
            )
        `);
        console.log('✅ SQLite Database Ready!');
    } catch (err) {
        console.error('❌ Database Init Error:', err);
    }
}

// 2. Loop Back Logic สำหรับดึงค่าเงินล่าสุด
async function getExchangeRate() {
    let exchangeData = null;
    let daysOffset = 1;
    const maxRetries = 7;

    while (!exchangeData && daysOffset <= maxRetries) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - daysOffset);
        const formatStr = targetDate.toISOString().slice(0, 10);

        try {
            const response = await axios.get('https://gateway.api.bot.or.th/Stat-ExchangeRate/v2/DAILY_AVG_EXG_RATE/', {
                params: { start_period: formatStr, end_period: formatStr, currency: 'CHF' },
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${CLIENT_ID}` }
            });

            const detail = response.data.result?.data?.data_detail?.[0];
            if (detail && detail.mid_rate) {
                exchangeData = {
                    mid_rate: detail.mid_rate,
                    selling_rate: detail.selling,
                    period: detail.period
                };
            } else {
                daysOffset++;
            }
        } catch (error) {
            daysOffset++;
        }
    }
    return exchangeData;
}

// 3. Cache Logic (Gatekeeper)
async function cachingExhangRate() {
    const now = new Date();
    const oneHour = 60 * 60 * 1000;

    if (cachedExchangeRate && lastFetchTime && (now - lastFetchTime < oneHour)) {
        return cachedExchangeRate;
    }

    const freshData = await getExchangeRate(); 
    if (freshData) {
        cachedExchangeRate = freshData;
        lastFetchTime = now;
    }
    return freshData;
}

// 4. API Routes (ย้ายออกมาด้านนอกให้เป็นระเบียบ)
app.get('/api/provinces', (req, res) => {
    const provinces = [...new Set(rawData.map(item => item.province))].sort((a, b) => a.localeCompare(b, 'th'));
    res.json(provinces);
});

app.get('/api/amphoes/:province', (req, res) => {
    const { province } = req.params;
    const amphoes = [...new Set(rawData.filter(item => item.province === province).map(item => item.amphoe))].sort((a, b) => a.localeCompare(b, 'th'));
    res.json(amphoes);
});

app.get('/api/districts/:province/:amphoe', (req, res) => {
    const { province, amphoe } = req.params;
    const districts = rawData.filter(item => item.province === province && item.amphoe === amphoe).map(item => ({district: item.district, zipcode: item.zipcode})).sort((a, b) => a.district.localeCompare(b, 'th'));
    res.json(districts);
});

app.get('/api/hello', async (req, res) => {
    // แก้ไข: ใช้ cachingExhangRate แทนการยิงตรง
    const exchangeData = await cachingExhangRate(); 
    res.json({
        message: "สวัสดี! ข้อมูลนี้ส่งมาจาก Node.js Server",
        serverStatus: "Online",
        currency1: exchangeData ? exchangeData.mid_rate : "N/A",
        currency2: exchangeData ? exchangeData.selling_rate : "N/A"
    });
});

// 5. Start Sequence (เชื่อมต่อ DB -> ดึงค่าเงินรอบแรก -> เปิด Server)
const PORT = 5000;
initDatabase().then(async () => {
    await cachingExhangRate(); // อุ่นเครื่อง Cache รอบแรก
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
});