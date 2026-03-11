// //หน้ากรอกฟอร์มเสนอราคา
// import axios from 'axios';
// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom'
// import Select from 'react-select'; // นำเข้า react-select

// function AddProductPage() {
//   const navigate = useNavigate();

//   //local server port fix
//   const baseURL = 'http://localhost:5000/api';

//   // ส่วนส่งข้อมูลไปหน้าค้น ISO ต่อไป
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const el = e.target.elements;

//     const p1 = "100";
//     const p2 = "200";
//     const p3 = "180";

//     // รวบรวมข้อมูลเป็น Object ตัวเดียว
//     const formData = {
//       princitem1: p1,
//       princitem2: p2,
//       princitem3: p3,
//       comp_name: el.comp_name.value,
//       comp_add: el.comp_add.value,
//       comp_phone: el.comp_phone.value,
//       comp_tax: el.comp_tax.value,
//       comp_contact: el.comp_contact.value,
//       comp_email: el.comp_email.value,
//       province: selectedProv?.value,
//       amphoe: selectedAmphoe?.value,
//       district: selectedDistrict?.value,
//       zipcode: selectedDistrict?.zipcode
//     };
//     // 2.บันทึกลง sessionStorage (ชื่อ key ว่า 'customerData')
//     // ต้องใช้ JSON.stringify เพราะ session เก็บได้เฉพาะ string
//     sessionStorage.setItem('customerData', JSON.stringify(formData));

//     // 3. Navigate ไปหน้าถัดไป
//     navigate('/Store');
//   };

//   //ส่วนเตรียมข้อมูล dropdown
//   const [provinces, setProvinces] = useState([]);
//   const [amphoes, setAmphoes] = useState([]);
//   const [districts, setDistricts] = useState([]);

//   const [selectedProv, setSelectedProv] = useState(null);
//   const [selectedAmphoe, setSelectedAmphoe] = useState(null);
//   const [selectedDistrict, setSelectedDistrict] = useState(null);

// // 1. ดึงจังหวัดครั้งแรก
//   useEffect(() => {
//     axios.get(`${baseURL}/provinces`)
//       .then(res => {
//         // แปลงข้อมูลเป็น format ที่ react-select ต้องการ
//         const options = res.data.map(p => ({ value: p, label: p }));
//         setProvinces(options);
//       })
//       .catch(err => console.error("Error provinces:", err));
//   }, []);

//   // 2. เมื่อจังหวัดเปลี่ยน -> ดึงอำเภอ
//   useEffect(() => {
//     if (selectedProv) {
//       axios.get(`${baseURL}/amphoes/${encodeURIComponent(selectedProv.value)}`)
//         .then(res => {
//           const options = res.data.map(a => ({ value: a, label: a }));
//           setAmphoes(options);
//         });
//     }
//     // ล้างค่าลำดับถัดไปเมื่อตัวแม่เปลี่ยน
//     setAmphoes([]);
//     setDistricts([]);
//     setSelectedAmphoe(null);
//     setSelectedDistrict(null);
//   }, [selectedProv]);

//   // 3. เมื่ออำเภอเปลี่ยน -> ดึงตำบล
//   useEffect(() => {
//     if (selectedAmphoe && selectedProv) {
//       // เขียน URL ต่อกันเพื่อไม่ให้เกิดช่องว่าง (Whitespace)
//       axios.get(`${baseURL}/districts/${encodeURIComponent(selectedProv.value)}/${encodeURIComponent(selectedAmphoe.value)}`)
//         .then(res => {
//           const options = res.data.map(d => ({ 
//             value: d.district, 
//             label: `${d.district}`,
//             zipcode: d.zipcode 
//           }));
//           setDistricts(options);
//         });
//     }
//     setDistricts([]);
//     setSelectedDistrict(null);
//   }, [selectedAmphoe, selectedProv]);

//   // ปรับแต่ง Style ของ react-select ให้โค้งมนเข้ากับ Tailwind ของคุณ
//   const customStyles = {
//     control: (base) => ({
//       ...base,
//       borderRadius: '0.75rem', // rounded-xl
//       padding: '2px',
//       borderColor: '#e2e8f0',
//       '&:hover': { borderColor: '#3b82f6' }
//     })
//   };

//   return (
//     <main className="max-w-2xl mx-auto p-6 lg:p-12">
//       <header className="mb-8">
//         <h2 className="text-2xl font-bold text-slate-800">ข้อมูลผู้ขอซื้อมาตรฐาน</h2>
//         <p className="text-slate-500">กรอกรายละเอียดเพื่อบันทึกลงในใบเสนอราคา</p>
//       </header>

//       {/* 2. เปลี่ยนจาก Grid/Search เป็น Form */}
//       <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
//         <label className="block text-sm font-medium mb-2">
//           ชื่อ/หน่วยงาน ผู้สั่งซื้อ <br /> (สำหรับการออกใบเสนอราคา แบบฟอร์มการสั่งซื้อ ใบแจ้งหนี้และใบเสร็จรับเงิน)*
//         </label>
//         <input 
//           type="text" 
//           name="comp_name" 
//           required
//           className="w-full p-3 border border-slate-200 rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400"
//           placeholder="กรุณากรอกข้อมูลหน่วยงาน"
//         />
//         <div className="mb-4">
//           <label className="block text-sm font-medium mb-2">
//             ที่อยู่ <br /> (สำหรับการออกใบเสนอราคา แบบฟอร์มการสั่งซื้อ ใบแจ้งหนี้และใบเสร็จรับเงิน)*
//           </label>
//           <input 
//             type="text" 
//             name="comp_add" 
//             required
//             className="w-full p-3 border border-slate-200 rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400 mb-4" 
//             placeholder="เลขที่ อาคาร ถนน ซอย"
//           />
//         </div>
//         <div className="space-y-4">
//           <Select
//             placeholder="-- ค้นหาจังหวัด --"
//             options={provinces}
//             value={selectedProv}
//             onChange={setSelectedProv}
//             styles={customStyles}
//             isSearchable
//             isClearable
//           />

