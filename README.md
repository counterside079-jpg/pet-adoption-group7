# Pet Adoption System (ระบบจัดการและรับเลี้ยงสัตว์เลี้ยง)

โครงงานพัฒนาเว็บแอปพลิเคชันแบบ Full-Stack เพื่อจัดการข้อมูลสัตว์เลี้ยงและสนับสนุนกระบวนการรับเลี้ยงสัตว์

---

## 👥 รายชื่อสมาชิกในกลุ่ม

| ลำดับ | รหัสนักศึกษา | ชื่อ - นามสกุล | บทบาทหน้าที่ |
| :---: | :---: | :--- | :--- |
| 1 | 67118729 | วรมันต์ ชูช่วย | **UX/UI & Frontend:** ออกแบบประสบการณ์ผู้ใช้และหน้าตาเว็บ และพัฒนาหน้าเว็บในช่วงแรกของโครงงาน |
| 2 | 67108027 | สิทธิชัย ชูแก้ว | **System Concept & Presentation:** วางแนวคิดและขอบเขตของระบบ และจัดทำสไลด์นำเสนอ  |
| 3 | 67105601 | พรรษกร นวนดำ | **Development, Deployment & Documentation:** แก้ไขและพัฒนาเว็บเพิ่มเติม นำระบบขึ้นใช้งานออนไลน์ และจัดทำรายงาน |
| 4 | 67120782 | วิทย์ธวัช คงเทพ | **UX/UI Design & Presentation:** ออกแบบ UX/UI ของระบบ และจัดทำสไลด์นำเสนอ|

---

## 🎯 วัตถุประสงค์ของโครงงาน
1. เพื่อประยุกต์ใช้ความรู้ด้านการพัฒนาเว็บแบบ Full-Stack เชื่อมโยงการทำงานตั้งแต่ Frontend -> Backend -> Database
2. เพื่อพัฒนาระบบศูนย์กลางในการจัดการข้อมูลสัตว์เลี้ยง (เพิ่ม, ค้นหา, ดูรายละเอียด, แก้ไข, ลบข้อมูล)
3. เพื่อสนับสนุนกระบวนการรับเลี้ยงสัตว์เลี้ยงอย่างเป็นระบบ โดยมี Business Rules ควบคุมสถานะความพร้อมในการรับเลี้ยง
4. เพื่อรองรับการใช้งานที่สะดวกและตอบสนองต่อขนาดหน้าจอทั้งบนคอมพิวเตอร์และโทรศัพท์มือถือ (Responsive Web Design)

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)
* **Frontend:** Angular, TypeScript, Reactive Forms, HTML Inline Styles (CSS)
* **Backend:** NestJS (Node.js Framework), TypeScript, Class-Validator, Class-Transformer
* **Database & ORM:** PostgreSQL, Prisma ORM (v6.19.0)
* **Architecture:** RESTful API Architecture

---

## 🗄️ โครงสร้างฐานข้อมูล (Database Structure)
ระบบใช้ฐานข้อมูล PostgreSQL และสร้างโมเดลความสัมพันธ์แบบ **One-to-Many (1:N)** ผ่าน Prisma ORM:

* **PetType (ประเภทสัตว์เลี้ยง):** เก็บหมวดหมู่ เช่น สุนัข, แมว, กระต่าย
  * `id` (Int, Primary Key, Auto Increment)
  * `name` (String, Unique)
  * `pets` (Relation: One-to-Many ไปยัง Pet)

* **Pet (สัตว์เลี้ยง):** เก็บข้อมูลรายละเอียดของสัตว์เลี้ยงแต่ละตัว
  * `id` (Int, Primary Key, Auto Increment)
  * `name` (String, Required)
  * `petTypeId` (Int, Foreign Key ชี้ไปที่ PetType)
  * `gender` (String: `MALE`, `FEMALE`, `UNKNOWN`)
  * `ageMonths` (Int, อายุเป็นจำนวนเต็มเดือน 0 - 600)
  * `weightKg` (Float, น้ำหนัก)
  * `breed` (String, สายพันธุ์)
  * `status` (String: `AVAILABLE`, `PENDING`, `ADOPTED`, `UNAVAILABLE`)
  * `healthNote` (String, ข้อมูลสุขภาพ/วัคซีน)
  * `description` (String, ข้อมูลนิสัย/ประวัติ)
  * `imageUrl` (String, URL รูปภาพ)
  * `arrivedDate` (DateTime, วันที่รับเข้ามา)
  * `adoptionRequests` (Relation: One-to-Many ไปยัง AdoptionRequest)

* **AdoptionRequest (คำขอรับเลี้ยง):** แบบฟอร์มที่ผู้ใช้ส่งจากหน้า `/pets/:id/adopt` (Pet 1 ตัว มีได้หลายคำขอ)
  * `id` (Int, Primary Key), `petId` (Int, Foreign Key ชี้ไปที่ Pet, ลบสัตว์แล้วคำขอถูกลบตาม)
  * `firstName`, `lastName`, `email`, `phone`, `city`, `postalCode`, `country`, `adoptionReason` (String, บังคับกรอก)
  * `prefix`, `address`, `socialContact`, `householdMembers`, `otherPets`, `housingDetails`, `occupationAndHours` ฯลฯ (String, ไม่บังคับ)
  * `status` (String: `PENDING`, `APPROVED`, `REJECTED`), `createdAt`

