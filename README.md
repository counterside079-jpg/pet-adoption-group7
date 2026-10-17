# Pet Adoption System (ระบบจัดการและรับเลี้ยงสัตว์เลี้ยง)

โครงงานพัฒนาเว็บแอปพลิเคชันแบบ Full-Stack เพื่อจัดการข้อมูลสัตว์เลี้ยงและสนับสนุนกระบวนการรับเลี้ยงสัตว์

---

## 🧑‍🏫 สำหรับผู้ตรวจ: ทดสอบระบบได้ 2 วิธี

### วิธีที่ 1 ทดสอบบนเว็บออนไลน์ (ไม่ต้องติดตั้ง)
* หน้าเว็บ: https://pet-adoption-group7-web.onrender.com
* API: https://pet-adoption-group7-api.onrender.com/api/pets
* เปิดครั้งแรกอาจต้องรอประมาณ 1 นาที เพราะ Render แบบฟรีพักเครื่องเมื่อไม่มีคนใช้
* บัญชีทดสอบอยู่ในหัวข้อ "บัญชีทดสอบ" ด้านล่าง

### วิธีที่ 2 ติดตั้งบนเครื่องของผู้ตรวจ (ประมาณ 10 นาที)
**สิ่งที่ต้องมี**
* Node.js 22 ขึ้นไป (แนะนำ 24 LTS จาก https://nodejs.org) ตรวจด้วย `node -v`
* ฐานข้อมูล PostgreSQL ว่าง 1 ฐาน เลือกแบบใดแบบหนึ่ง
  * **Neon (ฟรี ไม่ต้องติดตั้ง):** สมัครที่ https://neon.tech → Create project → กด Connect แล้วคัดลอก connection string ที่ขึ้นต้นด้วย `postgresql://`
  * **PostgreSQL ในเครื่อง:** สร้างฐานข้อมูลชื่อ `pet_adoption`

**ขั้นตอน** (ถ้าใช้ Windows แล้ว npm ขึ้น "running scripts is disabled" ให้รัน `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned -Force` ครั้งเดียว)
```bash
# Terminal ที่ 1: Backend
cd backend
copy .env.example .env        # macOS/Linux ใช้: cp .env.example .env
# เปิดไฟล์ .env แก้ DATABASE_URL เป็น connection string ของคุณ และตั้ง JWT_SECRET
npm install
npx prisma generate
npx prisma db push            # สร้างตารางทั้ง 7
npx prisma db seed            # ใส่ประเภทสัตว์ สัตว์ตัวอย่าง และบัญชีทดสอบ 3 บัญชี
npm run start:dev             # รอจนขึ้น "Backend พร้อมทำงานแล้วที่: http://localhost:3000/api"

# Terminal ที่ 2: Frontend
cd frontend
npm install
npm start                     # แล้วเปิด http://localhost:4200
```
เมื่อเปิดผ่าน localhost หน้าเว็บจะเรียก API ที่ `http://localhost:3000/api` ให้เอง ไม่ต้องแก้โค้ด ลำดับการทดสอบแนะนำอยู่ในหัวข้อ "ทดสอบติดตั้งบนเครื่องใหม่" ท้ายไฟล์

---

## 👥 รายชื่อสมาชิกในกลุ่ม

| ลำดับ | รหัสนักศึกษา | ชื่อ - นามสกุล | บทบาทหน้าที่ |
| :---: | :---: | :--- | :--- |
| 1 | 67118729 | วรมันต์ ชูช่วย | **UX/UI & Frontend ช่วงแรก:** ออกแบบหน้าตาและประสบการณ์ใช้งาน วาง Layout หน้าหลัก และพัฒนาหน้าเว็บช่วงเริ่มต้นโครงงาน |
| 2 | 67108027 | สิทธิชัย ชูแก้ว | **System Concept & Presentation:** คิดแนวคิดและขอบเขตระบบ กำหนดขั้นตอนการรับเลี้ยง และจัดทำสไลด์นำเสนอ |
| 3 | 67105601 | พรรษกร นวนดำ | **Full-Stack Developer & Deploy:** พัฒนาและแก้ไขระบบทั้ง Frontend/Backend/Database นำเว็บขึ้นระบบออนไลน์ (Render + Neon) และจัดทำรายงาน |
| 4 | 67120782 | วิทย์ธวัช คงเทพ | **UX/UI & Presentation:** ออกแบบ UX/UI ของหน้าต่างๆ และร่วมจัดทำสไลด์นำเสนอ |
---

## 🎯 วัตถุประสงค์ของโครงงาน
1. เพื่อประยุกต์ใช้ความรู้ด้านการพัฒนาเว็บแบบ Full-Stack เชื่อมโยงการทำงานตั้งแต่ Frontend -> Backend -> Database
2. เพื่อพัฒนาระบบศูนย์กลางในการจัดการข้อมูลสัตว์เลี้ยง (เพิ่ม, ค้นหา, ดูรายละเอียด, แก้ไข, ลบข้อมูล)
3. เพื่อสนับสนุนกระบวนการรับเลี้ยงสัตว์เลี้ยงอย่างเป็นระบบ โดยมี Business Rules ควบคุมสถานะความพร้อมในการรับเลี้ยง
4. เพื่อรองรับการใช้งานที่สะดวกและตอบสนองต่อขนาดหน้าจอทั้งบนคอมพิวเตอร์และโทรศัพท์มือถือ (Responsive Web Design)

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)
* **Frontend:** Angular 22, TypeScript, Reactive Forms, CSS Variables (โหมดสว่าง/มืด), ระบบแปลภาษาไทย/อังกฤษ
* **Backend:** NestJS 10 (Node.js Framework), TypeScript, Class-Validator, Class-Transformer, Multer (อัปโหลดรูป)
* **ความปลอดภัย:** Node.js crypto (รหัสผ่าน scrypt + salt, token แบบ HMAC-SHA256 อายุ 7 วัน), Guard ตรวจสิทธิ์สมาชิก/เจ้าหน้าที่
* **Database & ORM:** PostgreSQL (Neon), Prisma ORM (v6.19.0)
* **Hosting:** Render (Backend = Web Service, Frontend = Static Site)
* **Architecture:** RESTful API Architecture

