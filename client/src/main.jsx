import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './Store.jsx'
import AddProductPage from './firstform.jsx'
import Navb from './Navbar.jsx'
import ProductDetail from './Productdetail.jsx'
import Cart from './cart.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App /> */}
    <BrowserRouter>
      <Navb/>
      <Routes>
        {/* หน้าแรกให้โชว์ฟอร์ม */}
        <Route path="/" element={<AddProductPage />} />
        {/* เมื่อ navigate('/Store') จะมาโชว์หน้าที่นี่ */}
        <Route path="/Store" element={<App />} />

        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)