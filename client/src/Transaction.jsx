// import axios from 'axios';
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Select from 'react-select';

// function AddTransaction() {
//   const navigate = useNavigate();
//   const baseURL = 'http://localhost:5000/api';

//   // 1. ประกาศ State ให้สอดคล้องกับโครงสร้างใหม่
//   const [provinces, setProvinces] = useState([]);
//   const [districts, setDistricts] = useState([]); // เดิมคือ amphoes (อำเภอ)
//   const [subDistricts, setSubDistricts] = useState([]); // เดิมคือ districts (ตำบล)

//   const [selectedProv, setSelectedProv] = useState(null);
//   const [selectedDistrict, setSelectedDistrict] = useState(null);
//   const [selectedSubDistrict, setSelectedSubDistrict] = useState(null);

//   //สำหรับ OTP (ถ้าต้องการใช้ในอนาคต)
//   const [showOTPModal, setShowOTPModal] = useState(false);
//   const [otpInput, setOtpInput] = useState('');
//   const [serverRef, setServerRef] = useState(''); // เก็บ Ref code ที่ได้จากหลังบ้านมาโชว์
//   const [emailForOTP, setEmailForOTP] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const el = e.target.elements;

//     const formData = {
//       comp_name: el.comp_name.value,
//       comp_phone: el.comp_phone.value,
//       comp_tax: el.comp_tax.value,
//       comp_contact: el.comp_contact.value,
//       comp_email: el.comp_email.value,
//       comp_add: el.comp_add.value,
//       province: selectedProv?.value,
//       district: selectedDistrict?.value,       // อำเภอ
//       sub_district: selectedSubDistrict?.value, // ตำบล
//       postcode: selectedSubDistrict?.postcode   // รหัสไปรษณีย์
//     };

//     sessionStorage.setItem('customerData', JSON.stringify(formData));
//     navigate('/Store');
//   };

//   // 2. ดึงจังหวัด (ทำครั้งเดียวตอนโหลดหน้า)
//   useEffect(() => {
//     axios.get(`${baseURL}/provinces`)
//       .then(res => {
//         const options = res.data.map(p => ({ value: p, label: p }));
//         setProvinces(options);
//       })
//       .catch(err => console.error("Error provinces:", err));
//   }, []);

//   // 3. เมื่อเลือก "จังหวัด" -> ไปดึง "อำเภอ (District)"
//   useEffect(() => {
//     if (selectedProv) {
//       axios.get(`${baseURL}/amphoes/${encodeURIComponent(selectedProv.value)}`)
//         .then(res => {
//           setDistricts(res.data.map(a => ({ value: a, label: a })));
//         });
//     }
//     // ล้างค่าลูกเมื่อเปลี่ยนค่าแม่
//     setDistricts([]);
//     setSubDistricts([]);
//     setSelectedDistrict(null);
//     setSelectedSubDistrict(null);
//   }, [selectedProv]);

//   // 4. เมื่อเลือก "อำเภอ (District)" -> ไปดึง "ตำบล (SubDistrict)"
//   useEffect(() => {
//     if (selectedDistrict && selectedProv) {
//       axios.get(`${baseURL}/districts/${encodeURIComponent(selectedProv.value)}/${encodeURIComponent(selectedDistrict.value)}`)
//         .then(res => {
//           setSubDistricts(res.data.map(d => ({ 
//             value: d.district, 
//             label: d.district,
//             postcode: d.zipcode 
//           })));
//         });
//     }
//     setSubDistricts([]);
//     setSelectedSubDistrict(null);
//   }, [selectedDistrict, selectedProv]);

