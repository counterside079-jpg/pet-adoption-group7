import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TPipe, TDatePipe } from '../../shared/t.pipe';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdminNavComponent } from '../admin-nav/admin-nav.component';
import { PetService } from '../../services/pet.service';
import { backendMessage } from '../../services/request.service';
import { ActivityLog, LOG_ACTION_TH, LOG_TARGET_TH } from '../../models/pet.model';

// ประวัติการทำงาน (Audit Log): ใครเพิ่ม/แก้ไข/ลบ/อนุมัติอะไร เมื่อไร ตรวจสอบย้อนหลังได้
@Component({
  selector: 'app-admin-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavComponent, TPipe, TDatePipe],
  templateUrl: './admin-logs.component.html',
})
export class AdminLogsComponent implements OnInit {
  logs: ActivityLog[] = [];
  loading = true;
  errorMessage = '';

  targetType = '';
  targetId = '';
  q = '';

  actionTh = LOG_ACTION_TH;
  targetTh = LOG_TARGET_TH;
  targetTypes = Object.keys(LOG_TARGET_TH);

  constructor(private petService: PetService, private route: ActivatedRoute, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const p = this.route.snapshot.queryParamMap;
    this.targetType = p.get('targetType') || '';
    this.targetId = p.get('targetId') || '';
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';
    this.petService
      .getLogs({ targetType: this.targetType, targetId: this.targetId, q: this.q })
      .subscribe({
        next: (data) => {
          this.logs = data;
          this.loading = false;
          this.cdr.markForCheck(); // สั่งให้หน้าจออัปเดตหลังได้ผลจาก Backend
        },
        error: (err) => {
          this.errorMessage = backendMessage(err, 'โหลดประวัติการทำงานไม่สำเร็จ');
          this.loading = false;
          this.cdr.markForCheck(); // สั่งให้หน้าจออัปเดตหลังได้ผลจาก Backend
        },
      });
  }

  clear(): void {
    this.targetType = '';
    this.targetId = '';
    this.q = '';
    this.load();
  }

  color(action: string): string {
    switch (action) {
      case 'CREATE': return 'var(--fg-15803d)';
      case 'DELETE': case 'DELETE_IMAGE': return 'var(--fg-b91c1c)';
      case 'RESTORE': return 'var(--fg-1d4ed8)';
      case 'STATUS': return 'var(--fg-b45309)';
      default: return 'var(--fg-475569)';
    }
  }
}
