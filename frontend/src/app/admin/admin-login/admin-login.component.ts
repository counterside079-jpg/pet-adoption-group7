import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminAuthService } from '../admin-auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-login.component.html',
})
export class AdminLoginComponent {
  password = '';
  errorMessage = '';

  constructor(
    private auth: AdminAuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  onSubmit(): void {
    if (!this.password.trim()) {
      this.errorMessage = 'กรุณากรอกรหัสผ่าน';
      return;
    }

    if (this.auth.login(this.password)) {
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      // รับเฉพาะ path ภายในเว็บที่ขึ้นต้นด้วย /admin กันการพาไปที่อื่น
      const target = returnUrl && returnUrl.startsWith('/admin') ? returnUrl : '/admin';
      this.router.navigateByUrl(target);
    } else {
      this.errorMessage = 'รหัสผ่านไม่ถูกต้อง';
      this.password = '';
    }
  }
}
