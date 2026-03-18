import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function ProductDetail() {
  const { id } = useParams(); // ตัวอย่าง id ที่ได้: iso%3Apub%3Astd%3AIS%3A62085
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const options = [
    { id: 'pdf', label: "Digital (PDF)", priceModifier: 0, icon: "📄" },
    { id: 'bundle', label: "PDF + Redline", priceModifier: 1200, icon: "📑" },
    { id: 'hardcopy', label: "Hardcopy (Print)", priceModifier: 500, icon: "📚" }
  ];
  const [selectedOption, setSelectedOption] = useState(options[0]);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);

        // 1. ถอดรหัส URL
        const realUrn = decodeURIComponent(id);
        
        // 2. แปลงจาก Publication URN ให้เป็น Project URN (เช่น ดึง 62085 มาใส่)
        const projectNumberMatch = realUrn.match(/\d+$/);
        const projectNumber = projectNumberMatch ? projectNumberMatch[0] : "";
        const projectUrn = `iso:proj:${projectNumber}`; 

        console.log("CHECK POINT 1:", projectNumber);
        console.log("CHECK POINT 2:", projectUrn);
        console.log("CHECK POINT 3:", encodeURIComponent(projectUrn));

        // 3. ส่งข้อมูลไปถาม Backend (ใช้คำว่า projectUrn ให้ตรงกับหลังบ้าน)
        const response = await fetch(`http://localhost:5000/api/get-iso-detail?projectUrn=${encodeURIComponent(projectUrn)}`);

        if (!response.ok) throw new Error("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ หรือไม่พบข้อมูลมาตรฐานนี้");
        
        // 4. รับข้อมูลที่ Backend จัดรูปมาให้เป็น Object เดี่ยวๆ
        const data = await response.json();

        if (data && !data.error) {
          // ✅ ข้อมูลมาเป็นก้อนเดียว เซ็ตค่าได้เลย ไม่ต้องวน .find() แล้ว
          setProduct({
            id: data.id,
            code: data.code,
            edition: data.code.split(':')[1] || "N/A", 
            title: data.title,
            basePrice: data.priceTHB, 
            status: data.status,
            details: {
              abstract: "มาตรฐานนี้กำหนดข้อกำหนดสำหรับระบบการจัดการคุณภาพ (ดึงข้อมูลจำลองเนื่องจาก API หลักยังไม่รองรับข้อมูลส่วนนี้)...",
              ics: "N/A",
              pages: "-",
              language: ["English"]
            }
          });
        } else {
          setError(data.error || "ไม่พบข้อมูลมาตรฐานที่ต้องการ");
        }
      } catch (err) {
        console.error(err);
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล หรือไม่พบมาตรฐานที่ระบุ");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProductDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xl font-bold text-slate-500 animate-pulse">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

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

    const existingCart = JSON.parse(sessionStorage.getItem('cart') || "[]");
    const updatedCart = [...existingCart, cartItem];
    sessionStorage.setItem('cart', JSON.stringify(updatedCart));

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
        
        {/* ข้อมูลด้านซ้าย */}
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

        {/* ข้อมูลด้านขวา: ราคาและปุ่มสั่งซื้อ */}
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
                      disabled={!product.basePrice} 
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