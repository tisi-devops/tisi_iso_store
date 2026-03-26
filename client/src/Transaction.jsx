// import axios from 'axios';
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Select from 'react-select';

// function AddTransaction() {
//   const navigate = useNavigate();
//   const baseURL = 'http://localhost:5000/api';

//   // --- States สำหรับที่อยู่ ---
//   const [provinces, setProvinces] = useState([]);
//   const [districts, setDistricts] = useState([]);
//   const [subDistricts, setSubDistricts] = useState([]);
//   const [selectedProv, setSelectedProv] = useState(null);
//   const [selectedDistrict, setSelectedDistrict] = useState(null);
//   const [selectedSubDistrict, setSelectedSubDistrict] = useState(null);

//   // --- States สำหรับระบบ OTP & ฟอร์ม ---
//   const [isCorporate, setIsCorporate] = useState(false); // false=1 (บุคคล), true=2 (นิติบุคคล)
//   const [showOTPModal, setShowOTPModal] = useState(false);
//   const [otpInput, setOtpInput] = useState('');
//   const [serverRef, setServerRef] = useState('');
//   const [emailForOTP, setEmailForOTP] = useState('');
//   const [isSending, setIsSending] = useState(false);
//   const [tempFormData, setTempFormData] = useState(null);

//   const [selectedTitle, setSelectedTitle] = useState(null);
//   const titleOptions = [
//     { value: 'นาย', label: 'นาย (Mr.)' },
//     { value: 'นาง', label: 'นาง (Mrs.)' },
//     { value: 'นางสาว', label: 'นางสาว (Ms.)' },
//   ];

//   // 1. ฟังก์ชันส่ง OTP (Handle Submit)
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSending(true);
//     const el = e.target.elements;

//     // จัดโครงสร้างข้อมูลให้ตรงกับ Table 'transactions' ใน MySQL
//     const formData = {
//       is_corporate: isCorporate, // ใช้เช็คใน Backend เพื่อลง personType
//       comp_name: el.comp_name.value,
//       comp_tax: isCorporate ? (el.comp_tax?.value || '') : 'INDIVIDUAL',
//       // ข้อมูลที่อยู่ (ตามชื่อ Column ใน DB)
//       comp_add: el.comp_add.value,   // house_number
//       comp_moo: el.comp_moo.value,   // moo
//       comp_soi: el.comp_soi.value,   // soi
//       comp_road: el.comp_road.value, // road
//       province: selectedProv?.value,
//       district: selectedDistrict?.value,
//       sub_district: selectedSubDistrict?.value,
//       postcode: selectedSubDistrict?.postcode,
//       // ข้อมูลผู้ติดต่อ
//       title: selectedTitle?.value,
//       firstname: el.comp_firstname.value,
//       middlename: el.comp_middlename.value || '',
//       lastname: el.comp_lastname.value,
//       comp_phone: el.comp_phone.value,
//       comp_email: el.comp_email.value,
//     };

//     setEmailForOTP(formData.comp_email);
//     setTempFormData(formData);

//     try {
//       const res = await axios.post(`${baseURL}/send-otp`, { email: formData.comp_email });
//       if (res.data.success) {
//         setServerRef(res.data.ref);
//         setShowOTPModal(true);
//       }
//     } catch (err) {
//       alert("ไม่สามารถส่ง OTP ได้ กรุณาตรวจสอบอีเมลหรือลองใหม่อีกครั้ง");
//     } finally {
//       setIsSending(false);
//     }
//   };

//   // 2. ฟังก์ชันยืนยัน OTP
//   const handleVerifyOTP = async () => {
//     try {
//       const res = await axios.post(`${baseURL}/verify-otp`, { 
//         email: emailForOTP, 
//         otp: otpInput 
//       });

//       if (res.data.success) {
//         // บันทึกข้อมูลลง Session และไปหน้า Store
//         sessionStorage.setItem('customerData', JSON.stringify(tempFormData));
//         setShowOTPModal(false);
//         navigate('/Store');
//       }
//     } catch (err) {
//       alert(err.response?.data?.message || "รหัส OTP ไม่ถูกต้อง");
//     }
//   };

// // --- ส่วนของ Logic การดึงข้อมูล ---
// // 1. โหลดจังหวัดครั้งแรกที่เปิดหน้า
// useEffect(() => {
//     axios.get(`${baseURL}/provinces`)
//         .then(res => setProvinces(res.data))
//         .catch(err => console.error(err));
// }, []);

