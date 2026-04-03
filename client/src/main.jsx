import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

import Topbar from './Topbar.jsx'
import AddTransaction from './Transaction.jsx'
import App from './Store.jsx'
import ProductDetail from './Productdetail.jsx'
import Cart from './Cart.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <BrowserRouter> */}
    <BrowserRouter basename="/tisi_iso_store/client/dist">
      <Topbar/>
      <Routes>
        <Route path="/" element={<AddTransaction/>} />
        <Route path="/Store" element={<App />} />

        <Route path="/product/:id" element={<ProductDetail/>} />
        <Route path="/Cart" element={<Cart/>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)