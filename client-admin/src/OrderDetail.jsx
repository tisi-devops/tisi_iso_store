/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function OrderDetail() {
  const { id } = useParams(); // รับรหัสสั่งซื้อจาก URL
  const navigate = useNavigate();
  
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api-iso-store/orders/${id}`);
      setOrderData(response.data);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("ไม่พบข้อมูลรายการสั่งซื้อนี้ หรือระบบขัดข้อง");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  // 🌟 3. ฟังก์ชันสำหรับจัดการการกดปุ่มอนุมัติ/ยกเลิก
  const handleStatusAction = async (newStatus) => {
    const isApprove = newStatus === 'PAID';
    const statusText = isApprove ? 'อนุมัติคำสั่งซื้อ' : 'ปฏิเสธคำสั่งซื้อ';

    const confirm = await Swal.fire({
      title: isApprove ? 'ยืนยันการอนุมัติ?' : 'ยืนยันการปฏิเสธ?',
      text: `คุณต้องการ "${statusText}" รายการนี้ใช่หรือไม่?`,
      icon: isApprove ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: isApprove ? '#16a34a' : '#dc2626',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก'
    });

    if (confirm.isConfirmed) {
      try {
        await axios.put(`/api-iso-store/orders/${id}/status`, {
          status: newStatus
        });
        
        Swal.fire({
          title: 'สำเร็จ!',
          text: `เปลี่ยนสถานะเป็น ${newStatus} เรียบร้อยแล้ว`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        
        fetchOrderDetail(); // โหลดข้อมูลใหม่เพื่ออัปเดตหน้าจอทันที
      } catch (err) {
        console.error("Update Error:", err);
        Swal.fire('ข้อผิดพลาด', 'อัปเดตสถานะไม่สำเร็จ กรุณาลองใหม่', 'error');
      }
    }
  };


  if (loading) return <div className="p-8 text-center text-slate-500 font-bold">กำลังโหลดข้อมูล...</div>;
  if (error) return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;
  if (!orderData) return null;

  // ฟังก์ชันจัดสีสถานะ
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
    <div className="animate-fade-in max-w-5xl mx-auto pb-10">
      {/* ส่วนหัว */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-blue-600 font-bold bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 transition-colors">
          ← ย้อนกลับ
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            รายละเอียดคำสั่งซื้อ: {orderData.transaction_id}
            <span className={`text-xs px-3 py-1 rounded-full border border-white font-bold shadow-sm ${getStatusColor(orderData.status)}`}>
              {orderData.status}
            </span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">วันที่สั่งซื้อ: {new Date(orderData.created_at).toLocaleString('th-TH')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* คอลัมน์ซ้าย: ข้อมูลลูกค้า & ที่อยู่ */}
        <div className="lg:col-span-1 space-y-6">
          {/* การ์ดข้อมูลผู้ติดต่อ */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 text-lg">ข้อมูลผู้สั่งซื้อ</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-400 text-xs">ประเภท</p>
                <p className="font-bold text-slate-700">{orderData.person_type === 2 ? '🏢 นิติบุคคล' : '👤 บุคคลธรรมดา'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">ชื่อหน่วยงาน / บริษัท</p>
                <p className="font-bold text-slate-800">{orderData.company_name || '-'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">เลขประจำตัวผู้เสียภาษี</p>
                <p className="font-bold text-slate-800">{orderData.tax_id || '-'}</p>
              </div>
              <div className="pt-3 border-t border-slate-50">
                <p className="text-slate-400 text-xs">ชื่อผู้ติดต่อ</p>
                <p className="font-bold text-slate-800">{orderData.contact_title}{orderData.contact_firstname} {orderData.contact_lastname}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">อีเมล</p>
                <p className="font-bold text-slate-800">{orderData.email}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">เบอร์โทรศัพท์</p>
                <p className="font-bold text-slate-800">{orderData.phone}</p>
              </div>
            </div>
          </div>

          {/* การ์ดที่อยู่จัดส่ง */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 text-lg">ที่อยู่จัดส่งเอกสาร</h3>
            <div className="text-sm text-slate-600 leading-relaxed">
              <p>
                <span className="font-bold text-slate-800">บ้านเลขที่:</span> {orderData.house_number} 
                {orderData.moo ? ` หมู่ ${orderData.moo}` : ''}
              </p>
              {orderData.building_name && <p><span className="font-bold text-slate-800">อาคาร/หมู่บ้าน:</span> {orderData.building_name}</p>}
              {orderData.soi && <p><span className="font-bold text-slate-800">ซอย:</span> {orderData.soi}</p>}
              {orderData.road && <p><span className="font-bold text-slate-800">ถนน:</span> {orderData.road}</p>}
              <p>ต.{orderData.subdistrict} อ.{orderData.district}</p>
              <p>จ.{orderData.province} {orderData.postcode}</p>
            </div>
          </div>

          {/* การ์ดแก้ไขสถานะคำสั่งซื้อ */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 text-lg">แก้ไขสถานะคำสั่งซื้อ</h3>
            <div className="space-y-4">
              <button className="w-full bg-green-300 text-green-800 hover:bg-green-600 hover:text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm"
                onClick={() => handleStatusAction('PAID')}
              >
                อนุมัติคำสั่งซื้อ
              </button>
              <button className="w-full bg-red-300 text-red-800 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm"
                onClick={() => handleStatusAction('CANCELED')}
              >
                ปฏิเสธคำสั่งซื้อ
              </button>
            </div>
          </div>
        </div>

        {/* คอลัมน์ขวา: รายการสินค้า */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 text-lg">รายการมาตรฐาน ISO ที่สั่งซื้อ</h3>
            
            <div className="space-y-4">
              {orderData.items && orderData.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <h4 className="font-black text-red-700 text-lg">{item.product_code}</h4>
                    <span className="text-xs font-bold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500 uppercase">
                      Option: {item.product_option}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-xs">จำนวน: {item.quantity}</p>
                    <p className="font-black text-slate-800 text-xl">{Number(item.price_at_purchase).toLocaleString()} ฿</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex justify-between items-end">
                <span className="text-slate-500 font-bold">ยอดชำระสุทธิ</span>
                <span className="text-4xl font-black text-blue-700">
                  {Number(orderData.total_amount).toLocaleString()} <span className="text-lg text-slate-500 font-normal">บาท</span>
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}