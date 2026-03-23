import React from 'react';

export default function dashboard() {
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