---

## 🗄️ โครงสร้างฐานข้อมูล (Database Structure)
ระบบใช้ฐานข้อมูล PostgreSQL ผ่าน Prisma ORM มีทั้งหมด **7 ตาราง**

| ตาราง | หน้าที่ | ความสัมพันธ์ |
| :--- | :--- | :--- |
| **PetType** | ประเภทสัตว์ (สุนัข, แมว, กระต่าย ...) | 1 ประเภท : N สัตว์ |
| **Pet** | ข้อมูลสัตว์แต่ละตัว + `deletedAt` (เก็บถาวรแทนการลบจริง) | N : 1 PetType |
| **PetImage** | รูปภาพของสัตว์ (หลายรูปต่อ 1 ตัว) เก็บไฟล์ในฐานข้อมูล (`data` Bytes, `mimeType`, `sortOrder`) | N : 1 Pet |
| **User** | บัญชีสมาชิกและเจ้าหน้าที่ (`email` ไม่ซ้ำ, `passwordHash`, `role` = `USER` / `ADMIN`) | 1 : N AdoptionRequest, ActivityLog |
| **AdoptionRequest** | คำขอรับเลี้ยง ผูกกับสัตว์ (`petId`) และบัญชีผู้ส่ง (`userId`) สถานะ `PENDING` / `APPROVED` / `REJECTED` | N : 1 Pet, N : 1 User |
| **Donation** | การแจ้งบริจาค สถานะ `PENDING` / `RECEIVED` / `CANCELLED` | - |
| **ActivityLog** | ประวัติการทำงาน: ใคร (`userId`) ทำอะไร (`action`) กับข้อมูลไหน (`targetType`, `targetId`) เมื่อไร (`createdAt`) | N : 1 User |

