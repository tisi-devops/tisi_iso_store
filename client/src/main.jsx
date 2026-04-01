import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

import Topbar from './Topbar.jsx'
import AddTransaction from './Transaction.jsx'
import App from './Store.jsx'
import ProductDetail from './Productdetail.jsx'
import Cart from './cart.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App /> */}
    <BrowserRouter>
      <Topbar/>
      <Routes>
        {/* หน้าแรกให้โชว์ฟอร์ม */}
        <Route path="/" element={<AddTransaction/>} />
        {/* เมื่อ navigate('/Store') จะมาโชว์หน้าที่นี่ */}
        <Route path="/Store" element={<App />} />

        <Route path="/product/:id" element={<ProductDetail/>} />
        <Route path="/Cart" element={<Cart/>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)