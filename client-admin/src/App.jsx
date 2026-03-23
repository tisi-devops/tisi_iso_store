import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './Dashboard.jsx'; // 🌟 Import Component เข้ามา
import Reports from './Reports.jsx'; // 🌟 Import Component เข้ามา

// ==========================================
// โครงสร้างหลัก (Sidebar + Content)
// ==========================================
function AdminLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      
      {/* 🟢 Sidebar ด้านซ้าย */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-black tracking-tight text-white">
            TISI <span className="text-blue-500">E-Store</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">ระบบจัดการหลังบ้าน สมอ.</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link 
            to="/" 
            className={`block px-4 py-3 rounded-xl transition-all font-medium ${
              location.pathname === '/' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            📊 Dashboard
          </Link>
          <Link 
            to="/Reports" 
            className={`block px-4 py-3 rounded-xl transition-all font-medium ${
              location.pathname === '/Reports' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            📝 จัดการคำสั่งซื้อ
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="w-full bg-slate-800 hover:bg-red-500 hover:text-white text-slate-300 px-4 py-2 rounded-lg transition-colors text-sm font-medium">
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* 🟢 พื้นที่ Content ด้านขวา */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/Reports" element={<Reports />} />
        </Routes>
      </main>

    </div>
  );
}

// ==========================================
// จุดเริ่มต้นของแอป
// ==========================================
export default function App() {
  return (
    <BrowserRouter>
      <AdminLayout />
    </BrowserRouter>
  );
}