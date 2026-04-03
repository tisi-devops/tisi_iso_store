import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom' 
import Swal from 'sweetalert2';
import tisiLogo from './assets/tisi-logo.jpg';

function Topbar() {
  const [isBillOpen, setIsBillOpen] = useState(false);
  const [data, setData] = useState({ currency: 0, daynow: '-' });
  const location = useLocation();
  const [customerInfo, setCustomerInfo] = useState(() => {
    const saved = sessionStorage.getItem('customerData');
    return saved ? JSON.parse(saved) : null;
  });

  const [cartItems, setCartItems] = useState(() => {
    const saved = sessionStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [cartCount, setCartCount] = useState(() => {
    const saved = sessionStorage.getItem('cart');
    const items = saved ? JSON.parse(saved) : [];
    return items.length;
  });

  const logout = () => {
    Swal.fire({
      title: 'ยืนยันการล้างข้อมูล?',
      text: "ระบบจะลบข้อมูลผู้ซื้อและรายการในตะกร้าทั้งหมด",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#02af10', 
      cancelButtonColor: '#c50a0a',
      confirmButtonText: 'ใช่, ล้างข้อมูล',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.removeItem('customerData');
        sessionStorage.removeItem('cart');

        setCustomerInfo(null);
        setCartItems([]);
        setCartCount(0);
        setIsBillOpen(false);

        window.dispatchEvent(new Event("cartUpdated"));

        Swal.fire({
          title: 'ล้างข้อมูลเรียบร้อย',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  useEffect(() => {
    // ดึงข้อมูลค่าเงินจาก Backend
    fetch('/api-iso-store/hello')
      .then(res => res.json())
      .then(resData => {
        setData(resData);
      })
      .catch(err => console.error("Fetch API Error:", err));

    // ฟังก์ชันอัปเดตข้อมูลเมื่อมีการเปลี่ยนแปลงในหน้าอื่น (เช่น หน้า Store กดเพิ่มของ)
    const syncData = () => {
      const items = JSON.parse(sessionStorage.getItem('cart') || "[]");
      const customer = JSON.parse(sessionStorage.getItem('customerData') || "null");
      setCartItems(items);
      setCartCount(items.length);
      setCustomerInfo(customer);
    };

    window.addEventListener("cartUpdated", syncData);
    return () => window.removeEventListener("cartUpdated", syncData);
  }, [location.pathname]); // ติดตามการเปลี่ยนหน้า

  // คำนวณราคาสุทธิ
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-3">
          <img src={tisiLogo} className="h-12 md:h-16 w-auto object-contain" alt="TISI Logo" />
          <div className="hidden md:block">
            <h1 className="text-xl font-black text-blue-700 leading-none">TISI <span className="text-slate-400 font-light tracking-tight">ISO-Store</span></h1>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">Official Standard Service</p>
          </div>
        </Link>

        <div className="hidden lg:flex gap-6 text-sm font-bold">
          <Link to="/" className={`${location.pathname === '/' ? 'text-blue-600' : 'text-slate-500 hover:text-blue-500'} transition-colors`}>จัดการข้อมูล</Link>
          <Link to="/Store" className={`${location.pathname === '/Store' ? 'text-blue-600' : 'text-slate-500 hover:text-blue-500'} transition-colors`}>ร้านค้า</Link>
        </div>
      </div>

      <div className="flex gap-3 md:gap-6 items-center">
        <div className="hidden sm:flex flex-col items-end border-r border-slate-100 pr-4">
          <span className="text-[20px] font-black text-slate-600 uppercase">อัตราแลกเปลี่ยน ณ {data.daynow || '-'}</span>
          <div className="flex gap-2 mt-1">
             <span className="text-[11px] font-bold text-blue-600">1 CHF : {data.currency} THB</span>
          </div>
        </div>

        <div className="relative">
          <button 
            onClick={() => setIsBillOpen(!isBillOpen)}
            className="relative p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM8 9h8M8 13h8" />
            </svg>
          </button>

          {isBillOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden origin-top-right animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm">สรุปข้อมูล & ตะกร้า</h3>
                <button onClick={logout} className="text-red-400 hover:text-red-600 text-[10px] font-bold uppercase tracking-tighter border border-red-100 px-2 py-1 rounded-lg">
                  ล้างข้อมูล
                </button>
              </div>

              <div className="p-4 space-y-3">
                {customerInfo ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">ผู้ติดต่อ:</span>
                      <span className="font-bold text-slate-800">{customerInfo.contact_firstname} {customerInfo.contact_middlename || ''} {customerInfo.contact_lastname}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">บริษัท / หน่วยงาน:</span>
                      <span className="font-bold text-slate-800 text-right max-w-40 truncate" title={customerInfo.company_name}>
                        {customerInfo.company_name}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">อีเมล:</span>
                      <span className="font-bold text-blue-600 truncate max-w-45">{customerInfo.email}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2 text-slate-500 text-xs">
                    ยังไม่ได้กรอกข้อมูลใบเสนอราคา
                    <Link to="/" onClick={() => setIsBillOpen(false)} className="text-blue-600 font-bold hover:underline ml-1">
                      กรอกข้อมูล
                    </Link>
                  </div>
                )}

                <hr className="border-slate-100" />

                <div>
                  <h4 className="font-bold text-slate-700 text-xs mb-2">ตะกร้าสินค้า ({cartCount})</h4>
                  {cartItems.length > 0 ? (
                    <>
                      <div className="max-h-40 overflow-y-auto pr-1 space-y-2 mb-3 scrollbar-thin">
                        {cartItems.map((item, index) => (
                          <div key={index} className="flex justify-between items-start text-xs border-b border-slate-50 pb-2">
                            <div className="flex flex-col w-[65%]">
                              <span className="font-bold text-slate-800 truncate">{item.code}</span>
                              <span className="text-[10px] text-slate-400 truncate">{item.title}</span>
                            </div>
                            <span className="font-black text-slate-700 w-[35%] text-right">{item.price.toLocaleString()} ฿</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-slate-200">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-bold text-slate-500 text-xs">ยอดสุทธิ:</span>
                          <span className="text-base font-black text-red-600">{cartTotal.toLocaleString()} ฿</span>
                        </div>
                        <Link to="/cart" onClick={() => setIsBillOpen(false)} className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-100">
                          ไปที่ตะกร้าเพื่อสั่งซื้อ
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-slate-400 text-[10px] bg-slate-50 rounded-xl">
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