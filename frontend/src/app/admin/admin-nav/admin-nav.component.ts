import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AdminAuthService } from '../admin-auth.service';

// แถบเมนูหน้าเจ้าหน้าที่ ใช้ร่วมกัน 3 หน้า: สัตว์เลี้ยง / คำขอรับเลี้ยง / การบริจาค
@Component({
  selector: 'app-admin-nav',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="background: #ffffff; border-bottom: 1px solid #e2e8f0;">
      <div class="admin-bar" style="max-width: 1200px; margin: 0 auto; padding: 10px 16px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: space-between;">
        <div class="admin-tabs" style="display: flex; flex-wrap: wrap; gap: 6px;">
          <a *ngFor="let t of tabs" [routerLink]="t.link"
            [style.background]="active === t.key ? '#15803d' : '#f8fafc'"
            [style.color]="active === t.key ? '#ffffff' : '#334155'"
            style="padding: 8px 14px; border-radius: 999px; border: 1px solid #e2e8f0; font-size: 14px; font-weight: 700; text-decoration: none; white-space: nowrap;">
            {{ t.label }}
          </a>
        </div>
        <button type="button" (click)="logout()"
          style="font-size: 14px; font-weight: 600; color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; padding: 8px 14px; border-radius: 999px; cursor: pointer; font-family: inherit; white-space: nowrap;">
          🔓 <span class="logout-text">ออกจากระบบ</span>
        </button>
      </div>
    </div>
  `,
})
export class AdminNavComponent {
  @Input() active: 'pets' | 'requests' | 'donations' = 'pets';

  tabs = [
    { key: 'pets', label: '🐾 สัตว์เลี้ยง', link: '/admin' },
    { key: 'requests', label: '📋 คำขอรับเลี้ยง', link: '/admin/requests' },
    { key: 'donations', label: '💛 การบริจาค', link: '/admin/donations' },
  ];

  constructor(private auth: AdminAuthService, private router: Router) {}

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