//           <Select
//             placeholder="-- ค้นหาอำเภอ --"
//             options={amphoes}
//             value={selectedAmphoe}
//             onChange={setSelectedAmphoe}
//             isDisabled={!selectedProv}
//             styles={customStyles}
//             isSearchable
//             isClearable
//           />

//           <Select
//             placeholder="-- ค้นหาตำบล --"
//             options={districts}
//             value={selectedDistrict}
//             onChange={setSelectedDistrict}
//             isDisabled={!selectedAmphoe}
//             styles={customStyles}
//             isSearchable
//             isClearable
//           />

//           <input
//             placeholder="รหัสไปรษณีย์จะแสดงเมื่อเลือกตำบล"
//             type="text" 
//             name="comp_zipcode" 
//             readOnly // ให้ระบบเติมให้ ไม่ต้องพิมพ์เองเพื่อลดความผิดพลาด
//             value={selectedDistrict?.zipcode || ''} 
//             className="w-full p-3 border border-slate-100 bg-slate-50 text-slate-500 rounded-xl outline-none cursor-not-allowed"
//           />
//         </div>
//         <div className="mb-4">
//           <label className="block text-sm font-medium mb-2">
//             เบอร์โทรศัพท์*
//           </label>
//           <input 
//             type="text" 
//             name="comp_phone" 
//             required
//             className="w-full p-3 border border-slate-200 rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
//             placeholder="08X-XXX-XXXX"
//           />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm font-medium mb-2">
//             เลขประจำตัวผู้เสียภาษี*
//           </label>
//           <input 
//             type="text" 
//             name="comp_tax" 
//             required
//             pattern="[0-9]{13}"
//             title="กรุณากรอกหมายเลขประจำตัวผู้เสียภาษี 13 หลัก"
//             className="w-full p-3 border border-slate-200 rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
//             placeholder="หมายเลขประจำตัวผู้เสียภาษี 13 หลัก"
//           />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm font-medium mb-2">
//             ชื่อผู้ติดต่อ/ประสานงาน*
//           </label>
//           <input 
//             type="text" 
//             name="comp_contact" 
//             required
//             className="w-full p-3 border border-slate-200 rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
//             placeholder="ชื่อ-นามสกุล"
//           />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm font-medium mb-2">
//             Email*
//           </label>
//           <input 
//             type="email" 
//             name="comp_email" 
//             required
//             className="w-full p-3 border border-slate-200 rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
//             placeholder="example@mail.com"
//           />
//         </div>
//         <button type="submit"
//           className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
//             ถัดไป
//         </button>
//       </form>
//     </main>
//   );
// }

// export default AddProductPage;




import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

function AddProductPage() {
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
      princitem1: "100", // ราคาสมมติ
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
        
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-10 gap-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">1</span>
            <span className="font-bold text-slate-900">ข้อมูลผู้ซื้อ</span>
          </div>
          <div className="w-12 h-[2px] bg-slate-200"></div>
          <div className="flex items-center gap-2 opacity-40">
            <span className="w-8 h-8 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center font-bold text-sm">2</span>
            <span className="font-bold text-slate-500">เลือกสินค้า</span>
          </div>
        </div>

        <header className="mb-8 text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-2">ลงทะเบียนผู้สั่งซื้อ</h2>
          <p className="text-slate-500">กรุณากรอกข้อมูลที่ถูกต้องเพื่อใช้ในการออกเอกสารสำคัญ</p>
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
                <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อหน่วยงาน / บริษัท*</label>
                <input 
                  type="text" name="comp_name" required
                  className="w-full p-4 border border-slate-200 rounded-2xl outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-300"
                  placeholder="เช่น บริษัท ทีไอเอสไอ จำกัด (มหาชน)"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">เลขประจำตัวผู้เสียภาษี (13 หลัก)*</label>
                <input 
                  type="text" name="comp_tax" required pattern="[0-9]{13}"
                  className="w-full p-4 border border-slate-200 rounded-2xl outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-mono"
                  placeholder="0123456789012"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Address */}
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-50">
              <span className="text-blue-600">📍</span>
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">ที่อยู่ในการจัดส่งและออกเอกสาร</h3>
            </div>

            <div className="space-y-4">
              <input 
                type="text" name="comp_add" required
                className="w-full p-4 border border-slate-200 rounded-2xl outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                placeholder="บ้านเลขที่, อาคาร, ถนน, ซอย"
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
                <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อ-นามสกุล ผู้ติดต่อ*</label>
                <input type="text" name="comp_contact" required className="w-full p-4 border border-slate-200 rounded-2xl outline-none transition-all focus:border-blue-500" placeholder="คุณสมชาย ใจดี" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">เบอร์โทรศัพท์มือถือ*</label>
                <input type="text" name="comp_phone" required className="w-full p-4 border border-slate-200 rounded-2xl outline-none transition-all focus:border-blue-500" placeholder="08x-xxx-xxxx" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">อีเมล (สำหรับส่งเอกสาร)*</label>
                <input type="email" name="comp_email" required className="w-full p-4 border border-slate-200 rounded-2xl outline-none transition-all focus:border-blue-500" placeholder="contact@company.com" />
              </div>
            </div>
          </div>

          <button type="submit"
            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 hover:scale-[1.01] active:scale-[0.98]">
              ขั้นตอนถัดไป: เลือกมาตรฐาน ISO →
          </button>
        </form>
      </main>
    </div>
  );
}

export default AddProductPage;