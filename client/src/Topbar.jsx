import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom' 
import Swal from 'sweetalert2';

function Topbar() {
  const [isBillOpen, setIsBillOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState("Checking...");
  const [data, setData] = useState({ currency1: 0, currency2: 0 });
  const [cartCount, setCartCount] = useState(0); 
  const [cartItems, setCartItems] = useState([]); // 🌟 เพิ่ม State สำหรับเก็บรายการสินค้าในตะกร้า
  const [customerInfo, setCustomerInfo] = useState(null);
  
  // 1. เปิดคอมเมนต์ location เพื่อให้ตัว active menu ทำงานได้
  const location = useLocation();

  const logout = () => {
    Swal.fire({
      title: 'ยืนยันการล้างข้อมูล?',
      text: "ระบบจะลบข้อมูลผู้ซื้อและรายการในตะกร้าทั้งหมด",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#02af10', // สีน้ำเงิน TISI
      cancelButtonColor: '#c50a0a',
      confirmButtonText: 'ใช่, ล้างข้อมูล',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: false,
      customClass: {
        confirmButton: 'rounded-xl px-6 py-2 font-bold',
        cancelButton: 'rounded-xl px-6 py-2 font-bold text-slate-500'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // 🗑️ ล้างข้อมูลใน Storage
        sessionStorage.removeItem('customerData');
        sessionStorage.removeItem('cart');

        // ✨ ล้าง State เพื่ออัปเดตหน้าจอทันที
        setCustomerInfo(null);
        setCartItems([]);
        setCartCount(0);
        setIsBillOpen(false);

        // 🔔 แจ้งเตือน Component อื่นๆ
        window.dispatchEvent(new Event("cartUpdated"));

        // 🎉 แจ้งเตือนว่าลบสำเร็จ (Optional)
        Swal.fire({
          title: 'ล้างข้อมูลเรียบร้อย',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: 'rounded-[2rem]'
          }
        });
      }
    });
  };

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
      setCustomerInfo(JSON.parse(savedData));
    }
    
    // 🌟 แก้ไขตรงนี้: เปลี่ยนจาก localStorage เป็น sessionStorage
    const updateCount = () => {
      // ดึงข้อมูลตะกร้าจาก sessionStorage แทน
      const items = JSON.parse(sessionStorage.getItem('cart') || "[]");
      setCartCount(items.length);
      setCartItems(items); 
    };
    updateCount();

    window.addEventListener("cartUpdated", updateCount);
    return () => window.removeEventListener("cartUpdated", updateCount);
  }, [location]);
  
  // 🌟 คำนวณราคารวมทั้งหมดในตะกร้า
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);

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
          <span className="text-[20px] font-black text-slate-600 uppercase">อัตราแลกเปลี่ยน ณ วันที่ {data.daynow || '-'}</span>
          <div className="flex gap-2 mt-1">
             <span className="text-[11px] font-bold text-blue-600">1 CHF : {data.currency} THB</span>
          </div>
        </div>

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
                <h3 className="font-bold text-slate-800">สรุปข้อมูล & ตะกร้า</h3>
                {/* เพิ่มปุ่มล้างข้อมูลแยกออกมา (เพื่อให้ User ไม่สับสน) */}
                <button onClick={logout} className="text-red-400 hover:text-red-600 text-[10px] font-bold uppercase tracking-tighter border border-red-100 px-2 py-1 rounded-lg">
                  ล้างข้อมูลทั้งหมด
                </button>
              </div>

              <div className="p-4 space-y-3">
                {/* 📌 ส่วนที่ 1: ข้อมูลผู้สั่งซื้อ */}
                {customerInfo ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">ชื่อผู้ติดต่อ:</span>
                      <span className="font-medium text-slate-800">{customerInfo.firstname} {customerInfo.middlename || ''} {customerInfo.lastname}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">หน่วยงาน:</span>
                      <span className="font-medium text-slate-800 text-right max-w-[180px] truncate" title={customerInfo.comp_name}>
                        {customerInfo.comp_name}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">อีเมล:</span>
                      <span className="font-medium text-blue-600 truncate max-w-[180px]">{customerInfo.comp_email}</span>
                    </div>
                    <Link to="/" onClick={() => setIsBillOpen(false)} className="text-blue-600 font-bold hover:underline ml-1">
                      ออกจากระบบ
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-2 text-slate-500 text-xs">
                    ยังไม่ได้กรอกข้อมูลใบเสนอราคา
                    <Link to="/" onClick={() => setIsBillOpen(false)} className="text-blue-600 font-bold hover:underline ml-1">
                      กรอกข้อมูล
                    </Link>
                  </div>
                )}

                <hr className="border-slate-100 my-2" />

                {/* 📌 ส่วนที่ 2: รายการในตะกร้า 🌟 */}
                <div>
                  <h4 className="font-bold text-slate-700 text-sm mb-2">ตะกร้าสินค้า ({cartCount})</h4>
                  
                  {cartItems.length > 0 ? (
                    <>
                      {/* รายการสินค้า (จำกัดความสูงเผื่อของเยอะ) */}
                      <div className="max-h-40 overflow-y-auto pr-2 space-y-2 mb-3 scrollbar-thin scrollbar-thumb-slate-200">
                        {cartItems.map((item, index) => (
                          <div key={index} className="flex justify-between items-start text-sm border-b border-slate-50 pb-2">
                            <div className="flex flex-col w-[65%]">
                              <span className="font-bold text-slate-800 truncate" title={item.code}>{item.code}</span>
                              <span className="text-[10px] text-slate-400 truncate">{item.title}</span>
                              <span className="text-[10px] font-bold text-blue-500">{item.icon} {item.option}</span>
                            </div>
                            <span className="font-black text-slate-700 w-[35%] text-right">{item.price.toLocaleString()} ฿</span>
                          </div>
                        ))}
                      </div>

                      {/* ยอดรวมและปุ่มไปตะกร้า */}
                      <div className="pt-2 border-t border-slate-200">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-bold text-slate-500 text-sm">ยอดสุทธิ:</span>
                          <span className="text-lg font-black text-red-600">{cartTotal.toLocaleString()} ฿</span>
                        </div>
                        <Link 
                          to="/cart" 
                          onClick={() => setIsBillOpen(false)} 
                          className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-100"
                        >
                          ชำระเงิน / ขอใบเสนอราคา
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-slate-400 text-xs bg-slate-50 rounded-xl">
                      ไม่มีสินค้าในตะกร้า
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Topbar;