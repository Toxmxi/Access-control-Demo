# SKP Performance Tracker

เว็บ React สำหรับติดตามมติ/ข้อสั่งการ ปัญหาและงบประมาณ แผนงาน และพื้นที่รับผิดชอบ ข้อมูลการทำงานจัดเก็บร่วมกันใน Supabase และเข้าใช้งานด้วย Supabase Auth โดยให้บริการหน้าเว็บผ่าน Vercel

## โครงสร้าง Component

- `src/User.jsx` จัดการการเข้าสู่ระบบและสถานะผู้ใช้
- `src/App.jsx` เก็บ state และการทำงานหลัก แล้วประกอบ Component ของหน้า
- `src/components/AppHeader.jsx` แสดงชื่อระบบ เมนูนำทาง และปุ่มทำงานหลัก
- `src/components/PageHeading.jsx` แสดงชื่อและคำอธิบายของหน้าปัจจุบัน
- `src/components/AppFooter.jsx` แสดงข้อมูลระบบและสถานะการจัดเก็บข้อมูล
- `src/components/TrackerSections.jsx` แยกหน้าจอภาพรวม ปัญหา แผนงาน อาคาร และตารางงาน
- `src/components/HamburgerMenu.jsx` แยกปุ่ม Hamburger ออกจากลิงก์นำทาง และแสดงบัญชีผู้ใช้/ออกจากระบบ
- `src/components/PageNavigation.jsx` แสดงลิงก์นำทางแยกตามหน้า
- `src/components/EditorDialogs.jsx` แยกฟอร์มเพิ่ม/แก้ไขรายการ
- `src/components/ReportChart.jsx` แสดงกราฟสรุปงาน
- `src/components/Common.jsx` รวม UI ที่นำกลับมาใช้ซ้ำ เช่น ปุ่ม การ์ด และช่องกรอก
- `src/constants.js` รวมสถานะ หมวดงาน และสี
- `src/utils.js` รวมฟังก์ชันจัดรูปแบบ ส่งออก CSV และบันทึกข้อมูล
- `src/supabase.js` สร้าง Supabase client จาก environment variables
- `supabase/schema.sql` สร้างตารางข้อมูลและ Row Level Security (RLS)

## ตั้งค่า Supabase

1. สร้าง Supabase project ที่สำนักงานอนุมัติให้ใช้
2. เปิด SQL Editor แล้วรัน `supabase/schema.sql` เพื่อสร้างตารางและ RLS policies
3. ใน Authentication settings ปิด public sign-ups และเชิญผู้ใช้จากฝ่ายจัดการบัญชีเท่านั้น
4. หลัง Deploy ให้เพิ่มโดเมน Vercel จริงใน Site URL และ Redirect URLs ของ Supabase Auth
5. คัดลอก `.env.example` เป็น `.env.local` แล้วใส่ Project URL และ anon/publishable key จาก Supabase
6. เพิ่ม environment variables ชุดเดียวกันในหน้า Settings ของผู้ให้บริการ Build ก่อน deploy

บัญชีผู้ใช้และรหัสผ่านจัดการโดย Supabase Auth ไม่มีการเก็บรหัสผ่านไว้ในไฟล์ของเว็บ ห้ามใช้ `service_role` key ในเว็บหรือใส่ลงในตัวแปรที่ขึ้นต้นด้วย `VITE_` เพราะค่ากลุ่มนี้จะถูกส่งไปยังเบราว์เซอร์

ผู้ใช้ที่ได้รับเชิญทุกคนสามารถดูและแก้ไขข้อมูลสำนักงานทั้งหมดได้ การอนุญาตแยกตามบทบาทหรือผู้ใช้ยังไม่ได้ตั้งค่า

ฐานข้อมูลใหม่จะเริ่มว่าง ข้อมูลใน `src/data.json` จะไม่ถูกนำเข้าให้อัตโนมัติ หากมีข้อมูลอยู่ใน Supabase project เดิม ให้ใช้ project เดิมเพื่อรักษาข้อมูล หรือส่งออก/นำเข้าข้อมูลอย่างระมัดระวังก่อนเปลี่ยน project

## Run locally

```bash
npm install
npm run dev
```

สร้าง `.env.local` ก่อนเริ่มเว็บ หากยังไม่ตั้งค่า Supabase เว็บจะแสดงคำแนะนำแทนหน้า Login

### ทดลองหน้าเว็บโดยไม่เชื่อม Supabase

รันคำสั่ง `npm run dev:demo` เพื่อเข้าโหมดทดลองโดยไม่ต้องตั้งค่า Supabase โหมดนี้ข้าม Login และบันทึกข้อมูลเฉพาะในเบราว์เซอร์เครื่องปัจจุบัน ไม่ได้ส่งข้อมูลไป Supabase และไม่ควรเปิดใช้กับเว็บ Production

## Deploy

- Build command: `npm run build`
- Output directory: `dist`
- ตั้งค่า `VITE_SUPABASE_URL` และ `VITE_SUPABASE_ANON_KEY` ก่อน Build
- Deploy ขึ้น Vercel ด้วย `vercel.cmd deploy --prod`
- ใช้ HTTPS และตรวจสอบ Site URL/Redirect URLs ใน Supabase Auth ให้ตรงกับโดเมนจริง
