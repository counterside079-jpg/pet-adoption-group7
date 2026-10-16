import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from '../services/i18n.service';

// {{ 'ข้อความไทย' | t }} -> แสดงตามภาษาที่เลือก
// pure: false เพื่อให้เปลี่ยนภาษาแล้วหน้าจอเปลี่ยนตามทันที
@Pipe({ name: 't', standalone: true, pure: false })
export class TPipe implements PipeTransform {
  private i18n = inject(I18nService);

  transform<T>(value: T): T | string {
    return typeof value === 'string' ? this.i18n.t(value) : value;
  }
}

// {{ date | tdate: 'd MMM y HH:mm' }} -> วันที่ตามภาษา (ไทยแสดงเป็น พ.ศ., อังกฤษแสดงเป็น ค.ศ.)
@Pipe({ name: 'tdate', standalone: true, pure: false })
export class TDatePipe implements PipeTransform {
  private i18n = inject(I18nService);
  private cache = new Map<string, Intl.DateTimeFormat>();

  transform(value: string | number | Date | null | undefined, format = 'd MMM y'): string {
    if (value === null || value === undefined || value === '') return '';
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return '';
    const locale = this.i18n.locale;
    const key = locale + '|' + format;
    let fmt = this.cache.get(key);
    if (!fmt) {
      const o: Intl.DateTimeFormatOptions = {};
      if (/d/.test(format)) o.day = 'numeric';
      if (/MMMM/.test(format)) o.month = 'long';
      else if (/MMM/.test(format)) o.month = 'short';
      else if (/M/.test(format)) o.month = '2-digit';
      if (/y/.test(format)) o.year = 'numeric';
      if (/H/.test(format)) {
        o.hour = '2-digit';
        o.hour12 = false;
      }
      if (/m/.test(format)) o.minute = '2-digit';
      if (/s/.test(format)) o.second = '2-digit';
      fmt = new Intl.DateTimeFormat(locale, o);
      this.cache.set(key, fmt);
    }
    return fmt.format(d);
  }
}
