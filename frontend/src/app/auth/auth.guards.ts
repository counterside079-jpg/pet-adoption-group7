import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// ต้องเข้าสู่ระบบก่อน (ผู้ใช้ทั่วไปหรือเจ้าหน้าที่ก็ได้) เช่น หน้าส่งคำขอรับเลี้ยง / คำขอของฉัน
export const authGuard: CanActivateFn = (_route, state) => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;
  if (inject(AuthService).isLoggedIn()) return true;
  return inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

// ต้องเป็นบัญชีเจ้าหน้าที่ (role = ADMIN)
// หมายเหตุ: ด่านนี้แค่กันหน้าเว็บ ส่วน API ของเจ้าหน้าที่ถูกตรวจสิทธิ์ซ้ำที่ Backend (AdminGuard) ทุกครั้ง
export const adminGuard: CanActivateFn = (_route, state) => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAdmin()) return true;
  if (auth.isLoggedIn()) return router.createUrlTree(['/'], { queryParams: { denied: 1 } });
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