// // 2. เมื่อเลือกจังหวัด -> ไปดึงอำเภอ
// useEffect(() => {
//     if (selectedProv) {
//         axios.get(`${baseURL}/amphoes/${selectedProv.value}`)
//             .then(res => setDistricts(res.data));
//     }
//     // ล้างค่าเก่าเมื่อเปลี่ยนจังหวัด
//     setDistricts([]); 
//     setSubDistricts([]);
//     setSelectedDistrict(null);
//     setSelectedSubDistrict(null);
// }, [selectedProv]);

// // 3. เมื่อเลือกอำเภอ -> ไปดึงตำบล
// useEffect(() => {
//     if (selectedDistrict) {
//         axios.get(`${baseURL}/districts/${selectedDistrict.value}`)
//             .then(res => setSubDistricts(res.data));
//     }
//     // ล้างค่าเก่าเมื่อเปลี่ยนอำเภอ
//     setSubDistricts([]);
//     setSelectedSubDistrict(null);
// }, [selectedDistrict]);


//   const customStyles = {
//     control: (base, state) => ({
//       ...base, borderRadius: '1rem', padding: '8px', borderColor: state.isFocused ? '#040d8b' : '#e2e8f0', boxShadow: 'none'
//     })
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 pb-20 relative">
//       <main className="max-w-3xl mx-auto p-6 lg:pt-16">
//         <header className="mb-8 text-center">
//           <h2 className="text-3xl font-black text-slate-900 mb-2 italic">TISI E-STORE</h2>
//           <p className="text-slate-500">กรุณากรอกข้อมูลเพื่อใช้ประกอบการออกเอกสารมาตรฐาน</p>
//         </header>

//         {/* 🌟 Tab Selector ด้านบน Card */}
//         <div className="flex border-b border-slate-200 bg-white rounded-t-[2.5rem] overflow-hidden shadow-sm">
//           <button type="button" onClick={() => setIsCorporate(false)}
//             className={`flex-1 py-5 text-sm font-black transition-all border-b-4 ${!isCorporate ? 'bg-white text-blue-600 border-blue-600' : 'bg-slate-50 text-slate-400 border-transparent'}`}>
//             👤 บุคคลธรรมดา
//           </button>
//           <button type="button" onClick={() => setIsCorporate(true)}
//             className={`flex-1 py-5 text-sm font-black transition-all border-b-4 ${isCorporate ? 'bg-white text-blue-600 border-blue-600' : 'bg-slate-50 text-slate-400 border-transparent'}`}>
//             🏢 นิติบุคคล / หน่วยงาน
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* ส่วนข้อมูลหน่วยงาน/บุคคล */}
//           <div className="bg-white p-8 rounded-b-3xl shadow-xl border-x border-b border-slate-100">
//             <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-50">
//               <span className="text-red-600">{isCorporate ? '🏢' : '👤'}</span>
//               <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">ข้อมูลผู้สั่งซื้อ</h3>
//             </div>
//             <div className="space-y-5">
//               <input required type="text" name="comp_name" 
//                 className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-red-500 transition-all" 
//                 placeholder={isCorporate ? "ชื่อบริษัท / ชื่อหน่วยงาน" : "ชื่อ-นามสกุล (สำหรับพิมพ์ลายน้ำ)"} />
              
