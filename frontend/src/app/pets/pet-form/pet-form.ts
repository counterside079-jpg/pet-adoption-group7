import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { TPipe } from '../../shared/t.pipe';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../services/i18n.service';
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
import { PetImageRef, PetType } from '../../models/pet.model';
import { petImageUrl } from '../../services/pet-image';

export function noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
  const isWhitespace = (control.value || '').toString().trim().length === 0;
  return !isWhitespace ? null : { whitespace: true };
}

@Component({
  selector: 'app-pet-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TPipe],
  templateUrl: './pet-form.html',
})
export class PetFormComponent implements OnInit {
  readonly i18n = inject(I18nService);
  petForm!: FormGroup;
  isEditMode: boolean = false;
  petId: number | null = null;
  originalStatus: string = '';
  petTypes: PetType[] = [];

  loading: boolean = false;
  backendError: string = '';

  // ---------- รูปภาพหลายรูป ----------
  readonly MAX_IMAGES = 10;
  readonly MAX_SIZE_MB = 3;
  existingImages: PetImageRef[] = [];      // รูปที่อัปโหลดไว้แล้ว (โหมดแก้ไข)
  newFiles: { file: File; preview: string }[] = []; // รูปที่เลือกใหม่ รอส่งตอนกดบันทึก
  imageError = '';
  imageUrlOf = petImageUrl;

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
        this.existingImages = data.images || [];
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
        this.i18n.t('⚠️ สัตว์เลี้ยงตัวนี้มีสถานะ "รับเลี้ยงแล้ว (ADOPTED)"\nคุณต้องการเปิดรับเลี้ยงใหม่อีกครั้ง (AVAILABLE) ใช่หรือไม่?')
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
          this.afterSave(this.petId!, 'บันทึกการแก้ไขข้อมูลสำเร็จ');
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
        next: (pet) => {
          clearTimeout(safetyTimeout);
          this.afterSave(pet.id, 'เพิ่มสัตว์เลี้ยงใหม่สำเร็จ');
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

  // เลือกรูปจากเครื่อง (เลือกได้ทีละหลายรูป)
  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    input.value = '';
    this.imageError = '';
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        this.imageError = this.i18n.tr(`"${file.name}" ไม่ใช่ไฟล์รูปภาพ`, `"${file.name}" is not an image file`);
        continue;
      }
      if (file.size > this.MAX_SIZE_MB * 1024 * 1024) {
        this.imageError = this.i18n.tr(`"${file.name}" ใหญ่เกิน ${this.MAX_SIZE_MB}MB`, `"${file.name}" is larger than ${this.MAX_SIZE_MB}MB`);
        continue;
      }
      if (this.existingImages.length + this.newFiles.length >= this.MAX_IMAGES) {
        this.imageError = this.i18n.tr(`สัตว์ 1 ตัวมีรูปได้ไม่เกิน ${this.MAX_IMAGES} รูป`, `A pet can have at most ${this.MAX_IMAGES} photos`);
        break;
      }
      this.newFiles.push({ file, preview: URL.createObjectURL(file) });
    }
    this.cdr.detectChanges();
  }

  removeNewFile(i: number): void {
    URL.revokeObjectURL(this.newFiles[i].preview);
    this.newFiles.splice(i, 1);
  }

  // ลบรูปที่อัปโหลดไว้แล้ว (ลบทันที และถูกบันทึกในประวัติการทำงาน)
  deleteExistingImage(img: PetImageRef): void {
    if (!confirm(this.i18n.t('ลบรูปนี้ใช่หรือไม่?'))) return;
    this.petService.deleteImage(img.id).subscribe({
      next: () => {
        this.existingImages = this.existingImages.filter((x) => x.id !== img.id);
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.handleBackendError(err);
        this.cdr.detectChanges();
      },
    });
  }

  // หลังบันทึกข้อมูลสำเร็จ: ถ้ามีรูปใหม่ ส่งรูปขึ้นต่อ แล้วค่อยกลับหน้า Admin
  private afterSave(petId: number, message: string): void {
    const done = (msg: string) => {
      this.loading = false;
      this.cdr.detectChanges();
      alert(this.i18n.t(msg));
      this.router.navigate(['/admin']);
    };
    if (!this.newFiles.length) {
      done(message);
      return;
    }
    this.petService.uploadImages(petId, this.newFiles.map((f) => f.file)).subscribe({
      next: () => {
        this.newFiles.forEach((f) => URL.revokeObjectURL(f.preview));
        this.newFiles = [];
        done(this.i18n.t(message) + this.i18n.tr(' (อัปโหลดรูปเรียบร้อย)', ' (photos uploaded)'));
      },
      error: (err: HttpErrorResponse) => {
        // ข้อมูลบันทึกแล้ว แต่รูปขึ้นไม่สำเร็จ -> อยู่หน้าเดิม (โหมดแก้ไข) ให้ลองส่งรูปใหม่
        this.handleBackendError(err);
        this.backendError = this.i18n.tr('บันทึกข้อมูลแล้ว แต่อัปโหลดรูปไม่สำเร็จ: ', 'Saved, but the photo upload failed: ') + this.i18n.t(this.backendError);
        this.loading = false;
        if (!this.isEditMode) {
          this.router.navigate(['/admin', petId, 'edit']);
        }
        this.cdr.detectChanges();
      },
    });
  }

  private handleBackendError(err: HttpErrorResponse): void {
    if (err.error) {
      if (Array.isArray(err.error.message)) {
        this.backendError = err.error.message.map((m: string) => this.i18n.t(m)).join(' | ');
      } else if (typeof err.error.message === 'string') {
        this.backendError = err.error.message;
      } else if (typeof err.error === 'string') {
        this.backendError = err.error;
      } else {
        this.backendError = this.i18n.tr(`เกิดข้อผิดพลาดจาก Backend (Status: ${err.status})`, `Backend error (Status: ${err.status})`);
      }
    } else {
      this.backendError = 'ไม่สามารถเชื่อมต่อกับ Backend ได้';
    }
  }

  f(field: string) {
    return this.petForm.get(field);
  }
}