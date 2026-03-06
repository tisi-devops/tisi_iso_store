const express = require('express');
const cors = require('cors');
const axios = require('axios');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
app.use(cors());
app.use(express.json());


//เชื่อม API BOT ExchangRate
const CLIENT_ID = 'eyJvcmciOiI2NzM1NzgwZWM4YzFlYjAwMDEyYTM3NzEiLCJpZCI6IjFlYjViZTYzZDk1ZjQ4NWM5MjI3ZDQzN2MzYmUwYTUyIiwiaCI6Im11cm11cjEyOCJ9';
//วันที่ดึงค่าเงิน
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const formatyesterday = yesterday.toISOString().slice(0, 10);

//เก็บค่า Database
let db;

//ส่วนบันทึกข้อมูลลง DataBase
async function initDatabase() {
    db = await open({
        filename: './server/database/first.sqlite', // ไฟล์จะถูกสร้างขึ้นในโฟลเดอร์ server อัตโนมัติ
        driver: sqlite3.Database
    });

    //ข้อมูลดึงลง DB ยังไม่ครบ
    await db.exec(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company_name TEXT,
            address TEXT,
            phone TEXT,
            tax_id TEXT,
            contact_person TEXT,
            email TEXT
        )
    `);
    console.log('SQLite Database & Table Ready!');
}

//ส่วนดึง API CurrencyExchangRate
async function getExchangeRate() {
    try {
        const response = await axios.get('https://gateway.api.bot.or.th/Stat-ExchangeRate/v2/DAILY_AVG_EXG_RATE/', {
            params: {
                start_period: formatyesterday,
                end_period: formatyesterday,
                currency: 'CHF'
            },
            headers: {
                Accept: '*/*',
                Authorization: CLIENT_ID
            }
        });

        const dataDetail = response.data.result.data.data_detail[0];

        if (dataDetail && dataDetail.mid_rate) {
            console.log(`วันที่: ${dataDetail.period}`);
            console.log(`สกุลเงิน: ${dataDetail.currency_name_th}`);
            return {mid_rate: dataDetail.mid_rate,
                    selling_rate: dataDetail.selling
            }
        } else {
            console.log('ไม่พบข้อมูลในช่วงเวลาที่ระบุ (อาจเป็นวันหยุด)');
        }
    } catch (error) {
        if (error.response) {
            // กรณี API ตอบกลับมาเป็น Error (เช่น 401 Disallowed)
            console.error('Error Status:', error.response.status);
            console.error('Error Message:', error.response.data);
            console.error('date_value:', formatyesterday);
            console.error('date_value_type:', typeof(formatyesterday));
            console.error('CLIENT_ID:', CLIENT_ID);
        } else {
            console.error('Error:', error.message);
        }
    }
}
initDatabase();
getExchangeRate();



app.get('/api/hello', async (req, res) => {

    const exchangeData = await getExchangeRate();
    console.log("Data from BOT function:", exchangeData);

    const responseData = {
        message: "สวัสดี! ข้อมูลนี้ส่งมาจาก Node.js Server",
        serverStatus: "Online",
        sales: "12,000 ฿",
        pendingOrders: 8,
        currency1: exchangeData ? exchangeData.mid_rate : "N/A", //อัตราแลกเปลี่ยนกลาง
        currency2: exchangeData ? exchangeData.selling_rate : "N/A" //อัตราแลกเปลี่ยนถัวเฉลี่ย
    }
    
    console.log("--- Sending JSON ---");
    console.log(responseData);

    // 4. ส่งข้อมูลออกไปหา Browser
    res.json(responseData);
});

app.listen(5000, () => {
    console.log("Server รันอยู่ที่พอร์ต 5000");
    console.log(formatyesterday);
});