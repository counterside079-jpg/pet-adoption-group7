import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'pets/:id',
    renderMode: RenderMode.Server,
  },
  // หน้าเจ้าหน้าที่และหน้ากรอกรหัส ให้แสดงผลใน Browser เท่านั้น
  // เพื่อให้ด่านตรวจรหัสผ่าน (adminGuard) อ่าน sessionStorage ได้ก่อนแสดงหน้า
  {
    path: 'admin-login',
    renderMode: RenderMode.Client,
  },
  {
    path: 'admin',
    renderMode: RenderMode.Client,
  },
  {
    path: 'admin/new',
    renderMode: RenderMode.Client,
  },
  {
    path: 'admin/:id/edit',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
