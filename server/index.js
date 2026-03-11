//*ชุด code ดั้งเดิม

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const rawData = require('./database/raw_database.json');
const app = express();
app.use(cors());
app.use(express.json());

// ข้อมูลสำหรับเชื่อมต่อ ISO API
const ISO_API_KEY = '520EXOVKfzli7UAARpZ9fM1IM7UJbR8U';
const ISO_BASE_URL = 'https://api.iso.org/harmonized/publications';

let cachedExchangeRate = null;
let lastFetchTime = null;
const CLIENT_ID = 'eyJvcmciOiI2NzM1NzgwZWM4YzFlYjAwMDEyYTM3NzEiLCJpZCI6IjFlYjViZTYzZDk1ZjQ4NWM5MjI3ZDQzN2MzYmUwYTUyIiwiaCI6Im11cm11cjEyOCJ9'; 
let db;

// --- 1. Database & Exchange Rate Logic (เหมือนเดิมของคุณ) ---

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

// --- 2. ISO API Proxy Routes (ส่วนที่เพิ่มสำหรับการทดสอบ) ---

// Route สำหรับค้นหามาตรฐาน (ใช้ในหน้า Store)
app.get('/api/search-iso', async (req, res) => {
    const { q } = req.query; // รับค่าจากช่อง Search เช่น ?q=9001
    const exchangeData = await cachingExhangRate();
    const rate = exchangeData ? parseFloat(exchangeData.selling_rate) : 40.0;

    try {
        const response = await axios.get(ISO_BASE_URL, {
            params: { stdNumber: q, pageSize: 12 },
            headers: { 'x-api-key': ISO_API_KEY, 'Accept': 'application/json' }
        });

        // ตรวจสอบว่ามีข้อมูลส่งกลับมาไหม
        const publications = response.data.publications || [];
        
        // จัดรูปแบบข้อมูลให้ React ใช้ง่าย
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
        res.status(500).json({ error: "Search failed" });
    }
});

// Route สำหรับดึงรายละเอียดรายตัว (ใช้ในหน้า Product Detail)
app.get('/api/iso-publication/:urn', async (req, res) => {
    const { urn } = req.params;
    const exchangeData = await cachingExhangRate();
    const rate = exchangeData ? parseFloat(exchangeData.selling_rate) : 40.0;

    try {
        const response = await axios.get(`${ISO_BASE_URL}/${urn}`, {
            headers: { 'x-api-key': ISO_API_KEY, 'Accept': 'application/json' }
        });

        const data = response.data;
        const amountCHF = data.priceInfo?.basePrice?.amount || 0;

        res.json({
            id: data.urn,
            code: data.reference,
            title: data.title[0]?.content,
            abstract: data.abstract[0]?.content,
            basePriceCHF: amountCHF,
            priceTHB: Math.ceil(amountCHF * rate),
            status: data.status,
            rateUsed: rate
        });
    } catch (error) {
        console.error("❌ ISO Detail Error:", error.message);
        res.status(404).json({ error: "Publication not found" });
    }
});

// --- 3. Existing Routes ---
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
    const exchangeData = await cachingExhangRate(); 
    res.json({
        message: "สวัสดี! ระบบเชื่อมต่อ ISO พร้อมใช้งานแล้ว",
        serverStatus: "Online",
        currency1: exchangeData ? exchangeData.mid_rate : "N/A",
        currency2: exchangeData ? exchangeData.selling_rate : "N/A"
    });
});

const PORT = 5000;
initDatabase().then(async () => {
    await cachingExhangRate(); 
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
});




//*ชุด code ที่มีการเพิ่มส่วน api ISO เข้าไปแล้วแต่ยังใช้งานไม่ได้

// const express = require('express');
// const cors = require('cors');
// const axios = require('axios');

// const app = express();
// app.use(cors());
// app.use(express.json());

// // 1. ข้อมูลสำหรับเชื่อมต่อ (กรุณาตรวจสอบ API KEY อีกครั้ง)
// const ISO_API_KEY = 'Bearer 6nPQyHKhheX13eMMsqxZ838qkd0p7IAm';
// const ISO_BASE_URL = 'https://api.iso.org/harmonized/publications';

// // 2. Route สำหรับทดสอบการ Search (พิมพ์เลขมาตรฐาน)
// // ทดสอบผ่าน: http://localhost:5000/api/test-search?q=9001
// app.get('/api/test-search', async (req, res) => {
//     const { q } = req.query;
//     console.log(`🔍 Testing Search for: ${q}`);

