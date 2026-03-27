// 1. โหลด Environment Variables ทันทีที่เริ่มรันไฟล์
require('dotenv').config();

const { formatInTimeZone } = require('date-fns-tz');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mysql = require('mysql2/promise'); // 🌟 เปลี่ยน Library

const rateLimit = require('express-rate-limit');

// 🛡️ 1. แบบทั่วไป (General Limit)
// ป้องกันการยิง API รัวๆ ทั่วไป (เช่น 1 นาที ยิงได้ไม่เกิน 100 ครั้ง)
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 นาที
  max: 100, 
  message: { error: "คุณทำรายการบ่อยเกินไป กรุณาลองใหม่ในอีกสักครู่" },
  standardHeaders: true, // ส่งข้อมูล Rate Limit ไปใน Header ด้วย (Limit, Remaining)
  legacyHeaders: false,
});

// 🛡️ 2. แบบเข้มงวด (Strict Limit สำหรับ OTP)
// ป้องกันคนแกล้งส่งเมลรัวๆ (เช่น 15 นาที ขอ OTP ได้แค่ 3 ครั้ง)
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 3, 
  message: { error: "คุณขอ OTP บ่อยเกินไป (จำกัด 3 ครั้งทุก 15 นาที) กรุณารอสักครู่ครับ" },
  skipSuccessfulRequests: false, // นับทุกครั้งที่ยิงมา ไม่ว่าจะส่งเมลสำเร็จหรือไม่
});

// สำหรับส่งอีเมล (ถ้าต้องการใช้ในอนาคต)
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// โหลดข้อมูลจำลองสำหรับที่อยู่ (จังหวัด อำเภอ ตำบล) จากไฟล์ JSON เพื่อใช้ใน API ที่เกี่ยวกับที่อยู่
const rawData = require('./database/raw_database.json');
const app = express();

// 2. ตั้งค่าความปลอดภัยเบื้องต้น (อนุญาตทั้ง Admin และ User)
const allowedOrigins = [
  process.env.ADMIN_FRONTEND_URL, 
  process.env.USER_FRONTEND_URL,
];

