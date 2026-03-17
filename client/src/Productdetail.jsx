// import { useState } from 'react';
// import Swal from 'sweetalert2';

// const prototypeItem = {
//   id: "ISO-9001-2015",
//   code: "ISO 9001",
//   edition: "2015",
//   title: "Quality management systems — Requirements",
//   basePrice: 5400, 
//   status: "Published",
//   details: {
//     abstract: "มาตรฐานนี้กำหนดข้อกำหนดสำหรับระบบการจัดการคุณภาพ เมื่อองค์กรต้องการแสดงความสามารถในการจัดหาผลิตภัณฑ์และบริการที่ตอบสนองความต้องการของลูกค้าอย่างสม่ำเสมอ และมุ่งเน้นการเพิ่มความพึงพอใจของลูกค้า...",
//     ics: "03.120.10",
//     pages: 29,
//     language: ["English", "Thai"]
//   },
//   options: [
//     { id: 'pdf', label: "Digital (PDF)", priceModifier: 0, icon: "📄" },
//     { id: 'hardcopy', label: "Hardcopy (Print)", priceModifier: 500, icon: "📚" },
//     { id: 'bundle', label: "PDF + Redline", priceModifier: 1200, icon: "📑" }
//   ]
// };

// function ProductDetail() {
//   const [selectedOption, setSelectedOption] = useState(prototypeItem.options[0]);

//   // คำนวณราคาสุทธิ
//   const totalPrice = prototypeItem.basePrice + selectedOption.priceModifier;


//   const handleAddToCart = () => {
//     // 1. เตรียมข้อมูลสินค้าที่จะลงตะกร้า
//     const cartItem = {
//         cartId: Date.now(), // สร้าง ID เฉพาะสำหรับรายการในตะกร้า
//         id: prototypeItem.id,
//         code: prototypeItem.code,
//         title: prototypeItem.title,
//         option: selectedOption.label,
//         price: totalPrice,
//         icon: selectedOption.icon
//     };

//     // 2. ดึงตะกร้าเดิมจาก LocalStorage (ถ้าไม่มีให้เริ่มด้วย Array ว่าง)
//     const existingCart = JSON.parse(localStorage.getItem('cart') || "[]");
    
//     // 3. เพิ่มของใหม่เข้าไป
//     const updatedCart = [...existingCart, cartItem];
//     localStorage.setItem('cart', JSON.stringify(updatedCart));

//     // 4. *** สำคัญมาก *** ส่งสัญญาณบอกหน้าอื่นๆ ว่าตะกร้าเปลี่ยนแล้ว
//     window.dispatchEvent(new Event("cartUpdated"));
//     // แทนที่จะใช้ alert แบบเดิม ให้ใช้ Swal.fire แบบนี้แทนครับ
//     Swal.fire({
//       title: 'สำเร็จ!', // หัวข้อหลัก (เปลี่ยนเป็นอะไรก็ได้)
//       text: `เพิ่ม ${prototypeItem.code} (${selectedOption.label}) ลงในตะกร้าแล้ว!`, // ข้อความรายละเอียด
//       icon: 'success', // รูปไอคอน (success, error, warning, info)
//       confirmButtonText: 'ตกลง',
//       confirmButtonColor: '#2563eb', // สีปุ่มให้เข้ากับเว็บ (สีน้ำเงิน)
//       timer: 2000 // (ออปชันเสริม) ให้มันปิดตัวเองอัตโนมัติใน 2 วินาที
//     });
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 p-4 md:p-12 font-sans">
//       <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
//         {/* Left Side: Information */}
//         <div className="lg:col-span-2 space-y-6">
//           <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
//             <div className="flex items-center gap-3 mb-4">
//               <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
//                 {prototypeItem.status}
//               </span>
//               <span className="text-slate-400 text-sm">ICS: {prototypeItem.details.ics}</span>
//             </div>
            
