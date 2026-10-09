import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, timeout, catchError, throwError } from 'rxjs';
import { Pet, PetType } from '../models/pet.model';
import { API_BASE } from './api-config';

@Injectable({
  providedIn: 'root',
})
export class PetService {
  private apiUrl = `${API_BASE}/pets`;
  private typesUrl = `${API_BASE}/pet-types`;

  constructor(private http: HttpClient) {}

  getAll(search?: string, typeId?: number | string, status?: string): Observable<Pet[]> {
    let params = new HttpParams();

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
}