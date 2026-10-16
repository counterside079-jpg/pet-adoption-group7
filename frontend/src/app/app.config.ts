import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // authInterceptor แนบ token ของผู้ที่เข้าสู่ระบบไปกับทุกคำขอ
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
  ],
};
