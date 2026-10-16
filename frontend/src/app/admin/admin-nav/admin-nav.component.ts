import { Component, Input } from '@angular/core';
import { TPipe } from '../../shared/t.pipe';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// แถบเมนูหน้าเจ้าหน้าที่ ใช้ร่วมกันทุกหน้าในส่วน Admin
// แสดงชื่อเจ้าหน้าที่ที่เข้าสู่ระบบอยู่ (ทุกการเพิ่ม/แก้/ลบ/อนุมัติ ถูกบันทึกในชื่อบัญชีนี้)
@Component({
  selector: 'app-admin-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, TPipe],
  template: `
    <div style="background: var(--bg-ffffff); border-bottom: 1px solid var(--bd-e2e8f0);">
      <div class="admin-bar" style="max-width: 1200px; margin: 0 auto; padding: 10px 16px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: space-between;">
        <div class="admin-tabs" style="display: flex; flex-wrap: wrap; gap: 6px;">
          <a *ngFor="let t of tabs" [routerLink]="t.link"
            [style.background]="active === t.key ? '#15803d' : 'var(--bg-f8fafc)'"
            [style.color]="active === t.key ? '#ffffff' : 'var(--fg-334155)'"
            style="padding: 8px 14px; border-radius: 999px; border: 1px solid var(--bd-e2e8f0); font-size: 14px; font-weight: 700; text-decoration: none; white-space: nowrap;">
            {{ (t.label) | t }}
          </a>
        </div>
        <span class="hide-mobile" style="font-size: 13px; color: var(--fg-475569); white-space: nowrap;">👮 {{ 'กำลังใช้งานในชื่อ' | t }} <b>{{ auth.user()?.fullName }}</b></span>
      </div>
    </div>
  `,
})
export class AdminNavComponent {
  @Input() active: 'pets' | 'requests' | 'donations' | 'logs' | 'accounts' = 'pets';

  tabs = [
    { key: 'pets', label: '🐾 สัตว์เลี้ยง', link: '/admin' },
    { key: 'requests', label: '📋 คำขอรับเลี้ยง', link: '/admin/requests' },
    { key: 'donations', label: '💛 การบริจาค', link: '/admin/donations' },
    { key: 'logs', label: '🕘 ประวัติการทำงาน', link: '/admin/logs' },
    { key: 'accounts', label: '👮 บัญชีเจ้าหน้าที่', link: '/admin/accounts' },
  ];

  // ปุ่มออกจากระบบอยู่ที่แถบเมนูหลักด้านบนแล้ว (ไม่ซ้ำกัน)
  constructor(public auth: AuthService) {}
}
