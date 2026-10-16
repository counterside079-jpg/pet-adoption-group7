import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';
const THEME_KEY = 'bpj_theme';

// โหมดสว่าง / มืด
// - ครั้งแรกใช้ตามการตั้งค่าของเครื่อง (prefers-color-scheme) ถ้าผู้ใช้กดเลือกเองจะจำไว้ใน localStorage
// - ตั้งค่า <html data-theme="dark|light"> แล้วสีทั้งเว็บเปลี่ยนตามตัวแปรใน styles.css
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _theme = signal<Theme>(this.initialTheme());
  readonly theme = this._theme.asReadonly();

  constructor() {
    this.apply(this._theme());
  }

  private initialTheme(): Theme {
    try {
      const saved = window.localStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  }

  private apply(theme: Theme): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }

  toggle(): void {
    const next: Theme = this._theme() === 'dark' ? 'light' : 'dark';
    this._theme.set(next);
    this.apply(next);
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      /* ignore */
    }
  }
}
