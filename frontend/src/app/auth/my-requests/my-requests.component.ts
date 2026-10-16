import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TPipe, TDatePipe } from '../../shared/t.pipe';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RequestService, backendMessage } from '../../services/request.service';
import { AuthService } from '../../services/auth.service';
import { AdoptionRequest, REQUEST_STATUS_TH } from '../../models/request.model';
import { petCover } from '../../services/pet-image';

// หน้า "คำขอของฉัน": ผู้ใช้ติดตามได้ว่าคำขอรับเลี้ยงอยู่สถานะไหน (รอพิจารณา / อนุมัติ / ไม่อนุมัติ)
@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, RouterLink, TPipe, TDatePipe],
  templateUrl: './my-requests.component.html',
})
export class MyRequestsComponent implements OnInit {
  requests: AdoptionRequest[] = [];
  loading = true;
  errorMessage = '';
  statusTh = REQUEST_STATUS_TH;
  cover = petCover;

  constructor(private service: RequestService, public auth: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';
    this.service.getMyAdoptions().subscribe({
      next: (data) => {
        this.requests = data;
        this.loading = false;
        this.cdr.markForCheck(); // สั่งให้หน้าจออัปเดตหลังได้ผลจาก Backend
      },
      error: (err) => {
        this.loading = false;
        this.cdr.markForCheck(); // สั่งให้หน้าจออัปเดตหลังได้ผลจาก Backend
        this.errorMessage = backendMessage(err, 'โหลดคำขอไม่สำเร็จ');
      },
    });
  }

  count(status: string): number {
    return this.requests.filter((r) => r.status === status).length;
  }

  badge(status: string): { bg: string; color: string; icon: string } {
    if (status === 'APPROVED') return { bg: 'var(--bg-dcfce7)', color: 'var(--fg-15803d)', icon: '✅' };
    if (status === 'REJECTED') return { bg: 'var(--bg-fee2e2)', color: 'var(--fg-b91c1c)', icon: '❌' };
    return { bg: 'var(--bg-fef3c7)', color: 'var(--fg-b45309)', icon: '⏳' };
  }

  hint(status: string): string {
    if (status === 'APPROVED') return 'ยินดีด้วย! เจ้าหน้าที่จะติดต่อกลับทางอีเมล/โทรศัพท์เพื่อนัดรับน้อง';
    if (status === 'REJECTED') return 'คำขอนี้ไม่ผ่านการพิจารณา คุณยังส่งคำขอรับเลี้ยงน้องตัวอื่นได้';
    return 'เจ้าหน้าที่กำลังพิจารณาคำขอของคุณ โดยปกติใช้เวลา 3-7 วันทำการ';
  }
}
