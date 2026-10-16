import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { TPipe, TDatePipe } from '../../shared/t.pipe';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../services/i18n.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminNavComponent } from '../admin-nav/admin-nav.component';
import { PetService } from '../../services/pet.service';
import { ActivityLog, LOG_ACTION_TH, Pet } from '../../models/pet.model';
import { AdoptionRequest, REQUEST_STATUS_TH } from '../../models/request.model';
import { matchesPet } from '../../services/pet-search';
import { petCover } from '../../services/pet-image';
import { backendMessage } from '../../services/request.service';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdminNavComponent, TPipe, TDatePipe],
  templateUrl: './admin-page.component.html',
})
export class AdminPageComponent implements OnInit {
  readonly i18n = inject(I18nService);
  pets: Pet[] = [];
  loading = true;
  errorMessage = '';
  selectedFilter: string = 'ALL'; // ALL = ทุกสถานะ (ไม่รวมที่เก็บถาวร), ARCHIVED = เฉพาะที่ลบแล้ว
  searchKeyword = '';
  cover = petCover;

  // หน้าต่างประวัติย้อนหลังของสัตว์ 1 ตัว
  historyPet: Pet | null = null;
  historyRequests: AdoptionRequest[] = [];
  historyLogs: ActivityLog[] = [];
  historyLoading = false;
  historyError = '';
  requestStatusTh = REQUEST_STATUS_TH;
  actionTh = LOG_ACTION_TH;

  constructor(
    private petService: PetService,
    private cdr: ChangeDetectorRef, // 👈 ยาแรง: ตัวบังคับรีเฟรชหน้าจอ
  ) {}

  ngOnInit(): void {
    this.fetchPets();
  }

  fetchPets(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges(); // บังคับโชว์หน้าโหลด

    // โหลดทุกสถานะ รวมตัวที่ลบแล้ว (เก็บถาวร) เพื่อให้ค้นย้อนหลังได้
    this.petService.getAll(undefined, undefined, 'ALL', 'include').subscribe({
      next: (data: any) => {
        this.loading = false;
        
        // 👈 แก้บั๊กรูปแบบข้อมูล (ดักทั้งแบบ Array ปกติ และแบบมี data ครอบ)
        this.pets = Array.isArray(data) ? data : (data?.data || []);
        
        this.cdr.detectChanges(); // 👈 บังคับวาดตารางและอัปเดตตัวเลขทันที!
      },
      error: (err) => {
        console.error('Error fetching pets:', err);
        this.errorMessage = 'เกิดข้อผิดพลาดในการโหลดข้อมูลสัตว์เลี้ยง';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ตัวกรองสัตว์เลี้ยงตามแท็บที่กดเลือก
  get activePets(): Pet[] {
    return this.pets.filter((p) => !p.deletedAt);
  }

  get archivedPets(): Pet[] {
    return this.pets.filter((p) => !!p.deletedAt);
  }

  get filteredPets(): Pet[] {
    let list: Pet[];
    if (this.selectedFilter === 'ARCHIVED') list = this.archivedPets;
    else if (this.selectedFilter === 'ALL') list = this.activePets;
    else list = this.activePets.filter((p) => p.status === this.selectedFilter);
    if (this.searchKeyword.trim()) {
      list = list.filter((p) => matchesPet(p, this.searchKeyword));
    }
    return list;
  }

  setFilter(status: string): void {
    this.selectedFilter = status;
    this.cdr.detectChanges(); // รีเฟรชเมื่อเปลี่ยนแท็บ
  }

  // คำนวณจำนวนสัตว์เลี้ยงตามสถานะ
  getCountByStatus(status: string): number {
    return this.activePets.filter((p) => p.status === status).length;
  }

  getGenderThai(gender: string): string {
    if (gender === 'MALE') return 'ผู้';
    if (gender === 'FEMALE') return 'เมีย';
    return 'ไม่ระบุ';
  }

  getStatusThai(status: string): string {
    switch (status) {
      case 'AVAILABLE': return 'พร้อมรับเลี้ยง';
      case 'PENDING': return 'กำลังรอพิจารณา';
      case 'ADOPTED': return 'มีบ้านแล้ว';
      case 'UNAVAILABLE': return 'ไม่พร้อมรับเลี้ยง';
      default: return status;
    }
  }

  // ลบ = ย้ายไปเก็บถาวร: หายจากหน้าเว็บ แต่ข้อมูล คำขอ และประวัติยังอยู่ กู้คืนได้
  onDelete(id: number, name: string): void {
    if (confirm(this.i18n.tr(`ลบ "${name}" ออกจากหน้าเว็บใช่หรือไม่?\n(ข้อมูลจะย้ายไปแท็บ "เก็บถาวร" ยังค้นหาและกู้คืนได้)`, `Remove "${name}" from the website?\n(It moves to the "Archived" tab and can still be searched and restored)`))) {
      this.petService.delete(id).subscribe({
        next: () => this.fetchPets(),
        error: (err) => alert(this.i18n.t(backendMessage(err, 'ไม่สามารถลบข้อมูลได้'))),
      });
    }
  }

  onRestore(pet: Pet): void {
    if (!confirm(this.i18n.tr(`กู้คืน "${pet.name}" กลับมาแสดงในระบบใช่หรือไม่?`, `Restore "${pet.name}"?`))) return;
    this.petService.restore(pet.id).subscribe({
      next: () => this.fetchPets(),
      error: (err) => alert(this.i18n.t(backendMessage(err, 'กู้คืนไม่สำเร็จ'))),
    });
  }

  openHistory(pet: Pet): void {
    this.historyPet = pet;
    this.historyLoading = true;
    this.historyError = '';
    this.historyRequests = [];
    this.historyLogs = [];
    this.petService.history(pet.id).subscribe({
      next: (res) => {
        this.historyRequests = res.requests || [];
        this.historyLogs = res.logs || [];
        this.historyLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.historyError = backendMessage(err, 'โหลดประวัติไม่สำเร็จ');
        this.historyLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  closeHistory(): void {
    this.historyPet = null;
  }
}