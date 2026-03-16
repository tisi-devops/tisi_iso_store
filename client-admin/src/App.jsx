import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';

// ==========================================
// 📊 1. หน้า DASHBOARD (ภาพรวมระบบ)
// ==========================================
function Dashboard() {
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">ภาพรวมระบบ (Dashboard)</h2>
      
      {/* การ์ดสรุปข้อมูล */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-blue-500">
          <p className="text-sm font-semibold text-slate-500 mb-1">ยอดขายเดือนนี้</p>
          <h3 className="text-3xl font-black text-slate-800">124,500 <span className="text-lg text-slate-500 font-normal">บาท</span></h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-green-500">
          <p className="text-sm font-semibold text-slate-500 mb-1">รายการสั่งซื้อสำเร็จ</p>
          <h3 className="text-3xl font-black text-slate-800">42 <span className="text-lg text-slate-500 font-normal">รายการ</span></h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
          <p className="text-sm font-semibold text-slate-500 mb-1">รอตรวจสอบชำระเงิน</p>
          <h3 className="text-3xl font-black text-amber-600">5 <span className="text-lg text-slate-500 font-normal">รายการ</span></h3>
        </div>
      </div>

      {/* พื้นที่สำหรับกราฟ หรือ ข้อมูลสรุปอื่นๆ */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[300px] flex items-center justify-center">
        <p className="text-slate-400">พื้นที่สำหรับใส่กราฟสรุปยอดขาย (สามารถใช้ Chart.js หรือ Recharts)</p>
      </div>
    </div>
  );
}

// ==========================================
// 📝 2. หน้า REPORT (ตารางจัดการข้อมูล)
// ==========================================
function Reports() {
  // ข้อมูลจำลอง (Mock Data) สไตล์สมอ.
  const mockOrders = [
    { id: 'ORD-001', company: 'บจก. เอบีซี กรุ๊ป', standard: 'ISO 9001:2015', date: '2026-03-16', price: 5400, status: 'รอตรวจสอบ' },
    { id: 'ORD-002', company: 'บมจ. ไทยอุตสาหกรรม', standard: 'ISO 14001:2015', date: '2026-03-15', price: 4800, status: 'อนุมัติแล้ว' },
    { id: 'ORD-003', company: 'บจก. เทคโซลูชั่น', standard: 'ISO/IEC 27001:2022', date: '2026-03-15', price: 6200, status: 'อนุมัติแล้ว' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">รายงานการสั่งซื้อ (Orders Report)</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          Export to Excel
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <th className="p-4 font-semibold text-sm">รหัสสั่งซื้อ</th>
              <th className="p-4 font-semibold text-sm">ชื่อบริษัท / ผู้สั่งซื้อ</th>
              <th className="p-4 font-semibold text-sm">มาตรฐานที่สั่งซื้อ</th>
              <th className="p-4 font-semibold text-sm">วันที่สั่งซื้อ</th>
              <th className="p-4 font-semibold text-sm text-right">ยอดชำระ (บาท)</th>
              <th className="p-4 font-semibold text-sm text-center">สถานะ</th>
              <th className="p-4 font-semibold text-sm text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {mockOrders.map((order, index) => (
              <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4 font-medium text-blue-600">{order.id}</td>
                <td className="p-4 text-slate-700">{order.company}</td>
                <td className="p-4 text-slate-700">{order.standard}</td>
                <td className="p-4 text-slate-500">{order.date}</td>
                <td className="p-4 text-slate-700 text-right font-medium">{order.price.toLocaleString()}</td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    order.status === 'อนุมัติแล้ว' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button className="text-slate-400 hover:text-blue-600 font-medium text-sm underline">
                    ตรวจสอบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 🏗️ 3. โครงสร้างหลัก (Sidebar + Content)
// ==========================================
function AdminLayout() {
  const location = useLocation(); // เอาไว้เช็คว่าตอนนี้อยู่หน้าไหน เพื่อทำแถบเมนูให้เป็นสีน้ำเงิน

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
            to="/reports" 
            className={`block px-4 py-3 rounded-xl transition-all font-medium ${
              location.pathname === '/reports' 
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
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </main>

    </div>
  );
}

// ==========================================
// 🚀 4. จุดเริ่มต้นของแอป (App Provider)
// ==========================================
export default function App() {
  return (
    <BrowserRouter>
      <AdminLayout />
    </BrowserRouter>
  );
}