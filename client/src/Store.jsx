import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();

  const [inputValue, setInputValue] = useState('');
  const [customer, setCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // ข้อมูล Prototype สำหรับแสดงหน้า Store
  const products = [
    { id: '9001', code: 'ISO 9001', title: 'Quality management systems — Requirements', price: 5400 },
    { id: '14001', code: 'ISO 14001', title: 'Environmental Management Systems', price: 4800 },
    { id: '45001', code: 'ISO 45001', title: 'Occupational Health and Safety', price: 5100 },
  ];

  useEffect(() => {
    // ดึงข้อมูลจาก sessionStorage
    const savedData = sessionStorage.getItem('customerData');
    if (savedData) {
      setCustomer(JSON.parse(savedData));
    }

    const handleSearchClick = () => {
    // เอาค่าจากช่อง Input โยนใส่ searchQuery เพื่อกระตุ้นให้ useEffect ทำงาน
    setSearchQuery(inputValue);
  };
  }, []);

  // Filter ข้อมูลตามการค้นหา
  const filteredProducts = products.filter(p => 
    p.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      <main className="max-w-5xl mx-auto p-6 lg:p-12">
        
        <header className="mb-10">
          <div className="flex mt-12 bg-white rounded-2xl shadow-sm border border-slate-200 p-2 text-center">
            <input 
              type="text" 
              className="flex-1 p-3 ml-4 outline-none text-lg" 
              placeholder="ค้นหามาตรฐาน ISO..."
              // value={searchQuery}
              value={inputValue}
              // onChange={(e) => setSearchQuery(e.target.value)}
              onChange={(e) => setInputValue(e.target.value)}

            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl transition-colors font-bold"
                    // onClick={handleSearchClick}
                    disabled={loading}>
              Search
            </button>
          </div>
        </header>

        {/* Grid Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((item) => (
            <button 
              key={item.id}
              onClick={() => navigate(`/product/${item.id}`)}
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

              <h3 className="text-lg font-bold text-slate-700 leading-snug mb-4 h-14 overflow-hidden">
                {item.title}
              </h3>

              <hr className="mb-4 border-slate-100 transition-all group-hover:border-red-100" />

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ราคาเริ่มต้น</p>
                  <p className="text-2xl font-black text-slate-900">
                    {item.price.toLocaleString()} <span className="text-sm font-normal text-slate-500">฿</span>
                  </p>
                </div>
                <div className="text-xs font-bold text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  VIEW DETAILS
                </div>
              </div>
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            ไม่พบข้อมูลที่ค้นหา...
          </div>
        )}
      </main>
    </div>
  );
}

export default App;



// //*มีการเพิ่มการดึงข้อมูล api จาก iso(ดึงไปที่หน้า server)
// // แก้ไขไฟล์ App.jsx (Store)
// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// function App() {
//   const navigate = useNavigate();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isoProducts, setIsoProducts] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   // 1. โหลดข้อมูลเริ่มต้น (Top Standards)
//   useEffect(() => {
//     fetchDefaultStandards();
//   }, []);

//   const fetchDefaultStandards = async () => {
//     setIsLoading(true);
//     try {
//       const urns = ['iso:pub:9001:2015', 'iso:pub:14001:2015', 'iso:pub:45001:2018'];
//       const requests = urns.map(urn => axios.get(`http://localhost:5000/api/iso-publication/${urn}`));
//       const responses = await Promise.all(requests);
//       setIsoProducts(responses.map(res => res.data));
//     } catch (error) {
//       console.error("Fetch Error:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // 2. ✅ ฟังก์ชันค้นหามาตรฐานจริงจาก ISO (ยิงไปที่ /api/search-iso)
//   const handleSearch = async () => {
//     if (!searchQuery) {
//         fetchDefaultStandards();
//         return;
//     }
//     setIsLoading(true);
//     try {
//       const response = await axios.get(`http://localhost:5000/api/search-iso?q=${searchQuery}`);
//       setIsoProducts(response.data); // ข้อมูลจาก ISO จะมาลงที่นี่
//     } catch (error) {
//       console.error("Search Error:", error);
//       setIsoProducts([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 pb-12">
//       <main className="max-w-5xl mx-auto p-6 lg:p-12">
        
//         <header className="mb-10">
//           <div className="flex mt-12 bg-white rounded-2xl shadow-sm border border-slate-200 p-2">
//             <input 
//               type="text" 
//               className="flex-1 p-3 ml-4 outline-none text-lg" 
//               placeholder="พิมพ์เลขมาตรฐาน เช่น 9001, 27001..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               onKeyDown={(e) => e.key === 'Enter' && handleSearch()} // ค้นหาเมื่อกด Enter
//             />
//             {/* ✅ เพิ่มปุ่ม Search */}
//             <button 
//               onClick={handleSearch}
//               className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl transition-all font-bold active:scale-95"
//             >
//               Search
//             </button>
//           </div>
//         </header>

//         {isLoading ? (
//           <div className="text-center py-20 flex flex-col items-center">
//              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
//              <p className="text-slate-500 font-bold">กำลังค้นหาข้อมูลจากฐานข้อมูล ISO...</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {isoProducts.map((item) => (
//               <button 
//                 key={item.id}
//                 onClick={() => navigate(`/product/${encodeURIComponent(item.id)}`)}
//                 className="group w-full text-left bg-white p-6 rounded-3xl shadow-sm border border-slate-200 
//                           hover:shadow-xl hover:border-blue-200 hover:scale-[1.02] 
//                           transition-all duration-300 active:scale-[0.98]"
//               >
//                 {/* ... (ส่วนแสดงผลเหมือนเดิมของคุณ) ... */}
//                 <div className="flex justify-between items-start mb-4">
//                   <div>
//                     <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${item.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
//                       {item.status}
//                     </span>
//                     <p className="text-4xl font-black text-blue-700 uppercase tracking-tighter mt-2 group-hover:text-blue-500 transition-colors">
//                       {item.code}
//                     </p>
//                   </div>
//                 </div>
//                 <h3 className="text-lg font-bold text-slate-700 leading-snug mb-4 h-14 overflow-hidden">
//                   {item.title}
//                 </h3>
//                 <hr className="mb-4 border-slate-100 group-hover:border-blue-100" />
//                 <div className="flex justify-between items-end">
//                   <div>
//                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ราคาสุทธิ (THB)</p>
//                     <p className="text-2xl font-black text-slate-900">
//                       {item.priceTHB.toLocaleString()} <span className="text-sm font-normal text-slate-500">฿</span>
//                     </p>
//                   </div>
//                 </div>
//               </button>
//             ))}
//           </div>
//         )}

//         {!isLoading && isoProducts.length === 0 && (
//           <div className="text-center py-20 text-slate-400">
//             ไม่พบข้อมูลมาตรฐานที่ระบุ (โปรดใช้เลขมาตรฐาน เช่น 9001)
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }

// export default App;