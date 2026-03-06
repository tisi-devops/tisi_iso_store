//ส่วนนำทางด้านบน
import { useEffect, useState } from 'react'

function Navb() {
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
    <div className="bg-slate-50 font-sans antialiased text-slate-900">
      {/* 1. Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <img src="/image/tisi-logo.jpg" className="h-20" alt="TISI Logo" />
        <h1 className="text-xl font-bold text-blue-700 tracking-tight">TiSi <span className="text-slate-400 font-light">Admin</span></h1>
        <div className="flex gap-4 items-center">
          {/* อัตราแลกเปลี่ยนกลาง */}
          <span className={`text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700`}>Mid_Rate: {data.currency1}
          </span>
          {/* อัตราขายถัวเฉลี่ย */}
          <span className={`text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700`}>Selling_Rate: {data.currency2}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${serverStatus === 'Online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            Server: {serverStatus}
          </span>
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">T</div>
        </div>
      </nav>
    </div>
  );
}

export default Navb;