* **Donation (การบริจาค):** การแจ้งความประสงค์บริจาคจากหน้า `/donate` (ไม่ได้ตัดเงินจริง)
  * `id` (Int, Primary Key), `donorName` (String, บังคับ), `email`, `phone`, `message` (String, ไม่บังคับ)
  * `amount` (Float, 1 - 1,000,000 บาท), `method` (String: `TRANSFER`, `PROMPTPAY`, `CASH`)
  * `status` (String: `PENDING`, `RECEIVED`, `CANCELLED`), `createdAt`

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

---

## 🌐 รายการ REST API Endpoints (Backend)

| Method | Endpoint | คำอธิบาย | พารามิเตอร์ / Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/pets` | ดึงรายการสัตว์เลี้ยงทั้งหมด | Query: `search`, `typeId`, `status` (ค่าเริ่มต้นแสดงเฉพาะ `AVAILABLE`, ส่ง `ALL` เพื่อดูทุกสถานะ) |
| `GET` | `/api/pets/:id` | ดึงรายละเอียดสัตว์เลี้ยงตาม ID | Path: `id` |
| `POST` | `/api/pets` | เพิ่มข้อมูลสัตว์เลี้ยงใหม่ | Body: `CreatePetDto` (JSON) |
| `PUT` / `PATCH` | `/api/pets/:id` | แก้ไขข้อมูลสัตว์เลี้ยง (Frontend ใช้ PUT) | Path: `id`, Body: `UpdatePetDto` (JSON) |
| `DELETE` | `/api/pets/:id` | ลบข้อมูลสัตว์เลี้ยงตาม ID | Path: `id` |
| `GET` | `/api/pet-types` | ดึงรายการประเภทสัตว์เลี้ยงทั้งหมด | สำหรับแสดงผลใน Dropdown |
| `POST` | `/api/adoption-requests` | ส่งแบบฟอร์มขอรับเลี้ยง | Body: `CreateAdoptionRequestDto` (JSON) |
| `GET` | `/api/adoption-requests` | ดึงคำขอรับเลี้ยงทั้งหมด (หน้า Admin) | Query: `status` (`PENDING`, `APPROVED`, `REJECTED`, `ALL`) |
| `PATCH` | `/api/adoption-requests/:id/status` | เปลี่ยนสถานะคำขอ (อนุมัติ / ไม่อนุมัติ) | Body: `{ "status": "APPROVED" }` |
| `DELETE` | `/api/adoption-requests/:id` | ลบคำขอ | Path: `id` |
| `POST` | `/api/donations` | แจ้งความประสงค์บริจาค | Body: `CreateDonationDto` (JSON) |
| `GET` | `/api/donations` | ดึงรายการบริจาค (หน้า Admin) | Query: `status` |
| `PATCH` | `/api/donations/:id/status` | ยืนยันรับเงิน / ยกเลิก | Body: `{ "status": "RECEIVED" }` |
| `DELETE` | `/api/donations/:id` | ลบรายการบริจาค | Path: `id` |

---

## 🚀 ขั้นตอนการติดตั้งและการรันระบบ (Setup & Installation)

### 1. การติดตั้งและรันฝั่ง Backend

1.1 เข้าสู่โฟลเดอร์ Backend และติดตั้ง Dependencies:
```bash
cd backend
npm install
```

1.2 สร้างไฟล์ `backend/.env` (ดูตัวอย่างใน `.env.example`) แล้วใส่ connection string ของ PostgreSQL:
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require"
```

1.3 สร้างตารางในฐานข้อมูลและใส่ข้อมูลตัวอย่าง:
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

| Path | หน้า |
| :--- | :--- |
| `/` | List Page — รายการสัตว์ที่พร้อมรับเลี้ยง พร้อมค้นหา กรองประเภท/เพศ และเรียงลำดับ |
| `/pets/:id` | Detail Page — รายละเอียดสัตว์เลี้ยง |
| `/pets/:id/adopt` | หน้าแบบฟอร์มขอรับเลี้ยง — บันทึกคำขอลงฐานข้อมูล |
| `/donate` | หน้าร่วมบริจาค — แจ้งความประสงค์บริจาค |
| `/admin` | หน้าจัดการ — แสดงทุกสถานะ พร้อมกรองสถานะ แก้ไข และลบ |
| `/admin/new` | Add Page — เพิ่มสัตว์เลี้ยง |
| `/admin/requests` | คำขอรับเลี้ยง — ดูแบบฟอร์ม อนุมัติ / ไม่อนุมัติ / ลบ |
| `/admin/donations` | การบริจาค — ดูยอดรวม ยืนยันรับเงิน / ยกเลิก / ลบ |
| `/admin/:id/edit` | Edit Page — แก้ไขสัตว์เลี้ยง |

## หน้าเจ้าหน้าที่ (Admin)
หน้า /admin, /admin/new, /admin/:id/edit, /admin/requests และ /admin/donations ต้องกรอกรหัสผ่านก่อนเข้า
รหัสผ่าน: admin1234