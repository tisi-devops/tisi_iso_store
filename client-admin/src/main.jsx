import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './Admin.jsx' // 🌟 1. เปลี่ยนชื่อที่รับมาเป็น App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/client-admin">
      <App />
    </BrowserRouter>
  </StrictMode>,
)