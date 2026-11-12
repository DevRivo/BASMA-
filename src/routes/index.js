import { Router } from 'express';
import auth from './auth.js'; import users from './users.js'; import artworks from './artworks.js'; import social from './social.js'; import communities from './communities.js'; import chat from './chat.js'; import notifications from './notifications.js'; import uploads from './uploads.js';
const router = Router();
router.use('/auth', auth); router.use('/users', users); router.use('/artworks', artworks); router.use('/', social); router.use('/communities', communities); router.use('/', chat); router.use('/notifications', notifications); router.use('/uploads', uploads);
const categories = ['الأكريليك','الألوان المائية','الباستيل','البورتريه','التصميم','الحبر','الخط العربي','الرسم الرقمي','الرسم بالرصاص','الرسم الكرتوني','الرسم الواقعي','الرسم الزيتي','الطبيعة الصامتة','الفحم','الفن التجريدي','الفن الهندسي','الفن السريالي','الفن ثلاثي الأبعاد','فن البكسل','فن الاسكتش','الجرافيتي','الكولاج','الماندالا','الأنمي والمانجا','المناظر الطبيعية','النحت','التصوير'];
router.get('/categories', (_req, res) => res.json({ success: true, data: categories }));
export default router;
