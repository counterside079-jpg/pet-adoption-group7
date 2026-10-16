import { RenderMode, ServerRoute } from '@angular/ssr';

// (ไฟล์นี้ใช้เฉพาะตอนเปิด SSR ซึ่งโปรเจกต์นี้ปิดไว้)
// ทุกหน้าแสดงผลใน Browser เพื่อให้อ่าน token การเข้าสู่ระบบจาก localStorage ได้
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
