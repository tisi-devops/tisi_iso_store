// 1. โหลด Environment Variables ทันทีที่เริ่มรันไฟล์
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

// โหลดข้อมูลจำลองสำหรับที่อยู่ (จังหวัด อำเภอ ตำบล) จากไฟล์ JSON เพื่อใช้ใน API ที่เกี่ยวกับที่อยู่
const rawData = require('./database/raw_database.json');
const app = express();

// 2. ตั้งค่าความปลอดภัยเบื้องต้น
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// 3. โหลดค่าตัวแปร
const PORT = process.env.PORT || 5000;
const ISO_API_KEY = process.env.ISO_API_KEY;
const ISO_SECRET_KEY = process.env.ISO_SECRET_KEY;
const ISO_GEN_TOKEN = process.env.ISO_GEN_TOKEN;
const ISO_BASE_URL = process.env.ISO_BASE_URL;
const BOT_BASE_URL = process.env.BOT_BASE_URL;
const BOT_CLIENT_ID = process.env.BOT_CLIENT_ID;

let db;
let cachedExchangeRate = null;
let lastFetchTime = null;

let tokenCache = {
    accessToken: null,
    expiresAt: null
};

// ==========================================
// ⚙️ SYSTEM & DATABASE INIT
// ==========================================

// ฟังก์ชันนี้จะเปิดการเชื่อมต่อกับฐานข้อมูล SQLite และสร้างตาราง orders ขึ้นมา (ถ้ายังไม่มี) เพื่อเตรียมพร้อมสำหรับการใช้งานในอนาคต
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
// 💱 EXCHANGE RATE LOGIC
// ==========================================