**ฟิลด์หลักของ Pet:** `id`, `name`, `petTypeId`, `gender` (`MALE`/`FEMALE`/`UNKNOWN`), `ageMonths` (0-600), `weightKg`, `breed`, `status` (`AVAILABLE`/`PENDING`/`ADOPTED`/`UNAVAILABLE`), `healthNote`, `description`, `imageUrl` (ลิงก์รูปภายนอก ไม่บังคับ), `arrivedDate`, `deletedAt`

**ค่า action ใน ActivityLog:** `CREATE`, `UPDATE`, `DELETE`, `RESTORE`, `STATUS`, `UPLOAD_IMAGE`, `DELETE_IMAGE` · **targetType:** `PET`, `ADOPTION_REQUEST`, `DONATION`, `USER`

---

## 📋 กฎทางธุรกิจของระบบ (Business Rules)
1. **การกรองสถานะสัตว์เลี้ยง:** สัตว์เลี้ยงที่มีสถานะ **ADOPTED** (รับเลี้ยงแล้ว) จะต้องไม่ปรากฏในหน้ารายการพร้อมรับเลี้ยงสำหรับผู้ใช้ทั่วไป (`AVAILABLE`)
2. **การป้องกันการเปลี่ยนสถานะซ้ำซ้อน (Confirm Reopen):** หากสัตว์เลี้ยงมีสถานะเป็น `ADOPTED` อยู่ก่อนแล้ว และผู้ดูแลระบบต้องการเปลี่ยนสถานะกลับเป็น `AVAILABLE` จะต้องมีการยืนยัน (`confirmReopen = true`) มิฉะนั้น Backend จะไม่อนุญาตให้แก้ไข
3. **การตรวจสอบความถูกต้องของข้อมูล (Validation):**
   * ชื่อสัตว์เลี้ยงห้ามว่างและห้ามเป็นช่องว่างล้วน (Trim Whitespace ทั้งฝั่ง Frontend และ Backend)
   * อายุต้องเป็นจำนวนเต็มบวก (0 - 600 เดือน) ไม่รองรับค่าทศนิยม
   * ประเภทสัตว์เลี้ยง (`petTypeId`) ต้องมีอยู่จริงในฐานข้อมูล หากไม่พบจะตอบกลับ 400 Bad Request
4. **ขอรับเลี้ยงได้เฉพาะสัตว์ที่ยังเปิดรับ:** ส่งคำขอได้เฉพาะสัตว์สถานะ `AVAILABLE` หรือ `PENDING` ถ้าเป็น `ADOPTED` / `UNAVAILABLE` จะตอบกลับ 400
5. **อนุมัติคำขอแล้วสัตว์มีบ้านแล้ว:** เมื่อเจ้าหน้าที่อนุมัติคำขอ (`APPROVED`) สัตว์ตัวนั้นเปลี่ยนเป็น `ADOPTED` และคำขออื่นของตัวเดียวกันที่ยัง `PENDING` จะถูกเปลี่ยนเป็น `REJECTED` อัตโนมัติ (ทำใน Transaction เดียว)
6. **การบริจาค:** จำนวนเงินต้องอยู่ระหว่าง 1 - 1,000,000 บาท สถานะเริ่มต้นเป็น `PENDING` จนกว่าเจ้าหน้าที่ตรวจยอดแล้วกด "ได้รับแล้ว"
7. **ต้องเป็นสมาชิกก่อนขอรับเลี้ยง:** ผู้ใช้ต้องสมัครสมาชิก/เข้าสู่ระบบก่อนส่งคำขอ คำขอผูกกับบัญชี และติดตามสถานะได้ที่หน้า "คำขอของฉัน" (`/my-requests`) ผู้ใช้เห็นได้เฉพาะคำขอของตัวเอง
8. **ห้ามส่งคำขอซ้ำ:** บัญชีเดียวกันส่งคำขอสัตว์ตัวเดียวกันซ้ำไม่ได้ ถ้าคำขอเดิมยัง `PENDING`
9. **ยกเลิกการอนุมัติ:** ถ้าเปลี่ยนคำขอที่ `APPROVED` ไปเป็นสถานะอื่น สัตว์ตัวนั้นกลับเป็น `AVAILABLE` อัตโนมัติ (Transaction)
10. **เจ้าหน้าที่มีบัญชีของตัวเอง:** ไม่มีรหัสผ่านกลางร่วมกัน ทุก API ของเจ้าหน้าที่ตรวจสิทธิ์ `ADMIN` ที่ Backend (AdminGuard) ไม่ใช่แค่ซ่อนหน้าเว็บ
11. **บันทึกการทำงานทุกครั้ง (Audit Log):** การเพิ่ม/แก้ไข/ลบ/กู้คืน/อัปโหลดรูป/เปลี่ยนสถานะ ถูกบันทึกใน `ActivityLog` พร้อมชื่อเจ้าหน้าที่ผู้ทำ ดูย้อนหลังได้ที่ `/admin/logs`
12. **ลบ = เก็บถาวร (Soft Delete):** การลบสัตว์จะตั้งค่า `deletedAt` แทนการลบจริง สัตว์ที่ลบแล้ว/มีบ้านแล้ว/ไม่พร้อม จะไม่แสดงหน้าเว็บผู้ใช้ แต่เจ้าหน้าที่ยังค้นหา ดูประวัติคำขอ และกู้คืนได้
13. **รูปภาพ:** สัตว์ 1 ตัวมีรูปได้ไม่เกิน 10 รูป รูปละไม่เกิน 3 MB รับเฉพาะไฟล์รูปภาพ รูปแรกเป็นรูปปก
14. **การค้นหา:** ค้นได้จากชื่อ สายพันธุ์ ประเภท เพศ (เช่น "ตัวเมีย") นิสัย/คำอธิบาย และบันทึกสุขภาพ พิมพ์หลายคำได้ (ต้องตรงทุกคำ) เช่น `แมว เมีย`