//               {isCorporate && (
//                 <input required type="text" name="comp_tax" pattern="[0-9]{13}" maxLength="13" 
//                   className="w-full p-4 border border-slate-200 rounded-2xl outline-none font-mono focus:border-red-500 animate-in fade-in slide-in-from-top-2" 
//                   placeholder="เลขผู้เสียภาษี 13 หลัก" />
//               )}
//               {!isCorporate && (
//                 <input required type="text" name="comp_tax" pattern="[0-9]{13}" maxLength="13" 
//                   className="w-full p-4 border border-slate-200 rounded-2xl outline-none font-mono focus:border-red-500 animate-in fade-in slide-in-from-top-2" 
//                   placeholder="เลขประจำตัวประชาชน 13 หลัก" />
//               )}
//             </div>
//           </div>
//           {/* ส่วนที่อยู่จัดส่งเอกสาร */}
//           <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
//             <div className="mb-6 pb-2 border-b border-slate-50 flex items-center gap-2">
//               <span className="text-red-600">📍</span>
//               <label className="font-bold text-slate-800 text-sm uppercase tracking-wider">ที่อยู่จัดส่งเอกสาร</label>
//             </div>
//             <div className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <Select 
//                     placeholder="จังหวัด" 
//                     options={provinces} 
//                     value={selectedProv} 
//                     onChange={setSelectedProv} 
//                     styles={customStyles} 
//                 />
//                 <Select 
//                     placeholder="อำเภอ / เขต" 
//                     options={districts} 
//                     value={selectedDistrict} 
//                     onChange={setSelectedDistrict} 
//                     isDisabled={!selectedProv} 
//                     styles={customStyles} 
//                 />
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
//                 <Select 
//                     placeholder="ตำบล / แขวง" 
//                     options={subDistricts} 
//                     value={selectedSubDistrict} 
//                     onChange={setSelectedSubDistrict} 
//                     isDisabled={!selectedDistrict} 
//                     styles={customStyles} 
//                 />
//                 {/* ✅ รหัสไปรษณีย์ดึงอัตโนมัติจากตำบล */}
//                 <input 
//                     placeholder="รหัสไปรษณีย์" 
//                     type="text" 
//                     readOnly 
//                     value={selectedSubDistrict?.postcode || ''} 
//                     className="w-full p-4 bg-slate-50 border border-slate-200 text-slate-500 rounded-2xl font-bold" 
//                 />
//               </div>
//             </div>
//           </div>

//           {/* ส่วนข้อมูลผู้ติดต่อ */}
//           <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
//             <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-50">
//               <span className="text-red-600">👤</span>
//               <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">ข้อมูลผู้ติดต่อ</h3>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
//               <div className="md:col-span-3">
//                 <Select placeholder="คำนำหน้า" options={titleOptions} value={selectedTitle} onChange={setSelectedTitle} styles={customStyles} />
//               </div>
//               <div className="md:col-span-5">
//                 <input type="text" name="comp_firstname" required className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-red-500" placeholder="ชื่อ" />
//               </div>
//               <div className="md:col-span-4">
//                 <input type="text" name="comp_middlename" className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-red-500" placeholder="ชื่อกลาง (ถ้ามี)" />
//               </div>
//               <div className="md:col-span-4">
//                 <input type="text" name="comp_lastname" required className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-red-500" placeholder="นามสกุล" />
//               </div>
//               <div className="md:col-span-3">
//                 <input type="text" name="comp_phone" required className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-red-500" placeholder="เบอร์โทรศัพท์" />
//               </div>
//               <div className="md:col-span-5">
//                 <input type="email" name="comp_email" required className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-red-500" placeholder="อีเมลสำหรับรับรหัส OTP" />
//               </div>
//             </div>
//           </div>

//           <button type="submit" disabled={isSending}
//             className={`w-full py-5 rounded-2xl font-black text-xl transition-all shadow-xl active:scale-95 ${isSending ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100'}`}>
//             {isSending ? 'กำลังส่งรหัส OTP...' : 'ขั้นตอนถัดไป: เลือกมาตรฐาน →'}
//           </button>
//         </form>
//       </main>

