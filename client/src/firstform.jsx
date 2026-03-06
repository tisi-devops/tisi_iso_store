//หน้ากรอกฟอร์มเสนอราคา
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function AddProductPage() {
  const [formData, setFormData] = useState({ name: '', price: '' });
  const navigate = useNavigate(); // 2. สร้างตัวแปรไว้สั่งงาน

  const handleSaveClick = (e) => {
    e.preventDefault(); // กันไม่ให้หน้าเว็บรีโหลด
    navigate('/Store'); // 3. สั่งให้กระโดดไปที่ path /success ทันที
  };
  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      <main className="max-w-2xl mx-auto p-6 lg:p-12">
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800">ข้อมูลผู้ขอซื้อมาตรฐาน</h2>
          <p className="text-slate-500">กรอกรายละเอียดเพื่อบันทึกลงในใบเสนอราคา</p>
        </header>

        {/* 2. เปลี่ยนจาก Grid/Search เป็น Form */}
        <form className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">ชื่อ/หน่วยงาน ผู้สั่งซื้อ(สำหรับการออกใบเสนอราคา แบบฟอร์มการสั่งซื้อ ใบแจ้งหนี้และใบเสร็จรับเงิน)*</label>
            <input type="text" className="w-full p-2.5 border rounded-xl outline-none focus:border-blue-500" placeholder="เช่น ISO 9001:2015" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">ที่อยู่(สำหรับการออกใบเสนอราคา แบบฟอร์มการสั่งซื้อ ใบแจ้งหนี้และใบเสร็จรับเงิน)*</label>
            <input type="text" className="w-full p-2.5 border rounded-xl outline-none focus:border-blue-500" placeholder="เช่น ISO 9001:2015" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">เบอร์โทรศัพท์*</label>
            <input type="text" className="w-full p-2.5 border rounded-xl outline-none focus:border-blue-500" placeholder="เช่น ISO 9001:2015" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">เลขประจำตัวผู้เสียภาษี*</label>
            <input type="text" className="w-full p-2.5 border rounded-xl outline-none focus:border-blue-500" placeholder="เช่น ISO 9001:2015" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">ชื่อผู้ติดต่อ/ประสานงาน*</label>
            <input type="text" className="w-full p-2.5 border rounded-xl outline-none focus:border-blue-500" placeholder="เช่น ISO 9001:2015" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Email*</label>
            <input type="text" className="w-full p-2.5 border rounded-xl outline-none focus:border-blue-500" placeholder="เช่น ISO 9001:2015" />
          </div>

          <button 
          onClick={handleSaveClick}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
            ถัดไป
          </button>
        </form>
      </main>
    </div>
  );
}

export default AddProductPage;