---

## 🌐 รายการ REST API Endpoints (Backend)
สิทธิ์: 🌍 ทุกคน · 👤 ต้องเข้าสู่ระบบ (ส่ง `Authorization: Bearer <token>`) · 👮 เฉพาะเจ้าหน้าที่ (ADMIN)

| Method | Endpoint | สิทธิ์ | คำอธิบาย |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | 🌍 | สมัครสมาชิก `{ fullName, email, password, phone? }` → `{ token, user }` |
| `POST` | `/api/auth/login` | 🌍 | เข้าสู่ระบบ `{ email, password }` → `{ token, user }` |
| `GET` | `/api/auth/me` | 👤 | ข้อมูลบัญชีที่เข้าสู่ระบบอยู่ |
| `GET` | `/api/pets` | 🌍 | รายการสัตว์ Query: `search`, `typeId`; ผู้ใช้ทั่วไปเห็นเฉพาะ `AVAILABLE` ที่ไม่ถูกลบ; เจ้าหน้าที่ส่ง `status=ALL` และ `archived=only/include` ได้ |
| `GET` | `/api/pets/:id` | 🌍 | รายละเอียดสัตว์ (พร้อมรหัสรูป `images`) |
| `GET` | `/api/pets/:id/history` | 👮 | ประวัติย้อนหลัง: คำขอทั้งหมด + บันทึกการทำงาน |
| `POST` | `/api/pets` | 👮 | เพิ่มสัตว์ |
| `PUT` / `PATCH` | `/api/pets/:id` | 👮 | แก้ไขสัตว์ |
| `DELETE` | `/api/pets/:id` | 👮 | ลบ (เก็บถาวร) |
| `POST` | `/api/pets/:id/restore` | 👮 | กู้คืนสัตว์ที่ลบแล้ว |
| `POST` | `/api/pets/:id/images` | 👮 | อัปโหลดรูป (multipart/form-data ฟิลด์ `files` ได้หลายไฟล์) |
| `GET` | `/api/pet-images/:id` | 🌍 | ไฟล์รูปภาพ |
| `DELETE` | `/api/pet-images/:id` | 👮 | ลบรูป |
| `GET` | `/api/pet-types` | 🌍 | ประเภทสัตว์ทั้งหมด |
| `POST` | `/api/adoption-requests` | 👤 | ส่งคำขอรับเลี้ยง |
| `GET` | `/api/adoption-requests/mine` | 👤 | คำขอของฉัน + สถานะ |
| `GET` | `/api/adoption-requests` | 👮 | คำขอทั้งหมด Query: `status`, `q` (ค้นชื่อ/อีเมล/เบอร์/ชื่อสัตว์) |
| `GET` | `/api/adoption-requests/:id` | 👤 | ดูคำขอ (ผู้ใช้ดูได้เฉพาะของตัวเอง) |
| `PATCH` | `/api/adoption-requests/:id/status` | 👮 | อนุมัติ / ไม่อนุมัติ / กลับเป็นรอพิจารณา |
| `DELETE` | `/api/adoption-requests/:id` | 👮 | ลบคำขอ |
| `POST` | `/api/donations` | 🌍 | แจ้งบริจาค |
| `GET` | `/api/donations` | 👮 | รายการบริจาค Query: `status` |
| `PATCH` | `/api/donations/:id/status` | 👮 | ยืนยันรับเงิน / ยกเลิก |
| `DELETE` | `/api/donations/:id` | 👮 | ลบรายการบริจาค |
| `GET` | `/api/admins` | 👮 | รายชื่อเจ้าหน้าที่ |
| `POST` | `/api/admins` | 👮 | เพิ่มเจ้าหน้าที่ (อีเมลที่สมัครไว้แล้วจะถูกยกระดับเป็น ADMIN) |
| `DELETE` | `/api/admins/:id` | 👮 | ถอนสิทธิ์เจ้าหน้าที่ (ถอนสิทธิ์ตัวเองไม่ได้) |
| `GET` | `/api/activity-logs` | 👮 | ประวัติการทำงาน Query: `targetType`, `targetId`, `userId`, `q` |

