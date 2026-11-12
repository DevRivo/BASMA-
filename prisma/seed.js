import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const cats = ['الأكريليك','الألوان المائية','الباستيل','البورتريه','التصميم','الحبر','الخط العربي','الرسم الرقمي','الرسم بالرصاص','الرسم الكرتوني','الرسم الواقعي','الرسم الزيتي','الطبيعة الصامتة','الفحم','الفن التجريدي','الفن الهندسي','الفن السريالي','الفن ثلاثي الأبعاد','فن البكسل','فن الاسكتش','الجرافيتي','الكولاج','الماندالا','الأنمي والمانجا','المناظر الطبيعية','النحت','التصوير'];
try {
 const passwordHash = await bcrypt.hash('ChangeMe123!', 12);
 const owner = await prisma.user.upsert({ where: { email: 'admin@basma.local' }, update: {}, create: { email: 'admin@basma.local', username: 'basma_admin', passwordHash, bio: 'حساب إدارة تجريبي — غيّر كلمة المرور فورًا.' } });
 for (const category of cats) { /* categories are intentionally served as a shared static endpoint */ void category; }
 console.log(`Seed complete. Admin account: ${owner.email} / ChangeMe123! (change immediately)`);
} finally { await prisma.$disconnect(); }
