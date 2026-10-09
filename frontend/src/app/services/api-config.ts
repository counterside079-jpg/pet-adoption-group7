// ที่อยู่ของ Backend (NestJS) ที่ทุก Service ใช้ร่วมกัน
// เปิดบนเครื่องตัวเอง (localhost) -> ใช้ Backend ที่รันในเครื่อง
// เปิดจากเว็บออนไลน์ (Render) -> ใช้ Backend บน Render
export const API_BASE =
  typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://BACKEND-URL.onrender.com/api'
    : 'http://localhost:3000/api';