---

## 🚀 ขั้นตอนการติดตั้งและการรันระบบ (Setup & Installation)

### 1. การติดตั้งและรันฝั่ง Backend

1.1 เข้าสู่โฟลเดอร์ Backend และติดตั้ง Dependencies:
```bash
cd backend
npm install
```

1.2 สร้างไฟล์ `backend/.env` (คัดลอกจาก `.env.example`) แล้วใส่ connection string ของ PostgreSQL และกุญแจ token:
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require"
JWT_SECRET="ข้อความยาวๆ ที่เดายาก"
```

1.3 สร้างตารางในฐานข้อมูลและใส่ข้อมูลตัวอย่าง (ประเภทสัตว์ สัตว์ตัวอย่าง และบัญชีทดสอบ):
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

1.4 รัน Backend:
```bash
npm run start:dev
```
Backend จะทำงานที่ `http://localhost:3000/api`

### 2. การติดตั้งและรันฝั่ง Frontend
เปิด Terminal ใหม่:
```bash
cd frontend
npm install
npm start
```
เปิดเว็บที่ `http://localhost:4200`

---

## 🖥️ หน้าเว็บ (Angular Routing)

| Path | สิทธิ์ | หน้า |
| :--- | :---: | :--- |
| `/` | 🌍 | รายการสัตว์ที่พร้อมรับเลี้ยง ค้นหาได้หลายช่องข้อมูล กรองประเภท/เพศ เรียงลำดับ |
| `/pets/:id` | 🌍 | รายละเอียดสัตว์ + แกลเลอรีรูป |
| `/login` , `/register` | 🌍 | เข้าสู่ระบบ (ใช้หน้าเดียวกันทั้งสมาชิกและเจ้าหน้าที่) / สมัครสมาชิก |
| `/pets/:id/adopt` | 👤 | แบบฟอร์มขอรับเลี้ยง (เติมชื่อ อีเมล เบอร์ จากบัญชีให้อัตโนมัติ) |
| `/my-requests` | 👤 | คำขอของฉัน — ติดตามสถานะ รอพิจารณา / อนุมัติแล้ว / ไม่อนุมัติ |
| `/donate` | 🌍 | ร่วมบริจาค |
| `/admin` | 👮 | จัดการสัตว์: ทุกสถานะ + แท็บเก็บถาวร ค้นหา แก้ไข ลบ กู้คืน ดูประวัติ |
| `/admin/new` , `/admin/:id/edit` | 👮 | เพิ่ม / แก้ไขสัตว์ พร้อมอัปโหลดรูปหลายรูป |
| `/admin/requests` | 👮 | คำขอรับเลี้ยง: ค้นหา อนุมัติ / ไม่อนุมัติ / ลบ |
| `/admin/donations` | 👮 | การบริจาค |
| `/admin/logs` | 👮 | ประวัติการทำงานของเจ้าหน้าที่ (ใครทำอะไร เมื่อไร) |
| `/admin/accounts` | 👮 | บัญชีเจ้าหน้าที่: เพิ่ม / ถอนสิทธิ์ |

