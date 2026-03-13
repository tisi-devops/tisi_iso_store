// 1. โหลด Environment Variables ทันทีที่เริ่มรันไฟล์
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const rawData = require('./database/raw_database.json');
const app = express();

// 2. ตั้งค่าความปลอดภัยเบื้องต้น
app.use(cors({ origin: process.env.FRONTEND_URL || '*' })); // อนุญาตเฉพาะ Frontend ของเรา (หรือทั้งหมดถ้ายังไม่ได้ตั้งค่า)
app.use(express.json());

// 3. โหลดค่าจาก .env มาเก็บไว้ในตัวแปร
const PORT = process.env.PORT || 5000;
const USE_MOCK_API = process.env.USE_MOCK_API === 'false'; // สวิตช์สลับโหมด
const ISO_API_KEY = process.env.ISO_API_KEY;
const ISO_SECRET_KEY = process.env.ISO_SECRET_KEY;
const ISO_GEN_TOKEN = process.env.ISO_GEN_TOKEN;

const ISO_BASE_URL = process.env.ISO_BASE_URL;
const BOT_BASE_URL = process.env.BOT_BASE_URL;
const BOT_CLIENT_ID = process.env.BOT_CLIENT_ID;

let db;
let cachedExchangeRate = null;
let lastFetchTime = null;

