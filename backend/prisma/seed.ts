import { PrismaClient } from '@prisma/client';
import { randomBytes, scryptSync } from 'crypto';

const prisma = new PrismaClient();

// รูปแบบเดียวกับ AuthService.hashPassword (salt:hash แบบ scrypt)
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}

// บัญชีเริ่มต้น: เจ้าหน้าที่ 2 คน (แยกบัญชีกัน) + ผู้ใช้ทดสอบ 1 คน
// มีอีเมลนี้อยู่แล้วจะไม่สร้างซ้ำและไม่เปลี่ยนรหัสผ่าน
const SEED_USERS = [
  { email: 'admin@banphakjai.com', password: 'admin1234', fullName: 'ผู้ดูแลระบบ (หลัก)', role: 'ADMIN' },
  { email: 'staff@banphakjai.com', password: 'staff1234', fullName: 'เจ้าหน้าที่ศูนย์', role: 'ADMIN' },
  { email: 'user@banphakjai.com', password: 'user1234', fullName: 'ผู้ใช้ทดสอบ', role: 'USER' },
];

async function main() {
  console.log('🌱 กำลังเริ่มต้นการบันทึกข้อมูลตัวอย่าง (Seeding)...');

  // 1. เพิ่มข้อมูลประเภทสัตว์เลี้ยงเริ่มต้น (PetType)
  const dog = await prisma.petType.upsert({
    where: { name: 'สุนัข' },
    update: {},
    create: { name: 'สุนัข' },
  });

  const cat = await prisma.petType.upsert({
    where: { name: 'แมว' },
    update: {},
    create: { name: 'แมว' },
  });

  const rabbit = await prisma.petType.upsert({
    where: { name: 'กระต่าย' },
    update: {},
    create: { name: 'กระต่าย' },
  });

  const bird = await prisma.petType.upsert({
    where: { name: 'นก' },
    update: {},
    create: { name: 'นก' },
  });

  // ประเภทเพิ่มเติม (upsert = มีอยู่แล้วไม่สร้างซ้ำ) และ "อื่นๆ" สำหรับสัตว์ที่ไม่อยู่ในหมวดใด
  for (const name of ['ปลา', 'หนูแฮมสเตอร์', 'เต่า', 'อื่นๆ']) {
    await prisma.petType.upsert({ where: { name }, update: {}, create: { name } });
  }

  console.log('✅ เพิ่มข้อมูลประเภทสัตว์เลี้ยงสำเร็จ');

  // 2. เพิ่มข้อมูลสัตว์เลี้ยงตัวอย่าง (Sample Pets) หากยังไม่มีข้อมูลในระบบ
  const petsCount = await prisma.pet.count();
  if (petsCount === 0) {
    await prisma.pet.createMany({
      data: [
        {
          name: 'เจ้าทองคำ',
          petTypeId: dog.id,
          gender: 'MALE',
          ageMonths: 18,
          weightKg: 12.5,
          breed: 'โกลเด้น รีทรีฟเวอร์',
          status: 'AVAILABLE',
          healthNote: 'ฉีดวัคซีนรวมครบแล้ว สุขภาพแข็งแรง ร่าเริง',
          description: 'ชอบวิ่งเล่น เข้ากับเด็กและคนแปลกหน้าได้ดีมาก',
          imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
          arrivedDate: new Date('2024-01-15'),
        },
        {
          name: 'มิลค์กี้',
          petTypeId: cat.id,
          gender: 'FEMALE',
          ageMonths: 10,
          weightKg: 3.8,
          breed: 'เปอร์เซียผสมไทย',
          status: 'AVAILABLE',
          healthNote: 'ทำหมันแล้ว ตรวจเลือดไม่พบลิวคีเมีย',
          description: 'เรียบร้อย ขี้อ้อน ชอบนอนตักและให้เกาคาง',
          imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
          arrivedDate: new Date('2024-02-01'),
        },
        {
          name: 'ลัคกี้',
          petTypeId: dog.id,
          gender: 'MALE',
          ageMonths: 24,
          weightKg: 15.0,
          breed: 'ไทยหลังอาน',
          status: 'ADOPTED',
          healthNote: 'ฉีดวัคซีนป้องกันพิษสุนัขบ้าเรียบร้อย',
          description: 'มีครอบครัวใจดีรับไปอุปการะดูแลแล้ว',
          imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
          arrivedDate: new Date('2023-11-20'),
        },
        {
          name: 'โมจิ',
          petTypeId: rabbit.id,
          gender: 'FEMALE',
          ageMonths: 6,
          weightKg: 1.2,
          breed: 'ฮอลแลนด์ลอป',
          status: 'AVAILABLE',
          healthNote: 'สุขภาพแข็งแรง ทานอาหารเม็ดและหญ้าแห้งได้ดี',
          description: 'หูตก น่ารัก ไม่ดื้อ ทานหญ้าทิโมธีเป็นหลัก',
          imageUrl: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=800&q=80',
          arrivedDate: new Date('2024-03-05'),
        },
      ],
    });
    console.log('✅ เพิ่มข้อมูลสัตว์เลี้ยงตัวอย่างสำเร็จ');
  }

  // 3. บัญชีผู้ใช้เริ่มต้น
  for (const u of SEED_USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { email: u.email, fullName: u.fullName, role: u.role, passwordHash: hashPassword(u.password) },
    });
  }
  console.log('✅ เพิ่มบัญชีเริ่มต้นสำเร็จ (admin@banphakjai.com / staff@banphakjai.com / user@banphakjai.com)');

  console.log('🎉 บันทึกข้อมูล Seed เสร็จสิ้นเรียบร้อย');
}

main()
  .catch((e) => {
    console.error('❌ เกิดข้อผิดพลาดในการรัน Seed:', e);
    // 👈 แก้ข้อ 7: เปลี่ยนจาก process.exit(1); เป็น throw e;
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });