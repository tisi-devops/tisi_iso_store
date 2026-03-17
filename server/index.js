// // 1. โหลด Environment Variables ทันทีที่เริ่มรันไฟล์
// require('dotenv').config();

// const express = require('express');
// const cors = require('cors');
// const axios = require('axios');
// const sqlite3 = require('sqlite3');
// const { open } = require('sqlite');

// const rawData = require('./database/raw_database.json');
// const app = express();

// // 2. ตั้งค่าความปลอดภัยเบื้องต้น
// app.use(cors({ origin: process.env.FRONTEND_URL || '*' })); // อนุญาตเฉพาะ Frontend ของเรา (หรือทั้งหมดถ้ายังไม่ได้ตั้งค่า)
// app.use(express.json());

// // 3. โหลดค่าจาก .env มาเก็บไว้ในตัวแปร
// const PORT = process.env.PORT || 5000;
// const USE_MOCK_API = process.env.USE_MOCK_API === 'false'; // สวิตช์สลับโหมด
// const ISO_API_KEY = process.env.ISO_API_KEY;
// const ISO_SECRET_KEY = process.env.ISO_SECRET_KEY;
// const ISO_GEN_TOKEN = process.env.ISO_GEN_TOKEN;

// const ISO_BASE_URL = process.env.ISO_BASE_URL;
// const BOT_BASE_URL = process.env.BOT_BASE_URL;
// const BOT_CLIENT_ID = process.env.BOT_CLIENT_ID;

// let db;
// let cachedExchangeRate = null;
// let lastFetchTime = null;

// let tokenCache = {
//     accessToken: null,
//     expiresAt: null
// };

// // ==========================================
// // ⚙️ SYSTEM & DATABASE INIT
// // ==========================================
// async function initDatabase() {
//     try {
//         db = await open({ filename: process.env.DB_FILENAME || './database/first.sqlite', driver: sqlite3.Database });
//         await db.exec(`
//             CREATE TABLE IF NOT EXISTS orders (
//                 id INTEGER PRIMARY KEY AUTOINCREMENT,
//                 company_name TEXT, address TEXT, phone TEXT,
//                 tax_id TEXT, contact_person TEXT, email TEXT
//             )
//         `);
//         console.log('✅ SQLite Database Ready!');
//     } catch (err) {
//         console.error('❌ Database Init Error:', err);
//     }
// }

// // ==========================================
// // 💱 EXCHANGE RATE LOGIC (BOT API)
// // ==========================================
// async function getExchangeRate() {
//     let exchangeData = null;
//     let daysOffset = 1;
//     while (!exchangeData && daysOffset <= 10) {
//         const targetDate = new Date();
//         targetDate.setDate(targetDate.getDate() - daysOffset);
//         const formatStr = targetDate.toISOString().slice(0, 10);

//         try {
//             const response = await axios.get(BOT_BASE_URL, {
//                 params: { start_period: formatStr, end_period: formatStr, currency: 'CHF' },
//                 headers: { 'Accept': '*/*', 'Authorization': BOT_CLIENT_ID }
//             });
//             const detail = response.data.result?.data?.data_detail?.[0];
//             if (detail && detail.mid_rate) {
//                 exchangeData = { mid_rate: detail.mid_rate,
//                                 selling_rate: detail.selling,
//                                 period: detail.period,
//                                 start_day: formatStr,
//                                 CHK_date: targetDate};
//             } else {
//                 console.error(`❌ ยิง API พังในวันที่ ${formatStr}:`, error.message);
//                 daysOffset++; 
//             }
//         } catch (error) { 
//             console.error(`❌ ยิง API พังในวันที่ ${formatStr}:`, error.message);
//             daysOffset++; 
//         }
//     }
//     return exchangeData;
// }

// // ฟังก์ชัน Cache อัตราแลกเปลี่ยน (ที่หายไป)
// async function cachingExhangRate() {
//     const now = new Date();
//     if (cachedExchangeRate && lastFetchTime && (now - lastFetchTime < 3600000)) return cachedExchangeRate;
//     const freshData = await getExchangeRate(); 
//     if (freshData) { cachedExchangeRate = freshData; lastFetchTime = now; }
//     return freshData;
// }