//   const customStyles = {
//     control: (base, state) => ({
//       ...base,
//       borderRadius: '0.75rem',
//       padding: '4px',
//       borderColor: state.isFocused ? '#3b82f6' : '#e2e8f0',
//       boxShadow: state.isFocused ? '0 0 0 4px rgba(59, 130, 246, 0.1)' : 'none',
//       '&:hover': { borderColor: '#3b82f6' }
//     }),
//     placeholder: (base) => ({ ...base, color: '#94a3b8' })
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 pb-20">
//       <main className="max-w-3xl mx-auto p-6 lg:pt-16">
//         <header className="mb-8 text-center">
//           <h2 className="text-3xl font-black text-slate-900 mb-2">แบบฟอร์มขอใบเสนอราคา</h2>
//           <p className="text-slate-500">โปรดกรอกข้อมูลให้ครบถ้วนเพื่อใช้ประกอบการสั่งซื้อ</p>
//         </header>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* ข้อมูลหน่วยงาน */}
//           <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
//             <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-50">
//               <span className="text-blue-600">🏢</span>
//               <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">ข้อมูลผู้สั่งซื้อ</h3>
//             </div>
//             <div className="space-y-5">
//               <div>
//                 <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อหน่วยงาน / บริษัท</label>
//                 <input type="text" name="comp_name" required className="w-full p-4 border border-slate-200 rounded-2xl outline-none" placeholder="ชื่อหน่วยงาน..." />
//               </div>
//               <div>
//                 <label className="block text-sm font-bold text-slate-700 mb-2">เลขประจำตัวผู้เสียภาษี</label>
//                 <input type="text" name="comp_tax" required pattern="[0-9]{13}" maxLength="13" className="w-full p-4 border border-slate-200 rounded-2xl outline-none font-mono" placeholder="13 หลัก" />
//               </div>
//             </div>
//           </div>

//           {/* ที่อยู่ */}
//           <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
//             <div className="mb-6 pb-2 border-b border-slate-50 flex items-center gap-2">
//               <span className="text-blue-600">📍</span>
//               <label className="font-bold text-slate-800 text-sm">ที่อยู่</label>
//             </div>
//             <div className="space-y-4">
//               <input type="text" name="comp_add" required className="w-full p-4 border border-slate-200 rounded-2xl outline-none" placeholder="บ้านเลขที่, อาคาร, ถนน, ซอย" />
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <Select placeholder="จังหวัด" options={provinces} value={selectedProv} onChange={setSelectedProv} styles={customStyles} isSearchable />
//                 <Select placeholder="อำเภอ / เขต" options={districts} value={selectedDistrict} onChange={setSelectedDistrict} isDisabled={!selectedProv} styles={customStyles} />
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <Select placeholder="ตำบล / แขวง" options={subDistricts} value={selectedSubDistrict} onChange={setSelectedSubDistrict} isDisabled={!selectedDistrict} styles={customStyles} />
//                 <input placeholder="รหัสไปรษณีย์" type="text" readOnly value={selectedSubDistrict?.postcode || ''} className="w-full p-4 bg-slate-50 border border-slate-100 text-slate-500 rounded-2xl cursor-not-allowed font-bold" />
//               </div>
//             </div>
//           </div>

//           {/* ข้อมูลผู้ติดต่อ */}
//           <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
//             <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-50">
//               <span className="text-blue-600">👤</span>
//               <h3 className="font-bold text-slate-800 text-sm">ข้อมูลผู้ติดต่อประสานงาน</h3>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <input type="text" name="comp_contact" required className="w-full p-4 border border-slate-200 rounded-2xl outline-none" placeholder="ชื่อ-นามสกุล" />
//               <input type="text" name="comp_phone" required className="w-full p-4 border border-slate-200 rounded-2xl outline-none" placeholder="เบอร์โทรศัพท์" />
//               <div className="md:col-span-2">
//                 <input type="email" name="comp_email" required className="w-full p-4 border border-slate-200 rounded-2xl outline-none" placeholder="อีเมลสำหรับรับเอกสาร" />
//               </div>
//             </div>
//           </div>

