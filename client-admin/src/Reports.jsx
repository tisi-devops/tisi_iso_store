import React from 'react';
















export default function Reports() {
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