// // ==========================================
// // 🔑 TOKEN MANAGEMENT (แยกส่วนจัดการ Token ออกมา)
// // ==========================================
// async function getValidAccessToken() {
//     const now = Date.now();

//     // 1. เช็ค Cache ก่อน
//     if (tokenCache.accessToken && tokenCache.expiresAt > now) {
//         console.log("⚡ [CACHE HIT] ใช้ Token เดิม");
//         return tokenCache.accessToken;
//     }

//     // 2. ถ้าไม่มีหรือหมดอายุ ค่อยขอใหม่
//     console.log("🔄 [CACHE MISS] ขอ Token ใหม่...");
//     const authHeader = Buffer.from(`${ISO_API_KEY}:${ISO_SECRET_KEY}`).toString('base64');
    
//     const tokenResponse = await axios.post(ISO_GEN_TOKEN, {}, {
//         headers: {
//             'Authorization': `Basic ${authHeader}`,
//             'Content-Type': 'application/x-www-form-urlencoded'
//         }
//     });

//     const newAccessToken = tokenResponse.data.access_token;
//     const expiresInSeconds = tokenResponse.data.expires_in || 3600;

//     tokenCache.accessToken = newAccessToken;
//     tokenCache.expiresAt = Date.now() + (expiresInSeconds * 1000) - 300000; // เผื่อ 5 นาที

//     return newAccessToken;
// }

// // ==========================================
// // 📚 ISO API LOGIC (MOCK vs REAL)
// // ==========================================
// async function fetchRealISOList(query) {
//     console.log("🟢 [REAL MODE] Fetching API...");
//     try {
//         // เรียกใช้ Token 
//         const accessToken = await getValidAccessToken();

//         // ยิงข้อมูล
//         const isoData = await axios.get(ISO_BASE_URL, {
//             params: { 
//                 stdNumber: query || "9001", 
//                 publicationStatus: "PUBLISHED" 
//             },
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`,
//                 'Accept': 'application/json'
//             }
//         });  
        
//         // คืนค่าเฉพาะ Array ของข้อมูล
//         return isoData.data.publication || [];
//     } catch (error) {
//         console.error("❌ ISO Fetch Error:", error.response?.data || error.message);
//         throw error;
//     }
// }

// // ==========================================
// // 🚀 API ROUTES
// // ==========================================

// // 1. Route ค้นหามาตรฐาน ISO (สำหรับหน้า Store)
// app.get('/api/search-iso', async (req, res) => {
//     const { q } = req.query || "";
//     const exchangeData = await cachingExhangRate();
//     const rate = exchangeData ? parseFloat(exchangeData.selling_rate) : 40.0;

//     try {
//         await fetchRealISOList(q);

//         //const publications = rawIsoData.publications || [];
//         const results = publication.map(pub => ({
//             id: pub.urn,
//             code: pub.reference,
//             title: pub.title[0]?.content || "No Title",
//             basePriceCHF: pub.priceInfo?.basePrice?.amount || 0,
//             priceTHB: Math.ceil((pub.priceInfo?.basePrice?.amount || 0) * rate),
//             status: pub.status
//         }));

//         res.json(results);
//     } catch (error) {
//         console.error("❌ ISO Search Error:", error.message);
//         res.status(500).json({ error: "Failed to fetch ISO data" });
//     }
// });

// // 2. Route ข้อมูลฟอร์มที่อยู่ (เหมือนเดิม)
// app.get('/api/provinces', (req, res) => {
//     const provinces = [...new Set(rawData.map(item => item.province))].sort((a, b) => a.localeCompare(b, 'th'));
//     res.json(provinces);
// });
// app.get('/api/amphoes/:province', (req, res) => {
//     const amphoes = [...new Set(rawData.filter(item => item.province === req.params.province).map(item => item.amphoe))].sort((a, b) => a.localeCompare(b, 'th'));
//     res.json(amphoes);
// });
// app.get('/api/districts/:province/:amphoe', (req, res) => {
//     const districts = rawData.filter(item => item.province === req.params.province && item.amphoe === req.params.amphoe).map(item => ({district: item.district, zipcode: item.zipcode})).sort((a, b) => a.district.localeCompare(b, 'th'));
//     res.json(districts);
// });

// // 3. Route เช็คสถานะเซิร์ฟเวอร์
// app.get('/api/hello', async (req, res) => {
//     const exchangeData = await cachingExhangRate(); 
//     const today = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
//     res.json({
//         message: "ระบบ Backend พร้อมใช้งาน",
//         serverStatus: "Online",
//         mode: USE_MOCK_API ? "MOCK (ข้อมูลจำลอง)" : "REAL (ดึงข้อมูลจริง)",
//         currency: exchangeData ? exchangeData.selling_rate : "N/A",
//         ndate: today
//     });
// });

// // ==========================================
// // 🔥 START SERVER
// // ==========================================
// initDatabase().then(async () => {
//     const initialExchangeData = await cachingExhangRate();
//     app.listen(PORT, () => {
//         console.log(`\n=============================================`);
//         console.log(`🚀 TISI BACKEND SERVER STARTED`);
//         console.log(`📍 URL: http://localhost:${PORT}`);
//         console.log(`🛠️  MODE: ${USE_MOCK_API ? '🟡 MOCK DATA' : '🟢 REAL API'}`);

