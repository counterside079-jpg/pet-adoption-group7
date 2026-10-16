import { ChangeDetectorRef, Component } from '@angular/core';
import { TPipe } from '../../shared/t.pipe';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { backendMessage } from '../../services/request.service';

// สมัครสมาชิก (บัญชีใหม่เป็นผู้ใช้ทั่วไปเสมอ บัญชีเจ้าหน้าที่ต้องให้เจ้าหน้าที่เพิ่มให้)
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TPipe],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  fullName = '';
  email = '';
  phone = '';
  password = '';
  confirm = '';
  errorMessage = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  get returnUrl(): string | null {
    const r = this.route.snapshot.queryParamMap.get('returnUrl');
    return r && r.startsWith('/') && !r.startsWith('//') && !r.startsWith('/admin') ? r : null;
  }

  validate(): string {
    if (!this.fullName.trim()) return 'กรุณากรอกชื่อ-นามสกุล';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())) return 'รูปแบบอีเมลไม่ถูกต้อง';
    if (this.phone.trim() && !/^[0-9]{9,15}$/.test(this.phone.trim())) return 'เบอร์โทรต้องเป็นตัวเลข 9-15 หลัก';
    if (this.password.length < 6) return 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    if (this.password !== this.confirm) return 'ยืนยันรหัสผ่านไม่ตรงกัน';
    return '';
  }

  onSubmit(): void {
    this.errorMessage = this.validate();
    if (this.errorMessage) return;
    this.loading = true;
    this.auth
      .register({
        fullName: this.fullName.trim(),
        email: this.email.trim(),
        password: this.password,
        phone: this.phone.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.cdr.markForCheck(); // สั่งให้หน้าจออัปเดตหลังได้ผลจาก Backend
          this.router.navigateByUrl(this.returnUrl || '/');
        },
        error: (err) => {
          this.loading = false;
          this.cdr.markForCheck(); // สั่งให้หน้าจออัปเดตหลังได้ผลจาก Backend
          this.errorMessage = backendMessage(err, 'สมัครสมาชิกไม่สำเร็จ');
        },
      });
  }
}