app.use(cors({ 
  origin: function (origin, callback) {
    // ถ้าไม่มี origin (เช่น postman) หรือ origin อยู่ใน list ที่อนุญาต
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
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
        // 1. สร้างการเชื่อมต่อ (Connection Pool)
        db = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            database: process.env.DB_NAME || 'tisi_store',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // 2. ทดสอบเชื่อมต่อ และสร้างตาราง (ถ้ายังไม่มี)
        // ⚠️ ใน MySQL ต้องระบุ Engine และชุดตัวอักษรภาษาไทย (utf8mb4)
        // await db.execute(`
        //     CREATE TABLE IF NOT EXISTS transactions (
        //         id INT AUTO_INCREMENT PRIMARY KEY,
        //         transaction_id VARCHAR(20) UNIQUE, 
        //         company_name VARCHAR(255),
        //         tax_id VARCHAR(20),
        //         personType INT, -- 1 = บุคคลธรรมดา, 2 = นิติบุคคล
        //         house_number TEXT,
        //         moo TEXT,
        //         soi TEXT,
        //         road TEXT,
        //         sub_district VARCHAR(255),
        //         district VARCHAR(255),
        //         province VARCHAR(255),
        //         postcode VARCHAR(10),
        //         contact_title VARCHAR(50),
        //         contact_firstname VARCHAR(255),
        //         contact_middlename VARCHAR(255),
        //         contact_lastname VARCHAR(255),
        //         phone VARCHAR(20),
        //         email VARCHAR(255),
        //         total_amount INT,
        //         exchange_rate DECIMAL(10, 7),
        //         status VARCHAR(20) DEFAULT 'PENDING',
        //         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        //     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        // `);

        // await db.execute(`
        //     CREATE TABLE IF NOT EXISTS transaction_items (
        //         id INT AUTO_INCREMENT PRIMARY KEY,
        //         transaction_id CHAR(20),
        //         product_code VARCHAR(100),
        //         product_option VARCHAR(50),
        //         price_at_purchase INT,
        //         quantity INT DEFAULT 1,
        //         FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id) ON DELETE CASCADE
        //     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        // `);

        // await db.execute(`
        //     CREATE TABLE IF NOT EXISTS otp_storage (
        //         id INT AUTO_INCREMENT PRIMARY KEY,
        //         email VARCHAR(255) NOT NULL,
        //         otp_code CHAR(6) NOT NULL,
        //         ref_code CHAR(4) NOT NULL,
        //         expires_at DATETIME NOT NULL,
        //         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        //     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        // `);

        console.log('✅ MySQL Database Ready (via XAMPP)!');
    } catch (err) {
        console.error('❌ MySQL Init Error:', err.message);
        // แนะนำเพิ่มเติม: ถ้า Database ชื่อ tisi_store ยังไม่มีใน XAMPP มันจะ Error
        // คุณต้องเข้าไปสร้าง Database เปล่าๆ ใน phpMyAdmin ก่อนนะครับ
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
                    buying_transfer: detail.buying_transfer,
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
    const rate = exchangeData ? parseFloat(exchangeData.buying_transfer) : 40.0;

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

            // ราคาที่ดึงมาจาก ISO API จะเป็นราคาในหน่วย CHF
            RawPriceCHF: pub.priceInfo?.basePrice?.amount || 0,
            // ราคาที่แปลงเป็น THB แล้ว (ใช้สูตร CHF * อัตราแลกเปลี่ยน - ส่วนลด 30%)
            PriceTHB: Math.round(((pub.priceInfo?.basePrice?.amount || 0) * rate)),
            // ราคาที่ลด 30% แล้ว
            SpecialPriceTHB: Math.round(((pub.priceInfo?.basePrice?.amount || 0) * rate) * (1 - 0.3)),


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
    const rate = exchangeData ? parseFloat(exchangeData.buying_transfer) : 40.0;

    if (!projectUrn) return res.status(400).json({ error: "Missing projectUrn parameter" });

    try {
        const accessToken = await getValidAccessToken();

        // ยิงไปถาม ISO API แบบเจาะจง URN
        const isoData = await axios.get(ISO_BASE_URL, {
            params: { 
                // ✅ ส่งหา ISO ด้วย projectUrn ที่ตรงกับที่ Frontend ส่งมา (ซึ่งมาจากการแปลง Publication URN เป็น Project URN แล้ว)
                projectUrn: projectUrn,
                publicationStatus: "PUBLISHED",
                publicationStage: "IS" 
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

             // ราคาที่ดึงมาจาก ISO API จะเป็นราคาในหน่วย CHF
            RawPriceCHF: exactMatch.priceInfo?.basePrice?.amount || 0,
            // ราคาที่แปลงเป็น THB แล้ว (ใช้สูตร CHF * อัตราแลกเปลี่ยน - ส่วนลด 30%)
            PriceTHB: Math.round(((exactMatch.priceInfo?.basePrice?.amount || 0) * rate)),
            // ราคาที่ลด 30% แล้ว
            SpecialPriceTHB: Math.round(((exactMatch.priceInfo?.basePrice?.amount || 0) * rate) * (1 - 0.3)),

            status: exactMatch.status,
            publicationStage: exactMatch.publicationStage,
            abstract: exactMatch.abstract?.[0]?.content
        };

        res.json(result);
    } catch (error) {
        console.error("❌ Route Detail Fetch Error:", error.message);
        res.status(500).json({ error: "Failed to fetch ISO detail" });
    }
}); 

// 1. ดึงจังหวัดทั้งหมด
app.get('/api/provinces', async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT province_code as value, province as label FROM tr14_province ORDER BY province ASC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. ดึงอำเภอ (กรองด้วย province_code)
app.get('/api/amphoes/:p_code', async (req, res) => {
    try {
        const [rows] = await db.execute(
            "SELECT district_code as value, district as label FROM tr14_district WHERE province_code = ? ORDER BY district ASC",
            [req.params.p_code]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. ดึงตำบลและรหัสไปรษณีย์ (กรองด้วย district_code)
app.get('/api/districts/:d_code', async (req, res) => {
    try {
        const [rows] = await db.execute(
            "SELECT subdistrict_code as value, subdistrict as label, postcode FROM tr14_subdistrict WHERE district_code = ? ORDER BY subdistrict ASC",
            [req.params.d_code]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});






// ส่วนทดสอบ API ว่าระบบทำงานปกติหรือไม่ และแสดงอัตราแลกเปลี่ยนปัจจุบันด้วย (ถ้ามี)
app.get('/api/hello', async (req, res) => {
    const exchangeData = await cachingExhangRate(); 
    res.json({ 
        message: "ระบบ Backend พร้อมใช้งาน", 
        status: "Online", 
        currency: exchangeData ? exchangeData.buying_transfer : "N/A" });
});


app.post('/api/submit-transaction', async (req, res) => {
    const { customer, items, totalAmount } = req.body;
    
    const exchangeData = await cachingExhangRate();
    const currentRate = exchangeData ? parseFloat(exchangeData.buying_transfer) : 40.0;
    
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // 1. สร้าง Transaction ID (TISI + YYYYMMDD + Sequence)
        const today = new Date().toISOString();
        // const [countRow] = await connection.execute(
        //     `SELECT COUNT(*) as total FROM transactions WHERE DATE(created_at) = CURDATE()`
        // );
        // const nextNumber = (countRow[0].total || 0) + 1;
        // const transactionId = `TISI${today.replace(/-:T/g, '')}`;



        const utcDate = new Date(); // Current time in UTC
        const timeZone = 'Thailand/Bangkok';

        // Convert the date to the target timezone (returns a Date object with adjusted time components for the new zone)
        const zonedDate = toZonedTime(utcDate, timeZone);

        // Format with timezone string
        const formatted = formatInTimeZone(utcDate, timeZone, 'yyyyMMddHHmmss');

         const transactionId = `TISI${formatted}`;

        // console.log(formatted); // Example: "2026-03-26 08:01:00 EDT"



        // 2. บันทึกลงตารางแม่ (transactions) - Mapping ข้อมูลให้ตรงกับฟิลด์หน้าบ้าน
        await connection.execute(
            `INSERT INTO transactions 
            (transaction_id, company_name, tax_id, personType, house_number, moo, soi, road, 
             sub_district, district, province, postcode, 
             contact_title, contact_firstname, contact_middlename, contact_lastname, 
             phone, email, total_amount, exchange_rate, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                transactionId,
                customer.comp_name || null,
                customer.comp_tax || null,
                customer.is_corporate ? 2 : 1, // แปลง boolean เป็น INT (1=Indiv, 2=Corp)
                customer.comp_add || null,      // house_number
                customer.comp_moo || null,
                customer.comp_soi || null,
                customer.comp_road || null,
                customer.sub_district || null,
                customer.district || null,
                customer.province || null,
                customer.postcode || null,
                customer.title || null,         // contact_title
                customer.firstname || null,
                customer.middlename || null,
                customer.lastname || null,
                customer.comp_phone || null,
                customer.comp_email || null,
                totalAmount || 0,
                currentRate,
                'PENDING'
            ]
        );

        // 3. บันทึกลงตารางลูก (transaction_items)
        const itemSql = `INSERT INTO transaction_items 
                         (transaction_id, product_code, product_option, price_at_purchase, quantity) 
                         VALUES (?, ?, ?, ?, ?)`;

        for (const item of items) {
            await connection.execute(itemSql, [
                transactionId, 
                item.code,
                item.option || 'Standard',
                item.price,
                1
            ]);
        }

        await connection.commit();
        res.json({ success: true, transactionId });

    } catch (error) {
        await connection.rollback();
        console.error("❌ Database Error:", error.message); 
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

app.get('/api/orders', async (req, res) => {
    const connection = await db.getConnection();
    try {
        // ใช้ LEFT JOIN เพื่อดึงข้อมูลตารางแม่ และเอา product_code จากตารางลูกมาต่อกัน (กรณีซื้อหลายชิ้น)
        const [rows] = await connection.execute(`
            SELECT 
                t.transaction_id AS id,
                t.company_name AS company,
                GROUP_CONCAT(ti.product_code SEPARATOR ', ') AS standard,
                t.created_at AS date,
                t.total_amount AS price,
                t.status AS status
            FROM transactions t
            LEFT JOIN transaction_items ti ON t.transaction_id = ti.transaction_id
            GROUP BY t.transaction_id
            ORDER BY t.created_at DESC
        `);

        // ส่งข้อมูลที่ Query ได้กลับไปให้ React เป็น JSON
        res.json(rows);

    } catch (error) {
        console.error("❌ Fetch Orders Error:", error.message);
        res.status(500).json({ error: "ไม่สามารถดึงข้อมูลคำสั่งซื้อได้" });
    }   finally {   
        connection.release(); 
    }
});



// 📌 Route: สำหรับดึงข้อมูลรายละเอียดของ 1 คำสั่งซื้อ (ตารางแม่ + ตารางลูก)
app.get('/api/orders/:id', async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();
    
    try {
        // 1. ดึงข้อมูลตารางแม่ (ข้อมูลลูกค้า)
        const [masterRows] = await connection.execute(
            `SELECT * FROM transactions WHERE transaction_id = ?`, 
            [id]
        );

        if (masterRows.length === 0) {
            return res.status(404).json({ error: "ไม่พบข้อมูลรายการสั่งซื้อนี้" });
        }

        // 2. ดึงข้อมูลตารางลูก (รายการมาตรฐานที่สั่งซื้อ)
        const [itemRows] = await connection.execute(
            `SELECT * FROM transaction_items WHERE transaction_id = ?`, 
            [id]
        );

        // 3. รวมร่างข้อมูลส่งกลับไปให้หน้าบ้าน
        const result = {
            ...masterRows[0],
            items: itemRows
        };

        res.json(result);

    } catch (error) {
        console.error("❌ Fetch Order Detail Error:", error.message);
        res.status(500).json({ error: "เซิร์ฟเวอร์ขัดข้อง ไม่สามารถดึงข้อมูลได้" });
    } finally {
        connection.release();
    }
});

app.post('/api/send-otp', otpLimiter, async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const refCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    // ตั้งเวลาหมดอายุ 5 นาทีจากตอนนี้
    const expiresAt = new Date(Date.now() + 5 * 60000); 

    try {
        // 1. บันทึกลง DB (ถ้าเคยมีอีเมลนี้อยู่แล้ว ให้ทับอันเก่าไปเลย)
        await db.execute(`DELETE FROM otp_storage WHERE expires_at < NOW()`);
        await db.execute(
            `INSERT INTO otp_storage (email, otp_code, ref_code, expires_at) 
             VALUES (?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE otp_code = VALUES(otp_code), ref_code = VALUES(ref_code), expires_at = VALUES(expires_at)`,
            [email, otp, refCode, expiresAt]
        );

        // 2. ส่งเมล (ใช้โค้ดเดิมของคุณ) 
        await transporter.sendMail({
            from: `"TISI E-Store" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `รหัส OTP ของคุณคือ ${otp} (Ref: ${refCode})`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-w-md">
                    <h2 style="color: #1e3a8a;">TISI E-Store</h2>
                    <p>รหัสยืนยันตัวตน (OTP) สำหรับการสั่งซื้อมาตรฐาน ISO ของคุณคือ:</p>
                    <h1 style="background: #f1f5f9; padding: 15px; text-align: center; letter-spacing: 5px; color: #333;">${otp}</h1>
                    <p><strong>รหัสอ้างอิง (Ref):</strong> ${refCode}</p>
                    <p style="color: #ef4444; font-size: 12px;">* รหัสนี้มีอายุการใช้งาน 5 นาที</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #999;">หากคุณไม่ได้ทำรายการนี้ โปรดเพิกเฉยต่ออีเมลฉบับนี้</p>
                </div>
            `
        });

        res.json({ success: true, ref: refCode });
    } catch (error) {
        res.status(500).json({ error: "พังที่ขั้นตอน DB หรือ Mail" });
    }
});


app.post('/api/verify-otp', otpLimiter, async (req, res) => {
    const { email, otp } = req.body;

    try {
        const [rows] = await db.execute(
            `SELECT * FROM otp_storage 
             WHERE email = ? AND otp_code = ? AND expires_at > NOW() 
             ORDER BY created_at DESC LIMIT 1`,
            [email, otp]
        );

        if (rows.length > 0) {
            // ✅ ตรวจผ่าน! ลบ OTP นี้ทิ้งเลยเพื่อป้องกันการใช้ซ้ำ
            await db.execute(`DELETE FROM otp_storage WHERE email = ?`, [email]);
            res.json({ success: true, message: "ยืนยันตัวตนสำเร็จ" });
        } else {
            // ❌ ไม่ผ่าน (รหัสผิด หรือ หมดอายุ)
            res.status(400).json({ success: false, message: "รหัส OTP ไม่ถูกต้องหรือหมดอายุ" });
        }
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
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