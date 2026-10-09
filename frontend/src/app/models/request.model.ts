import { Pet } from './pet.model';

export type AdoptionRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AdoptionRequest {
  id: number;
  petId: number;
  pet?: Pet;
  prefix?: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string | null;
  city: string;
  postalCode: string;
  country: string;
  socialContact?: string | null;
  nearestAirport?: string | null;
  householdMembers?: string | null;
  householdAgreement?: string | null;
  otherPets?: string | null;
  housingDetails?: string | null;
  occupationAndHours?: string | null;
  adoptionReason: string;
  receiveNews: boolean;
  status: AdoptionRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export type NewAdoptionRequest = Omit<
  AdoptionRequest,
  'id' | 'pet' | 'status' | 'createdAt' | 'updatedAt'
>;

export type DonationStatus = 'PENDING' | 'RECEIVED' | 'CANCELLED';
export type DonationMethod = 'TRANSFER' | 'PROMPTPAY' | 'CASH';

export interface Donation {
  id: number;
  donorName: string;
  email?: string | null;
  phone?: string | null;
  amount: number;
  method: DonationMethod;
  message?: string | null;
  status: DonationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NewDonation {
  donorName: string;
  email?: string;
  phone?: string;
  amount: number;
  method: DonationMethod;
  message?: string;
}

// ป้ายภาษาไทยที่ใช้ร่วมกันหลายหน้า
export const REQUEST_STATUS_TH: Record<AdoptionRequestStatus, string> = {
  PENDING: 'รอพิจารณา',
  APPROVED: 'อนุมัติแล้ว',
  REJECTED: 'ไม่อนุมัติ',
};

export const DONATION_STATUS_TH: Record<DonationStatus, string> = {
  PENDING: 'รอตรวจสอบยอด',
  RECEIVED: 'ได้รับแล้ว',
  CANCELLED: 'ยกเลิก',
};

export const DONATION_METHOD_TH: Record<DonationMethod, string> = {
  TRANSFER: 'โอนผ่านบัญชีธนาคาร',
  PROMPTPAY: 'พร้อมเพย์',
  CASH: 'เงินสดที่ศูนย์',
};
