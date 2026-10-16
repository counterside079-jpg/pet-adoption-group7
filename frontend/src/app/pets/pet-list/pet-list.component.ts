import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { TPipe } from '../../shared/t.pipe';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../services/i18n.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PetService } from '../../services/pet.service';
import { Pet } from '../../models/pet.model';
import { matchesPet } from '../../services/pet-search';
import { petCover } from '../../services/pet-image';

@Component({
  selector: 'app-pet-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TPipe],
  templateUrl: './pet-list.component.html',
})
export class PetListComponent implements OnInit {
  readonly i18n = inject(I18nService);
  allPets: Pet[] = [];
  filteredPets: Pet[] = [];
  loading = true;
  errorMessage = '';

  // ตัวแปรตัวกรองและการค้นหา
  searchKeyword = '';
  selectedType = 'ทั้งหมด';
  selectedGender = '';
  sortBy = 'latest';
  cover = petCover;

  // คำค้นตัวอย่าง กดแล้วค้นทันที (บอกผู้ใช้ว่าค้นจากอะไรได้บ้าง)
  get searchExamples(): string[] {
    return this.i18n.isEn()
      ? ['cat', 'female', 'dog male', 'rabbit']
      : ['แมว', 'ตัวเมีย', 'โกลเด้น', 'ขี้เล่น', 'สุนัข ผู้'];
  }

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

  useExample(word: string): void {
    this.searchKeyword = word;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchKeyword = '';
    this.selectedType = 'ทั้งหมด';
    this.selectedGender = '';
    this.applyFilters();
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

    // 3. กรองตามคำค้นหา: ชื่อ สายพันธุ์ ประเภท เพศ นิสัย/คำอธิบาย (พิมพ์หลายคำได้ เช่น "แมว เมีย")
    if (this.searchKeyword.trim()) {
      result = result.filter((p) => matchesPet(p, this.searchKeyword));
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
    return this.i18n.age(months);
  }
}