//         // 🌟 ดึง fetch_date ออกมาโชว์ตรงนี้!
//         const start_day = initialExchangeData ? initialExchangeData.start_day : 'N/A';
//         console.log(`💱 BOT Exchange Rate Date: ${start_day}`);


//         console.log("Test API ISO : ",`http://localhost:5000/api/search-iso?q=9001`);
//         console.log(`=============================================\n`);
//     });
// });






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
async function getValidAccessToken() {
    const now = Date.now();

    if (tokenCache.accessToken && tokenCache.expiresAt > now) {
        console.log("⚡ [CACHE HIT] ใช้ Token เดิม");
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
// 📚 ISO API LOGIC (REAL ONLY)
// ==========================================
async function fetchRealISOList(query) {
    console.log("🟢 [REAL MODE] Fetching API...");
    try {
        const accessToken = await getValidAccessToken();

        const isoData = await axios.get(ISO_BASE_URL, {
            params: { 
                stdNumber: query || "9001", 
                publicationStatus: "PUBLISHED" 
            },
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        });  
        
        return isoData.data.publication || [];
    } catch (error) {
        console.error("❌ ISO Fetch Error:", error.response?.data || error.message);
        throw error;
    }
}

// ==========================================
// 🚀 API ROUTES
// ==========================================
app.get('/api/search-iso', async (req, res) => {
    const { q } = req.query || "";
    const exchangeData = await cachingExhangRate();
    const rate = exchangeData ? parseFloat(exchangeData.selling_rate) : 40.0;

    try {
        const publications = await fetchRealISOList(q);

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
        console.error("❌ Route Error:", error.message);
        res.status(500).json({ error: "Failed to fetch ISO data" });
    }
});

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

app.get('/api/hello', async (req, res) => {
    const exchangeData = await cachingExhangRate(); 
    const today = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    res.json({
        message: "ระบบ Backend พร้อมใช้งาน",
        serverStatus: "Online",
        mode: "REAL API",
        currency: exchangeData ? exchangeData.selling_rate : "N/A",
        ndate: today
    });
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
        console.log(`🛠️  MODE: 🟢 REAL API`);

        const start_day = initialExchangeData ? initialExchangeData.start_day : 'N/A';
        console.log(`💱 BOT Exchange Rate Date: ${start_day}`);
        console.log(`=============================================\n`);
        console.log("Test API ISO : ",`http://localhost:${PORT}/api/search-iso?q=9001`);
    });
});