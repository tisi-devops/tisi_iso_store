//หน้ากรอกฟอร์มเสนอราคา
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import Select from 'react-select'; // นำเข้า react-select

function AddProductPage() {
  const navigate = useNavigate();

  //local server port fix
  const baseURL = 'http://localhost:5000/api';

  // ส่วนส่งข้อมูลไปหน้าค้น ISO ต่อไป
  const handleSubmit = (e) => {
    e.preventDefault();
    const el = e.target.elements;

    const p1 = "100";
    const p2 = "200";
    const p3 = "180";

    // รวบรวมข้อมูลเป็น Object ตัวเดียว
    const formData = {
      princitem1: p1,
      princitem2: p2,
      princitem3: p3,
      comp_name: el.comp_name.value,
      comp_add: el.comp_add.value,
      comp_phone: el.comp_phone.value,
      comp_tax: el.comp_tax.value,
      comp_contact: el.comp_contact.value,
      comp_email: el.comp_email.value,
      province: selectedProv?.value,
      amphoe: selectedAmphoe?.value,
      district: selectedDistrict?.value,
      zipcode: selectedDistrict?.zipcode
    };
    // 2.บันทึกลง sessionStorage (ชื่อ key ว่า 'customerData')
    // ต้องใช้ JSON.stringify เพราะ session เก็บได้เฉพาะ string
    sessionStorage.setItem('customerData', JSON.stringify(formData));

    // 3. Navigate ไปหน้าถัดไป
    navigate('/Store');
  };

  //ส่วนเตรียมข้อมูล dropdown
  const [provinces, setProvinces] = useState([]);
  const [amphoes, setAmphoes] = useState([]);
  const [districts, setDistricts] = useState([]);

  const [selectedProv, setSelectedProv] = useState(null);
  const [selectedAmphoe, setSelectedAmphoe] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

// 1. ดึงจังหวัดครั้งแรก
  useEffect(() => {
    axios.get(`${baseURL}/provinces`)
      .then(res => {
        // แปลงข้อมูลเป็น format ที่ react-select ต้องการ
        const options = res.data.map(p => ({ value: p, label: p }));
        setProvinces(options);
      })
      .catch(err => console.error("Error provinces:", err));
  }, []);

  // 2. เมื่อจังหวัดเปลี่ยน -> ดึงอำเภอ
  useEffect(() => {
    if (selectedProv) {
      axios.get(`${baseURL}/amphoes/${encodeURIComponent(selectedProv.value)}`)
        .then(res => {
          const options = res.data.map(a => ({ value: a, label: a }));
          setAmphoes(options);
        });
    }
    // ล้างค่าลำดับถัดไปเมื่อตัวแม่เปลี่ยน
    setAmphoes([]);
    setDistricts([]);
    setSelectedAmphoe(null);
    setSelectedDistrict(null);
  }, [selectedProv]);

  // 3. เมื่ออำเภอเปลี่ยน -> ดึงตำบล
  useEffect(() => {
    if (selectedAmphoe && selectedProv) {
      // เขียน URL ต่อกันเพื่อไม่ให้เกิดช่องว่าง (Whitespace)
      axios.get(`${baseURL}/districts/${encodeURIComponent(selectedProv.value)}/${encodeURIComponent(selectedAmphoe.value)}`)
        .then(res => {
          const options = res.data.map(d => ({ 
            value: d.district, 
            label: `${d.district}`,
            zipcode: d.zipcode 
          }));
          setDistricts(options);
        });
    }
    setDistricts([]);
    setSelectedDistrict(null);
  }, [selectedAmphoe, selectedProv]);

  // ปรับแต่ง Style ของ react-select ให้โค้งมนเข้ากับ Tailwind ของคุณ
  const customStyles = {
    control: (base) => ({
      ...base,
      borderRadius: '0.75rem', // rounded-xl
      padding: '2px',
      borderColor: '#e2e8f0',
      '&:hover': { borderColor: '#3b82f6' }
    })
  };

  return (
    <main className="max-w-2xl mx-auto p-6 lg:p-12">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">ข้อมูลผู้ขอซื้อมาตรฐาน</h2>
        <p className="text-slate-500">กรอกรายละเอียดเพื่อบันทึกลงในใบเสนอราคา</p>
      </header>

      {/* 2. เปลี่ยนจาก Grid/Search เป็น Form */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <label className="block text-sm font-medium mb-2">
          ชื่อ/หน่วยงาน ผู้สั่งซื้อ <br /> (สำหรับการออกใบเสนอราคา แบบฟอร์มการสั่งซื้อ ใบแจ้งหนี้และใบเสร็จรับเงิน)*
        </label>
        <input 
          type="text" 
          name="comp_name" 
          required
          className="w-full p-3 border border-slate-200 rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400"
          placeholder="กรุณากรอกข้อมูลหน่วยงาน"
        />
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            ที่อยู่ <br /> (สำหรับการออกใบเสนอราคา แบบฟอร์มการสั่งซื้อ ใบแจ้งหนี้และใบเสร็จรับเงิน)*
          </label>
          <input 
            type="text" 
            name="comp_add" 
            required
            className="w-full p-3 border border-slate-200 rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400 mb-4" 
            placeholder="เลขที่ อาคาร ถนน ซอย"
          />
        </div>
        <div className="space-y-4">
          <Select
            placeholder="-- ค้นหาจังหวัด --"
            options={provinces}
            value={selectedProv}
            onChange={setSelectedProv}
            styles={customStyles}
            isSearchable
            isClearable
          />

          <Select
            placeholder="-- ค้นหาอำเภอ --"
            options={amphoes}
            value={selectedAmphoe}
            onChange={setSelectedAmphoe}
            isDisabled={!selectedProv}
            styles={customStyles}
            isSearchable
            isClearable
          />

          <Select
            placeholder="-- ค้นหาตำบล --"
            options={districts}
            value={selectedDistrict}
            onChange={setSelectedDistrict}
            isDisabled={!selectedAmphoe}
            styles={customStyles}
            isSearchable
            isClearable
          />

          <input
            placeholder="รหัสไปรษณีย์จะแสดงเมื่อเลือกตำบล"
            type="text" 
            name="comp_zipcode" 
            readOnly // ให้ระบบเติมให้ ไม่ต้องพิมพ์เองเพื่อลดความผิดพลาด
            value={selectedDistrict?.zipcode || ''} 
            className="w-full p-3 border border-slate-100 bg-slate-50 text-slate-500 rounded-xl outline-none cursor-not-allowed"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            เบอร์โทรศัพท์*
          </label>
          <input 
            type="text" 
            name="comp_phone" 
            required
            className="w-full p-3 border border-slate-200 rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            placeholder="08X-XXX-XXXX"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            เลขประจำตัวผู้เสียภาษี*
          </label>
          <input 
            type="text" 
            name="comp_tax" 
            required
            pattern="[0-9]{13}"
            title="กรุณากรอกหมายเลขประจำตัวผู้เสียภาษี 13 หลัก"
            className="w-full p-3 border border-slate-200 rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            placeholder="หมายเลขประจำตัวผู้เสียภาษี 13 หลัก"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            ชื่อผู้ติดต่อ/ประสานงาน*
          </label>
          <input 
            type="text" 
            name="comp_contact" 
            required
            className="w-full p-3 border border-slate-200 rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            placeholder="ชื่อ-นามสกุล"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Email*
          </label>
          <input 
            type="email" 
            name="comp_email" 
            required
            className="w-full p-3 border border-slate-200 rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            placeholder="example@mail.com"
          />
        </div>
        <button type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
            ถัดไป
        </button>
      </form>
    </main>
  );
}

export default AddProductPage;