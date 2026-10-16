import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, timeout, catchError, throwError } from 'rxjs';
import { ActivityLog, Pet, PetType } from '../models/pet.model';
import { AdoptionRequest } from '../models/request.model';
import { API_BASE } from './api-config';

@Injectable({
  providedIn: 'root',
})
export class PetService {
  private apiUrl = `${API_BASE}/pets`;
  private typesUrl = `${API_BASE}/pet-types`;

  constructor(private http: HttpClient) {}

  // archived: 'only' = ดูเฉพาะที่เก็บถาวร, 'include' = รวมที่เก็บถาวร (ใช้ได้เฉพาะเจ้าหน้าที่)
  getAll(search?: string, typeId?: number | string, status?: string, archived?: 'only' | 'include'): Observable<Pet[]> {
    let params = new HttpParams();
    if (archived) {
      params = params.set('archived', archived);
    }

    if (search && search.trim() !== '') {
      params = params.set('search', search.trim());
    }
    if (typeId && typeId !== 'ALL' && typeId.toString().trim() !== '') {
      params = params.set('typeId', typeId.toString());
    }
    // ส่ง status ไปทุกครั้งที่มีค่า รวมถึง 'ALL' (หน้า Admin ใช้ ALL เพื่อดูทุกสถานะ)
    // ถ้าไม่ส่ง Backend จะคืนเฉพาะ AVAILABLE (Business Rule)
    if (status && status.trim() !== '') {
      params = params.set('status', status.trim());
    }

    return this.http.get<Pet[]>(this.apiUrl, { params }).pipe(
      timeout(20000), // 👈 ถ้าเซิร์ฟเวอร์ไม่ตอบใน 20 วินาที ให้ตีเป็น Error (เผื่อ Render ตื่นช้า)
      catchError(err => throwError(() => err))
    );
  }

  getTypes(): Observable<PetType[]> {
    return this.http.get<PetType[]>(this.typesUrl).pipe(timeout(20000));
  }

  getOne(id: number | string): Observable<Pet> {
    return this.http.get<Pet>(`${this.apiUrl}/${id}`);
  }
  create(data: any): Observable<Pet> {
    return this.http.post<Pet>(this.apiUrl, data);
  }
  update(id: number | string, data: any): Observable<Pet> {
    // ใช้ PUT ให้ตรงกับ Controller พร้อมระบบ timeout 7 วินาทีตัดจบ
    return this.http.put<Pet>(`${this.apiUrl}/${id}`, data).pipe(
      timeout(7000),
      catchError((err) => throwError(() => err))
    );
  }
  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ลบ = เก็บถาวร (ซ่อนจากหน้าเว็บ แต่ข้อมูลและประวัติยังอยู่ กู้คืนได้)
  restore(id: number | string): Observable<Pet> {
    return this.http.post<Pet>(`${this.apiUrl}/${id}/restore`, {});
  }

  // ประวัติย้อนหลังของสัตว์ 1 ตัว: คำขอรับเลี้ยงทั้งหมด + บันทึกการทำงานของเจ้าหน้าที่
  history(id: number | string): Observable<{ pet: Pet; requests: AdoptionRequest[]; logs: ActivityLog[] }> {
    return this.http.get<{ pet: Pet; requests: AdoptionRequest[]; logs: ActivityLog[] }>(`${this.apiUrl}/${id}/history`);
  }

  // อัปโหลดรูปหลายรูปพร้อมกัน (สูงสุด 10 รูป/ตัว, รูปละไม่เกิน 3MB)
  uploadImages(id: number | string, files: File[]): Observable<Pet> {
    const form = new FormData();
    files.forEach((f) => form.append('files', f, f.name));
    return this.http.post<Pet>(`${this.apiUrl}/${id}/images`, form).pipe(timeout(60000));
  }

  deleteImage(imageId: number): Observable<unknown> {
    return this.http.delete(`${API_BASE}/pet-images/${imageId}`);
  }

  getLogs(filter: { targetType?: string; targetId?: number | string; q?: string } = {}): Observable<ActivityLog[]> {
    let params = new HttpParams();
    if (filter.targetType) params = params.set('targetType', filter.targetType);
    if (filter.targetId) params = params.set('targetId', String(filter.targetId));
    if (filter.q && filter.q.trim()) params = params.set('q', filter.q.trim());
    return this.http.get<ActivityLog[]>(`${API_BASE}/activity-logs`, { params }).pipe(timeout(20000));
  }
}
