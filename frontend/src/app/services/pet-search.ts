import { Pet } from '../models/pet.model';
import { EN } from '../i18n/en';

const GENDER_WORDS: Record<string, string[]> = {
  MALE: ['ผู้', 'ตัวผู้', 'เพศผู้', 'male', 'm'],
  FEMALE: ['เมีย', 'ตัวเมีย', 'เพศเมีย', 'female', 'f'],
  UNKNOWN: ['ไม่ระบุ', 'unknown'],
};

const STATUS_WORDS: Record<string, string> = {
  AVAILABLE: 'พร้อมรับเลี้ยง',
  PENDING: 'กำลังรอพิจารณา',
  ADOPTED: 'มีบ้านแล้ว',
  UNAVAILABLE: 'ไม่พร้อมรับเลี้ยง',
};

// คำค้น 1 คำ ตรงกับสัตว์ตัวนี้ไหม: ดูจาก ชื่อ สายพันธุ์ ประเภท เพศ นิสัย/คำอธิบาย สุขภาพ รหัส และสถานะ
function matchTerm(p: Pet, term: string): boolean {
  const t = term.toLowerCase();
  const typeTh = p.petType?.name;
  const statusTh = STATUS_WORDS[p.status];
  // ค้นด้วยคำภาษาอังกฤษได้ด้วย (เช่น cat, available) ตอนเลือกภาษาอังกฤษ
  const text = [p.name, p.breed, p.description, p.healthNote, typeTh, statusTh, typeTh && EN[typeTh], statusTh && EN[statusTh]]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  if (text.includes(t)) return true;
  if (t.replace('#', '') === String(p.id)) return true;
  // คำภาษาอังกฤษต้องตรงทั้งคำ (กัน "female" ไปตรงกับ "male") ส่วนคำไทยตรงบางส่วนได้ เช่น "ตัวเมีย" มี "เมีย"
  return (GENDER_WORDS[p.gender] || []).some((w) => w === t || (/[\u0E00-\u0E7F]/.test(w) && t.includes(w)));
}

// ค้นหาหลายคำพร้อมกัน เช่น "แมว เมีย" = ต้องตรงทุกคำ
export function matchesPet(p: Pet, keyword: string): boolean {
  const terms = (keyword || '').trim().split(/\s+/).filter(Boolean);
  return terms.every((t) => matchTerm(p, t));
}
