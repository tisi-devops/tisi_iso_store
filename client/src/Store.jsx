//*page 2

import { useEffect, useState } from 'react'

function App() {
  const [serverStatus, setServerStatus] = useState("Checking...");
  const [data, setData] = useState({
    message: "กำลังโหลด...",
    serverStatus: "Checking...",
    sales: "0 ฿",
    pendingOrders: 0,
    currency1: 0,
    currency2: 0
  });

  // จำลองการดึงข้อมูลจาก Node.js
  useEffect(() => {
    fetch('http://localhost:5000/api/hello')
      .then(res => res.json())
      .then(data => {setData(data);
                     setServerStatus("Online");})
      .catch(() => setServerStatus("Offline"));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      {/* 2. Main Content */}
      <main className="max-w-5xl mx-auto p-6 lg:p-12">
        
        {/* Header Section */}
        <header className="mb-10">

        {/* Search Button */}
        <div className="flex mt-12 rounded-2xl p-8 border-slate-200 text-center">
          <input 
            type="text" 
            className="rounded-l-xl border-t border-b border-l border-slate-300 p-2.5 w-full outline-none focus:border-blue-500" 
            placeholder="Search products..."
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-r-xl transition-colors font-medium">
            Search
          </button>
        </div>

        </header>

        {/* 3. Grid Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <p className="text-5xl font-bold text-red-700 uppercase tracking-wider mb-1">ISO 9001</p>
            <h3 className="text-2xl font-bold text-slate-800">Quality management systems — Requirements</h3>
            <hr className="my-4 border-red-700 border-2"/>
            <div className="mt-4 text-xl bg-gray font-bold text-gray-600 font-medium">ราคา</div>
          </div>


          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <p className="text-5xl font-bold text-red-500 uppercase tracking-wider mb-1">ISO 9001</p>
            <h3 className="text-2xl font-bold text-slate-800">Quality management systems — Requirements</h3>
            <div className="mt-4 text-xl font-bold text-gray-600 font-medium">ราคา</div>
          </div>


          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <p className="text-5xl font-bold text-red-500 uppercase tracking-wider mb-1">ISO 9001</p>
            <h3 className="text-2xl font-bold text-slate-800">Quality management systems — Requirements</h3>
            <div className="mt-4 text-xl font-bold text-gray-600 font-medium">ราคา</div>
          </div>
        </div>

        {/* 4. Action Button Area */}
        <section className="mt-12 bg-white rounded-2xl p-8 border border-slate-200 text-center">
          <h4 className="text-lg font-bold mb-2">เริ่มสร้างโครงการใหม่</h4>
          <p className="text-slate-500 mb-6 text-sm">สร้างแบบฟอร์มเพื่อลงทะเบียนมาตรฐาน ISO ใหม่เข้าระบบ</p>
          <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-800 active:scale-95 transition-all shadow-lg shadow-slate-200">
            + เพิ่มข้อมูลมาตรฐาน
          </button>
        </section>

      </main>
    </div>
  );
}

export default App;