//       {/* OTP Modal */}
//       {showOTPModal && (
//         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
//           <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in duration-300">
//             <div className="text-center">
//               <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">✉️</div>
//               <h3 className="text-2xl font-black text-slate-800 mb-2">ยืนยันตัวตน</h3>
//               <p className="text-slate-500 text-sm mb-8 leading-relaxed">
//                 ส่งรหัส OTP ไปที่ <span className="font-bold text-slate-800">{emailForOTP}</span><br/>
//                 Ref: <span className="text-red-600 font-black">{serverRef}</span>
//               </p>
//               <input type="text" maxLength="6" value={otpInput}
//                 onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
//                 className="w-full text-center text-4xl font-black tracking-[12px] p-5 border-2 border-slate-100 rounded-3xl focus:border-red-500 outline-none transition-all mb-8 bg-slate-50"
//               />
//               <div className="flex gap-4">
//                 <button onClick={() => setShowOTPModal(false)} className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl">ยกเลิก</button>
//                 <button onClick={handleVerifyOTP} className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 shadow-lg shadow-red-200">ยืนยัน</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
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

  // --- States สำหรับที่อยู่ ---
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);
  const [selectedProv, setSelectedProv] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedSubDistrict, setSelectedSubDistrict] = useState(null);

  // --- States สำหรับระบบ OTP & ฟอร์ม ---
  const [isCorporate, setIsCorporate] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [serverRef, setServerRef] = useState('');
  const [emailForOTP, setEmailForOTP] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [tempFormData, setTempFormData] = useState(null);

  const [selectedTitle, setSelectedTitle] = useState(null);
  const titleOptions = [
    { value: 'นาย', label: 'นาย (Mr.)' },
    { value: 'นาง', label: 'นาง (Mrs.)' },
    { value: 'นางสาว', label: 'นางสาว (Ms.)' },
  ];

  // 1. ฟังก์ชันส่ง OTP (Handle Submit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    const el = e.target.elements;

    try {
      // ✅ ใช้ ?. เพื่อป้องกัน Error กรณีหา Element ไม่พบ
      const formData = {
        is_corporate: isCorporate,
        comp_name: el.comp_name?.value || '',
        comp_tax: el.comp_tax?.value || 'INDIVIDUAL',
        // ข้อมูลที่อยู่ (ดึง Label มาบันทึกลง DB)
        comp_add: el.comp_add?.value || '',   
        comp_moo: el.comp_moo?.value || '',   
        comp_soi: el.comp_soi?.value || '',   
        comp_road: el.comp_road?.value || '', 
        province: selectedProv?.label || '',
        district: selectedDistrict?.label || '',
        sub_district: selectedSubDistrict?.label || '',
        postcode: selectedSubDistrict?.postcode || '',
        // ข้อมูลผู้ติดต่อ
        title: selectedTitle?.value || '',
        firstname: el.comp_firstname?.value || '',
        middlename: el.comp_middlename?.value || '',
        lastname: el.comp_lastname?.value || '',
        comp_phone: el.comp_phone?.value || '',
        comp_email: el.comp_email?.value || '',
      };

      setEmailForOTP(formData.comp_email);
      setTempFormData(formData);

      const res = await axios.post(`${baseURL}/send-otp`, { email: formData.comp_email });
      if (res.data.success) {
        setServerRef(res.data.ref);
        setShowOTPModal(true);
      }
    } catch (err) {
      console.error("Submit Error:", err);
      alert("เกิดข้อผิดพลาดในการดึงข้อมูลฟอร์มหรือส่ง OTP");
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
      alert(err.response?.data?.message || "รหัส OTP ไม่ถูกต้อง");
    }
  };

  // --- Logic การดึงข้อมูลที่อยู่จาก Database ---
  useEffect(() => {
    axios.get(`${baseURL}/provinces`)
      .then(res => setProvinces(res.data))
      .catch(err => console.error("Fetch Provinces Error:", err));
  }, []);

  useEffect(() => {
    if (selectedProv) {
      axios.get(`${baseURL}/amphoes/${selectedProv.value}`)
        .then(res => setDistricts(res.data));
    }
    setDistricts([]); setSubDistricts([]); setSelectedDistrict(null); setSelectedSubDistrict(null);
  }, [selectedProv]);

  useEffect(() => {
    if (selectedDistrict) {
      axios.get(`${baseURL}/districts/${selectedDistrict.value}`)
        .then(res => setSubDistricts(res.data));
    }
    setSubDistricts([]); setSelectedSubDistrict(null);
  }, [selectedDistrict]);

  const customStyles = {
    control: (base, state) => ({
      ...base, borderRadius: '1rem', padding: '8px', borderColor: state.isFocused ? '#2563eb' : '#e2e8f0', boxShadow: 'none'
    })
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 pb-20 relative">
      <main className="max-w-3xl mx-auto p-6 lg:pt-16">
        <header className="mb-8 text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-2 italic uppercase">TISI E-STORE</h2>
          <p className="text-slate-500">กรุณากรอกข้อมูลเพื่อใช้ประกอบการออกเอกสารมาตรฐาน</p>
        </header>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-white rounded-t-[2.5rem] overflow-hidden shadow-sm">
          <button type="button" onClick={() => setIsCorporate(false)}
            className={`flex-1 py-5 text-sm font-black transition-all border-b-4 ${!isCorporate ? 'bg-white text-blue-600 border-blue-600' : 'bg-slate-50 text-slate-400 border-transparent'}`}>
            👤 บุคคลธรรมดา
          </button>
          <button type="button" onClick={() => setIsCorporate(true)}
            className={`flex-1 py-5 text-sm font-black transition-all border-b-4 ${isCorporate ? 'bg-white text-blue-600 border-blue-600' : 'bg-slate-50 text-slate-400 border-transparent'}`}>
            🏢 นิติบุคคล / หน่วยงาน
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-8 rounded-b-3xl shadow-xl border-x border-b border-slate-100">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-50">
              <span className="text-blue-600 font-bold">Step 1:</span>
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">ข้อมูลผู้สั่งซื้อ</h3>
            </div>
            <div className="space-y-5">
              <input required type="text" name="comp_name" 
                className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all" 
                placeholder={isCorporate ? "ชื่อบริษัท / ชื่อหน่วยงาน" : "ชื่อ-นามสกุล (สำหรับพิมพ์ลายน้ำ)"} />
              
              <input required type="text" name="comp_tax" pattern="[0-9]{13}" maxLength="13" 
                className="w-full p-4 border border-slate-200 rounded-2xl outline-none font-mono focus:border-blue-500 transition-all" 
                placeholder={isCorporate ? "เลขผู้เสียภาษี 13 หลัก" : "เลขประจำตัวประชาชน 13 หลัก"} />
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            <div className="mb-6 pb-2 border-b border-slate-50 flex items-center gap-2">
              <span className="text-blue-600 font-bold">Step 2:</span>
              <label className="font-bold text-slate-800 text-sm uppercase tracking-wider">ที่อยู่จัดส่งเอกสาร</label>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="text" name="comp_add" className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-blue-500" placeholder="บ้านเลขที่ / อาคาร" />
                <input type="text" name="comp_moo" className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-blue-500" placeholder="หมู่ที่" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="comp_soi" className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-blue-500" placeholder="ซอย" />
                <input type="text" name="comp_road" className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-blue-500" placeholder="ถนน" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select placeholder="จังหวัด" options={provinces} value={selectedProv} onChange={setSelectedProv} styles={customStyles} />
                <Select placeholder="อำเภอ / เขต" options={districts} value={selectedDistrict} onChange={setSelectedDistrict} isDisabled={!selectedProv} styles={customStyles} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select placeholder="ตำบล / แขวง" options={subDistricts} value={selectedSubDistrict} onChange={setSelectedSubDistrict} isDisabled={!selectedDistrict} styles={customStyles} />
                <input readOnly placeholder="รหัสไปรษณีย์" type="text" value={selectedSubDistrict?.postcode || ''} className="w-full p-4 bg-slate-50 border border-slate-200 text-slate-500 rounded-2xl font-bold" />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-50">
              <span className="text-blue-600 font-bold">Step 3:</span>
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">ข้อมูลผู้ติดต่อ</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
              <div className="md:col-span-3">
                <Select placeholder="คำนำหน้า" options={titleOptions} value={selectedTitle} onChange={setSelectedTitle} styles={customStyles} />
              </div>
              <div className="md:col-span-5">
                <input type="text" name="comp_firstname" required className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-blue-500" placeholder="ชื่อ" />
              </div>
              <div className="md:col-span-4">
                <input type="text" name="comp_middlename" className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-blue-500" placeholder="ชื่อกลาง (ถ้ามี)" />
              </div>
              <div className="md:col-span-4">
                <input type="text" name="comp_lastname" required className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-blue-500" placeholder="นามสกุล" />
              </div>
              <div className="md:col-span-3">
                <input type="text" name="comp_phone" required className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-blue-500" placeholder="เบอร์โทรศัพท์" />
              </div>
              <div className="md:col-span-5">
                <input type="email" name="comp_email" required className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-blue-500" placeholder="อีเมลสำหรับรับรหัส OTP" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={isSending}
            className={`w-full py-5 rounded-2xl font-black text-xl transition-all shadow-xl active:scale-95 ${isSending ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100'}`}>
            {isSending ? 'กำลังส่งรหัส OTP...' : 'ขั้นตอนถัดไป: เลือกมาตรฐาน →'}
          </button>
        </form>
      </main>

      {/* OTP Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in duration-300">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">✉️</div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">ยืนยันตัวตน</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                ส่งรหัส OTP ไปที่ <span className="font-bold text-slate-800">{emailForOTP}</span><br/>
                Ref: <span className="text-blue-600 font-black">{serverRef}</span>
              </p>
              <input type="text" maxLength="6" value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full text-center text-4xl font-black tracking-[12px] p-5 border-2 border-slate-100 rounded-3xl focus:border-blue-500 outline-none transition-all mb-8 bg-slate-50"
              />
              <div className="flex gap-4">
                <button onClick={() => setShowOTPModal(false)} className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl">ยกเลิก</button>
                <button onClick={handleVerifyOTP} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200">ยืนยัน</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddTransaction;