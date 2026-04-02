import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function App() {
  const navigate = useNavigate();

  const [inputValue, setInputValue] = useState('');
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // เปลี่ยน products ให้เป็น State เพื่อรอรับข้อมูลจาก API
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // ดึงข้อมูลจาก sessionStorage
    const savedData = sessionStorage.getItem('customerData');
    if (savedData) {
      setCustomer(JSON.parse(savedData));
    }
  }, []);

  // ฟังก์ชันยิง API ไปหา Backend
  const handleSearchClick = async () => {
    if (!inputValue.trim()) return; // ถ้าไม่ได้พิมพ์อะไร ไม่ต้องค้นหา

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      //ยิง API ไปที่ Backend ของเรา
      const response = await fetch(`http://localhost:5000/api/search-iso?q=${encodeURIComponent(inputValue)}`);
      
      if (!response.ok) {
        throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
      }

      const data = await response.json();
      setProducts(data); // นำข้อมูลที่ได้มาเก็บลง State

      console.log("Search Results:", data); // ตรวจสอบข้อมูลที่ได้จาก API
    } catch (err) {
      console.error("Search Error:", err);
      setError("เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId) => {
    // ตรวจสอบว่ามีข้อมูลลูกค้าใน customerInfo หรือไม่
    if (!customer) {
      // 🚩 ถ้าว่าง ให้ขึ้น Pop-up (ใช้ alert พื้นฐาน หรือ Modal ที่คุณมี)
      window.dispatchEvent(new Event("cartUpdated"));
    
      Swal.fire({
        text: `กรุณากรอกข้อมูลผู้สั่งซื้อก่อนดูรายละเอียดสินค้า`,
        icon: 'warning',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#2563eb',
        timer: 2000
      }).then(() => {
        // หลังจากผู้ใช้กด "ตกลง" ใน Pop-up ให้ไปที่หน้าฟอร์ม
        navigate('/'); 
      });
    } else {
      // ✅ ถ้ามีข้อมูลแล้ว ให้ไปหน้า Product Detail ได้ปกติ
      navigate(`/product/${encodeURIComponent(productId)}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      <main className="max-w-5xl mx-auto p-6 lg:p-12"> 
        <header className="mb-10">
          <h2 className="text-center text-3xl font-black text-slate-900 mb-2 ">ค้นหามาตรฐาน ISO ที่ต้องการสั่งซื้อ</h2>
          <div className="flex mt-12 bg-white rounded-2xl shadow-sm border border-slate-200 p-2 text-center">
            <input 
              type="text"   
              inputMode="numeric"
              pattern="[0-9]*"
              className="flex-1 p-3 ml-4 outline-none text-lg" 
              placeholder="ตัวอย่างการค้นหา เช่น 9001, 14001, 45001, 27001, 50001"
              value={inputValue}
              onChange={(e) => {
                const onlyNums = e.target.value.replace(/\D/g, ''); // ลบทุกอย่างที่ไม่ใช่ตัวเลข (0-9) ทิ้ง
                setInputValue(onlyNums);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchClick();
              }}
              disabled={loading}
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl transition-colors font-bold disabled:bg-slate-400"
              onClick={handleSearchClick}
              disabled={loading}>
              {loading ? 'กำลังค้นหา...' : 'Search'}
            </button>
          </div>
        </header>
        
        {/* แสดงข้อความ Error ถ้าดึงข้อมูลพัง */}
        {error && (
          <div className="text-center py-10 text-red-500 font-bold bg-red-50 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Grid Container Section (เปิดทิ้งไว้เสมอไม่ว่าจะ loading หรือโชว์ข้อมูล) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          
          {/* =============================================================
             จังหวะ Loading: แสดง Skeleton Cards
             เราจะวนลูปสร้างกล่องเปล่าๆ กะพริบๆ เลียนแบบจำนวน Card จริง (เช่น 6 กล่อง)
          ============================================================== */}
          {loading && (
            Array.from({ length: 6 }).map((_, index) => (
              <div 
                key={`skeleton-${index}`} 
                className="w-full bg-white p-6 rounded-3xl shadow-sm border border-slate-100 animate-pulse"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="h-10 bg-red-100 rounded-full w-24"></div>
                  <div className="h-6 w-6 bg-slate-100 rounded-full"></div>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="h-5 bg-slate-200 rounded-full w-full"></div>
                  <div className="h-5 bg-slate-200 rounded-full w-4/5"></div>
                </div>
                <hr className="mb-4 border-slate-100" />

                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="h-3 bg-slate-100 rounded-full w-20"></div>
                    <div className="h-8 bg-slate-200 rounded-full w-32"></div>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full w-16 mb-1"></div>
                </div>
              </div>
              ))
            )}
          {/* =============================================================
            จังหวะโหลดเสร็จและมีข้อมูล: แสดง Cards จริง
          ============================================================== */}
          {!loading && products.length > 0 && (
            <>
              {products.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => handleProductClick(item.id)}
                  className="group w-full text-left bg-white p-4 rounded-3xl shadow-sm border border-slate-200 
                            hover:shadow-xl hover:border-red-200 hover:scale-[1.02] 
                            transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-100
                            active:scale-[0.98] flex flex-col min-h-70"
                >
                  {/* ส่วนรหัสมาตรฐาน (Code) และลูกศร */}
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <p className={`font-black text-red-700 uppercase tracking-tighter transition-colors group-hover:text-red-500 
                        ${item.code.length > 15 ? 'text-3xl break-all' : 'text-4xl'} 
                    `}>
                      {item.code}
                    </p>
                    <span className="text-slate-300 group-hover:text-red-500 transition-colors shrink-0 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                  {/* ชื่อมาตรฐานภาษาอังกฤษ */}
                  <h3 
                    className="text-sm font-bold text-slate-600 leading-snug mb-6 
                              h-12 line-clamp-2 overflow-hidden group-hover:text-slate-900 transition-colors" 
                    title={item.title}
                  >
                    {item.title}
                  </h3>
                  {/* เส้นคั่นกลาง */}
                  <hr className="mt-auto mb-4 border-slate-100 transition-all group-hover:border-red-100" />
                  {/* ส่วนราคาทุกอย่างในบรรทัดเดียว */}
                  <div>
                    <p className="text-[15px] font-bold text-slate-600 uppercase tracking-widest mb-1">ราคาเริ่มต้น</p>
                    <div className="flex items-baseline justify-between gap-2">
                      {/* ก้อนราคา: โชว์ราคาเต็มขีดฆ่า + ราคาลด */}
                      <div className="flex items-baseline gap-2">
                        {/* ราคาเต็ม (PriceTHB) - โชว์ขีดฆ่า */}
                        <span className="text-lg text-slate-400 line-through decoration-3 decoration-red-700/50 font-bold;">
                          {Number(item.PriceTHB) > 0 ? item.PriceTHB.toLocaleString() : ''}
                        </span>
                        {/* ราคาที่ต้องจ่ายจริง (SpecialPriceTHB) */}
                        <span className="text-2xl font-black text-slate-900">
                          {item.SpecialPriceTHB ? item.SpecialPriceTHB.toLocaleString() : '0'}
                        </span>
                        <span className="text-[12px] font-bold text-slate-700 uppercase">
                          THB
                        </span>
                      </div>
                      {/* ปุ่ม View Details (เปลี่ยนเป็นสีแดง) */}
                      <div className="text-[10px] font-bold text-white bg-red-600 px-3 py-1.5 rounded-full 
                                    opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 
                                    transition-all duration-300 ease-out shadow-lg shadow-red-100">
                        VIEW DETAILS
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}
          </div>
          {/* แสดงข้อความเมื่อค้นหาแล้วแต่ไม่เจอข้อมูล */}
          {!loading && !error && hasSearched && products.length === 0 && (
          <div className="text-center py-20 text-slate-400 bg-white rounded-3xl border border-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ไม่พบข้อมูลมาตรฐานที่ค้นหาครับ
          </div>
          )}
      </main>
    </div>
  );
}

export default App;