import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { TPipe, TDatePipe } from '../../shared/t.pipe';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../services/i18n.service';
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
  imports: [CommonModule, AdminNavComponent, TPipe, TDatePipe],
  templateUrl: './admin-donations.component.html',
})
export class AdminDonationsComponent implements OnInit {
  readonly i18n = inject(I18nService);
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
    return s === 'RECEIVED' ? 'var(--fg-15803d)' : s === 'CANCELLED' ? 'var(--fg-64748b)' : 'var(--fg-a16207)';
  }

  statusBg(s: DonationStatus): string {
    return s === 'RECEIVED' ? 'var(--bg-dcfce7)' : s === 'CANCELLED' ? 'var(--bg-f1f5f9)' : 'var(--bg-fef9c3)';
  }

  setStatus(d: Donation, status: DonationStatus): void {
    this.requestService.updateDonationStatus(d.id, status).subscribe({
      next: (updated) => {
        this.donations = this.donations.map((x) => (x.id === updated.id ? updated : x));
        this.cdr.detectChanges();
      },
      error: (err) => alert(this.i18n.t(backendMessage(err, 'เปลี่ยนสถานะไม่สำเร็จ'))),
    });
  }

  remove(d: Donation): void {
    if (!confirm(this.i18n.tr(`ลบรายการบริจาคของ ${d.donorName} (${d.amount.toLocaleString()} บาท) ถาวร?`, `Permanently delete the donation from ${d.donorName} (${d.amount.toLocaleString()} THB)?`))) return;
    this.requestService.deleteDonation(d.id).subscribe({
      next: () => {
        this.donations = this.donations.filter((x) => x.id !== d.id);
        this.cdr.detectChanges();
      },
      error: (err) => alert(this.i18n.t(backendMessage(err, 'ลบรายการไม่สำเร็จ'))),
    });
  }
}
