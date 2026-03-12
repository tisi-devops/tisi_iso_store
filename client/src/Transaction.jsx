// //หน้ากรอกฟอร์มเสนอราคา
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

function AddTransaction() {
  const navigate = useNavigate();
  const baseURL = 'http://localhost:5000/api';

  const [provinces, setProvinces] = useState([]);
  const [amphoes, setAmphoes] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedProv, setSelectedProv] = useState(null);
  const [selectedAmphoe, setSelectedAmphoe] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

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
      amphoe: selectedAmphoe?.value,
      district: selectedDistrict?.value,
      zipcode: selectedDistrict?.zipcode //รหัสไปรษณีย์
    };

    sessionStorage.setItem('customerData', JSON.stringify(formData));
    navigate('/Store');
  };

  useEffect(() => {
    axios.get(`${baseURL}/provinces`)
      .then(res => {
        const options = res.data.map(p => ({ value: p, label: p }));
        setProvinces(options);
      })
      .catch(err => console.error("Error provinces:", err));
  }, []);

  useEffect(() => {
    if (selectedProv) {
      axios.get(`${baseURL}/amphoes/${encodeURIComponent(selectedProv.value)}`)
        .then(res => {
          setAmphoes(res.data.map(a => ({ value: a, label: a })));
        });
    }
    setAmphoes([]);
    setDistricts([]);
    setSelectedAmphoe(null);
    setSelectedDistrict(null);
  }, [selectedProv]);

  useEffect(() => {
    if (selectedAmphoe && selectedProv) {
      axios.get(`${baseURL}/districts/${encodeURIComponent(selectedProv.value)}/${encodeURIComponent(selectedAmphoe.value)}`)
        .then(res => {
          setDistricts(res.data.map(d => ({ 
            value: d.district, 
            label: d.district,
            zipcode: d.zipcode 
          })));
        });
    }
    setDistricts([]);
    setSelectedDistrict(null);
  }, [selectedAmphoe, selectedProv]);

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
          <h2 className="text-3xl font-black text-slate-900 mb-2">แบบฟอร์มขอใบเสนอราคาการสั่งซื้อ<br></br>มาตรฐานต่างประเทศ</h2>
          <p className="text-slate-500">โปรดกรอกข้อมูลให้ครบถ้วนเพื่อใช้ประกอบการจัดทำใบเสนอราคาและแบบฟอร์มการสั่งซื้อ</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Company Info */}
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-50">
              <span className="text-blue-600">🏢</span>
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">ข้อมูลหน่วยงาน/ผู้สั่งซื้อ</h3>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อหน่วยงาน / บริษัท</label>
                <label className="block text-sm text-slate-500 mb-2">(สำหรับการออกใบเสนอราคา แบบฟอร์มการสั่งซื้อ ใบแจ้งหนี้และใบเสร็จรับเงิน)</label>
                <input 
                  type="text" name="comp_name" required
                  className="w-full p-4 border border-slate-200 rounded-2xl outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-300"
                  placeholder="เช่น บริษัท ทีไอเอสไอ จำกัด (มหาชน)"
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">เลขประจำตัวผู้เสียภาษี (13 หลัก)</label>
                <input 
                  type="text" name="comp_tax" required pattern="[0-9]{13}" maxLength="13"
                  className="w-full p-4 border border-slate-200 rounded-2xl outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-mono"
                  placeholder="0123456789012"
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Address */}
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">

            <div className="mb-6 pb-2 border-b border-slate-50">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-blue-600">📍</span>
                <label className="font-bold text-slate-800 uppercase tracking-wider text-sm">ที่อยู่</label>
              </div>
              <label className="block text-sm text-slate-500">(สำหรับการออกใบเสนอราคา แบบฟอร์มการสั่งซื้อ ใบแจ้งหนี้และใบเสร็จรับเงิน)</label>
            </div>
            
            <div className="space-y-4">
              <input 
                type="text" name="comp_add" required
                className="w-full p-4 border border-slate-200 rounded-2xl outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                placeholder="บ้านเลขที่, อาคาร, ถนน, ซอย"
                autoComplete="off"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select placeholder="จังหวัด" options={provinces} value={selectedProv} onChange={setSelectedProv} styles={customStyles} isSearchable />
                <Select placeholder="อำเภอ / เขต" options={amphoes} value={selectedAmphoe} onChange={setSelectedAmphoe} isDisabled={!selectedProv} styles={customStyles} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select placeholder="ตำบล / แขวง" options={districts} value={selectedDistrict} onChange={setSelectedDistrict} isDisabled={!selectedAmphoe} styles={customStyles} />
                <div className="relative">
                  <input
                    placeholder="รหัสไปรษณีย์" type="text" readOnly
                    value={selectedDistrict?.zipcode || ''} 
                    className="w-full p-4 bg-slate-50 border border-slate-100 text-slate-500 rounded-2xl outline-none cursor-not-allowed font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Contact */}
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-50">
              <span className="text-blue-600">👤</span>
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">ข้อมูลผู้ติดต่อประสานงาน</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อ-นามสกุล ผู้ติดต่อ</label>
                <input type="text" name="comp_contact" 
                       required className="w-full p-4 border border-slate-200 rounded-2xl outline-none transition-all focus:border-blue-500" 
                       placeholder="คุณสมชาย ใจดี" 
                       autoComplete="off"/>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">เบอร์โทรศัพท์มือถือ</label>
                <input type="text" name="comp_phone" 
                       required className="w-full p-4 border border-slate-200 rounded-2xl outline-none transition-all focus:border-blue-500" 
                       placeholder="08x-xxx-xxxx"
                       autoComplete="off"/>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">อีเมล (สำหรับส่งเอกสาร)</label>
                <input type="email" name="comp_email" 
                       required className="w-full p-4 border border-slate-200 rounded-2xl outline-none transition-all focus:border-blue-500" 
                       placeholder="contact@company.com"
                       autoComplete="off"/>
              </div>
            </div>
          </div>

          <button type="submit"
            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 hover:scale-[1.01] active:scale-[0.98]">
              ขั้นตอนถัดไป: เลือกมาตรฐาน →
          </button>
        </form>
      </main>
    </div>
  );
}

export default AddTransaction;