//             <h1 className="text-5xl font-black text-red-700 mb-2">
//               {prototypeItem.code}<span className="text-slate-300 ml-2">:{prototypeItem.edition}</span>
//             </h1>
//             <p className="text-2xl font-bold text-slate-800 mb-6">{prototypeItem.title}</p>
            
//             <div className="prose prose-slate">
//               <h3 className="text-lg font-bold text-slate-900 mb-2">บทคัดย่อ (Abstract)</h3>
//               <p className="text-slate-600 leading-relaxed">{prototypeItem.details.abstract}</p>
//             </div>
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
//               <p className="text-xs font-bold text-slate-400 uppercase mb-1">จำนวนหน้า</p>
//               <p className="font-bold text-slate-700">{prototypeItem.details.pages}</p>
//             </div>
//             <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
//               <p className="text-xs font-bold text-slate-400 uppercase mb-1">ภาษา</p>
//               <p className="font-bold text-slate-700">{prototypeItem.details.language.join(', ')}</p>
//             </div>
//           </div>
//         </div>

//         {/* Right Side: Selection & Checkout */}
//         <div className="space-y-6">
//           <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200 sticky top-8">
//             <h3 className="text-xl font-bold mb-4 text-slate-800">เลือกรูปแบบเอกสาร</h3>
            
//             <div className="space-y-3 mb-8">
//               {prototypeItem.options.map((option) => (
//                 <button
//                   key={option.id}
//                   onClick={() => setSelectedOption(option)}
//                   className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
//                     selectedOption.id === option.id 
//                     ? "border-blue-600 bg-blue-50" 
//                     : "border-slate-100 hover:border-slate-300"
//                   }`}
//                 >
//                   <div className="flex items-center gap-3">
//                     <span className="text-2xl">{option.icon}</span>
//                     <span className={`font-bold ${selectedOption.id === option.id ? "text-blue-700" : "text-slate-600"}`}>
//                       {option.label}
//                     </span>
//                   </div>
//                   {option.priceModifier > 0 && (
//                     <span className="text-xs font-bold text-blue-600">+{option.priceModifier} ฿</span>
//                   )}
//                 </button>
//               ))}
//             </div>

//             <div className="border-t border-slate-100 pt-6">
//               <div className="flex justify-between items-end mb-6">
//                 <span className="text-slate-500 font-medium">ราคาสุทธิ</span>
//                 <span className="text-4xl font-black text-slate-900">
//                   {totalPrice.toLocaleString()} <small className="text-sm font-normal">บาท</small>
//                 </span>
//               </div>
              
//               <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-100 active:scale-95"
//                       onClick={handleAddToCart} >
//                 หยิบใส่ตะกร้า
//               </button>
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }

// export default ProductDetail;















