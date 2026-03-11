import { useState } from 'react';

const prototypeItem = {
  id: "ISO-9001-2015",
  code: "ISO 9001",
  edition: "2015",
  title: "Quality management systems — Requirements",
  basePrice: 5400, 
  status: "Published",
  details: {
    abstract: "มาตรฐานนี้กำหนดข้อกำหนดสำหรับระบบการจัดการคุณภาพ เมื่อองค์กรต้องการแสดงความสามารถในการจัดหาผลิตภัณฑ์และบริการที่ตอบสนองความต้องการของลูกค้าอย่างสม่ำเสมอ และมุ่งเน้นการเพิ่มความพึงพอใจของลูกค้า...",
    ics: "03.120.10",
    pages: 29,
    language: ["English", "Thai"]
  },
  options: [
    { id: 'pdf', label: "Digital (PDF)", priceModifier: 0, icon: "📄" },
    { id: 'hardcopy', label: "Hardcopy (Print)", priceModifier: 500, icon: "📚" },
    { id: 'bundle', label: "PDF + Redline", priceModifier: 1200, icon: "📑" }
  ]
};

function ProductDetail() {
  const [selectedOption, setSelectedOption] = useState(prototypeItem.options[0]);

  // คำนวณราคาสุทธิ
  const totalPrice = prototypeItem.basePrice + selectedOption.priceModifier;


  const handleAddToCart = () => {
    // 1. เตรียมข้อมูลสินค้าที่จะลงตะกร้า
    const cartItem = {
        cartId: Date.now(), // สร้าง ID เฉพาะสำหรับรายการในตะกร้า
        id: prototypeItem.id,
        code: prototypeItem.code,
        title: prototypeItem.title,
        option: selectedOption.label,
        price: totalPrice,
        icon: selectedOption.icon
    };

    // 2. ดึงตะกร้าเดิมจาก LocalStorage (ถ้าไม่มีให้เริ่มด้วย Array ว่าง)
    const existingCart = JSON.parse(localStorage.getItem('cart') || "[]");
    
    // 3. เพิ่มของใหม่เข้าไป
    const updatedCart = [...existingCart, cartItem];
    localStorage.setItem('cart', JSON.stringify(updatedCart));

    // 4. *** สำคัญมาก *** ส่งสัญญาณบอกหน้าอื่นๆ ว่าตะกร้าเปลี่ยนแล้ว
    window.dispatchEvent(new Event("cartUpdated"));
    
    alert(`เพิ่ม ${prototypeItem.code} (${selectedOption.label}) ลงในตะกร้าแล้ว!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                {prototypeItem.status}
              </span>
              <span className="text-slate-400 text-sm">ICS: {prototypeItem.details.ics}</span>
            </div>
            
            <h1 className="text-5xl font-black text-red-700 mb-2">
              {prototypeItem.code}<span className="text-slate-300 ml-2">:{prototypeItem.edition}</span>
            </h1>
            <p className="text-2xl font-bold text-slate-800 mb-6">{prototypeItem.title}</p>
            
            <div className="prose prose-slate">
              <h3 className="text-lg font-bold text-slate-900 mb-2">บทคัดย่อ (Abstract)</h3>
              <p className="text-slate-600 leading-relaxed">{prototypeItem.details.abstract}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">จำนวนหน้า</p>
              <p className="font-bold text-slate-700">{prototypeItem.details.pages}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">ภาษา</p>
              <p className="font-bold text-slate-700">{prototypeItem.details.language.join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Right Side: Selection & Checkout */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200 sticky top-8">
            <h3 className="text-xl font-bold mb-4 text-slate-800">เลือกรูปแบบเอกสาร</h3>
            
            <div className="space-y-3 mb-8">
              {prototypeItem.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    selectedOption.id === option.id 
                    ? "border-blue-600 bg-blue-50" 
                    : "border-slate-100 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{option.icon}</span>
                    <span className={`font-bold ${selectedOption.id === option.id ? "text-blue-700" : "text-slate-600"}`}>
                      {option.label}
                    </span>
                  </div>
                  {option.priceModifier > 0 && (
                    <span className="text-xs font-bold text-blue-600">+{option.priceModifier} ฿</span>
                  )}
                </button>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-6">
              <div className="flex justify-between items-end mb-6">
                <span className="text-slate-500 font-medium">ราคาสุทธิ</span>
                <span className="text-4xl font-black text-slate-900">
                  {totalPrice.toLocaleString()} <small className="text-sm font-normal">บาท</small>
                </span>
              </div>
              
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-100 active:scale-95"
                      onClick={handleAddToCart} >
                หยิบใส่ตะกร้า
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ProductDetail;