import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

function AddTransaction() {
  const navigate = useNavigate();
  const baseURL = '/api-iso-store';

  // States สำหรับที่อยู่
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);
  const [selectedProv, setSelectedProv] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedSubDistrict, setSelectedSubDistrict] = useState(null);

  // States สำหรับระบบ OTP & ฟอร์ม
  const [IsPersonalType, setIsPersonalType] = useState(false);
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

  // ฟังก์ชันส่ง OTP (Handle Submit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    const el = e.target.elements;

    try {
      const formData = {
        person_type: IsPersonalType,
        company_name: el.company_name?.value || '',
        tax_id: el.tax_id?.value || 'INDIVIDUAL',
        house_number: el.house_number?.value || '',
        building_name: el.building_name?.value || '',
        moo: el.moo?.value || '',   
        soi: el.soi?.value || '',   
        road: el.road?.value || '', 
        province: selectedProv?.label || '',
        district: selectedDistrict?.label || '',
        subdistrict: selectedSubDistrict?.label || '',
        province_code: selectedProv?.value || '',
        district_code: selectedDistrict?.value || '',
        subdistrict_code: selectedSubDistrict?.value || '',
        postcode: selectedSubDistrict?.postcode || '',
        contact_title: selectedTitle?.value || '',
        contact_firstname: el.contact_firstname?.value || '',
        contact_middlename: el.contact_middlename?.value || '',
        contact_lastname: el.contact_lastname?.value || '',
        phone: el.phone?.value || '',
        email: el.email?.value || '',
      };

      setEmailForOTP(formData.email);
      setTempFormData(formData);

      const res = await axios.post(`${baseURL}/send-otp`, { email: formData.email });
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

  useEffect(() => {
    axios.get(`${baseURL}/provinces`)
      .then(res => setProvinces(res.data))
      .catch(err => console.error("Fetch Provinces Error:", err));
  }, []);

// เมื่อเปลี่ยนจังหวัด -> ล้างค่าอำเภอ/ตำบลเดิมทิ้งก่อน แล้วค่อยดึงอำเภอใหม่
  useEffect(() => {
    setDistricts([]); 
    setSubDistricts([]); 
    setSelectedDistrict(null); 
    setSelectedSubDistrict(null);

    if (selectedProv) {
      axios.get(`${baseURL}/amphoes/${selectedProv.value}`)
        .then(res => setDistricts(res.data))
        .catch(err => console.error("Fetch Amphoes Error:", err)); // เพิ่ม .catch
    }
  }, [selectedProv]);

// เมื่อเปลี่ยนอำเภอ -> ล้างค่าตำบลเดิมทิ้งก่อน แล้วค่อยดึงตำบลใหม่
  useEffect(() => {
    setSubDistricts([]); 
    setSelectedSubDistrict(null);

    if (selectedDistrict) {
      axios.get(`${baseURL}/districts/${selectedDistrict.value}`)
        .then(res => setSubDistricts(res.data))
        .catch(err => console.error("Fetch SubDistricts Error:", err)); // เพิ่ม .catch
    }
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
          <h2 className="text-3xl font-black text-slate-900 mb-2 italic uppercase">แบบฟอร์มขอใบเสนอราคาการสั่งซื้อ<br />มาตรฐานต่างประเทศ</h2>
          <p className="text-slate-500">กรุณากรอกข้อมูลเพื่อใช้ประกอบการออกเอกสารมาตรฐาน</p>
        </header>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-white rounded-t-[2.5rem] overflow-hidden shadow-sm">
          <button type="button" onClick={() => setIsPersonalType(false)}
            className={`flex-1 py-5 text-sm font-black transition-all border-b-4 ${!IsPersonalType ? 'bg-white text-blue-600 border-blue-600' : 'bg-slate-50 text-slate-400 border-transparent'}`}>
            👤 บุคคลธรรมดา
          </button>
          <button type="button" onClick={() => setIsPersonalType(true)}
            className={`flex-1 py-5 text-sm font-black transition-all border-b-4 ${IsPersonalType ? 'bg-white text-blue-600 border-blue-600' : 'bg-slate-50 text-slate-400 border-transparent'}`}>
            🏢 นิติบุคคล / หน่วยงาน
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-8 rounded-b-3xl shadow-xl border-x border-b border-slate-100">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-50">
              <span className="font-bold text-blue-700 uppercase tracking-wider text-xl">ข้อมูลผู้สั่งซื้อ</span>
            </div>
            <div className="space-y-5">
              <input required type="text" name="company_name" 
                className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all" 
                placeholder={IsPersonalType ? "ชื่อบริษัท / ชื่อหน่วยงาน (สำหรับพิมพ์ลายน้ำ)" : "ชื่อ-นามสกุล (สำหรับพิมพ์ลายน้ำ)"} />
              
              <input required type="text" name="tax_id" pattern="[0-9]{13}" maxLength="13" 
                className="w-full p-4 border border-slate-200 rounded-2xl outline-none font-mono focus:border-blue-500 transition-all" 
                placeholder={IsPersonalType ? "เลขผู้เสียภาษี 13 หลัก" : "เลขประจำตัวประชาชน 13 หลัก"} />
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            <div className="mb-6 pb-2 border-b border-slate-50 flex items-center gap-2">
              <span className="font-bold text-blue-700 uppercase tracking-wider text-xl">ที่อยู่จัดส่งเอกสาร</span>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="text" name="house_number" className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-blue-500" placeholder="บ้านเลขที่ / อาคารเลขที่" />
                <input type="text" name="building_name" className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-blue-500" placeholder="ชื่อหมู่บ้าน / ชื่ออาคาร" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="moo" className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-blue-500" placeholder="หมู่ที่" />
                <input type="text" name="soi" className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-blue-500" placeholder="ซอย" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <input type="text" name="road" className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-blue-500" placeholder="ถนน" />
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
              <span className="font-bold text-blue-700 uppercase tracking-wider text-xl">ข้อมูลผู้ติดต่อ</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
              <div className="md:col-span-3">
                <Select placeholder="คำนำหน้า" options={titleOptions} value={selectedTitle} onChange={setSelectedTitle} styles={customStyles} />
              </div>
              <div className="md:col-span-5">
                <input type="text" name="contact_firstname" required className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-blue-500" placeholder="ชื่อ" />
              </div>
              <div className="md:col-span-4">
                <input type="text" name="contact_middlename" className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-blue-500" placeholder="ชื่อกลาง (ถ้ามี)" />
              </div>
              <div className="md:col-span-4">
                <input type="text" name="contact_lastname" required className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-blue-500" placeholder="นามสกุล" />
              </div>
              <div className="md:col-span-3">
                <input type="text" name="phone" required className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-blue-500" placeholder="เบอร์โทรศัพท์" />
              </div>
              <div className="md:col-span-5">
                <input type="email" name="email" required className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-blue-500" placeholder="อีเมลสำหรับรับรหัส OTP และส่งเอกสาร ISO" />
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