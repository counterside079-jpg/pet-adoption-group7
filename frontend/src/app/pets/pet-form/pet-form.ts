import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { PetService } from '../../services/pet.service';
import { PetType } from '../../models/pet.model';

export function noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
  const isWhitespace = (control.value || '').toString().trim().length === 0;
  return !isWhitespace ? null : { whitespace: true };
}

@Component({
  selector: 'app-pet-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './pet-form.html',
})
export class PetFormComponent implements OnInit {
  petForm!: FormGroup;
  isEditMode: boolean = false;
  petId: number | null = null;
  originalStatus: string = '';
  petTypes: PetType[] = [];

  loading: boolean = false;
  backendError: string = '';

  constructor(
    private fb: FormBuilder,
    private petService: PetService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadPetTypes();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.petId = Number(idParam);
      this.loadPetData(this.petId);
    }
  }

  initForm(): void {
    this.petForm = this.fb.group({
      name: ['', [Validators.required, noWhitespaceValidator]],
      petTypeId: [null, [Validators.required]],
      gender: ['UNKNOWN', [Validators.required]],
      ageMonths: [
        null,
        [
          Validators.required,
          Validators.min(0),
          Validators.max(600),
          Validators.pattern('^[0-9]+\$'),
        ],
      ],
      weightKg: [null, [Validators.min(0)]],
      healthNote: [''],
      arrivedDate: [''],
      status: ['AVAILABLE', [Validators.required]],
      breed: [''],
      description: [''],
      imageUrl: ['', [Validators.pattern('^(https?:\\/\\/).+')]],
    });
  }

  loadPetTypes(): void {
    this.petService.getTypes().subscribe({
      next: (types) => {
        this.petTypes = types || [];
        if (!this.isEditMode && types.length > 0 && !this.petForm.value.petTypeId) {
          this.petForm.patchValue({ petTypeId: types[0].id });
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.backendError = 'ไม่สามารถดึงหมวดหมู่ประเภทสัตว์เลี้ยงได้';
        this.cdr.detectChanges();
      },
    });
  }

  loadPetData(id: number): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.petService.getOne(id).subscribe({
      next: (pet: any) => {
        const data = pet.data ? pet.data : pet;
        this.originalStatus = data.status;
        this.petForm.patchValue({
          name: data.name,
          petTypeId: data.petTypeId,
          gender: data.gender || 'UNKNOWN',
          ageMonths: data.ageMonths,
          weightKg: data.weightKg ?? null,
          healthNote: data.healthNote || '',
          arrivedDate: data.arrivedDate ? data.arrivedDate.substring(0, 10) : '',
          status: data.status,
          breed: data.breed || '',
          description: data.description || '',
          imageUrl: data.imageUrl || '',
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.handleBackendError(err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onSubmit(): void {
    this.backendError = '';

    if (this.petForm.invalid) {
      this.petForm.markAllAsTouched();
      return;
    }

    const currentStatus = this.petForm.value.status;
    let confirmReopen = false;

    if (this.isEditMode && this.originalStatus === 'ADOPTED' && currentStatus === 'AVAILABLE') {
      const isConfirmed = confirm(
        '⚠️ สัตว์เลี้ยงตัวนี้มีสถานะ "รับเลี้ยงแล้ว (ADOPTED)"\nคุณต้องการเปิดรับเลี้ยงใหม่อีกครั้ง (AVAILABLE) ใช่หรือไม่?'
      );
      if (!isConfirmed) return;
      confirmReopen = true;
    }

    this.loading = true;
    this.cdr.detectChanges();

    // ตัวตัดการค้าง (Failsafe) ป้องกันปุ่มหมุนค้างตลอดกาล
    const safetyTimeout = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.backendError = 'เซิร์ฟเวอร์ตอบกลับล่าช้า กรุณาตรวจสอบการเชื่อมต่อ Backend';
        this.cdr.detectChanges();
      }
    }, 8000);

    const formVal = this.petForm.value;
    const formData = {
      ...formVal,
      name: formVal.name ? formVal.name.trim() : '',
      petTypeId: Number(formVal.petTypeId),
      ageMonths: Number(formVal.ageMonths),
      weightKg: formVal.weightKg !== null && formVal.weightKg !== '' ? Number(formVal.weightKg) : null,
      breed: formVal.breed?.trim() || null,
      description: formVal.description?.trim() || null,
      healthNote: formVal.healthNote ? formVal.healthNote.trim() : null,
      imageUrl: formVal.imageUrl?.trim() || null,
      arrivedDate: formVal.arrivedDate ? formVal.arrivedDate : null,
      confirmReopen: confirmReopen,
    };

    // แยกการทำงานระหว่าง Update และ Create แบบตรงไปตรงมา
    if (this.isEditMode && this.petId) {
      this.petService.update(this.petId, formData).subscribe({
        next: () => {
          clearTimeout(safetyTimeout);
          this.loading = false;
          this.cdr.detectChanges();
          alert('บันทึกการแก้ไขข้อมูลสำเร็จ');
          this.router.navigate(['/admin']);
        },
        error: (err: HttpErrorResponse) => {
          clearTimeout(safetyTimeout);
          this.handleBackendError(err);
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
    } else {
      this.petService.create(formData).subscribe({
        next: () => {
          clearTimeout(safetyTimeout);
          this.loading = false;
          this.cdr.detectChanges();
          alert('เพิ่มสัตว์เลี้ยงใหม่สำเร็จ');
          this.router.navigate(['/admin']);
        },
        error: (err: HttpErrorResponse) => {
          clearTimeout(safetyTimeout);
          this.handleBackendError(err);
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
    }
  }

  private handleBackendError(err: HttpErrorResponse): void {
    if (err.error) {
      if (Array.isArray(err.error.message)) {
        this.backendError = err.error.message.join(' | ');
      } else if (typeof err.error.message === 'string') {
        this.backendError = err.error.message;
      } else if (typeof err.error === 'string') {
        this.backendError = err.error;
      } else {
        this.backendError = `เกิดข้อผิดพลาดจาก Backend (Status: ${err.status})`;
      }
    } else {
      this.backendError = 'ไม่สามารถเชื่อมต่อกับ Backend ได้';
    }
  }

  f(field: string) {
    return this.petForm.get(field);
  }
}