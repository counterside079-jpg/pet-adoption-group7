import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { TPipe } from '../../shared/t.pipe';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../services/i18n.service';
import { FormsModule } from '@angular/forms';
import { AdminNavComponent } from '../admin-nav/admin-nav.component';
import { AuthService, AuthUser } from '../../services/auth.service';
import { backendMessage } from '../../services/request.service';

// บัญชีเจ้าหน้าที่: แต่ละคนมีบัญชีของตัวเอง ไม่ใช้รหัสผ่านร่วมกัน
@Component({
  selector: 'app-admin-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavComponent, TPipe],
  templateUrl: './admin-accounts.component.html',
})
export class AdminAccountsComponent implements OnInit {
  readonly i18n = inject(I18nService);
  admins: AuthUser[] = [];
  loading = true;
  errorMessage = '';
  saving = false;
  formError = '';
  formOk = '';

  form = { fullName: '', email: '', phone: '', password: '' };

  constructor(public auth: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.auth.listAdmins().subscribe({
      next: (data) => {
        this.admins = data;
        this.loading = false;
        this.cdr.markForCheck(); // สั่งให้หน้าจออัปเดตหลังได้ผลจาก Backend
      },
      error: (err) => {
        this.errorMessage = backendMessage(err, 'โหลดรายชื่อเจ้าหน้าที่ไม่สำเร็จ');
        this.loading = false;
        this.cdr.markForCheck(); // สั่งให้หน้าจออัปเดตหลังได้ผลจาก Backend
      },
    });
  }

  add(): void {
    this.formError = '';
    this.formOk = '';
    const f = this.form;
    if (!f.fullName.trim() || !f.email.trim()) {
      this.formError = 'กรุณากรอกชื่อและอีเมล';
      return;
    }
    if (f.password.length < 6) {
      this.formError = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
      return;
    }
    this.saving = true;
    this.auth
      .addAdmin({
        fullName: f.fullName.trim(),
        email: f.email.trim(),
        password: f.password,
        phone: f.phone.trim() || undefined,
      })
      .subscribe({
        next: (u) => {
          this.saving = false;
          this.cdr.markForCheck(); // สั่งให้หน้าจออัปเดตหลังได้ผลจาก Backend
          this.formOk = this.i18n.tr(`เพิ่ม ${u.fullName} เป็นเจ้าหน้าที่แล้ว`, `${u.fullName} is now a staff member`);
          this.form = { fullName: '', email: '', phone: '', password: '' };
          this.load();
        },
        error: (err) => {
          this.saving = false;
          this.cdr.markForCheck(); // สั่งให้หน้าจออัปเดตหลังได้ผลจาก Backend
          this.formError = backendMessage(err, 'เพิ่มเจ้าหน้าที่ไม่สำเร็จ');
        },
      });
  }

  remove(u: AuthUser): void {
    if (!confirm(this.i18n.tr(`ถอนสิทธิ์เจ้าหน้าที่ของ ${u.fullName} ใช่หรือไม่?\n(บัญชียังอยู่ แต่จะกลายเป็นผู้ใช้ทั่วไป)`, `Remove staff access from ${u.fullName}?\n(The account stays, as a regular member)`))) return;
    this.auth.removeAdmin(u.id).subscribe({
      next: () => this.load(),
      error: (err) => alert(this.i18n.t(backendMessage(err, 'ถอนสิทธิ์ไม่สำเร็จ'))),
    });
  }
}
