import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState(null);
  const navigate = useNavigate();

  // ดึงข้อมูลจาก Storage มาแสดง
  useEffect(() => {
    const items = JSON.parse(sessionStorage.getItem('cart') || "[]");
    setCartItems(items);

    const savedData = sessionStorage.getItem('customerData');
    if (savedData) {
      setCustomerInfo(JSON.parse(savedData));
    }
  }, []);

  // ฟังก์ชันลบสินค้า
  const removeItem = (cartId) => {
    const updatedCart = cartItems.filter(item => item.cartId !== cartId);
    setCartItems(updatedCart);
    sessionStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // คำนวณราคารวม
  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);
  const total = subtotal;
  const handleCheckout = async () => {
    // ตรวจสอบก่อนว่ามีข้อมูลลูกค้าและสินค้าไหม
    if (!customerInfo) {
      Swal.fire({
        title: 'ข้อมูลไม่ครบ',
        text: 'กรุณากลับไปกรอกข้อมูลผู้ติดต่อที่หน้าแรกก่อนครับ',
        icon: 'warning',
        confirmButtonColor: '#2563eb'
      });
      return;
    }
    
    if (cartItems.length === 0) return;
    // เตรียมก้อนข้อมูลที่จะส่งไป Backend
    const orderData = {
      customer: customerInfo, // ข้อมูลจาก sessionStorage
      items: cartItems,       // รายการสินค้าในตะกร้า
      totalAmount: total      // ยอดรวมสุทธิ
    };

    try {
      // แสดง Loading ระหว่างส่งข้อมูล
      Swal.fire({
        title: 'กำลังดำเนินการ...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
      });

      // ยิง API ไปที่ Backend (ตัวที่เราจะเขียนในข้อถัดไป)
      const response = await fetch('/api-iso-store/submit-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();
      if (response.ok) {
        // ถ้าสำเร็จ: แจ้งเตือน และเคลียร์ตะกร้า
        await Swal.fire({
          title: 'สั่งซื้อสำเร็จ!',
          html: `เลขที่รายการของคุณคือ <span class="font-bold text-orange-500">${result.transactionId}</span>`,
          icon: 'success',
          confirmButtonColor: '#2563eb'
        });

        sessionStorage.removeItem('cart'); // ล้างตะกร้า
        window.dispatchEvent(new Event("cartUpdated")); // บอก Navbar ให้เลข 0
        navigate('/'); // กลับหน้าแรกหรือไปหน้า Success
      } else {
        throw new Error(result.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }

    } catch (err) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: err.message,
        icon: 'error'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
          ตะกร้าสินค้าของคุณ 
          <span className="text-sm font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
            {cartItems.length} รายการ
          </span>
        </h1>
        {cartItems.length === 0 ? (
          <div className="bg-white p-20 rounded-3xl border border-dashed border-slate-300 text-center">
            <p className="text-slate-400 mb-6 text-lg">ยังไม่มีสินค้าในตะกร้า...</p>
            <button 
              onClick={() => navigate('/Store')}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
            >
              ไปเลือกซื้อมาตรฐาน ISO
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {/* ส่วนแสดงข้อมูลผู้สั่งซื้อแบบย่อ (Customer Summary) */}
              {customerInfo && (
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-6">
                  <h4 className="text-blue-800 font-bold text-sm mb-1">ข้อมูลผู้สั่งซื้อ:</h4>
                  <p className="text-blue-900 font-medium">{customerInfo.company_name}</p>
                  <p className="text-blue-600 text-xs">{customerInfo.email} | {customerInfo.phone}</p>
                </div>
              )}
              {/* รายการสินค้า */}
              {cartItems.map((item) => (
                <div key={item.cartId} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between group hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl bg-slate-50 p-3 rounded-xl">{item.icon}</span>
                    <div>
                      <h3 className="font-black text-red-700">{item.code}</h3>
                      <p className="text-sm font-bold text-slate-800 leading-tight mb-1">{item.title}</p>
                      <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        Option: {item.option}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-slate-900 mb-2">{item.price.toLocaleString()} ฿</p>
                    <button 
                      onClick={() => removeItem(item.cartId)}
                      className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors uppercase tracking-widest"
                    >
                      ลบออก
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* สรุปยอดชำระเงิน */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 h-fit sticky top-24">
              <h2 className="text-xl font-bold mb-6 text-slate-800">สรุปยอดคำสั่งซื้อ</h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>ราคาสินค้า</span>
                  <span>{subtotal.toLocaleString()} ฿</span>
                </div>
                <div className="border-t border-slate-100 pt-4 flex justify-between items-end">
                  <span className="font-bold text-slate-900">ยอดรวมสุทธิ</span>
                  <span className="text-3xl font-black text-blue-600">
                    {total.toLocaleString()} <small className="text-xs font-normal">บาท</small>
                  </span>
                </div>
              </div>
              <button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-100 active:scale-95 mb-4"
                onClick={() => handleCheckout()}
              >
                ดำเนินการชำระเงิน
              </button>
              <button 
                onClick={() => navigate('/Store')}
                className="w-full text-slate-400 hover:text-slate-600 font-bold py-2 text-sm transition-colors"
              >
                เลือกซื้อสินค้าต่อ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;