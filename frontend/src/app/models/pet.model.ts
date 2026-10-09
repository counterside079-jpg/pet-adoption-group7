export interface PetType {
  id: number;
  name: string;
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