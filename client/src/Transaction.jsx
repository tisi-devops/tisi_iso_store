import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

function AddTransaction() {
  const navigate = useNavigate();
  const baseURL = 'http://localhost:5000/api';

  // 1. ประกาศ State ให้สอดคล้องกับโครงสร้างใหม่
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]); // เดิมคือ amphoes (อำเภอ)
  const [subDistricts, setSubDistricts] = useState([]); // เดิมคือ districts (ตำบล)

  const [selectedProv, setSelectedProv] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedSubDistrict, setSelectedSubDistrict] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const el = e.target.elements;

    const formData = {
      comp_name: el.comp_name.value,
      comp_phone: el.comp_phone.value,
      comp_tax: el.comp_tax.value,
      comp_contact: el.comp_contact.value,
      comp_email: el.comp_email.value,
      comp_add: el.comp_add.value,
      province: selectedProv?.value,
      district: selectedDistrict?.value,       // อำเภอ
      sub_district: selectedSubDistrict?.value, // ตำบล
      postcode: selectedSubDistrict?.postcode   // รหัสไปรษณีย์
    };

    sessionStorage.setItem('customerData', JSON.stringify(formData));
    navigate('/Store');
  };

  // 2. ดึงจังหวัด (ทำครั้งเดียวตอนโหลดหน้า)
  useEffect(() => {
    axios.get(`${baseURL}/provinces`)
      .then(res => {
        const options = res.data.map(p => ({ value: p, label: p }));
        setProvinces(options);
      })
      .catch(err => console.error("Error provinces:", err));
  }, []);

  // 3. เมื่อเลือก "จังหวัด" -> ไปดึง "อำเภอ (District)"
  useEffect(() => {
    if (selectedProv) {
      axios.get(`${baseURL}/amphoes/${encodeURIComponent(selectedProv.value)}`)
        .then(res => {
          setDistricts(res.data.map(a => ({ value: a, label: a })));
        });
    }
    // ล้างค่าลูกเมื่อเปลี่ยนค่าแม่
    setDistricts([]);
    setSubDistricts([]);
    setSelectedDistrict(null);
    setSelectedSubDistrict(null);
  }, [selectedProv]);

  // 4. เมื่อเลือก "อำเภอ (District)" -> ไปดึง "ตำบล (SubDistrict)"
  useEffect(() => {
    if (selectedDistrict && selectedProv) {
      axios.get(`${baseURL}/districts/${encodeURIComponent(selectedProv.value)}/${encodeURIComponent(selectedDistrict.value)}`)
        .then(res => {
          setSubDistricts(res.data.map(d => ({ 
            value: d.district, 
            label: d.district,
            postcode: d.zipcode 
          })));
        });
    }
    setSubDistricts([]);
    setSelectedSubDistrict(null);
  }, [selectedDistrict, selectedProv]);

  const customStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: '0.75rem',
      padding: '4px',
      borderColor: state.isFocused ? '#3b82f6' : '#e2e8f0',
      boxShadow: state.isFocused ? '0 0 0 4px rgba(59, 130, 246, 0.1)' : 'none',
      '&:hover': { borderColor: '#3b82f6' }
    }),
    placeholder: (base) => ({ ...base, color: '#94a3b8' })
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 pb-20">
      <main className="max-w-3xl mx-auto p-6 lg:pt-16">
        <header className="mb-8 text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-2">แบบฟอร์มขอใบเสนอราคา</h2>
          <p className="text-slate-500">โปรดกรอกข้อมูลให้ครบถ้วนเพื่อใช้ประกอบการสั่งซื้อ</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ข้อมูลหน่วยงาน */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-50">
              <span className="text-blue-600">🏢</span>
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">ข้อมูลผู้สั่งซื้อ</h3>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อหน่วยงาน / บริษัท</label>
                <input type="text" name="comp_name" required className="w-full p-4 border border-slate-200 rounded-2xl outline-none" placeholder="ชื่อหน่วยงาน..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">เลขประจำตัวผู้เสียภาษี</label>
                <input type="text" name="comp_tax" required pattern="[0-9]{13}" maxLength="13" className="w-full p-4 border border-slate-200 rounded-2xl outline-none font-mono" placeholder="13 หลัก" />
              </div>
            </div>
          </div>

          {/* ที่อยู่ */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            <div className="mb-6 pb-2 border-b border-slate-50 flex items-center gap-2">
              <span className="text-blue-600">📍</span>
              <label className="font-bold text-slate-800 text-sm">ที่อยู่</label>
            </div>
            <div className="space-y-4">
              <input type="text" name="comp_add" required className="w-full p-4 border border-slate-200 rounded-2xl outline-none" placeholder="บ้านเลขที่, อาคาร, ถนน, ซอย" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select placeholder="จังหวัด" options={provinces} value={selectedProv} onChange={setSelectedProv} styles={customStyles} isSearchable />
                <Select placeholder="อำเภอ / เขต" options={districts} value={selectedDistrict} onChange={setSelectedDistrict} isDisabled={!selectedProv} styles={customStyles} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select placeholder="ตำบล / แขวง" options={subDistricts} value={selectedSubDistrict} onChange={setSelectedSubDistrict} isDisabled={!selectedDistrict} styles={customStyles} />
                <input placeholder="รหัสไปรษณีย์" type="text" readOnly value={selectedSubDistrict?.postcode || ''} className="w-full p-4 bg-slate-50 border border-slate-100 text-slate-500 rounded-2xl cursor-not-allowed font-bold" />
              </div>
            </div>
          </div>

          {/* ข้อมูลผู้ติดต่อ */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-50">
              <span className="text-blue-600">👤</span>
              <h3 className="font-bold text-slate-800 text-sm">ข้อมูลผู้ติดต่อประสานงาน</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" name="comp_contact" required className="w-full p-4 border border-slate-200 rounded-2xl outline-none" placeholder="ชื่อ-นามสกุล" />
              <input type="text" name="comp_phone" required className="w-full p-4 border border-slate-200 rounded-2xl outline-none" placeholder="เบอร์โทรศัพท์" />
              <div className="md:col-span-2">
                <input type="email" name="comp_email" required className="w-full p-4 border border-slate-200 rounded-2xl outline-none" placeholder="อีเมลสำหรับรับเอกสาร" />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-blue-700 transition-all shadow-xl">
            ขั้นตอนถัดไป: เลือกมาตรฐาน →
          </button>
        </form>
      </main>
    </div>
  );
}

export default AddTransaction;