## 🎨 ธีมและภาษา (UX/UI)
* **โหมดสว่าง / มืด:** ปุ่ม 🌙 / ☀️ บนแถบเมนู ครั้งแรกใช้ตามการตั้งค่าของเครื่อง เลือกแล้วจำไว้ในเบราว์เซอร์ (`localStorage: bpj_theme`) สีทุกหน้าอ้างตัวแปร CSS ใน `frontend/src/styles.css` (โหมดสว่างใช้สีเดิมทุกค่า)
* **ภาษาไทย / อังกฤษ:** ปุ่ม `TH / EN` บนแถบเมนู ข้อความในหน้าเว็บส่งผ่าน pipe `| t` แล้วแปลจากพจนานุกรม `frontend/src/app/i18n/en.ts` ถ้าไม่มีคำแปลจะแสดงภาษาไทยเดิม วันที่แสดงตามภาษา (ไทยเป็น พ.ศ.) และจำภาษาที่เลือกไว้ (`bpj_lang`)
* ข้อมูลที่เจ้าหน้าที่กรอกเอง (ชื่อสัตว์ คำอธิบาย) แสดงตามที่กรอก ไม่ถูกแปล
* รองรับมือถือ: แถบเมนูย่อเหลือไอคอน ปุ่มภาษา/ธีมอยู่บนแถบเมนูทุกขนาดจอ มีโฟกัสชัดเจนเมื่อใช้คีย์บอร์ด

## 🔑 บัญชีทดสอบ (สร้างโดย `npx prisma db seed`)

| บทบาท | อีเมล | รหัสผ่าน |
| :--- | :--- | :--- |
| เจ้าหน้าที่ 1 | `admin@banphakjai.com` | `admin1234` |
| เจ้าหน้าที่ 2 | `staff@banphakjai.com` | `staff1234` |
| สมาชิกทั่วไป | `user@banphakjai.com` | `user1234` |

> รหัสผ่านเก็บในฐานข้อมูลแบบ hash (scrypt + salt) ไม่เก็บรหัสจริง · token มีอายุ 7 วัน · ควรเปลี่ยนรหัสบัญชีทดสอบก่อนใช้งานจริง

## ✅ ทดสอบติดตั้งบนเครื่องใหม่ (Fresh Install Checklist)
1. ติดตั้ง Node.js 22 ขึ้นไป และมีฐานข้อมูล PostgreSQL ว่าง (ในเครื่องหรือ Neon)
2. ทำตามขั้นตอนติดตั้งด้านบน (`npm install` → `.env` → `prisma generate` → `db push` → `db seed` → `start:dev`)
3. เปิด `http://localhost:3000/api/pets` ต้องเห็นข้อมูล JSON ของสัตว์ตัวอย่าง
4. เปิด `http://localhost:4200` → สมัครสมาชิกใหม่ → ส่งคำขอรับเลี้ยง → ดูสถานะที่ "คำขอของฉัน"
5. เข้าสู่ระบบด้วย `admin@banphakjai.com` → เพิ่มสัตว์พร้อมรูป 2-3 รูป → อนุมัติคำขอ → ดู "ประวัติการทำงาน"
6. กลับไปบัญชีสมาชิก สถานะคำขอต้องเป็น "อนุมัติแล้ว" และสัตว์ตัวนั้นต้องหายจากหน้ารายการ
