import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, timeout } from 'rxjs';
import { API_BASE } from './api-config';

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  phone?: string | null;
  role: 'USER' | 'ADMIN';
  createdAt?: string;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

const TOKEN_KEY = 'bpj_token';
const USER_KEY = 'bpj_user';

// ระบบสมาชิก: สมัคร / เข้าสู่ระบบ / ออกจากระบบ
// Token เก็บใน localStorage แล้วแนบไปกับทุกคำขอผ่าน authInterceptor
// สิทธิ์ (ADMIN/USER) ถูกตรวจซ้ำที่ Backend ทุกครั้ง ฝั่งหน้าเว็บใช้แค่ซ่อน/แสดงเมนู
@Injectable({ providedIn: 'root' })
export class AuthService {
  private url = `${API_BASE}/auth`;
  private _user = signal<AuthUser | null>(this.readUser());

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());
  readonly isAdmin = computed(() => this._user()?.role === 'ADMIN');

  constructor(private http: HttpClient) {}

  private get storage(): Storage | null {
    try {
      return typeof window !== 'undefined' ? window.localStorage : null;
    } catch {
      return null;
    }
  }

  private readUser(): AuthUser | null {
    try {
      const raw = this.storage?.getItem(USER_KEY);
      return raw && this.storage?.getItem(TOKEN_KEY) ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }

  get token(): string | null {
    return this.storage?.getItem(TOKEN_KEY) ?? null;
  }

  private save(res: AuthResponse): void {
    this.storage?.setItem(TOKEN_KEY, res.token);
    this.storage?.setItem(USER_KEY, JSON.stringify(res.user));
    this._user.set(res.user);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.url}/login`, { email, password })
      .pipe(timeout(20000), tap((res) => this.save(res)));
  }

  register(data: { fullName: string; email: string; password: string; phone?: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.url}/register`, data)
      .pipe(timeout(20000), tap((res) => this.save(res)));
  }

  // ตรวจกับ Backend ว่า token ยังใช้ได้ และอัปเดตข้อมูล/สิทธิ์ล่าสุด
  refreshMe(): void {
    if (!this.token) return;
    this.http.get<AuthUser>(`${this.url}/me`).subscribe({
      next: (u) => {
        this.storage?.setItem(USER_KEY, JSON.stringify(u));
        this._user.set(u);
      },
      error: (err) => {
        if (err?.status === 401) this.logout();
      },
    });
  }

  logout(): void {
    this.storage?.removeItem(TOKEN_KEY);
    this.storage?.removeItem(USER_KEY);
    this._user.set(null);
  }

  // ---------- จัดการบัญชีเจ้าหน้าที่ (เฉพาะ ADMIN) ----------
  listAdmins(): Observable<AuthUser[]> {
    return this.http.get<AuthUser[]>(`${API_BASE}/admins`).pipe(timeout(20000));
  }

  addAdmin(data: { fullName: string; email: string; password: string; phone?: string }): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${API_BASE}/admins`, data);
  }

  removeAdmin(id: number): Observable<unknown> {
    return this.http.delete(`${API_BASE}/admins/${id}`);
  }
}
