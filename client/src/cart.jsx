import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  // 1. ดึงข้อมูลจาก LocalStorage มาแสดง
  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cart') || "[]");
    setCartItems(items);
  }, []);

  // 2. ฟังก์ชันลบสินค้า
  const removeItem = (cartId) => {
    const updatedCart = cartItems.filter(item => item.cartId !== cartId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // ส่งสัญญาณบอก Navb ให้ลดตัวเลข Badge
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // 3. คำนวณราคารวม
  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);
  const tax = subtotal * 0.07; // ภาษี 7%
  const total = subtotal + tax;

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
            
            {/* รายการสินค้าในตะกร้า */}
            <div className="lg:col-span-2 space-y-4">
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
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>ภาษี (7%)</span>
                  <span>{tax.toLocaleString()} ฿</span>
                </div>
                <div className="border-t border-slate-100 pt-4 flex justify-between items-end">
                  <span className="font-bold text-slate-900">ยอดรวมสุทธิ</span>
                  <span className="text-3xl font-black text-blue-600">
                    {total.toLocaleString()} <small className="text-xs font-normal">บาท</small>
                  </span>
                </div>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-100 active:scale-95 mb-4">
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