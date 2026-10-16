import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TPipe } from '../../shared/t.pipe';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { backendMessage } from '../../services/request.service';

// หน้าเข้าสู่ระบบเดียว ใช้ทั้งผู้ใช้ทั่วไปและเจ้าหน้าที่ (ระบบดูสิทธิ์จากบัญชีเอง)
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TPipe],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  errorMessage = '';
  info = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap;
    if (q.get('expired')) this.info = 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง';
    else if (q.get('returnUrl')?.includes('/adopt')) this.info = 'กรุณาเข้าสู่ระบบหรือสมัครสมาชิกก่อนส่งคำขอรับเลี้ยง';
    else if (q.get('returnUrl')?.startsWith('/admin')) this.info = 'หน้านี้สำหรับเจ้าหน้าที่ กรุณาเข้าสู่ระบบด้วยบัญชีเจ้าหน้าที่';
  }

  get returnUrl(): string | null {
    const r = this.route.snapshot.queryParamMap.get('returnUrl');
    // รับเฉพาะ path ภายในเว็บ กันการพาไปเว็บอื่น
    return r && r.startsWith('/') && !r.startsWith('//') ? r : null;
  }

  onSubmit(): void {
    if (!this.email.trim() || !this.password) {
      this.errorMessage = 'กรุณากรอกอีเมลและรหัสผ่าน';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.auth.login(this.email.trim(), this.password).subscribe({
      next: (res) => {
        this.loading = false;
        this.cdr.markForCheck(); // สั่งให้หน้าจออัปเดตหลังได้ผลจาก Backend
        const fallback = res.user.role === 'ADMIN' ? '/admin' : '/';
        let target = this.returnUrl || fallback;
        if (target.startsWith('/admin') && res.user.role !== 'ADMIN') target = '/';
        this.router.navigateByUrl(target);
      },
      error: (err) => {
        this.loading = false;
        this.cdr.markForCheck(); // สั่งให้หน้าจออัปเดตหลังได้ผลจาก Backend
        this.password = '';
        this.errorMessage = backendMessage(err, 'เข้าสู่ระบบไม่สำเร็จ');
      },
    });
  }
}
