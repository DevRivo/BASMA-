import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { AppError, ok, asyncHandler } from '../utils/http.js';
const router = Router();
const selectPublic = { id: true, username: true, bio: true, avatarUrl: true, coverUrl: true, createdAt: true };
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim(); const page = Math.max(1, Number(req.query.page) || 1); const limit = Math.min(40, Math.max(1, Number(req.query.limit) || 20));
  const where = q ? { OR: [{ username: { contains: q, mode: 'insensitive' } }, { bio: { contains: q, mode: 'insensitive' } }] } : {};
  const [users, total] = await Promise.all([prisma.user.findMany({ where, select: selectPublic, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }), prisma.user.count({ where })]);
  ok(res, users, 200, { page, limit, total, pages: Math.ceil(total / limit) });
}));
router.get('/:id', asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: { ...selectPublic, _count: { select: { artworks: true, followers: true, following: true, communityMemberships: true } }, artworks: { take: 12, orderBy: { createdAt: 'desc' }, include: { _count: { select: { likes: true, comments: true } } } } } });
  if (!user) throw new AppError(404, 'المستخدم غير موجود');
  const friends = await prisma.friendship.count({ where: { status: 'ACCEPTED', OR: [{ requesterId: user.id }, { addresseeId: user.id }] } });
  ok(res, { ...user, stats: { ...user._count, friends } });
}));
router.patch('/me', authenticate, asyncHandler(async (req, res) => {
  const d = z.object({ username: z.string().trim().min(3).max(30).optional(), bio: z.string().max(500).nullable().optional(), avatarUrl: z.string().url().nullable().optional(), coverUrl: z.string().url().nullable().optional() }).strict().parse(req.body);
  const user = await prisma.user.update({ where: { id: req.user.id }, data: d, select: selectPublic }); ok(res, user);
}));
export default router;
