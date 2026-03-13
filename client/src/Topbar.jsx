import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom' 

function Topbar() {
  const [isBillOpen, setIsBillOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState("Checking...");
  const [data, setData] = useState({ currency1: 0, currency2: 0 });
  const [cartCount, setCartCount] = useState(0); 
  const [customerInfo, setCustomerInfo] = useState(null);
  
  // 1. เปิดคอมเมนต์ location เพื่อให้ตัว active menu ทำงานได้
  const location = useLocation();

  useEffect(() => {
    fetch('http://localhost:5000/api/hello')
    .then(res => res.json())
    .then(data => {
      setData(data);
      setServerStatus("Online");
    })
    .catch(() => setServerStatus("Offline"));

    // 2. ดึงข้อมูลจาก Session มาเก็บใน State (รันทุกครั้งที่เปลี่ยนหน้า)
    const savedData = sessionStorage.getItem('customerData');
    if (savedData) {
      setCustomerInfo(JSON.parse(savedData)); // แก้จาก setCustomer เป็น setCustomerInfo
    }
    
    const updateCount = () => {
      const items = JSON.parse(localStorage.getItem('cart') || "[]");
      setCartCount(items.length);
    };

    updateCount();

    window.addEventListener("cartUpdated", updateCount);
    return () => window.removeEventListener("cartUpdated", updateCount);
  }, [location]); // เพิ่ม location เข้าไป เพื่อให้อัปเดตข้อมูลทุกครั้งที่มีการเปลี่ยนหน้า

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
      {/* ส่วนโลโก้และชื่อระบบ */}
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-3">
          <img src="/image/tisi-logo.jpg" className="h-12 md:h-16 w-auto object-contain" alt="TISI Logo" />
          <div className="hidden md:block">
            <h1 className="text-xl font-black text-blue-700 leading-none">TISI <span className="text-slate-400 font-light tracking-tight">E-Store</span></h1>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">Official Standard Service</p>
          </div>
        </Link>

        {/* เมนูนำทาง (Navigation Links) */}
        <div className="hidden lg:flex gap-6 text-sm font-bold">
          <Link to="/" className={`${location.pathname === '/' ? 'text-blue-600' : 'text-slate-500 hover:text-blue-500'} transition-colors`}>จัดการข้อมูล</Link>
          <Link to="/Store" className={`${location.pathname === '/Store' ? 'text-blue-600' : 'text-slate-500 hover:text-blue-500'} transition-colors`}>ร้านค้า</Link>
        </div>
      </div>

      {/* ส่วนข้อมูลและตะกร้าสินค้า */}
      <div className="flex gap-3 md:gap-6 items-center">
        {/* อัตราแลกเปลี่ยน */}
        <div className="hidden sm:flex flex-col items-end border-r border-slate-100 pr-4">
          <span className="text-[20px] font-black text-slate-600 uppercase">อัตราแลกเปลี่ยน ณ วันที่ {data.ndate || '-'}</span>
          <div className="flex gap-2 mt-1">
             <span className="text-[11px] font-bold text-green-600">Mid: {data.currency1}</span>
             <span className="text-[11px] font-bold text-blue-600">Sell: {data.currency2}</span>
          </div>
        </div>

        <Link to="/cart" className="relative p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                {cartCount}
              </span>
            )}
        </Link>

        {/* Dropdown บิล/ผู้สั่งซื้อ */}
        <div className="relative">
          <button 
            onClick={() => setIsBillOpen(!isBillOpen)}
            className="relative p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM8 9h8M8 13h8" />
            </svg>
          </button>

          {/* ส่วนของ Dropdown ที่จะสไลด์ลงมา */}
          {isBillOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden origin-top-right animate-in fade-in slide-in-from-top-4 duration-200">
              
              {/* หัว Dropdown */}
              <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">ข้อมูลผู้สั่งซื้อ</h3>
                <button onClick={() => setIsBillOpen(false)} className="text-slate-400 hover:text-red-500 text-sm">
                  ปิด ✕
                </button>
              </div>

              {/* ข้อมูลที่รับมาจากฟอร์ม */}
              <div className="p-4 space-y-3">
                {customerInfo ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">ชื่อผู้ติดต่อ:</span>
                      <span className="font-medium text-slate-800">{customerInfo.comp_contact}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">หน่วยงาน:</span>
                      <span className="font-medium text-slate-800 text-right max-w-[180px] truncate" title={customerInfo.comp_name}>
                        {customerInfo.comp_name}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">อีเมล:</span>
                      <span className="font-medium text-blue-600">{customerInfo.comp_email}</span>
                    </div>
                    
                    {/* ยอดชำระ ผมใส่ 0 ไว้ก่อน เพราะต้องรอคำนวณจากระบบตะกร้า (Cart) */}
                    <div className="border-t border-slate-100 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800">ยอดชำระเบื้องต้น:</span>
                        <span className="font-bold text-red-600 text-lg">รอดำเนินการ</span>
                      </div>
                    </div>
                  </>
                ) : (
                  // ถ้ายังไม่มีข้อมูลใน Session
                  <div className="text-center py-4 text-slate-500 text-sm">
                    <span className="text-4xl block mb-2">📄</span>
                    ยังไม่ได้กรอกข้อมูลใบเสนอราคา<br/>
                    <Link to="/" onClick={() => setIsBillOpen(false)} className="text-blue-600 font-bold hover:underline mt-2 inline-block">
                      กลับไปกรอกข้อมูล
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Topbar;