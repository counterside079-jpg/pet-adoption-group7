import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { TPipe, TDatePipe } from '../../shared/t.pipe';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../services/i18n.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { petCover } from '../../services/pet-image';
import { AdminNavComponent } from '../admin-nav/admin-nav.component';
import { RequestService, backendMessage } from '../../services/request.service';
import { AdoptionRequest, AdoptionRequestStatus, REQUEST_STATUS_TH } from '../../models/request.model';

@Component({
  selector: 'app-admin-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdminNavComponent, TPipe, TDatePipe],
  templateUrl: './admin-requests.component.html',
})
export class AdminRequestsComponent implements OnInit {
  readonly i18n = inject(I18nService);
  requests: AdoptionRequest[] = [];
  loading = true;
  errorMessage = '';
  selectedFilter: 'ALL' | AdoptionRequestStatus = 'PENDING';
  expandedId: number | null = null;
  busyId: number | null = null;
  q = '';
  cover = petCover;

  statusTh = REQUEST_STATUS_TH;
  filters: ('ALL' | AdoptionRequestStatus)[] = ['PENDING', 'APPROVED', 'REJECTED', 'ALL'];

  constructor(private requestService: RequestService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';
    this.requestService.getAdoptions('ALL').subscribe({
      next: (data) => {
        this.requests = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = backendMessage(err, 'โหลดคำขอรับเลี้ยงไม่สำเร็จ');
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // กรองตามแท็บสถานะ + ค้นจากชื่อผู้ขอ อีเมล เบอร์โทร ชื่อสัตว์ หรือรหัสคำขอ
  get filtered(): AdoptionRequest[] {
    let list = this.selectedFilter === 'ALL' ? this.requests : this.requests.filter((r) => r.status === this.selectedFilter);
    const terms = this.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length) {
      list = list.filter((r) => {
        const text = [r.id, '#' + r.id, r.firstName, r.lastName, r.email, r.phone, r.pet?.name, r.pet?.petType?.name, r.user?.email]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return terms.every((t) => text.includes(t));
      });
    }
    return list;
  }

  count(status: 'ALL' | AdoptionRequestStatus): number {
    return status === 'ALL' ? this.requests.length : this.requests.filter((r) => r.status === status).length;
  }

  filterLabel(f: 'ALL' | AdoptionRequestStatus): string {
    return f === 'ALL' ? 'ทั้งหมด' : this.statusTh[f];
  }

  statusColor(status: AdoptionRequestStatus): string {
    return status === 'APPROVED' ? 'var(--fg-15803d)' : status === 'REJECTED' ? 'var(--fg-b91c1c)' : 'var(--fg-a16207)';
  }

  statusBg(status: AdoptionRequestStatus): string {
    return status === 'APPROVED' ? 'var(--bg-dcfce7)' : status === 'REJECTED' ? 'var(--bg-fee2e2)' : 'var(--bg-fef9c3)';
  }

  toggle(id: number): void {
    this.expandedId = this.expandedId === id ? null : id;
  }

  setStatus(r: AdoptionRequest, status: AdoptionRequestStatus): void {
    const tr = (th: string, en: string) => this.i18n.tr(th, en);
    const petName = r.pet?.name || tr('สัตว์เลี้ยง', 'this pet');
    const who = `${r.firstName} ${r.lastName}`;
    const text =
      status === 'APPROVED'
        ? tr(`อนุมัติคำขอของ ${who}?\n"${petName}" จะเปลี่ยนเป็น "มีบ้านแล้ว" และคำขออื่นของตัวนี้ที่รอพิจารณาจะถูกปฏิเสธอัตโนมัติ`,
             `Approve ${who}'s request?\n"${petName}" will be marked "Adopted" and other pending requests for this pet will be rejected automatically.`)
        : status === 'REJECTED'
          ? tr(`ไม่อนุมัติคำขอของ ${who}?`, `Reject ${who}'s request?`)
          : tr(`ย้ายคำขอนี้กลับไปเป็น "รอพิจารณา"?`, `Move this request back to "Pending"?`);
    const undo = r.status === 'APPROVED' && status !== 'APPROVED'
      ? tr(`\n\nคำขอนี้เคยอนุมัติแล้ว: "${petName}" จะกลับเป็น "พร้อมรับเลี้ยง"`,
           `\n\nThis request was approved: "${petName}" will become "Available" again.`)
      : '';
    if (!confirm(text + undo)) return;

    this.busyId = r.id;
    this.requestService.updateAdoptionStatus(r.id, status).subscribe({
      next: () => {
        this.busyId = null;
        this.load(); // โหลดใหม่ เพราะการอนุมัติอาจเปลี่ยนคำขออื่นด้วย
      },
      error: (err) => {
        this.busyId = null;
        alert(this.i18n.t(backendMessage(err, 'เปลี่ยนสถานะไม่สำเร็จ')));
        this.cdr.detectChanges();
      },
    });
  }

  remove(r: AdoptionRequest): void {
    if (!confirm(this.i18n.tr(`ลบคำขอของ ${r.firstName} ${r.lastName} ถาวร?`, `Permanently delete ${r.firstName} ${r.lastName}'s request?`))) return;
    this.requestService.deleteAdoption(r.id).subscribe({
      next: () => {
        this.requests = this.requests.filter((x) => x.id !== r.id);
        this.cdr.detectChanges();
      },
      error: (err) => alert(this.i18n.t(backendMessage(err, 'ลบคำขอไม่สำเร็จ'))),
    });
  }
}
