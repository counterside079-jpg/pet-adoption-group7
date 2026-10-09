import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AdminAuthService } from '../admin-auth.service';
import { AdminNavComponent } from '../admin-nav/admin-nav.component';
import { PetService } from '../../services/pet.service';
import { Pet } from '../../models/pet.model';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminNavComponent],
  templateUrl: './admin-page.component.html',
})
export class AdminPageComponent implements OnInit {
  pets: Pet[] = [];
  loading = true;
  errorMessage = '';
  selectedFilter: string = 'ALL';

  constructor(
    private petService: PetService,
    private cdr: ChangeDetectorRef, // 👈 ยาแรง: ตัวบังคับรีเฟรชหน้าจอ
    private auth: AdminAuthService,
    private router: Router,
  ) {}

  // ออกจากระบบเจ้าหน้าที่ แล้วกลับหน้าหลัก
  onLogout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }

  ngOnInit(): void {
    this.fetchPets();
  }

  fetchPets(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges(); // บังคับโชว์หน้าโหลด

    this.petService.getAll(undefined, undefined, 'ALL').subscribe({
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
  get filteredPets(): Pet[] {
    if (this.selectedFilter === 'ALL') {
      return this.pets;
    }
    return this.pets.filter((p) => p.status === this.selectedFilter);
  }

  setFilter(status: string): void {
    this.selectedFilter = status;
    this.cdr.detectChanges(); // รีเฟรชเมื่อเปลี่ยนแท็บ
  }

  // คำนวณจำนวนสัตว์เลี้ยงตามสถานะ
  getCountByStatus(status: string): number {
    return this.pets.filter((p) => p.status === status).length;
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

  onDelete(id: number, name: string): void {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูล "${name}"?`)) {
      this.petService.delete(id).subscribe({
        next: () => {
          this.fetchPets(); // โหลดข้อมูลใหม่หลังจากลบ
        },
        error: (err) => {
          console.error('Delete error:', err);
          alert('ไม่สามารถลบข้อมูลได้');
        },
      });
    }
  }
}