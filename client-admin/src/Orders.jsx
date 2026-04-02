import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 🌟 เพิ่ม import นี้
import axios from 'axios';
import Swal from 'sweetalert2';

export default function Orders() {
  const [logorders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // 🌟 เรียกใช้งาน useNavigate

  // 1. ฟังก์ชันดึงข้อมูลคำสั่งซื้อ
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/orders');
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถดึงข้อมูลรายการสั่งซื้อได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-200 text-yellow-800 border-yellow-200';
      case 'PAID': return 'bg-blue-200 text-blue-800 border-blue-200';
      case 'COMPLETED': return 'bg-green-200 text-green-800 border-green-200';
      case 'CANCELED': return 'bg-red-200 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">จัดการคำสั่งซื้อ (Orders Management)</h2>
        <button 
          onClick={fetchOrders}
          className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          🔄 รีเฟรชข้อมูล
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
              <th className="p-4 font-semibold text-sm text-center">อัปเดตสถานะ</th>
              <th className="p-4 font-semibold text-sm text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="p-8 text-center text-slate-400 font-medium">กำลังโหลดข้อมูล...</td></tr>
            ) : logorders.length === 0 ? (
              <tr><td colSpan="7" className="p-8 text-center text-slate-400 font-medium">ยังไม่มีรายการสั่งซื้อ</td></tr>
            ) : (
              logorders.map((order, index) => (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-blue-600">{order.id }</td>
                  <td className="p-4 text-slate-700 font-medium max-w-[200px]" >{order.company || '-'}</td>
                  <td className="p-4 text-slate-500 text-xs max-w-[200px]">{order.standard || '-'}</td>
                  <td className="p-4 text-slate-500 text-xs max-w-[200px]">{order.date || '-'}</td>
                  <td className="p-4 text-right font-bold text-green-600">{order.price?.toLocaleString()}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {/* 🌟 เปลี่ยนปุ่มธรรมดา ให้มี onClick สั่งเปลี่ยนหน้า */}
                    <button 
                      onClick={() => navigate(`/Orders/${order.id}`)}
                      className="text-white bg-slate-800 hover:bg-blue-600 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors shadow-sm"
                    >
                      ตรวจสอบ
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}