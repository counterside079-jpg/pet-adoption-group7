import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PetService } from '../../services/pet.service';
import { Pet } from '../../models/pet.model';

@Component({
  selector: 'app-pet-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pet-detail.component.html',
})
export class PetDetailComponent implements OnInit {
  pet: Pet | null = null;
  loading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private petService: PetService,
    private cdr: ChangeDetectorRef
  ) {}

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