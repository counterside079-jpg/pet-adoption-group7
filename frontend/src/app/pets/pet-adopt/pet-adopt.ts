import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PetService } from '../../services/pet.service';
import { RequestService, backendMessage } from '../../services/request.service';
import { Pet } from '../../models/pet.model';

@Component({
  selector: 'app-pet-adopt',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './pet-adopt.html',
})
export class PetAdoptComponent implements OnInit {
  pet: Pet | null = null;
  adoptForm!: FormGroup;
  loadingPet = true;
  submitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private petService: PetService,
    private requestService: RequestService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPet(id);
    }
  }

  initForm(): void {
    this.adoptForm = this.fb.group({
      prefix: [''],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      address1: [''],
      address2: [''],
      city: ['', [Validators.required]],
      postalCode: ['', [Validators.required]],
      country: ['Thailand', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      confirmEmail: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      socialContact: [''],
      nearestAirport: [''],
      householdMembers: [''],
      householdAgreement: [''],
      otherPets: [''],
      housingDetails: [''],
      occupationAndHours: [''],
      adoptionReason: ['', [Validators.required]],
      receiveNews: ['ต้องการรับข่าวสาร'],
      agreeDonationInfo: [false],
    });
  }

  loadPet(id: string): void {
    this.loadingPet = true;
    this.cdr.detectChanges();

    this.petService.getOne(id).subscribe({
      next: (res: any) => {
        this.pet = res?.data ? res.data : res;
        this.loadingPet = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading pet:', err);
        this.loadingPet = false;
        this.cdr.detectChanges();
      },
    });
  }

  formatAge(months?: number | null): string {
    if (!months || months <= 0) return 'ไม่ระบุอายุ';
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years > 0 && remainingMonths > 0) {
      return `${years} ปี ${remainingMonths} เดือน`;
    } else if (years > 0) {
      return `${years} ปี`;
    } else {
      return `${remainingMonths} เดือน`;
    }
  }

  getGenderThai(gender?: string): string {
    if (gender === 'MALE') return 'ตัวผู้';
    if (gender === 'FEMALE') return 'ตัวเมีย';
    return gender || '-';
  }

  removeSelectedPet(): void {
    if (confirm('ต้องการยกเลิกการเลือกสัตว์เลี้ยงตัวนี้และกลับไปหน้ารายการหรือไม่?')) {
      this.router.navigate(['/']);
    }
  }

  onSubmit(): void {
    if (this.adoptForm.invalid) {
      this.adoptForm.markAllAsTouched();
      alert('กรุณากรอกข้อมูลในช่องที่มีเครื่องหมายดอกจัน (*) ให้ครบถ้วน');
      return;
    }

    if (this.adoptForm.value.email !== this.adoptForm.value.confirmEmail) {
      alert('อีเมลและยืนยันอีเมลไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
      return;
    }

    if (!this.pet) {
      alert('ไม่พบข้อมูลสัตว์เลี้ยง กรุณาเลือกสัตว์เลี้ยงจากหน้ารายการอีกครั้ง');
      return;
    }

    const v = this.adoptForm.value;
    const address = [v.address1, v.address2].map((x: string) => (x || '').trim()).filter(Boolean).join(' ');
    const petName = this.pet.name;

    this.submitting = true;
    this.cdr.detectChanges();

    // ส่งแบบฟอร์มไปบันทึกที่ Backend (POST /api/adoption-requests)
    this.requestService
      .createAdoption({
        petId: this.pet.id,
        prefix: v.prefix || undefined,
        firstName: v.firstName,
        lastName: v.lastName,
        email: v.email,
        phone: v.phone,
        address: address || undefined,
        city: v.city,
        postalCode: v.postalCode,
        country: v.country,
        socialContact: v.socialContact || undefined,
        nearestAirport: v.nearestAirport || undefined,
        householdMembers: v.householdMembers || undefined,
        householdAgreement: v.householdAgreement || undefined,
        otherPets: v.otherPets || undefined,
        housingDetails: v.housingDetails || undefined,
        occupationAndHours: v.occupationAndHours || undefined,
        adoptionReason: v.adoptionReason,
        receiveNews: v.receiveNews === 'ต้องการรับข่าวสาร',
      })
      .subscribe({
        next: () => {
          this.submitting = false;
          this.cdr.detectChanges();
          alert(`🎉 ส่งแบบฟอร์มขอรับเลี้ยง "${petName}" สำเร็จแล้ว!\nเจ้าหน้าที่จะติดต่อกลับหาคุณโดยเร็วที่สุด`);
          // ถ้าติ๊กว่าสนใจข้อมูลการบริจาค พาไปหน้าบริจาคต่อ
          this.router.navigate([v.agreeDonationInfo ? '/donate' : '/']);
        },
        error: (err) => {
          this.submitting = false;
          this.cdr.detectChanges();
          alert('ส่งแบบฟอร์มไม่สำเร็จ\n' + backendMessage(err, 'กรุณาลองใหม่อีกครั้ง'));
        },
      });
  }
}