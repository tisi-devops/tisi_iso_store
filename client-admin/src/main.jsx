import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './Admin.jsx' // 🌟 1. เปลี่ยนชื่อที่รับมาเป็น App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App /> {/* 🌟 2. เรียกใช้งาน <App /> ที่มี BrowserRouter หุ้มอยู่แล้ว */}
  </StrictMode>,
)