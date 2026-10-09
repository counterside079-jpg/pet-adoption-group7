import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminNavComponent } from '../admin-nav/admin-nav.component';
import { RequestService, backendMessage } from '../../services/request.service';
import {
  DONATION_METHOD_TH,
  DONATION_STATUS_TH,
  Donation,
  DonationStatus,
} from '../../models/request.model';

@Component({
  selector: 'app-admin-donations',
  standalone: true,
  imports: [CommonModule, AdminNavComponent],
  templateUrl: './admin-donations.component.html',
})
export class AdminDonationsComponent implements OnInit {
  donations: Donation[] = [];
  loading = true;
  errorMessage = '';
  selectedFilter: 'ALL' | DonationStatus = 'ALL';

  statusTh = DONATION_STATUS_TH;
  methodTh = DONATION_METHOD_TH;
  filters: ('ALL' | DonationStatus)[] = ['ALL', 'PENDING', 'RECEIVED', 'CANCELLED'];

  constructor(private requestService: RequestService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';
    this.requestService.getDonations('ALL').subscribe({
      next: (data) => {
        this.donations = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = backendMessage(err, 'โหลดรายการบริจาคไม่สำเร็จ');
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get filtered(): Donation[] {
    if (this.selectedFilter === 'ALL') return this.donations;
    return this.donations.filter((d) => d.status === this.selectedFilter);
  }

  count(status: 'ALL' | DonationStatus): number {
    return status === 'ALL' ? this.donations.length : this.donations.filter((d) => d.status === status).length;
  }

  total(status: DonationStatus): number {
    return this.donations.filter((d) => d.status === status).reduce((sum, d) => sum + d.amount, 0);
  }

  filterLabel(f: 'ALL' | DonationStatus): string {
    return f === 'ALL' ? 'ทั้งหมด' : this.statusTh[f];
  }

  statusColor(s: DonationStatus): string {
    return s === 'RECEIVED' ? '#15803d' : s === 'CANCELLED' ? '#64748b' : '#a16207';
  }

  statusBg(s: DonationStatus): string {
    return s === 'RECEIVED' ? '#dcfce7' : s === 'CANCELLED' ? '#f1f5f9' : '#fef9c3';
  }

  setStatus(d: Donation, status: DonationStatus): void {
    this.requestService.updateDonationStatus(d.id, status).subscribe({
      next: (updated) => {
        this.donations = this.donations.map((x) => (x.id === updated.id ? updated : x));
        this.cdr.detectChanges();
      },
      error: (err) => alert(backendMessage(err, 'เปลี่ยนสถานะไม่สำเร็จ')),
    });
  }

  remove(d: Donation): void {
    if (!confirm(`ลบรายการบริจาคของ ${d.donorName} (${d.amount.toLocaleString()} บาท) ถาวร?`)) return;
    this.requestService.deleteDonation(d.id).subscribe({
      next: () => {
        this.donations = this.donations.filter((x) => x.id !== d.id);
        this.cdr.detectChanges();
      },
      error: (err) => alert(backendMessage(err, 'ลบรายการไม่สำเร็จ')),
    });
  }
}
