import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom' // ใช้สำหรับทำ Link และเช็คหน้าปัจจุบัน

function Navb() {
  const [serverStatus, setServerStatus] = useState("Checking...");
  const [data, setData] = useState({ currency1: 0, currency2: 0 });
  const [cartCount, setCartCount] = useState(0); // Prototype: จำนวนของในตะกร้า
  const location = useLocation();

  useEffect(() => {
    fetch('http://localhost:5000/api/hello')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setServerStatus("Online");
      })
      .catch(() => setServerStatus("Offline"));
    
    const updateCount = () => {
        const items = JSON.parse(localStorage.getItem('cart') || "[]");
        setCartCount(items.length);
      };

    // เรียกครั้งแรกตอนโหลดหน้า
    updateCount();

    // รอฟัง "สัญญาณ" จากหน้า ProductDetail เมื่อมีการกดปุ่ม
    window.addEventListener("cartUpdated", updateCount);

    // ทำความสะอาด Event เมื่อปิดหน้า
    return () => window.removeEventListener("cartUpdated", updateCount);
  }, []); // อัปเดตเมื่อเปลี่ยนหน้า

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
        {/* อัตราแลกเปลี่ยน (ซ่อนบนมือถือเพื่อความสะอาด) */}
        <div className="hidden sm:flex flex-col items-end border-r border-slate-100 pr-4">
          <span className="text-[9px] font-black text-slate-400 uppercase">Exchange Rate (CHF/THB)</span>
          <div className="flex gap-2 mt-1">
             <span className="text-[11px] font-bold text-green-600">Mid: {data.currency1}</span>
             <span className="text-[11px] font-bold text-blue-600">Sell: {data.currency2}</span>
          </div>
        </div>

        {/* ไอคอนตะกร้าสินค้า (Cart Icon) */}
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

        {/* โปรไฟล์ผู้ใช้ */}
        <div className="flex items-center gap-3 pl-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center text-white font-black shadow-md shadow-blue-100 transition-transform hover:rotate-3 cursor-pointer">
            T
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navb;