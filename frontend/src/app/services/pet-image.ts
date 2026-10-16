import { Pet } from '../models/pet.model';
import { API_BASE } from './api-config';

// รูปสำรองเมื่อสัตว์ยังไม่มีรูป
export const DEFAULT_PET_IMAGE = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&q=80';

// ที่อยู่ของรูปที่อัปโหลดไว้ในฐานข้อมูล
export function petImageUrl(imageId: number): string {
  return `${API_BASE}/pet-images/${imageId}`;
}

// รายการรูปทั้งหมดของสัตว์ 1 ตัว: รูปที่อัปโหลดก่อน แล้วตามด้วยลิงก์รูป (imageUrl) ถ้ามี
export function petImages(pet?: Pet | null): string[] {
  if (!pet) return [];
  const list = (pet.images ?? []).map((img) => petImageUrl(img.id));
  if (pet.imageUrl) list.push(pet.imageUrl);
  return list;
}

// รูปปก (รูปแรก) ใช้ในการ์ด/ตาราง
export function petCover(pet?: Pet | null): string {
  return petImages(pet)[0] || DEFAULT_PET_IMAGE;
}