//     try {
//         const response = await axios.get(ISO_BASE_URL, {
//             params: { projectUrn: "9001"},
//             headers: { 
//                 'x-api-key': ISO_API_KEY, 
//                 'Accept': 'application/json' 
//             }
//         });

//         console.log('✅ Connection Successful!');
//         res.json({
//             status: "Success",
//             source: "ISO Global API",
//             resultsCount: response.data.publications?.length || 0,
//             data: response.data.publications
//         });
//     } catch (error) {
//         console.error("❌ ISO API Error:", error.response?.data || error.message);
//         res.status(error.response?.status || 500).json({
//             status: "Error",
//             message: error.message,
//             details: error.response?.data
//         });
//     }
// });

// // 3. Route สำหรับทดสอบดึงข้อมูลรายตัว (URN)
// // ทดสอบผ่าน: http://localhost:5000/api/test-detail?urn=iso:pub:9001:2015
// app.get('/api/test-detail', async (req, res) => {
//     const { urn } = req.query;
//     console.log(`📄 Fetching Detail for: ${urn}`);

//     try {
//         const response = await axios.get(`${ISO_BASE_URL}/${urn}`, {
//             headers: { 
//                 'x-api-key': ISO_API_KEY, 
//                 'Accept': 'application/json' 
//             }
//         });

//         res.json({
//             status: "Success",
//             data: response.data
//         });
//     } catch (error) {
//         res.status(error.response?.status || 500).json({
//             status: "Error",
//             details: error.response?.data
//         });
//     }
// });

// // หน้าแรกสำหรับเช็คว่า Server รันอยู่ไหม
// app.get('/', (req, res) => {
//     res.send('🚀 ISO API Test Server is Running on Port 5000');
// });

// const PORT = 5000;
// app.listen(PORT, () => {
//     console.log(`
//     =============================================
//     🚀 ISO TEST SERVER STARTED
//     URL: http://localhost:${PORT}
    
//     Test Search: http://localhost:${PORT}/api/test-search?q=9001
//     Test Detail: http://localhost:${PORT}/api/test-detail?urn=iso:pub:9001:2015
//     =============================================
//     `);
// });




//*ส่วน test api iso (อยู่หว่างรอ iso approve ใช้งาน app)

// const express = require('express');
// const axios = require('axios');
// const app = express();

// // 1. ข้อมูลจากหน้า Portal ของคุณ
// const API_KEY = '3fu80Ia0kTsUUVdi0MgJds0zlNB0QZQD'; // Primary Key
// const API_SECRET = '0vf6mZpo4wqtuSDd'; 

// app.get('/api/test-iso-oauth', async (req, res) => {
//     try {
//         console.log("🚀 Step 1: Requesting Access Token...");
        
//         // แปลง Key:Secret เป็น Base64 ตามที่คู่มือ ISO บอก
//         const authHeader = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');

//         console.log('firstkey: ', authHeader);

//         // ยิงไปขอ Token
//         const tokenResponse = await axios.post(
//             'https://api.iso.org/oauth/client_credential/accesstoken?grant_type=client_credentials',

//             {}, // Body ว่างเปล่า
//             {
//                 headers: {
//                     'Authorization': `Basic ${authHeader}`,
//                     'Content-Type': 'application/x-www-form-urlencoded'
//                 }
//             }
//         );

//         const accessToken = tokenResponse.data.access_token;
//         console.log("✅ Step 2: Access Token received:", accessToken);
//         console.log("secundkey: ", accessToken);

//         // Step 3: ลองดึงข้อมูลจริงโดยใช้ Token ที่ได้มา
//         console.log("🚀 Step 3: Fetching ISO 9001 Data...");
//         const isoData = await axios.get('https://api.iso.org/harmonized/publications', {
//             params: { stdNumber: "9001", pageSize: 1 },
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`,
//                 'Accept': 'application/json'
//             }
//         });

//         console.log("✅ Step 4: ISO Data received successfully!");
//         res.json({
//             message: "Connect Success!",
//             token_expires_in: tokenResponse.data.expires_in,
//             sample_data: isoData.data.publications[0]
//         });

//     } catch (error) {
//         console.error("❌ Error Detail:", error.response?.data || error.message);
//         res.status(500).json({
//             error: "Connection Failed",
//             details: error.response?.data || error.message
//         });
//     }
// });

// app.listen(5000, () => console.log('Test server running at http://localhost:5000/api/test-iso-oauth'));