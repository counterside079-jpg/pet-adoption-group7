import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { API_BASE } from '../services/api-config';

// แนบ "Authorization: Bearer <token>" ให้ทุกคำขอที่ยิงไป Backend ของเรา
// ถ้า Backend ตอบ 401 (token หมดอายุ/ไม่ถูกต้อง) -> ออกจากระบบแล้วพาไปหน้าเข้าสู่ระบบ
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token;

  const isOurApi = req.url.startsWith(API_BASE);
  const authReq = token && isOurApi
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      const isLoginCall = req.url.includes('/auth/login') || req.url.includes('/auth/register');
      if (err.status === 401 && isOurApi && !isLoginCall && token) {
        auth.logout();
        router.navigate(['/login'], { queryParams: { returnUrl: router.url, expired: 1 } });
      }
      return throwError(() => err);
    }),
  );
};
