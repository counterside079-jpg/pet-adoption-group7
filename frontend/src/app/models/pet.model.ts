export interface PetType {
  id: number;
  name: string;
}

export interface PetImageRef {
  id: number;
}

export interface Pet {
  id: number;
  name: string;
  petTypeId: number;
  petType?: PetType;
  status: 'AVAILABLE' | 'PENDING' | 'ADOPTED' | 'UNAVAILABLE';
  gender: 'MALE' | 'FEMALE' | 'UNKNOWN'; // 👈 เพิ่ม 'UNKNOWN'
  ageMonths: number;
  weightKg?: number | null;              // 👈 เพิ่ม weightKg
  healthNote?: string | null;            // 👈 เพิ่ม healthNote
  arrivedDate?: string | null;           // 👈 เพิ่ม arrivedDate
  breed?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  images?: PetImageRef[];               // รูปที่อัปโหลด (หลายรูป) เรียงตามลำดับ รูปแรกคือรูปปก
  deletedAt?: string | null;            // มีค่า = ถูกเก็บถาวร (ลบออกจากหน้าเว็บ แต่ข้อมูลยังอยู่)
  createdAt?: string;
  updatedAt?: string;
}

export interface PetFormData {
  name: string;
  petTypeId: number;
  status: string;
  gender: string;
  ageMonths: number;
  weightKg?: number | null;              // 👈 เพิ่มในฟอร์ม
  healthNote?: string | null;            // 👈 เพิ่มในฟอร์ม
  arrivedDate?: string | null;           // 👈 เพิ่มในฟอร์ม
  breed?: string;
  description?: string;
  imageUrl?: string;
  confirmReopen?: boolean;
}
// ประวัติการทำงาน (Activity Log) ที่เจ้าหน้าที่ดูย้อนหลังได้
export interface ActivityLog {
  id: number;
  userId?: number | null;
  user?: { id: number; fullName: string; email: string } | null;
  action: string;
  targetType: string;
  targetId?: number | null;
  detail?: string | null;
  createdAt: string;
}

export const LOG_ACTION_TH: Record<string, string> = {
  CREATE: 'เพิ่ม',
  UPDATE: 'แก้ไข',
  DELETE: 'ลบ',
  RESTORE: 'กู้คืน',
  STATUS: 'เปลี่ยนสถานะ',
  UPLOAD_IMAGE: 'อัปโหลดรูป',
  DELETE_IMAGE: 'ลบรูป',
};

export const LOG_TARGET_TH: Record<string, string> = {
  PET: 'สัตว์เลี้ยง',
  ADOPTION_REQUEST: 'คำขอรับเลี้ยง',
  DONATION: 'การบริจาค',
  USER: 'บัญชีผู้ใช้',
};
