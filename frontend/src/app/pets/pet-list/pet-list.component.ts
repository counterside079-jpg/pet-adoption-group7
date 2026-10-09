import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PetService } from '../../services/pet.service';
import { Pet } from '../../models/pet.model';

@Component({
  selector: 'app-pet-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './pet-list.component.html',
})
export class PetListComponent implements OnInit {
  allPets: Pet[] = [];
  filteredPets: Pet[] = [];
  loading = true;
  errorMessage = '';

  // ตัวแปรตัวกรองและการค้นหา
  searchKeyword = '';
  selectedType = 'ทั้งหมด';
  selectedGender = '';
  sortBy = 'latest';

  // ปุ่มกรองประเภท: ดึงชื่อประเภทจริงจาก Backend (GET /api/pet-types)
  typeFilters: string[] = ['ทั้งหมด'];

  constructor(
    private petService: PetService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPetTypes();
    this.loadPets();
  }

  loadPetTypes(): void {
    this.petService.getTypes().subscribe({
      next: (types) => {
        this.typeFilters = ['ทั้งหมด', ...(types || []).map((t) => t.name)];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching pet types:', err),
    });
  }

  loadPets(): void {
    this.loading = true;
    this.errorMessage = '';
    this.petService.getAll().subscribe({
      next: (res: any) => {
        const petsData = res?.data ? res.data : (Array.isArray(res) ? res : []);
        this.allPets = petsData;
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching pets:', err);
        this.errorMessage = 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  selectType(type: string): void {
    this.selectedType = type;
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.allPets];

    // 1. กรองตามประเภทสัตว์เลี้ยง
    if (this.selectedType !== 'ทั้งหมด') {
      result = result.filter((p) => p.petType?.name === this.selectedType);
    }

    // 2. กรองตามเพศ
    if (this.selectedGender) {
      result = result.filter((p) => p.gender === this.selectedGender);
    }

    // 3. กรองตามคำค้นหา (ชื่อ, สายพันธุ์, คำอธิบาย)
    if (this.searchKeyword.trim()) {
      const q = this.searchKeyword.toLowerCase().trim();
      result = result.filter((p) =>
        p.name?.toLowerCase().includes(q) ||
        p.breed?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    // 4. จัดเรียงข้อมูล
    if (this.sortBy === 'latest') {
      result.sort((a, b) => (b.id || 0) - (a.id || 0));
    } else if (this.sortBy === 'oldest') {
      result.sort((a, b) => (a.id || 0) - (b.id || 0));
    } else if (this.sortBy === 'name') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    this.filteredPets = result;
    this.cdr.detectChanges();
  }

  formatAge(months?: number | null): string {
    if (!months || months <= 0) return 'ไม่ระบุอายุ';
    const years = Math.floor(months / 12);
    const remMonths = months % 12;

    if (years > 0 && remMonths > 0) {
      return `${years} ปี ${remMonths} เดือน`;
    } else if (years > 0) {
      return `${years} ปี`;
    } else {
      return `${remMonths} เดือน`;
    }
  }
}