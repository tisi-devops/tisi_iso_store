import 'dotenv/config';
import { formatInTimeZone } from 'date-fns-tz';
import express, { json } from 'express';
import cors from 'cors';
import axios from 'axios';
import { createPool } from 'mysql2/promise';
import rateLimit from 'express-rate-limit';
import { createTransport } from 'nodemailer';

const app = express();

const PORT = process.env.PORT;
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

// ป้องกันคนแกล้งส่งเมลรัวๆ (เช่น 15 นาที ขอ OTP ได้แค่ 3 ครั้ง)
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 3, 
  message: { error: "คุณขอ OTP บ่อยเกินไป (จำกัด 3 ครั้งทุก 15 นาที) กรุณารอสักครู่ครับ" },
  skipSuccessfulRequests: false, // นับทุกครั้งที่ยิงมา ไม่ว่าจะส่งเมลสำเร็จหรือไม่
});

// สำหรับส่งอีเมล
const transporter = createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ตั้งค่าความปลอดภัยเบื้องต้น (อนุญาตทั้ง Admin และ User)
const allowedOrigins = [
  process.env.ADMIN_FRONTEND_URL, 
  process.env.USER_FRONTEND_URL,
  'https://dev.tisi.go.th',
];
app.use(cors({ 
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(json());

// สร้างการเชื่อมต่อ (Connection Pool) กับ MySQL
async function initDatabase() {
    try {
        db = createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        console.log('✅ MySQL Database Ready');
    } catch (err) {
        console.error('❌ MySQL Init Error:', err.message);
    }
}

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
            if (detail && detail.buying_transfer) {
                exchangeData = {
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
async function cachingExhangRate() {
    const now = new Date();
    // เช็คก่อนว่ามีของเก่าและยังไม่หมดอายุไหม
    if (cachedExchangeRate && lastFetchTime && (now - lastFetchTime < 3600000)) {
        return cachedExchangeRate;
    }
    // ถ้าไม่มีหรือหมดอายุ ค่อยไปดึงใหม่
    const freshData = await getExchangeRate(); 
    if (freshData) { 
        cachedExchangeRate = freshData; 
        lastFetchTime = now; 
    }
    return freshData;
}

// ฟังก์ชันนี้จะเช็คว่าเรามี Access Token ที่ยังไม่หมดอายุอยู่ในแคชหรือไม่ ถ้าใช่ก็คืนค่าเดิมถ้าไม่ก็ไปขอ Token ใหม่จาก ISO API แล้วเก็บไว้ในแคชพร้อมกับเวลาหมดอายุ (เราจะตั้งให้หมดอายุก่อนเวลาจริง 5 นาทีเพื่อความปลอดภัย)
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

// หน้าแรกกันหน้าขาว (เวลาเข้า localhost:5000 ตรงๆ จะได้ไม่ขึ้น Cannot GET /)
app.get('/', (req, res) => {
    res.send("<h1>✅ TISI Backend Server is Running!</h1><p>API Endpoint: /api-iso-store/...</p>");
});

// ส่วนทดสอบ API ว่าระบบทำงานปกติหรือไม่ และแสดงอัตราแลกเปลี่ยนปัจจุบันด้วย (ถ้ามี)
app.get('/api-iso-store/hello', async (req, res) => {
    const exchangeData = await cachingExhangRate();
    const now = new Date();
    const thaiDate = new Intl.DateTimeFormat('th-TH', {
        dateStyle: 'full',
    }).format(now); 
    res.json({ 
        message: "ระบบ Backend พร้อมใช้งาน", 
        status: "Online", 
        currency: exchangeData ? Math.round(exchangeData.buying_transfer * 10000) / 10000 : "N/A",
        daynow: thaiDate
    });
});

// API สำหรับดึงข้อมูลจังหวัดจากฐานข้อมูล
app.get('/api-iso-store/provinces', async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT province_code as value, province as label FROM tr14_province ORDER BY province ASC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API สำหรับดึงข้อมูลอำเภอจากฐานข้อมูล (กรองด้วย province_code)
app.get('/api-iso-store/amphoes/:p_code', async (req, res) => {
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

// API สำหรับดึงข้อมูลตำบลและรหัสไปรษณีย์จากฐานข้อมูล (กรองด้วย district_code)
app.get('/api-iso-store/districts/:d_code', async (req, res) => {
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

// API สำหรับส่ง OTP ไปยังอีเมลของลูกค้า (ใช้สำหรับยืนยันตัวตนก่อนสั่งซื้อ) โดยจะมีการจำกัดจำนวนครั้งในการขอ OTP เพื่อป้องกันการแกล้งส่งเมลรัวๆ
app.post('/api-iso-store/send-otp', otpLimiter, async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const refCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const expiresAt = new Date(Date.now() + 5 * 60000); 

    try {
        await db.execute(`DELETE FROM ISO_STORE_TB_otp_storage WHERE expires_at < NOW()`);
        await db.execute(
            `INSERT INTO ISO_STORE_TB_otp_storage (email, otp_code, ref_code, expires_at) 
             VALUES (?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE otp_code = VALUES(otp_code), ref_code = VALUES(ref_code), expires_at = VALUES(expires_at)`,
            [email, otp, refCode, expiresAt]
        );
        try {
            await transporter.sendMail({
                from: `"TISI ISO-Store" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: `รหัส OTP ของคุณคือ ${otp} (Ref: ${refCode})`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-w-md">
                        <h2 style="color: #1e3a8a;">TISI ISO-Store</h2>
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
        } catch (emailError) {
            console.error("❌ Email Send Error:", emailError.message);
            await db.execute(`DELETE FROM otp_storage WHERE email = ?`, [email]);
            return res.status(500).json({ error: "ไม่สามารถส่งอีเมล OTP ได้ในขณะนี้ กรุณาตรวจสอบอีเมลของคุณ" });
        }
    } catch (error) {
        console.error("❌ Database/System Error:", error.message);
        res.status(500).json({ error: "ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง" });
    }
});

// API สำหรับตรวจสอบ OTP ที่ลูกค้ากรอกเข้ามา (ใช้สำหรับยืนยันตัวตนก่อนสั่งซื้อ) โดยจะเช็คว่า OTP นี้ตรงกับอีเมลนี้และยังไม่หมดอายุหรือไม่ ถ้าตรวจผ่านก็จะลบ OTP นี้ทิ้งเลยเพื่อป้องกันการใช้ซ้ำ
app.post('/api-iso-store/verify-otp', otpLimiter, async (req, res) => {
    const { email, otp } = req.body;
    try {
        const [rows] = await db.execute(
            `SELECT * FROM ISO_STORE_TB_otp_storage 
             WHERE email = ? AND otp_code = ? AND expires_at > NOW() 
             ORDER BY created_at DESC LIMIT 1`,
            [email, otp]
        );
        if (rows.length > 0) {
            await db.execute(`DELETE FROM ISO_STORE_TB_otp_storage WHERE email = ?`, [email]);
            res.json({ success: true, message: "ยืนยันตัวตนสำเร็จ" });
        } else {
            res.status(400).json({ success: false, message: "รหัส OTP ไม่ถูกต้องหรือหมดอายุ" });
        }
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
});

// API สำหรับค้นหามาตรฐานมาแสดงหน้า Store
app.get('/api-iso-store/search-iso', async (req, res) => {
    const { q } = req.query || "";
    const exchangeData = await cachingExhangRate();
    const rate = exchangeData ? parseFloat(exchangeData.buying_transfer) : 40.0;
    try {
        const accessToken = await getValidAccessToken();
        const isoData = await axios.get(ISO_BASE_URL, {
            params: { 
                stdNumber: q || "",
                publicationStatus: "PUBLISHED", // กำหนดให้แสดงเฉพาะมาตรฐานที่มีสถานะเผยแพร่แล้ว (Published) เท่านั้น
                publicationStage: "IS" // กำหนดให้แสดงเฉพาะมาตรฐานที่อยู่ในช่วง IS (International Standard) เท่านั้น
            },
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' }
        });  
        const publications = isoData.data.publication || [];
        const results = publications.map(pub => ({
            id: pub.urn, // ใช้ URN เป็น ID เพราะมันมีความเฉพาะเจาะจงมากกว่ารหัสมาตรฐาน (reference) ที่อาจซ้ำกันได้ในบางกรณี
            code: pub.reference, // รหัสมาตรฐาน เช่น ISO 9001
            title: pub.title && pub.title.length > 0 ? (pub.title[0].value || pub.title[0].content) : "No Title", // ชื่อมาตรฐาน
            RawPriceCHF: pub.priceInfo?.basePrice?.amount || 0, // ราคาที่ดึงมาจาก ISO API จะเป็นราคาในหน่วย CHF
            PriceTHB: Math.round(((pub.priceInfo?.basePrice?.amount || 0) * rate)), // ราคาที่แปลงเป็น THB แล้ว (ใช้สูตร CHF * อัตราแลกเปลี่ยน)
            SpecialPriceTHB: Math.round(((pub.priceInfo?.basePrice?.amount || 0) * rate) * (1 - 0.3)), // ราคาที่แปลงเป็น THB แล้วและลด 30% (ใช้สูตร CHF * อัตราแลกเปลี่ยน - ส่วนลด 30%)
            status: pub.status // สถานะของมาตรฐาน
        }));
        res.json(results);
    } catch (error) {
        console.error("❌ Route Search Error:", error.message);
        res.status(500).json({ error: "Failed to fetch ISO data" });
    }
});

// API สำหรับหน้า Product Detail ดึงเจาะจง 1 รายการด้วย projectUrn (ซึ่งมาจากการแปลง Publication URN เป็น Project URN แล้วในฝั่ง Frontend)
app.get('/api-iso-store/get-iso-detail', async (req, res) => {
    const { projectUrn } = req.query; // รับ projectUrn จาก query parameter (ซึ่งมาจากการแปลง Publication URN เป็น Project URN แล้วในฝั่ง Frontend)
    const exchangeData = await cachingExhangRate();
    const rate = parseFloat(exchangeData.buying_transfer);
    if (!projectUrn) return res.status(400).json({
        error: "Missing projectUrn parameter" 
    });
    try {
        const accessToken = await getValidAccessToken();
        const isoData = await axios.get(ISO_BASE_URL, {
            params: { 
                projectUrn: projectUrn,
                publicationStatus: "PUBLISHED",
                publicationStage: "IS" 
            }, 
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' }
        });  
        const publications = isoData.data.publication || [];
        if (publications.length === 0) {
            console.log("❌ ไม่พบข้อมูลสำหรับ:", projectUrn);
            return res.status(404).json({ 
                error: "ไม่พบข้อมูลมาตรฐานนี้" 
            });
        }
        const exactMatch = publications[0];
        const result = {
            id: exactMatch.urn, // ใช้ URN เป็น ID เพราะมันมีความเฉพาะเจาะจงมากกว่ารหัสมาตรฐาน (reference) ที่อาจซ้ำกันได้ในบางกรณี
            code: exactMatch.reference, // รหัสมาตรฐาน เช่น ISO 9001
            title: exactMatch.title && exactMatch.title.length > 0 ? (exactMatch.title[0].value || exactMatch.title[0].content) : "No Title", // ชื่อมาตรฐาน
            RawPriceCHF: exactMatch.priceInfo?.basePrice?.amount || 0, // ราคาที่ดึงมาจาก ISO API จะเป็นราคาในหน่วย CHF
            PriceTHB: Math.round(((exactMatch.priceInfo?.basePrice?.amount || 0) * rate)), // ราคาที่แปลงเป็น THB แล้ว (ใช้สูตร CHF * อัตราแลกเปลี่ยน)
            SpecialPriceTHB: Math.round(((exactMatch.priceInfo?.basePrice?.amount || 0) * rate) * (1 - 0.3)), // ราคาที่แปลงเป็น THB แล้วและลด 30% (ใช้สูตร CHF * อัตราแลกเปลี่ยน - ส่วนลด 30%)
            status: exactMatch.status, // สถานะของมาตรฐาน
            publicationStage: exactMatch.publicationStage, // ช่วงของมาตรฐาน (เช่น IS, WD, CD, etc.)
            abstract: exactMatch.abstract?.[0]?.content // เนื้อหาสรุปของมาตรฐาน (ถ้ามี)
        };
        res.json(result);
    } catch (error) {
        console.error("❌ Route Detail Fetch Error:", error.message);
        res.status(500).json({ error: "Failed to fetch ISO detail" });
    }
}); 

// API สำหรับรับข้อมูลการสั่งซื้อจากหน้าบ้าน (ข้อมูลลูกค้า + รายการมาตรฐานที่สั่งซื้อ) แล้วบันทึกลงฐานข้อมูล (ทั้งตารางแม่และตารางลูก)
app.post('/api-iso-store/submit-transaction', async (req, res) => {
    const { customer, items, totalAmount } = req.body;
    const exchangeData = await cachingExhangRate();
    const currentRate = parseFloat(exchangeData.buying_transfer);
    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
        // Transaction ID (TISI + YYYYMMDD + HHMMSS) - ใช้เวลาปัจจุบันเป็น UTC แล้วแปลงเป็นเวลาในโซน Asia/Bangkok เพื่อความแม่นยำ
        const utcDate = new Date();
        const timeZone = 'Asia/Bangkok';
        const formatted = formatInTimeZone(utcDate, timeZone, 'yyyyMMddHHmmss');
        const transactionId = `TISI${formatted}`;
        await connection.execute(
            `INSERT INTO ISO_STORE_TB_transactions 
            (transaction_id, company_name, tax_id, person_type, house_number, building_name, moo, soi, road, 
             subdistrict, district, province, subdistrict_code, district_code, province_code, postcode, 
             contact_title, contact_firstname, contact_middlename, contact_lastname, 
             phone, email, total_amount, exchange_rate, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                transactionId,
                customer.company_name || null,
                customer.tax_id || null,
                customer.person_type ? 2 : 1,
                customer.house_number || null,
                customer.building_name || null,
                customer.moo || null,
                customer.soi || null,
                customer.road || null,
                customer.subdistrict || null,
                customer.district || null,
                customer.province || null,
                customer.subdistrict_code || null,
                customer.district_code || null,
                customer.province_code || null,
                customer.postcode || null,
                customer.contact_title || null,
                customer.contact_firstname || null,
                customer.contact_middlename || null,
                customer.contact_lastname || null,
                customer.phone || null,
                customer.email || null,
                totalAmount || 0,
                currentRate,
                'PENDING'
            ]
        );
        const itemSql = `INSERT INTO ISO_STORE_TB_transaction_items 
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

// API สำหรับดึงข้อมูลคำสั่งซื้อทั้งหมด (ใช้สำหรับหน้า Order History) โดยจะดึงข้อมูลจากตารางแม่และตารางลูกมารวมกันเพื่อให้แสดงผลได้ง่ายขึ้น
app.get('/api-iso-store/orders', async (req, res) => {
    const connection = await db.getConnection();
    try {
        const [rows] = await connection.execute(`
            SELECT 
                t.transaction_id AS id,
                ANY_VALUE(t.company_name) AS company,
                GROUP_CONCAT(ti.product_code SEPARATOR ', ') AS standard,
                ANY_VALUE(t.created_at) AS date,
                ANY_VALUE(t.total_amount) AS price,
                ANY_VALUE(t.status) AS status
            FROM ISO_STORE_TB_transactions t
            LEFT JOIN ISO_STORE_TB_transaction_items ti ON t.transaction_id = ti.transaction_id
            GROUP BY t.transaction_id
            ORDER BY ANY_VALUE(t.created_at) DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error("❌ Fetch Orders Error:", error.message);
        res.status(500).json({ error: "ไม่สามารถดึงข้อมูลคำสั่งซื้อได้" });
    }   finally {   
        connection.release(); 
    }
});

// API สำหรับดึงข้อมูลรายละเอียดของ 1 คำสั่งซื้อ (ตารางแม่ + ตารางลูก)
app.get('/api-iso-store/orders/:id', async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();
    try {
        const [masterRows] = await connection.execute(
            `SELECT * FROM ISO_STORE_TB_transactions WHERE transaction_id = ?`, 
            [id]
        );
        if (masterRows.length === 0) {
            return res.status(404).json({ error: "ไม่พบข้อมูลรายการสั่งซื้อนี้" });
        }
        const [itemRows] = await connection.execute(
            `SELECT * FROM ISO_STORE_TB_transaction_items WHERE transaction_id = ?`, 
            [id]
        );
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

// API สำหรับอัปเดตสถานะคำสั่งซื้อ (เมื่อแอดมินกดปุ่มอนุมัติ/ปฏิเสธ)
app.put('/api-iso-store/orders/:id/status', async (req, res) => {
    const { id } = req.params;     // รับรหัส order จาก URL
    const { status } = req.body;   // รับสถานะใหม่ที่ส่งมาจาก Frontend

    try {
        // อัปเดตตาราง transactions ให้เป็นสถานะใหม่
        const [result] = await db.execute(
            `UPDATE ISO_STORE_TB_transactions SET status = ? WHERE transaction_id = ?`,
            [status, id]
        );
        
        // ถ้าไม่มีการเปลี่ยนแปลง (หาออเดอร์ไม่เจอ)
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "ไม่พบข้อมูลรายการสั่งซื้อนี้" });
        }
        
        // ถ้าอัปเดตสำเร็จ ส่งข้อความกลับไปบอก Frontend
        res.json({ success: true, message: "อัปเดตสถานะเรียบร้อยแล้ว" });
        
    } catch (error) {
        console.error("❌ Update Status Error:", error.message);
        res.status(500).json({ error: "เซิร์ฟเวอร์ขัดข้อง ไม่สามารถอัปเดตสถานะได้" });
    }
});

// ดักจับ Path API ที่ไม่มีอยู่จริง (ป้องกัน Error Unexpected token <)
app.use('/api-iso-store', (req, res) => {
    res.status(404).json({ error: "ไม่พบ Path นี้ในระบบ API" });
});

initDatabase().then(async () => {
    await cachingExhangRate();
    app.listen(PORT, () => {
        console.log(`\n=============================================`);
        console.log(`🚀 TISI BACKEND SERVER STARTED`);
        console.log(`📍 URL: http://localhost:${PORT}`);
        console.log(`=============================================\n`);
    });
});