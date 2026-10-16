import { Component, OnInit } from '@angular/core';
import { TPipe } from './shared/t.pipe';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './services/auth.service';
import { I18nService } from './services/i18n.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  title = 'frontend';

  constructor(
    public auth: AuthService,
    public i18n: I18nService,
    public theme: ThemeService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // ตรวจ token กับ Backend ทุกครั้งที่เปิดเว็บ (หมดอายุ -> ออกจากระบบให้อัตโนมัติ)
    this.auth.refreshMe();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