import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function ProductDetail() {
  const { id } = useParams(); // ดึง ID จาก URL (เช่น iso:pub:9001:2015)
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ตัวเลือกรูปแบบเอกสาร (Option Modifier)
  const options = [
    { id: 'pdf', label: "Digital (PDF)", priceModifier: 0, icon: "📄" },
    { id: 'hardcopy', label: "Hardcopy (Print)", priceModifier: 500, icon: "📚" },
    { id: 'bundle', label: "PDF + Redline", priceModifier: 1200, icon: "📑" }
  ];
  
  const [selectedOption, setSelectedOption] = useState(options[0]);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        // เนื่องจาก API ตอนนี้มีแค่หน้าค้นหา เราจึงจำลองดึงข้อมูลโดยใช้เลขมาตรฐานจาก ID
        // เช่น ถ้า id คือ 'iso:pub:9001:2015' เราจะสกัดเอาแค่ '9001' ไปค้นหา
        const stdNumber = id.match(/\d+/)?.[0] || "";
        
        console.log(`Fetching details for standard number: ${stdNumber}`);
        
        const response = await fetch(`http://localhost:5000/api/search-iso?q=${stdNumber}`);
        if (!response.ok) throw new Error("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
        
        const data = await response.json();
        
        // ค้นหาตัวที่ ID ตรงกับที่กดมาเป๊ะๆ
        const foundProduct = data.find(item => item.id === id);

        if (foundProduct) {
          setProduct({
            id: foundProduct.id,
            code: foundProduct.code,
            edition: foundProduct.code.split(':')[1] || "N/A", // ตัดเอาปีจากโค้ด (ถ้ามี)
            title: foundProduct.title,
            basePrice: foundProduct.priceTHB, // ดึงราคาบาทจาก API
            status: foundProduct.status,
            details: {
              // ⚠️ ส่วนนี้ API ปัจจุบันยังไม่ส่งมาให้ ขอจำลองไว้ก่อนนะครับ
              abstract: "มาตรฐานนี้กำหนดข้อกำหนดสำหรับระบบการจัดการคุณภาพ (ดึงข้อมูลจำลองเนื่องจาก API หลักยังไม่รองรับข้อมูลส่วนนี้)...",
              ics: "N/A",
              pages: "-",
              language: ["English"]
            }
          });
        } else {
          setError("ไม่พบข้อมูลมาตรฐานที่ต้องการ");
        }
      } catch (err) {
        console.error(err);
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProductDetail();
  }, [id]);

  // แสดงหน้า Loading ระหว่างรอ API
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xl font-bold text-slate-500 animate-pulse">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  // แสดงหน้า Error ถ้าดึงข้อมูลพังหรือหาไม่เจอ
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="text-xl font-bold text-red-500 mb-4">{error}</div>
        <button onClick={() => navigate(-1)} className="text-blue-600 underline hover:text-blue-800">
          กลับไปหน้าค้นหา
        </button>
      </div>
    );
  }

  // คำนวณราคาสุทธิจากฐานราคา API + ออปชันเสริม
  const totalPrice = product.basePrice + selectedOption.priceModifier;

  const handleAddToCart = () => {
    const cartItem = {
        cartId: Date.now(),
        id: product.id,
        code: product.code,
        title: product.title,
        option: selectedOption.label,
        price: totalPrice,
        icon: selectedOption.icon
    };

    const existingCart = JSON.parse(localStorage.getItem('cart') || "[]");
    const updatedCart = [...existingCart, cartItem];
    localStorage.setItem('cart', JSON.stringify(updatedCart));

    window.dispatchEvent(new Event("cartUpdated"));
    
    Swal.fire({
      title: 'สำเร็จ!',
      text: `เพิ่ม ${product.code} (${selectedOption.label}) ลงในตะกร้าแล้ว!`,
      icon: 'success',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#2563eb',
      timer: 2000
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Information */}
        <div className="lg:col-span-2 space-y-6">
          <button onClick={() => navigate(-1)} className="text-sm font-bold text-slate-400 hover:text-blue-600 mb-4 inline-flex items-center gap-2">
            ← กลับไปหน้าก่อนหน้า
          </button>
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                {product.status}
              </span>
              <span className="text-slate-400 text-sm">ICS: {product.details.ics}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-red-700 mb-2">
              {product.code}
            </h1>
            <p className="text-xl md:text-2xl font-bold text-slate-800 mb-6">{product.title}</p>
            
            <div className="prose prose-slate">
              <h3 className="text-lg font-bold text-slate-900 mb-2">บทคัดย่อ (Abstract)</h3>
              <p className="text-slate-600 leading-relaxed">{product.details.abstract}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">จำนวนหน้า</p>
              <p className="font-bold text-slate-700">{product.details.pages}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">ภาษา</p>
              <p className="font-bold text-slate-700">{product.details.language.join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Right Side: Selection & Checkout */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200 sticky top-8">
            <h3 className="text-xl font-bold mb-4 text-slate-800">เลือกรูปแบบเอกสาร</h3>
            
            <div className="space-y-3 mb-8">
              {options.map((option) => (
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
              
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-100 active:scale-95 disabled:bg-slate-400"
                      onClick={handleAddToCart}
                      disabled={!product.basePrice} // ป้องกันกดซื้อถ้าราคาไม่ขึ้น
                      >
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