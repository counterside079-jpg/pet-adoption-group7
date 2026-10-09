import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';
import { API_BASE } from './api-config';
import {
  AdoptionRequest,
  AdoptionRequestStatus,
  Donation,
  DonationStatus,
  NewAdoptionRequest,
  NewDonation,
} from '../models/request.model';

// เรียก API คำขอรับเลี้ยง (/api/adoption-requests) และการบริจาค (/api/donations)
@Injectable({ providedIn: 'root' })
export class RequestService {
  private adoptUrl = `${API_BASE}/adoption-requests`;
  private donateUrl = `${API_BASE}/donations`;

  constructor(private http: HttpClient) {}

  private statusParams(status?: string): HttpParams {
    let params = new HttpParams();
    if (status && status !== 'ALL') params = params.set('status', status);
    return params;
  }

  // ---------- คำขอรับเลี้ยง ----------
  createAdoption(data: NewAdoptionRequest): Observable<AdoptionRequest> {
    return this.http.post<AdoptionRequest>(this.adoptUrl, data).pipe(timeout(20000));
  }

  getAdoptions(status?: string): Observable<AdoptionRequest[]> {
    return this.http
      .get<AdoptionRequest[]>(this.adoptUrl, { params: this.statusParams(status) })
      .pipe(timeout(20000));
  }

  updateAdoptionStatus(id: number, status: AdoptionRequestStatus): Observable<AdoptionRequest> {
    return this.http.patch<AdoptionRequest>(`${this.adoptUrl}/${id}/status`, { status });
  }

  deleteAdoption(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adoptUrl}/${id}`);
  }

  // ---------- การบริจาค ----------
  createDonation(data: NewDonation): Observable<Donation> {
    return this.http.post<Donation>(this.donateUrl, data).pipe(timeout(20000));
  }

  getDonations(status?: string): Observable<Donation[]> {
    return this.http
      .get<Donation[]>(this.donateUrl, { params: this.statusParams(status) })
      .pipe(timeout(20000));
  }

  updateDonationStatus(id: number, status: DonationStatus): Observable<Donation> {
    return this.http.patch<Donation>(`${this.donateUrl}/${id}/status`, { status });
  }

  deleteDonation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.donateUrl}/${id}`);
  }
}

// ดึงข้อความ error จาก Backend (NestJS ส่ง message มาเป็น string หรือ array)
export function backendMessage(err: any, fallback: string): string {
  const msg = err?.error?.message;
  if (Array.isArray(msg)) return msg.join('\n');
  if (typeof msg === 'string' && msg) return msg;
  if (err?.name === 'TimeoutError' || err?.status === 0) {
    return 'ติดต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่อีกครั้ง';
  }
  return fallback;
}