// ==========================================
// ⚙️ SYSTEM & DATABASE INIT
// ==========================================
async function initDatabase() {
    try {
        db = await open({ filename: process.env.DB_FILENAME || './database/first.sqlite', driver: sqlite3.Database });
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

// ==========================================
// 💱 EXCHANGE RATE LOGIC (BOT API)
// ==========================================
async function getExchangeRate() {
    let exchangeData = null;
    let daysOffset = 1;
    while (!exchangeData && daysOffset <= 7) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - daysOffset);
        const formatStr = targetDate.toISOString().slice(0, 10);
        try {
            const response = await axios.get(BOT_BASE_URL, {
                params: { start_period: formatStr, end_period: formatStr, currency: 'CHF' },
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${BOT_CLIENT_ID}` }
            });
            const detail = response.data.result?.data?.data_detail?.[0];
            if (detail && detail.mid_rate) {
                exchangeData = { mid_rate: detail.mid_rate, selling_rate: detail.selling, period: detail.period };
            } else { daysOffset++; }
        } catch (error) { daysOffset++; }
    }
    return exchangeData;
}

async function cachingExhangRate() {
    const now = new Date();
    if (cachedExchangeRate && lastFetchTime && (now - lastFetchTime < 3600000)) return cachedExchangeRate;
    const freshData = await getExchangeRate(); 
    if (freshData) { cachedExchangeRate = freshData; lastFetchTime = now; }
    return freshData;
}

// ==========================================
// 📚 ISO API LOGIC (MOCK vs REAL)
// ==========================================

// ฟังก์ชันดึงข้อมูล "จำลอง" (ใช้ตอนที่สิทธิ์ API ยังไม่อนุมัติ)
async function fetchMockISOList(query) {
    console.log("🟡 [MOCK MODE] Fetching ISO List...");
    return {
        publications: [
            { urn: "iso:pub:9001:2015", reference: "ISO 9001:2015", title: [{content: "Quality management systems — Requirements"}], priceInfo: {basePrice: {amount: 138}}, status: "Published" },
            { urn: "iso:pub:14001:2015", reference: "ISO 14001:2015", title: [{content: "Environmental management systems"}], priceInfo: {basePrice: {amount: 118}}, status: "Published" },
            { urn: "iso:pub:27001:2022", reference: "ISO/IEC 27001:2022", title: [{content: "Information security management systems"}], priceInfo: {basePrice: {amount: 168}}, status: "Published" }
        ]
    };
}

// ฟังก์ชันดึงข้อมูล "จริง" (รอแก้โค้ดเชื่อม OAuth เมื่อสิทธิ์ผ่าน)
async function fetchRealISOList(query) {
    console.log("🟢 [REAL MODE] Fetching ISO List from api.iso.org...");

        try {
            console.log("🚀 Step 1: Requesting Access Token...");
            
            // แปลง Key:Secret เป็น Base64 ตามที่คู่มือ ISO บอก
            const authHeader = Buffer.from(`${ISO_API_KEY}:${ISO_SECRET_KEY}`).toString('base64');

            console.log('firstkey: ', authHeader);

            // ยิงไปขอ Token
            const tokenResponse = await axios.post(ISO_GEN_TOKEN,
                {}, // Body ว่างเปล่า
                {
                    headers: {
                        'Authorization': `Basic ${authHeader}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            //เช็ค respone ที่ส่ง token กลับมา
            console.log("TokenResponse: ", tokenResponse)

            const accessToken = tokenResponse.data.access_token;
            console.log("✅ Step 2: Access Token received:", accessToken);
            console.log("accessToken: ", accessToken);

            // Step 3: ลองดึงข้อมูลจริงโดยใช้ Token ที่ได้มา
            console.log("🚀 Step 3: Fetching ISO 9001 Data...");
            const isoData = await axios.get(ISO_BASE_URL, {
                params: { },
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json'
                }
            })  

            console.log("✅ Step 4: ISO Data received successfully!");
            res.json({
                message: "Connect Success!",
                token_expires_in: tokenResponse.data.expires_in,
                sample_data: isoData.data.publications[0]
            }); 

        } catch (error) {
        console.error("❌ Error Detail:", error.response?.data || error.message);
        throw error; // โยน Error ขึ้นไปให้ Route หลักจัดการต่อ
    }
    return response.data;
}

// ==========================================
// 🚀 API ROUTES
// ==========================================

// 1. Route ค้นหามาตรฐาน ISO (สำหรับหน้า Store)
app.get('/api/search-iso', async (req, res) => {
    const { q } = req.query || "";
    const exchangeData = await cachingExhangRate();
    const rate = exchangeData ? parseFloat(exchangeData.selling_rate) : 40.0;

    try {
        // 🌟 สวิตช์สลับโหมดอยู่ที่นี่! โค้ดที่เหลือทำงานเหมือนเดิม
        const rawIsoData = USE_MOCK_API 
            ? await fetchMockISOList(q) 
            : await fetchRealISOList(q);

        const publications = rawIsoData.publications || [];
        const results = publications.map(pub => ({
            id: pub.urn,
            code: pub.reference,
            title: pub.title[0]?.content || "No Title",
            basePriceCHF: pub.priceInfo?.basePrice?.amount || 0,
            priceTHB: Math.ceil((pub.priceInfo?.basePrice?.amount || 0) * rate),
            status: pub.status
        }));

        res.json(results);
    } catch (error) {
        console.error("❌ ISO Search Error:", error.message);
        res.status(500).json({ error: "Failed to fetch ISO data" });
    }
});

// 2. Route ข้อมูลฟอร์มที่อยู่ (เหมือนเดิม)
app.get('/api/provinces', (req, res) => {
    const provinces = [...new Set(rawData.map(item => item.province))].sort((a, b) => a.localeCompare(b, 'th'));
    res.json(provinces);
});
app.get('/api/amphoes/:province', (req, res) => {
    const amphoes = [...new Set(rawData.filter(item => item.province === req.params.province).map(item => item.amphoe))].sort((a, b) => a.localeCompare(b, 'th'));
    res.json(amphoes);
});
app.get('/api/districts/:province/:amphoe', (req, res) => {
    const districts = rawData.filter(item => item.province === req.params.province && item.amphoe === req.params.amphoe).map(item => ({district: item.district, zipcode: item.zipcode})).sort((a, b) => a.district.localeCompare(b, 'th'));
    res.json(districts);
});

// 3. Route เช็คสถานะเซิร์ฟเวอร์
app.get('/api/hello', async (req, res) => {
    const exchangeData = await cachingExhangRate(); 
    const today = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    res.json({
        message: "ระบบ Backend พร้อมใช้งาน",
        serverStatus: "Online",
        mode: USE_MOCK_API ? "MOCK (ข้อมูลจำลอง)" : "REAL (ดึงข้อมูลจริง)",
        currency1: exchangeData ? exchangeData.mid_rate : "N/A",
        currency2: exchangeData ? exchangeData.selling_rate : "N/A",
        ndate: today
    });
});

// ==========================================
// 🔥 START SERVER
// ==========================================
initDatabase().then(async () => {
    await cachingExhangRate(); 
    app.listen(PORT, () => {
        console.log(`\n=============================================`);
        console.log(`🚀 TISI BACKEND SERVER STARTED`);
        console.log(`📍 URL: http://localhost:${PORT}`);
        console.log(`🛠️  MODE: ${USE_MOCK_API ? '🟡 MOCK DATA' : '🟢 REAL API'}`);
        console.log("Test API ISO : ",`http://localhost:5000/api/search-iso?q=9001`);
        console.log(`=============================================\n`);
    });
});