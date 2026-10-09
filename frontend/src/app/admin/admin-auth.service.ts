import { Injectable } from '@angular/core';

// ตรวจรหัสผ่านก่อนเข้าหน้าเจ้าหน้าที่ (Admin)
// หมายเหตุ: เป็นการกันหน้าเว็บอย่างง่าย ตรวจที่ฝั่ง Browser เท่านั้น ยังไม่ใช่ระบบ Login เต็มรูปแบบ
const ADMIN_PASSWORD = 'admin1234';
const STORAGE_KEY = 'bpj_admin_ok';

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  // อ่าน/เขียน sessionStorage ได้เฉพาะตอนรันใน Browser (ตอน SSR/prerender ไม่มี window)
  private get storage(): Storage | null {
    try {
      return typeof window !== 'undefined' ? window.sessionStorage : null;
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return this.storage?.getItem(STORAGE_KEY) === '1';
  }

  login(password: string): boolean {
    if (password === ADMIN_PASSWORD) {
      this.storage?.setItem(STORAGE_KEY, '1');
      return true;
    }
    return false;
  }

  logout(): void {
    this.storage?.removeItem(STORAGE_KEY);
  }
}
