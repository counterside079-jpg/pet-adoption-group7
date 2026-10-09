import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminNavComponent } from '../admin-nav/admin-nav.component';
import { RequestService, backendMessage } from '../../services/request.service';
import { AdoptionRequest, AdoptionRequestStatus, REQUEST_STATUS_TH } from '../../models/request.model';

@Component({
  selector: 'app-admin-requests',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminNavComponent],
  templateUrl: './admin-requests.component.html',
})
export class AdminRequestsComponent implements OnInit {
  requests: AdoptionRequest[] = [];
  loading = true;
  errorMessage = '';
  selectedFilter: 'ALL' | AdoptionRequestStatus = 'PENDING';
  expandedId: number | null = null;
  busyId: number | null = null;

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

  get filtered(): AdoptionRequest[] {
    if (this.selectedFilter === 'ALL') return this.requests;
    return this.requests.filter((r) => r.status === this.selectedFilter);
  }

  count(status: 'ALL' | AdoptionRequestStatus): number {
    return status === 'ALL' ? this.requests.length : this.requests.filter((r) => r.status === status).length;
  }

  filterLabel(f: 'ALL' | AdoptionRequestStatus): string {
    return f === 'ALL' ? 'ทั้งหมด' : this.statusTh[f];
  }

  statusColor(status: AdoptionRequestStatus): string {
    return status === 'APPROVED' ? '#15803d' : status === 'REJECTED' ? '#b91c1c' : '#a16207';
  }

  statusBg(status: AdoptionRequestStatus): string {
    return status === 'APPROVED' ? '#dcfce7' : status === 'REJECTED' ? '#fee2e2' : '#fef9c3';
  }

  toggle(id: number): void {
    this.expandedId = this.expandedId === id ? null : id;
  }

  setStatus(r: AdoptionRequest, status: AdoptionRequestStatus): void {
    const petName = r.pet?.name || 'สัตว์เลี้ยง';
    const text =
      status === 'APPROVED'
        ? `อนุมัติคำขอของ ${r.firstName} ${r.lastName}?\n"${petName}" จะเปลี่ยนเป็น "มีบ้านแล้ว" และคำขออื่นของตัวนี้ที่รอพิจารณาจะถูกปฏิเสธอัตโนมัติ`
        : status === 'REJECTED'
          ? `ไม่อนุมัติคำขอของ ${r.firstName} ${r.lastName}?`
          : `ย้ายคำขอนี้กลับไปเป็น "รอพิจารณา"?`;
    if (!confirm(text)) return;

    this.busyId = r.id;
    this.requestService.updateAdoptionStatus(r.id, status).subscribe({
      next: () => {
        this.busyId = null;
        this.load(); // โหลดใหม่ เพราะการอนุมัติอาจเปลี่ยนคำขออื่นด้วย
      },
      error: (err) => {
        this.busyId = null;
        alert(backendMessage(err, 'เปลี่ยนสถานะไม่สำเร็จ'));
        this.cdr.detectChanges();
      },
    });
  }

  remove(r: AdoptionRequest): void {
    if (!confirm(`ลบคำขอของ ${r.firstName} ${r.lastName} ถาวร?`)) return;
    this.requestService.deleteAdoption(r.id).subscribe({
      next: () => {
        this.requests = this.requests.filter((x) => x.id !== r.id);
        this.cdr.detectChanges();
      },
      error: (err) => alert(backendMessage(err, 'ลบคำขอไม่สำเร็จ')),
    });
  }
}
