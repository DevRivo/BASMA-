import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { AppError, ok, asyncHandler } from '../utils/http.js';
import { notify } from '../services/notifications.js';
const router = Router();
router.use(authenticate);
router.post('/friend-requests/:userId', asyncHandler(async (req, res) => {
  const target = req.params.userId; if (target === req.user.id) throw new AppError(400, 'لا يمكنك إرسال طلب صداقة لنفسك');
  if (!await prisma.user.findUnique({ where: { id: target } })) throw new AppError(404, 'المستخدم غير موجود');
  const old = await prisma.friendship.findFirst({ where: { OR: [{ requesterId: req.user.id, addresseeId: target }, { requesterId: target, addresseeId: req.user.id }] } });
  if (old) throw new AppError(409, old.status === 'ACCEPTED' ? 'أنتم أصدقاء بالفعل' : 'يوجد طلب صداقة سابق بينكما', 'FRIENDSHIP_EXISTS');
  const row = await prisma.friendship.create({ data: { requesterId: req.user.id, addresseeId: target } });
  const actor = await prisma.user.findUnique({ where: { id: req.user.id }, select: { username: true } }); await notify(target, 'FRIEND_REQUEST', 'طلب صداقة جديد', `${actor.username} أرسل إليك طلب صداقة`, req.user.id, { friendshipId: row.id }, req.app.get('io'));
  ok(res, row, 201);
}));
router.get('/friend-requests', asyncHandler(async (req, res) => { const rows = await prisma.friendship.findMany({ where: { OR: [{ requesterId: req.user.id }, { addresseeId: req.user.id }] }, include: { requester: { select: { id: true, username: true, avatarUrl: true } }, addressee: { select: { id: true, username: true, avatarUrl: true } } }, orderBy: { createdAt: 'desc' } }); ok(res, rows); }));
router.patch('/friend-requests/:id', asyncHandler(async (req, res) => {
  const { action } = req.body; if (!['accept', 'reject', 'cancel'].includes(action)) throw new AppError(400, 'الإجراء غير صالح');
  const f = await prisma.friendship.findUnique({ where: { id: req.params.id } }); if (!f) throw new AppError(404, 'الطلب غير موجود');
  if (action === 'cancel') { if (f.requesterId !== req.user.id || f.status !== 'PENDING') throw new AppError(403, 'لا يمكنك إلغاء هذا الطلب'); await prisma.friendship.delete({ where: { id: f.id } }); return ok(res, { cancelled: true }); }
  if (f.addresseeId !== req.user.id || f.status !== 'PENDING') throw new AppError(403, 'لا يمكنك معالجة هذا الطلب');
  const updated = await prisma.friendship.update({ where: { id: f.id }, data: { status: action === 'accept' ? 'ACCEPTED' : 'REJECTED' } });
  if (action === 'accept') { const actor = await prisma.user.findUnique({ where: { id: req.user.id }, select: { username: true } }); await notify(f.requesterId, 'FRIEND_REQUEST_ACCEPTED', 'تم قبول طلب الصداقة', `${actor.username} قبل طلب صداقتك`, req.user.id, { friendshipId: f.id }, req.app.get('io')); }
  ok(res, updated);
}));
router.delete('/friends/:userId', asyncHandler(async (req, res) => { const f = await prisma.friendship.findFirst({ where: { status: 'ACCEPTED', OR: [{ requesterId: req.user.id, addresseeId: req.params.userId }, { requesterId: req.params.userId, addresseeId: req.user.id }] } }); if (!f) throw new AppError(404, 'الصداقة غير موجودة'); await prisma.friendship.delete({ where: { id: f.id } }); ok(res, { removed: true }); }));
router.get('/friends', asyncHandler(async (req, res) => { const rows = await prisma.friendship.findMany({ where: { status: 'ACCEPTED', OR: [{ requesterId: req.user.id }, { addresseeId: req.user.id }] }, include: { requester: { select: { id: true, username: true, avatarUrl: true } }, addressee: { select: { id: true, username: true, avatarUrl: true } } } }); ok(res, rows.map(f => f.requesterId === req.user.id ? f.addressee : f.requester)); }));
router.post('/follows/:userId', asyncHandler(async (req, res) => { const id = req.params.userId; if (id === req.user.id) throw new AppError(400, 'لا يمكنك متابعة نفسك'); if (!await prisma.user.findUnique({ where: { id } })) throw new AppError(404, 'المستخدم غير موجود'); const row = await prisma.follow.create({ data: { followerId: req.user.id, followingId: id } }); ok(res, row, 201); }));
router.delete('/follows/:userId', asyncHandler(async (req, res) => { const row = await prisma.follow.findUnique({ where: { followerId_followingId: { followerId: req.user.id, followingId: req.params.userId } } }); if (!row) throw new AppError(404, 'المتابعة غير موجودة'); await prisma.follow.delete({ where: { id: row.id } }); ok(res, { following: false }); }));
router.get('/follows/:userId', asyncHandler(async (req, res) => { const [followers, following] = await Promise.all([prisma.follow.count({ where: { followingId: req.params.userId } }), prisma.follow.count({ where: { followerId: req.params.userId } })]); ok(res, { followers, following }); }));
export default router;
