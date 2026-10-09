import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuthService } from './admin-auth.service';

// ด่านกั้นหน้า /admin, /admin/new, /admin/:id/edit
// ยังไม่ได้กรอกรหัส -> พาไปหน้า /admin-login แล้วกลับมาหน้าเดิมหลังกรอกถูก
export const adminGuard: CanActivateFn = (_route, state) => {
  // ตอนรันฝั่ง Server ไม่มี sessionStorage ให้ผ่านไปก่อน แล้วไปตรวจจริงใน Browser
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return true;
  }

  const auth = inject(AdminAuthService);
  if (auth.isLoggedIn()) {
    return true;
  }

  return inject(Router).createUrlTree(['/admin-login'], {
    queryParams: { returnUrl: state.url },
  });
};
