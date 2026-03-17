// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// function App() {
//   const navigate = useNavigate();

//   const [inputValue, setInputValue] = useState('');
//   const [customer, setCustomer] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [loading, setLoading] = useState(false);

//   // ข้อมูล Prototype สำหรับแสดงหน้า Store
//   const products = [
//     { id: '9001', code: 'ISO 9001', title: 'Quality management systems — Requirements', price: 5400 },
//     { id: '14001', code: 'ISO 14001', title: 'Environmental Management Systems', price: 4800 },
//     { id: '45001', code: 'ISO 45001', title: 'Occupational Health and Safety', price: 5100 },
//   ];

//   useEffect(() => {
//     // ดึงข้อมูลจาก sessionStorage
//     const savedData = sessionStorage.getItem('customerData');
//     if (savedData) {
//       setCustomer(JSON.parse(savedData));
//     }
//   }, []);

//   const handleSearchClick = () => {
//     // เอาค่าจากช่อง Input โยนใส่ searchQuery เพื่อกระตุ้นให้ useEffect ทำงาน
//     setSearchQuery(inputValue);
//   };

//   // Filter ข้อมูลตามการค้นหา
//   const filteredProducts = products.filter(p => 
//     p.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
//     p.title.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
//       <main className="max-w-5xl mx-auto p-6 lg:p-12">
        
//         <header className="mb-10">
//           <div className="flex mt-12 bg-white rounded-2xl shadow-sm border border-slate-200 p-2 text-center">
//             <input 
//               type="text" 
//               className="flex-1 p-3 ml-4 outline-none text-lg" 
//               placeholder="ค้นหามาตรฐาน ISO..."
//               value={inputValue}
//               onChange={(e) => setInputValue(e.target.value)}
//               // 2. เพิ่มการกด Enter เพื่อค้นหา (UX ที่ดี)
//               onKeyDown={(e) => {
//                 if (e.key === 'Enter') handleSearchClick();
//               }}
//             />
//             <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl transition-colors font-bold"
//               onClick={handleSearchClick}
//               disabled={loading}>
//               Search
//             </button>
//           </div>
//         </header>

//         {/* Grid Cards Section */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredProducts.map((item) => (
//             <button 
//               key={item.id}
//               onClick={() => navigate(`/product/${item.id}`)}
//               className="group w-full text-left bg-white p-6 rounded-3xl shadow-sm border border-slate-200 
//                         hover:shadow-xl hover:border-red-200 hover:scale-[1.02] 
//                         transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-100
//                         active:scale-[0.98]"
//             >
//               <div className="flex justify-between items-start mb-4">
//                 <p className="text-4xl font-black text-red-700 uppercase tracking-tighter transition-colors group-hover:text-red-500">
//                   {item.code}
//                 </p>
//                 <span className="text-slate-300 group-hover:text-red-500 transition-colors">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
//                   </svg>
//                 </span>
//               </div>

//               <h3 className="text-lg font-bold text-slate-700 leading-snug mb-4 h-14 overflow-hidden">
//                 {item.title}
//               </h3>

//               <hr className="mb-4 border-slate-100 transition-all group-hover:border-red-100" />

//               <div className="flex justify-between items-end">
//                 <div>
//                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ราคาเริ่มต้น</p>
//                   <p className="text-2xl font-black text-slate-900">
//                     {item.price.toLocaleString()} <span className="text-sm font-normal text-slate-500">฿</span>
//                   </p>
//                 </div>
//                 <div className="text-xs font-bold text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
//                   VIEW DETAILS
//                 </div>
//               </div>
//             </button>
//           ))}
//         </div>

//         {filteredProducts.length === 0 && (
//           <div className="text-center py-20 text-slate-400">
//             ไม่พบข้อมูลที่ค้นหา...
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }

// export default App;









import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();

  const [inputValue, setInputValue] = useState('');
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // 1. เปลี่ยน products ให้เป็น State เพื่อรอรับข้อมูลจาก API
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // ดึงข้อมูลจาก sessionStorage
    const savedData = sessionStorage.getItem('customerData');
    if (savedData) {
      setCustomer(JSON.parse(savedData));
    }
  }, []);

  // 2. ฟังก์ชันยิง API ไปหา Backend
  const handleSearchClick = async () => {
    if (!inputValue.trim()) return; // ถ้าไม่ได้พิมพ์อะไร ไม่ต้องค้นหา

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // 🌟 ยิง API ไปที่ Backend ของเรา
      const response = await fetch(`http://localhost:5000/api/search-iso?q=${encodeURIComponent(inputValue)}`);
      
      if (!response.ok) {
        throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
      }

      const data = await response.json();
      setProducts(data); // นำข้อมูลที่ได้มาเก็บลง State

    } catch (err) {
      console.error("Search Error:", err);
      setError("เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      <main className="max-w-5xl mx-auto p-6 lg:p-12">
        
        <header className="mb-10">
          <div className="flex mt-12 bg-white rounded-2xl shadow-sm border border-slate-200 p-2 text-center">
            <input 
              type="text" 
              className="flex-1 p-3 ml-4 outline-none text-lg" 
              placeholder="ค้นหามาตรฐาน ISO... (เช่น 9001, 14001)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchClick();
              }}
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

        {/* Grid Cards Section */}
        {products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 3. นำ products ที่ได้จาก API มาวนลูปแสดงผล */}
            {products.map((item) => (
              <button 
                key={item.id}
                onClick={() => navigate(`/product/${encodeURIComponent(item.id)}`)}
                className="group w-full text-left bg-white p-6 rounded-3xl shadow-sm border border-slate-200 
                          hover:shadow-xl hover:border-red-200 hover:scale-[1.02] 
                          transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-100
                          active:scale-[0.98]"
              >
                <div className="flex justify-between items-start mb-4">
                  <p className="text-4xl font-black text-red-700 uppercase tracking-tighter transition-colors group-hover:text-red-500">
                    {item.code}
                  </p>
                  <span className="text-slate-300 group-hover:text-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-700 leading-snug mb-4 h-14 overflow-hidden" 
                    title={item.title}>
                  {item.title}
                </h3>

                <hr className="mb-4 border-slate-100 transition-all group-hover:border-red-100" />

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ราคาเริ่มต้น</p>
                    <p className="text-2xl font-black text-slate-900">
                      {/* 4. เรียกใช้ priceTHB จาก Backend */}
                      {item.priceTHB ? item.priceTHB.toLocaleString() : 'N/A'} <span className="text-sm font-normal text-slate-500">฿</span>
                    </p>
                  </div>
                  <div className="text-xs font-bold text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    VIEW DETAILS
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* แสดงข้อความเมื่อค้นหาแล้วแต่ไม่เจอข้อมูล */}
        {!loading && !error && hasSearched && products.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ไม่พบข้อมูลมาตรฐานที่ค้นหา ลองค้นหาด้วยคำอื่นดูนะครับ
          </div>
        )}
      </main>
    </div>
  );
}

export default App;