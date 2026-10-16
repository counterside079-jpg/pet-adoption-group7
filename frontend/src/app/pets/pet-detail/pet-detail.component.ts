import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { TPipe, TDatePipe } from '../../shared/t.pipe';
import { I18nService } from '../../services/i18n.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PetService } from '../../services/pet.service';
import { Pet } from '../../models/pet.model';
import { DEFAULT_PET_IMAGE, petImages } from '../../services/pet-image';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-pet-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TPipe, TDatePipe],
  templateUrl: './pet-detail.component.html',
})
export class PetDetailComponent implements OnInit {
  readonly i18n = inject(I18nService);
  pet: Pet | null = null;
  loading = true;
  errorMessage = '';

  // แกลเลอรีรูป: รูปทั้งหมดของสัตว์ตัวนี้ + รูปที่กำลังดูอยู่
  photos: string[] = [];
  current = 0;

  constructor(
    private route: ActivatedRoute,
    private petService: PetService,
    private cdr: ChangeDetectorRef,
    public auth: AuthService,
  ) {}

  get currentPhoto(): string {
    return this.photos[this.current] || DEFAULT_PET_IMAGE;
  }

  show(i: number): void {
    const n = this.photos.length;
    if (!n) return;
    this.current = (i + n) % n;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPet(id);
    } else {
      this.errorMessage = 'ไม่พบรหัสสัตว์เลี้ยงในระบบ';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  loadPet(id: string): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.petService.getOne(id).subscribe({
      next: (res: any) => {
        this.pet = res?.data ? res.data : res;
        this.photos = petImages(this.pet);
        this.current = 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching pet:', err);
        this.errorMessage = 'ไม่สามารถดึงข้อมูลสัตว์เลี้ยงได้ กรุณาลองใหม่อีกครั้ง';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  getGenderThai(gender?: string): string {
    if (gender === 'MALE') return 'ผู้';
    if (gender === 'FEMALE') return 'เมีย';
    return 'ไม่ระบุ';
  }

  getStatusThai(status?: string): string {
    switch (status) {
      case 'AVAILABLE': return 'พร้อมรับเลี้ยง';
      case 'PENDING': return 'กำลังรอพิจารณา';
      case 'ADOPTED': return 'มีบ้านแล้ว';
      case 'UNAVAILABLE': return 'ไม่พร้อมรับเลี้ยง';
      default: return status || '-';
    }
  }
}