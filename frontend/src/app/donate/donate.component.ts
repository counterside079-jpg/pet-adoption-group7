import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RequestService, backendMessage } from '../services/request.service';
import { DONATION_METHOD_TH, DonationMethod } from '../models/request.model';

@Component({
  selector: 'app-donate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './donate.component.html',
})
export class DonateComponent {
  form: FormGroup;
  submitting = false;
  success = false;
  errorMessage = '';
  donatedAmount = 0;

  presetAmounts = [100, 300, 500, 1000];
  methods = Object.entries(DONATION_METHOD_TH) as [DonationMethod, string][];

  constructor(
    private fb: FormBuilder,
    private requestService: RequestService,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      donorName: ['', [Validators.required, Validators.pattern(/.*\S.*/)]],
      email: ['', [Validators.email]],
      phone: ['', [Validators.pattern(/^[0-9+\-\s]{9,15}$/)]],
      amount: [300, [Validators.required, Validators.min(1), Validators.max(1000000)]],
      method: ['PROMPTPAY', [Validators.required]],
      message: ['', [Validators.maxLength(500)]],
    });
  }

  isInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  setAmount(amount: number): void {
    this.form.patchValue({ amount });
  }

  onSubmit(): void {
    this.errorMessage = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    this.submitting = true;

    // POST /api/donations
    this.requestService
      .createDonation({
        donorName: v.donorName.trim(),
        email: v.email?.trim() || undefined,
        phone: v.phone?.trim() || undefined,
        amount: Number(v.amount),
        method: v.method,
        message: v.message?.trim() || undefined,
      })
      .subscribe({
        next: (d) => {
          this.submitting = false;
          this.success = true;
          this.donatedAmount = d.amount;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.submitting = false;
          this.errorMessage = backendMessage(err, 'บันทึกการบริจาคไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
          this.cdr.detectChanges();
        },
      });
  }

  donateAgain(): void {
    this.success = false;
    this.form.reset({ donorName: '', email: '', phone: '', amount: 300, method: 'PROMPTPAY', message: '' });
  }
}