// ฟังก์ชันนี้จะพยายามดึงอัตราแลกเปลี่ยนจาก BOT API โดยเริ่มจากวันที่ปัจจุบันและถอยหลังไปเรื่อยๆ (สูงสุด 10 วัน) จนกว่าจะได้ข้อมูลที่ถูกต้องมา
async function getExchangeRate() {
    let exchangeData = null;
    let daysOffset = 1;
    while (!exchangeData && daysOffset <= 10) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - daysOffset);
        const formatStr = targetDate.toISOString().slice(0, 10);

        try {
            const response = await axios.get(BOT_BASE_URL, {
                params: { start_period: formatStr, end_period: formatStr, currency: 'CHF' },
                headers: { 'Accept': '*/*', 'Authorization': BOT_CLIENT_ID }
            });
            const detail = response.data.result?.data?.data_detail?.[0];
            if (detail && detail.mid_rate) {
                exchangeData = { 
                    mid_rate: detail.mid_rate,
                    selling_rate: detail.selling,
                    period: detail.period,
                    start_day: formatStr,
                    CHK_date: targetDate
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

// ฟังก์ชันนี้จะเช็คว่าเรามีข้อมูลอัตราแลกเปลี่ยนที่เก็บไว้ในแคชหรือไม่และยังไม่หมดอายุ (ตั้งไว้ 1 ชั่วโมง) 
// ถ้าใช่ก็คืนค่าเดิม ถ้าไม่ก็ไปดึงข้อมูลใหม่จาก getExchangeRate() และอัปเดตแคช
async function cachingExhangRate() {
    const now = new Date();
    if (cachedExchangeRate && lastFetchTime && (now - lastFetchTime < 3600000)) return cachedExchangeRate;
    const freshData = await getExchangeRate(); 
    if (freshData) { cachedExchangeRate = freshData; lastFetchTime = now; }
    return freshData;
}

// ==========================================
// 🔑 TOKEN MANAGEMENT
// ==========================================

// ฟังก์ชันนี้จะเช็คว่าเรามี Access Token ที่ยังไม่หมดอายุอยู่ในแคชหรือไม่ ถ้าใช่ก็คืนค่าเดิมถ้าไม่ก็ไปขอ Token ใหม่จาก ISO API 
// และอัปเดตแคชพร้อมกับเวลาหมดอายุ(อายุตามคู่มือของ ISO มีเวลา 1 ชั่วโมงตั้งให้หมดอายุก่อนเวลาจริง 5 นาทีเพื่อความปลอดภัย) 
// แล้วคืนค่า Token ใหม่ที่ได้มาให้กับผู้เรียกใช้งาน
async function getValidAccessToken() {
    const now = Date.now();

    if (tokenCache.accessToken && tokenCache.expiresAt > now) {
        return tokenCache.accessToken;
    }

    console.log("🔄 [CACHE MISS] ขอ Token ใหม่...");
    const authHeader = Buffer.from(`${ISO_API_KEY}:${ISO_SECRET_KEY}`).toString('base64');
    
    const tokenResponse = await axios.post(ISO_GEN_TOKEN, {}, {
        headers: {
            'Authorization': `Basic ${authHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    const newAccessToken = tokenResponse.data.access_token;
    const expiresInSeconds = tokenResponse.data.expires_in || 3600;

    tokenCache.accessToken = newAccessToken;
    tokenCache.expiresAt = Date.now() + (expiresInSeconds * 1000) - 300000; 

    return newAccessToken;
}

// ==========================================
// 🚀 API ROUTES
// ==========================================

// 📌 หน้าแรกกันหน้าขาว (เวลาเข้า localhost:5000 ตรงๆ จะได้ไม่ขึ้น Cannot GET /)
app.get('/', (req, res) => {
    res.send("<h1>✅ TISI Backend Server is Running!</h1><p>API Endpoint: /api/...</p>");
});

// 📌 1. Route: สำหรับค้นหามาตรฐานมาแสดงหน้า Store
app.get('/api/search-iso', async (req, res) => {
    const { q } = req.query || "";
    const exchangeData = await cachingExhangRate();
    const rate = exchangeData ? parseFloat(exchangeData.selling_rate) : 40.0;

    try {
        const accessToken = await getValidAccessToken();
        const isoData = await axios.get(ISO_BASE_URL, {
            params: { 
                stdNumber: q || "", 
                // กำหนดให้แสดงเฉพาะมาตรฐานที่มีสถานะเผยแพร่แล้ว (Published) เท่านั้น เพราะบางส่วนยังอยู่ในช่วงร่าง (Draft) หรือกำลังจะออก 
                // (Forthcoming) ซึ่งข้อมูลยังไม่สมบูรณ์และอาจทำให้เกิดปัญหาในการแสดงผลได้
                publicationStatus: "PUBLISHED", 
                // กำหนดให้แสดงเฉพาะมาตรฐานที่อยู่ในช่วง IS (International Standard) เท่านั้น
                // (เพราะถ้าเอาทุกช่วงมาแสดงมันจะเยอะมากและบางส่วนก็ยังไม่สมบูรณ์)
                publicationStage: "IS" 
            },
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' }
        });  

        const publications = isoData.data.publication || [];

        const results = publications.map(pub => ({
            id: pub.urn,
            code: pub.reference,
            title: pub.title && pub.title.length > 0 ? (pub.title[0].value || pub.title[0].content) : "No Title",
            basePriceCHF: pub.priceInfo?.basePrice?.amount || 0,
            priceTHB: Math.ceil((pub.priceInfo?.basePrice?.amount || 0) * rate),
            status: pub.status
        }));

        res.json(results);
    } catch (error) {
        console.error("❌ Route Search Error:", error.message);
        res.status(500).json({ error: "Failed to fetch ISO data" });
    }
});

// 📌 2. Route ใหม่ 🌟: สำหรับหน้า Product Detail ดึงเจาะจง 1 รายการด้วย projectUrn
app.get('/api/get-iso-detail', async (req, res) => {
    // รับ projectUrn จาก query parameter (ซึ่งมาจากการแปลง Publication URN เป็น Project URN แล้วในฝั่ง Frontend)
    const { projectUrn } = req.query;
    const exchangeData = await cachingExhangRate();
    const rate = exchangeData ? parseFloat(exchangeData.selling_rate) : 40.0;

    if (!projectUrn) return res.status(400).json({ error: "Missing projectUrn parameter" });

    try {
        const accessToken = await getValidAccessToken();

        // ยิงไปถาม ISO API แบบเจาะจง URN
        const isoData = await axios.get(ISO_BASE_URL, {
            params: { 
                // ✅ ส่งหา ISO ด้วย projectUrn ที่ตรงกับที่ Frontend ส่งมา (ซึ่งมาจากการแปลง Publication URN เป็น Project URN แล้ว)
                projectUrn: projectUrn,
                // publicationStatus: "PUBLISHED",
                // publicationStage: "IS" 
            }, 
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' }
        });  
        
        const publications = isoData.data.publication || [];
        
        // ✅ ไม่ต้องใช้ .find() แล้ว หยิบตัวแรกมาเช็คเลย
        if (publications.length === 0) {
            console.log("❌ ไม่พบข้อมูลสำหรับ:", projectUrn);
            return res.status(404).json({ error: "ไม่พบข้อมูลมาตรฐานนี้" });
        }

        const exactMatch = publications[0];

        const result = {
            id: exactMatch.urn,
            code: exactMatch.reference,
            title: exactMatch.title && exactMatch.title.length > 0 
            ? (exactMatch.title[0].value || exactMatch.title[0].content) : "No Title",
            basePriceCHF: exactMatch.priceInfo?.basePrice?.amount || 0,
            priceTHB: Math.ceil((exactMatch.priceInfo?.basePrice?.amount || 0) * rate),
            status: exactMatch.status,
            publicationStage: exactMatch.publicationStage
        };

        res.json(result);
    } catch (error) {
        console.error("❌ Route Detail Fetch Error:", error.message);
        res.status(500).json({ error: "Failed to fetch ISO detail" });
    }
});

// 📌 3. Route: ข้อมูลที่อยู่ และ เช็คสถานะ (ปล่อยไว้เหมือนเดิม)
// ส่วนเลือกจังหวัด
app.get('/api/provinces', (req, res) => { 
    res.json([...new Set(rawData.map(item => item.province))].sort((a, b) => a.localeCompare(b, 'th'))); 
});
// ส่วนเลือกอำเภอ (ต้องส่ง province มาด้วย)
app.get('/api/amphoes/:province', (req, res) => { 
    res.json([...new Set(rawData.filter(item => item.province === req.params.province).map(item => item.amphoe))].sort((a, b) => a.localeCompare(b, 'th'))); 
});
// ส่วนเลือกตำบล (ต้องส่ง province และ amphoe มาด้วย) พร้อมส่งรหัสไปรษณีย์กลับไปด้วย
app.get('/api/districts/:province/:amphoe', (req, res) => { 
    res.json(rawData.filter(item => item.province === req.params.province && item.amphoe === req.params.amphoe).map(item => ({district: item.district, zipcode: item.zipcode})).sort((a, b) => a.district.localeCompare(b, 'th'))); 
});

// ส่วนทดสอบ API ว่าระบบทำงานปกติหรือไม่ และแสดงอัตราแลกเปลี่ยนปัจจุบันด้วย (ถ้ามี)
app.get('/api/hello', async (req, res) => {
    const exchangeData = await cachingExhangRate(); 
    res.json({ 
        message: "ระบบ Backend พร้อมใช้งาน", 
        status: "Online", 
        currency: exchangeData ? exchangeData.selling_rate : "N/A" });
});

// ==========================================
// 🔥 START SERVER
// ==========================================
initDatabase().then(async () => {
    const initialExchangeData = await cachingExhangRate();
    app.listen(PORT, () => {
        console.log(`\n=============================================`);
        console.log(`🚀 TISI BACKEND SERVER STARTED`);
        console.log(`📍 URL: http://localhost:${PORT}`);
        console.log(`=============================================\n`);
    });
});