//           <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-blue-700 transition-all shadow-xl">
//             ขั้นตอนถัดไป: เลือกมาตรฐาน →
//           </button>
//         </form>
//       </main>
//     </div>
//   );
// }

// export default AddTransaction;













import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

function AddTransaction() {
  const navigate = useNavigate();
  const baseURL = 'http://localhost:5000/api';

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);

  const [selectedProv, setSelectedProv] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedSubDistrict, setSelectedSubDistrict] = useState(null);

  // 🌟 State สำหรับระบบ OTP
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [serverRef, setServerRef] = useState('');
  const [emailForOTP, setEmailForOTP] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [tempFormData, setTempFormData] = useState(null);

  // 1. ฟังก์ชันเมื่อกดปุ่ม "ขั้นตอนถัดไป" (ส่ง OTP ก่อน)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    const el = e.target.elements;

    const formData = {
      comp_name: el.comp_name.value,
      comp_phone: el.comp_phone.value,
      comp_tax: el.comp_tax.value,
      comp_contact: el.comp_contact.value,
      comp_email: el.comp_email.value,
      comp_add: el.comp_add.value,
      province: selectedProv?.value,
      district: selectedDistrict?.value,
      sub_district: selectedSubDistrict?.value,
      postcode: selectedSubDistrict?.postcode
    };

    setEmailForOTP(formData.comp_email);
    setTempFormData(formData); // เก็บข้อมูลไว้ชั่วคราว รอตรวจ OTP ผ่าน

    try {
      // 🚀 ยิง API ไปหา Server เพื่อส่งอีเมล
    const res = await axios.post(`${baseURL}/send-otp`, { email: formData.comp_email });
      if (res.data.success) {
        setServerRef(res.data.ref);
        setShowOTPModal(true); // เปิด Pop-up ยืนยัน
      }
    } catch (err) {
      alert("ไม่สามารถส่ง OTP ได้ กรุณาตรวจสอบอีเมลหรือลองใหม่อีกครั้ง");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
        const res = await axios.post(`${baseURL}/verify-otp`, { 
            email: emailForOTP, 
            otp: otpInput 
        });

        if (res.data.success) {
            sessionStorage.setItem('customerData', JSON.stringify(tempFormData));
            setShowOTPModal(false);
            navigate('/Store');
        }
    } catch (err) {
        // ถ้า Server ตอบกลับมาเป็น 400 (รหัสผิด) จะตกมาที่นี่
        alert(err.response?.data?.message || "รหัส OTP ไม่ถูกต้อง");
    }
  };

  // 3. ดึงข้อมูลที่อยู่ (คงเดิม)
  useEffect(() => {
    axios.get(`${baseURL}/provinces`)
      .then(res => setProvinces(res.data.map(p => ({ value: p, label: p }))))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedProv) {
      axios.get(`${baseURL}/amphoes/${encodeURIComponent(selectedProv.value)}`)
        .then(res => setDistricts(res.data.map(a => ({ value: a, label: a }))));
    }
    setDistricts([]); setSubDistricts([]); setSelectedDistrict(null); setSelectedSubDistrict(null);
  }, [selectedProv]);

  useEffect(() => {
    if (selectedDistrict && selectedProv) {
      axios.get(`${baseURL}/districts/${encodeURIComponent(selectedProv.value)}/${encodeURIComponent(selectedDistrict.value)}`)
        .then(res => setSubDistricts(res.data.map(d => ({ value: d.district, label: d.district, postcode: d.zipcode }))));
    }
    setSubDistricts([]); setSelectedSubDistrict(null);
  }, [selectedDistrict, selectedProv]);

  const customStyles = {
    control: (base, state) => ({
      ...base, borderRadius: '0.75rem', padding: '4px', borderColor: state.isFocused ? '#3b82f6' : '#e2e8f0'
    })
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 pb-20 relative">
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
              <input type="text" name="comp_name" required className="w-full p-4 border border-slate-200 rounded-2xl outline-none" placeholder="ชื่อหน่วยงาน / บริษัท" />
              <input type="text" name="comp_tax" required pattern="[0-9]{13}" maxLength="13" className="w-full p-4 border border-slate-200 rounded-2xl outline-none font-mono" placeholder="เลขผู้เสียภาษี 13 หลัก" />
            </div>
          </div>

          {/* ที่อยู่ */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            <div className="mb-6 pb-2 border-b border-slate-50 flex items-center gap-2">
              <span className="text-blue-600">📍</span>
              <label className="font-bold text-slate-800 text-sm">ที่อยู่จัดส่งเอกสาร</label>
            </div>
            <div className="space-y-4">
              <input type="text" name="comp_add" required className="w-full p-4 border border-slate-200 rounded-2xl outline-none" placeholder="บ้านเลขที่, ถนน, ซอย" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select placeholder="จังหวัด" options={provinces} value={selectedProv} onChange={setSelectedProv} styles={customStyles} />
                <Select placeholder="อำเภอ / เขต" options={districts} value={selectedDistrict} onChange={setSelectedDistrict} isDisabled={!selectedProv} styles={customStyles} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select placeholder="ตำบล / แขวง" options={subDistricts} value={selectedSubDistrict} onChange={setSelectedSubDistrict} isDisabled={!selectedDistrict} styles={customStyles} />
                <input placeholder="รหัสไปรษณีย์" type="text" readOnly value={selectedSubDistrict?.postcode || ''} className="w-full p-4 bg-slate-50 border border-slate-100 text-slate-500 rounded-2xl" />
              </div>
            </div>
          </div>

          {/* ข้อมูลผู้ติดต่อ */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-50">
              <span className="text-blue-600">👤</span>
              <h3 className="font-bold text-slate-800 text-sm">ข้อมูลผู้ติดต่อ</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" name="comp_contact" required className="w-full p-4 border border-slate-200 rounded-2xl outline-none" placeholder="ชื่อ-นามสกุล" />
              <input type="text" name="comp_phone" required className="w-full p-4 border border-slate-200 rounded-2xl outline-none" placeholder="เบอร์โทรศัพท์" />
              <div className="md:col-span-2">
                <input type="email" name="comp_email" required className="w-full p-4 border border-slate-200 rounded-2xl outline-none" placeholder="อีเมล (สำหรับรับรหัส OTP)" />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSending}
            className={`w-full py-5 rounded-2xl font-black text-xl transition-all shadow-xl ${isSending ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            {isSending ? 'กำลังส่ง OTP...' : 'ขั้นตอนถัดไป: เลือกมาตรฐาน →'}
          </button>
        </form>
      </main>

      {/* 🌟 4. OTP Modal (Pop-up) */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 animate-in zoom-in duration-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✉️</div>
              <h3 className="text-xl font-black text-slate-800 mb-2">ยืนยันรหัส OTP</h3>
              <p className="text-slate-500 text-sm mb-6">
                เราได้ส่งรหัสไปยัง <span className="font-bold text-slate-700">{emailForOTP}</span> แล้ว<br/>
                รหัสอ้างอิง: <span className="text-blue-600 font-bold">{serverRef}</span>
              </p>
              
              <input 
                type="text" 
                maxLength="6"
                placeholder="ระบุรหัส 6 หลัก"
                className="w-full text-center text-3xl font-black tracking-[8px] p-4 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition-all mb-6"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
              />

              <div className="flex gap-3">
                <button onClick={() => setShowOTPModal(false)} className="flex-1 py-3 text-slate-400 font-bold hover:bg-slate-50 rounded-xl">ยกเลิก</button>
                <button onClick={handleVerifyOTP} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200">ยืนยันรหัส</button>
              </div>
              
              <p className="mt-6 text-xs text-slate-400">หากไม่ได้รับรหัส? <button className="text-blue-600 font-bold hover:underline">ส่งอีกครั้ง</button></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddTransaction;