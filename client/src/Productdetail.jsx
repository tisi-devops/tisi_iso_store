import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // ✅ แก้ Import ให้ถูกต้อง
import Swal from 'sweetalert2';

function ProductDetail() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const realUrn = decodeURIComponent(id);
        const projectNumberMatch = realUrn.match(/\d+$/);
        const projectNumber = projectNumberMatch ? projectNumberMatch[0] : "";
        const projectUrn = `iso:proj:${projectNumber}`; 

        console.log("projectUrn IS :", projectUrn);

        const response = await fetch(`http://localhost:5000/api/get-iso-detail?projectUrn=${encodeURIComponent(projectUrn)}`);

        if (!response.ok) throw new Error("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ หรือไม่พบข้อมูลมาตรฐานนี้");
        
        const data = await response.json();

        if (data && !data.error) {
          setProduct({
            id: data.id,
            code: data.code,
            edition: data.code.split(':')[1] || "N/A", 
            title: data.title || "No Title",
            basePrice: data.SpecialPriceTHB, 
            status: data.status,
            abstract: data.abstract || "ไม่มีบทคัดย่อ",
          });
        // console.log("projectUrn IS :", product.basePrice);
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

  // ✅ ฟังก์ชัน Add to Cart ที่แก้ไขตัวแปรเรียบร้อยแล้ว
  const handleAddToCart = () => {
    if (!product) return;

    const cartItem = {
        cartId: Date.now(),
        id: product.id,
        code: product.code,
        title: product.title,
        option: "Standard Digital", // กำหนดค่าตายตัวเพราะขายราคาเดียว
        price: product.basePrice,   // ✅ ใช้ค่าจาก State product
        icon: "📄"
    };

    const existingCart = JSON.parse(sessionStorage.getItem('cart') || "[]");
    const updatedCart = [...existingCart, cartItem];
    sessionStorage.setItem('cart', JSON.stringify(updatedCart));

    window.dispatchEvent(new Event("cartUpdated"));
    
    Swal.fire({
      title: 'สำเร็จ!',
      text: `เพิ่ม ${product.code} ลงในตะกร้าเรียบร้อยแล้ว`,
      icon: 'success',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#2563eb',
      timer: 2000
    });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">กำลังโหลดข้อมูล...</div>;
  if (error || !product) return <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <button onClick={() => navigate(-1)} className="text-sm font-bold text-slate-400 hover:text-blue-600 mb-4 inline-flex items-center gap-2">
            ← กลับไปหน้าก่อนหน้า
          </button>
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                {product.status}
              </span>
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                English
              </span>
              <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                PDF File
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-red-700 mb-2">{product.code}</h1>
            <p className="text-xl md:text-2xl font-bold text-slate-800 mb-6">{product.title}</p>
            <h5 className="text-red-600 py-1 rounded-full text-2xl font-bold ">Abstract</h5>
            {/* ✅ ใช้ dangerouslySetInnerHTML เพื่อรองรับ Tag HTML จาก API */}
            <div 
              className="text-slate-600 leading-relaxed prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: product.abstract }} 
            />
          </div>  
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200 sticky top-8">
            <h3 className="text-xl font-bold mb-4 text-slate-800">สรุปการสั่งซื้อ</h3>
            <p className="text-sm text-slate-500 mb-6">รูปแบบ: Digital Standard Edition (PDF)</p>

            <div className="border-t border-slate-100 pt-6">
              <div className="flex justify-between items-end mb-6">
                <span className="text-slate-500 font-medium">ราคาสุทธิ</span>
                <span className="text-4xl font-black text-slate-900">
                  {/* ✅ แก้ไขการเรียกตัวแปรราคา */}
                  {product.basePrice?.toLocaleString()} <small className="text-sm font-normal">บาท</small>
                </span>
              </div>
              
              <button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 disabled:bg-slate-400"
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