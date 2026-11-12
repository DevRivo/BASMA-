import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { AppError, ok, asyncHandler } from '../utils/http.js';
import { notify } from '../services/notifications.js';
const router = Router();
const include = { user: { select: { id: true, username: true, avatarUrl: true } }, _count: { select: { likes: true, comments: true } } };
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1), limit = Math.min(40, Math.max(1, Number(req.query.limit) || 20));
  const q = String(req.query.q || '').trim(), category = String(req.query.category || '').trim(), artistId = String(req.query.artistId || '').trim();
  const where = { ...(category ? { category } : {}), ...(artistId ? { userId: artistId } : {}), ...(q ? { OR: [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }, { user: { username: { contains: q, mode: 'insensitive' } } }] } : {}) };
  const [items, total] = await Promise.all([prisma.artwork.findMany({ where, include, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }), prisma.artwork.count({ where })]);
  let liked = new Set(); if (req.user && items.length) { const likes = await prisma.artworkLike.findMany({ where: { userId: req.user.id, artworkId: { in: items.map(x => x.id) } }, select: { artworkId: true } }); liked = new Set(likes.map(x => x.artworkId)); }
  ok(res, items.map(x => ({ ...x, likedByMe: liked.has(x.id) })), 200, { page, limit, total, pages: Math.ceil(total / limit) });
}));
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const d = z.object({ title: z.string().trim().min(1).max(120), description: z.string().max(2000).optional(), category: z.string().min(1).max(80), imageUrl: z.string().url() }).parse(req.body);
  const item = await prisma.artwork.create({ data: { ...d, userId: req.user.id }, include }); ok(res, item, 201);
}));
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const item = await prisma.artwork.findUnique({ where: { id: req.params.id }, include: { ...include, comments: { include: { user: { select: { id: true, username: true, avatarUrl: true } } }, orderBy: { createdAt: 'asc' }, take: 100 } } });
  if (!item) throw new AppError(404, 'العمل الفني غير موجود');
  const likedByMe = req.user ? !!(await prisma.artworkLike.findUnique({ where: { artworkId_userId: { artworkId: item.id, userId: req.user.id } } })) : false;
  ok(res, { ...item, likedByMe });
}));
router.patch('/:id', authenticate, asyncHandler(async (req, res) => {
  const item = await prisma.artwork.findUnique({ where: { id: req.params.id } }); if (!item) throw new AppError(404, 'العمل الفني غير موجود'); if (item.userId !== req.user.id) throw new AppError(403, 'غير مسموح بتعديل عمل فني لا تملكه');
  const d = z.object({ title: z.string().trim().min(1).max(120).optional(), description: z.string().max(2000).nullable().optional(), category: z.string().min(1).max(80).optional(), imageUrl: z.string().url().optional() }).strict().parse(req.body);
  ok(res, await prisma.artwork.update({ where: { id: item.id }, data: d, include }));
}));
router.delete('/:id', authenticate, asyncHandler(async (req, res) => { const item = await prisma.artwork.findUnique({ where: { id: req.params.id } }); if (!item) throw new AppError(404, 'العمل غير موجود'); if (item.userId !== req.user.id) throw new AppError(403, 'غير مسموح'); await prisma.artwork.delete({ where: { id: item.id } }); ok(res, { deleted: true }); }));
router.post('/:id/like', authenticate, asyncHandler(async (req, res) => {
  const item = await prisma.artwork.findUnique({ where: { id: req.params.id } }); if (!item) throw new AppError(404, 'العمل غير موجود');
  const existing = await prisma.artworkLike.findUnique({ where: { artworkId_userId: { artworkId: item.id, userId: req.user.id } } });
  if (existing) { await prisma.artworkLike.delete({ where: { id: existing.id } }); return ok(res, { liked: false }); }
  await prisma.artworkLike.create({ data: { artworkId: item.id, userId: req.user.id } });
  const actor = await prisma.user.findUnique({ where: { id: req.user.id }, select: { username: true } });
  await notify(item.userId, 'ARTWORK_LIKE', 'إعجاب جديد', `${actor.username} أعجب بعملك الفني`, req.user.id, { artworkId: item.id }, req.app.get('io'));
  ok(res, { liked: true });
}));
router.post('/:id/comments', authenticate, asyncHandler(async (req, res) => {
  const { content } = z.object({ content: z.string().trim().min(1).max(1000) }).parse(req.body); const item = await prisma.artwork.findUnique({ where: { id: req.params.id } }); if (!item) throw new AppError(404, 'العمل غير موجود');
  const comment = await prisma.artworkComment.create({ data: { artworkId: item.id, userId: req.user.id, content }, include: { user: { select: { id: true, username: true, avatarUrl: true } } } });
  const actor = comment.user; await notify(item.userId, 'ARTWORK_COMMENT', 'تعليق جديد', `${actor.username}: ${content.slice(0, 120)}`, req.user.id, { artworkId: item.id, commentId: comment.id }, req.app.get('io')); ok(res, comment, 201);
}));
router.delete('/:id/comments/:commentId', authenticate, asyncHandler(async (req, res) => { const c = await prisma.artworkComment.findUnique({ where: { id: req.params.commentId } }); if (!c || c.artworkId !== req.params.id) throw new AppError(404, 'التعليق غير موجود'); if (c.userId !== req.user.id) throw new AppError(403, 'غير مسموح'); await prisma.artworkComment.delete({ where: { id: c.id } }); ok(res, { deleted: true }); }));
export default router;
