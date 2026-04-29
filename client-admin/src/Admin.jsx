import React from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard.jsx';
import Orders from './Orders.jsx';
import OrderDetail from './OrderDetail.jsx';
import Login from './LoginPage.jsx';

// --- ตัวช่วยเช็คสถานะแบบ Real-time ---
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  // ถ้ายังไม่ได้ login ให้ดีดไปหน้าแรก
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function AdminLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-black text-white">TISI ISO-Store</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {/* ✅ สำคัญมาก: Path ใน Link ต้องขึ้นต้นด้วย /App เสมอ */}
          <Link 
            to="/App" 
            className={`block px-4 py-3 rounded-xl ${location.pathname === '/App' ? 'bg-blue-600' : ''}`}
          >
            📊 Dashboard
          </Link>
          <Link 
            to="/App/Orders" 
            className={`block px-4 py-3 rounded-xl ${location.pathname.includes('/Orders') ? 'bg-blue-600' : ''}`}
          >
            📝 จัดการคำสั่งซื้อ
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => {
              localStorage.removeItem('isAuthenticated');
              window.location.href = '/client-admin/'; // เคลียร์สถานะและกลับไปหน้าแรก
            }}
            className="w-full bg-slate-800 hover:bg-red-500 text-slate-300 px-4 py-2 rounded-lg text-sm"
          >
            ออกจากระบบ
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <Routes>
          {/* ✅ Path ย่อยไม่ต้องใส่ /App ซ้ำ เพราะมันอยู่ภายใต้ /App/* แล้ว */}
          <Route path="/" element={<Dashboard />} />
          <Route path="Orders" element={<Orders />} />
          <Route path="Orders/:id" element={<OrderDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  // เช็คสถานะทุกครั้งที่ Route เปลี่ยน
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  return (
    <Routes>
      {/* หน้าแรก: ถ้า Login แล้วให้ไป /App ถ้ายังให้โชว์หน้า Login */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/App" replace /> : <Login />} />
      
      {/* หน้าหลัก: หุ้มด้วย ProtectedRoute */}
      <Route 
        path="/App/*" 
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        } 
      />

      {/* กันเหนียว: ถ้าเข้า Path มั่ว ให้ดีดกลับหน้าแรก */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}