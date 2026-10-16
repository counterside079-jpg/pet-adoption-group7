import { Injectable, computed, signal } from '@angular/core';
import { EN } from '../i18n/en';

export type Lang = 'th' | 'en';
const LANG_KEY = 'bpj_lang';

// ระบบเปลี่ยนภาษา ไทย / อังกฤษ
// - ข้อความในหน้าเว็บเขียนเป็นภาษาไทยตามเดิม แล้วส่งผ่าน pipe "t" ({{ 'ข้อความ' | t }})
// - เลือกภาษาอังกฤษ: ระบบหาคำแปลจากพจนานุกรม i18n/en.ts ถ้าไม่มีคำแปลจะแสดงภาษาไทยเดิม (เว็บไม่พัง)
// - ภาษาที่เลือกจำไว้ในเครื่อง (localStorage) และตั้ง <html lang> ให้ตรง
// - ข้อมูลที่เจ้าหน้าที่กรอกเอง (ชื่อสัตว์ คำอธิบาย) ไม่ถูกแปล
@Injectable({ providedIn: 'root' })
export class I18nService {
  private _lang = signal<Lang>(this.initialLang());
  readonly lang = this._lang.asReadonly();
  readonly isEn = computed(() => this._lang() === 'en');

  constructor() {
    this.apply(this._lang());
  }

  private initialLang(): Lang {
    try {
      const saved = typeof window !== 'undefined' ? window.localStorage.getItem(LANG_KEY) : null;
      if (saved === 'th' || saved === 'en') return saved;
    } catch {
      /* ignore */
    }
    return 'th';
  }

  private apply(lang: Lang): void {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }

  setLang(lang: Lang): void {
    this._lang.set(lang);
    this.apply(lang);
    try {
      window.localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* ignore */
    }
  }

  toggle(): void {
    this.setLang(this._lang() === 'th' ? 'en' : 'th');
  }

  // แปลข้อความไทย -> อังกฤษ (ไม่มีคำแปล = คืนข้อความเดิม) เว้นวรรคหน้า/หลังคงไว้
  t(value: string): string {
    if (this._lang() !== 'en' || !value) return value;
    const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(value);
    if (!m) return value;
    const key = m[2].replace(/\s+/g, ' ');
    const hit = EN[key];
    if (hit !== undefined) return m[1] + hit + m[3];
    // ข้อความจาก Backend ที่มีค่าแทรก (เช่น ชื่อสัตว์ / รหัส)
    for (const [re, en] of BACKEND_PATTERNS) {
      if (re.test(key)) return m[1] + key.replace(re, en) + m[3];
    }
    // ข้อความ error หลายบรรทัดจาก Backend
    if (value.includes('\n')) return this.backend(value);
    return value;
  }

  // ข้อความที่มีค่าแทรก เช่น ชื่อสัตว์ ใช้คู่ไทย/อังกฤษที่เขียนไว้ในโค้ด
  tr(th: string, en: string): string {
    return this._lang() === 'en' ? en : th;
  }

  // แปลข้อความ error จาก Backend ที่พบบ่อย (ข้อความอื่นแสดงตามที่ Backend ส่งมา)
  backend(msg: string): string {
    if (this._lang() !== 'en' || !msg) return msg;
    return msg
      .split('\n')
      .map((line) => {
        const exact = EN[line.trim()];
        if (exact !== undefined) return exact;
        for (const [re, en] of BACKEND_PATTERNS) {
          if (re.test(line)) return line.replace(re, en);
        }
        return line;
      })
      .join('\n');
  }

  get locale(): string {
    return this._lang() === 'en' ? 'en-GB' : 'th-TH';
  }

  // อายุจากจำนวนเดือน เช่น "1 ปี 2 เดือน" / "1 yr 2 mo"
  age(months?: number | null): string {
    if (!months || months <= 0) return this.tr('ไม่ระบุอายุ', 'Age unknown');
    const y = Math.floor(months / 12);
    const m = months % 12;
    const en = this.isEn();
    const yy = y > 0 ? (en ? `${y} yr${y > 1 ? 's' : ''}` : `${y} ปี`) : '';
    const mm = m > 0 ? (en ? `${m} mo` : `${m} เดือน`) : '';
    return [yy, mm].filter(Boolean).join(' ');
  }
}

// รูปแบบข้อความ Backend ที่มีค่าแทรก
const BACKEND_PATTERNS: [RegExp, string][] = [
  [/^ไม่พบข้อมูลสัตว์เลี้ยงรหัส #(\d+)$/, 'Pet #$1 not found'],
  [/^ไม่พบสัตว์เลี้ยงรหัส #(\d+)$/, 'Pet #$1 not found'],
  [/^ไม่พบคำขอรับเลี้ยงรหัส #(\d+)$/, 'Adoption request #$1 not found'],
  [/^"(.+)" ไม่เปิดรับคำขอรับเลี้ยงแล้ว$/, '"$1" is no longer open for adoption'],
  [/^คุณส่งคำขอรับเลี้ยง "(.+)" ไว้แล้ว.*$/, 'You already have a pending request for "$1". Check "My requests".'],
  [/^"(.+)" มีบ้านแล้ว อนุมัติคำขอนี้ไม่ได้$/, '"$1" has already been adopted; this request cannot be approved'],
  [/^สัตว์ 1 ตัวมีรูปได้ไม่เกิน (\d+) รูป \(ตอนนี้มี (\d+) รูป\)$/, 'A pet can have at most $1 photos (currently $2)'],
  [/^ไฟล์ "(.+)" ไม่ใช่รูปภาพ$/, 'File "$1" is not an image'],
];
