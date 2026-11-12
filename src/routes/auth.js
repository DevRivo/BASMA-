import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { AppError, ok, asyncHandler } from '../utils/http.js';
import { signAccess, signRefresh, hashToken, verifyRefresh } from '../utils/tokens.js';
import { authenticate } from '../middleware/auth.js';
const router = Router();
const cookieOptions = (maxAge) => ({ httpOnly: true, secure: process.env.COOKIE_SECURE === 'true', sameSite: process.env.COOKIE_SAME_SITE || 'lax', path: '/', maxAge });
const publicUser = ({ passwordHash, refreshTokenHash, ...u }) => u;
function setTokens(res, user) {
  const access = signAccess(user), refresh = signRefresh(user);
  res.cookie('basma_access', access, cookieOptions(15 * 60 * 1000));
  res.cookie('basma_refresh', refresh, cookieOptions(7 * 24 * 60 * 60 * 1000));
  return { accessToken: access, refreshToken: refresh };
}
router.post('/register', asyncHandler(async (req, res) => {
  const data = z.object({ email: z.string().email().max(254), username: z.string().trim().min(3).max(30).regex(/^[\p{L}\p{N}_.-]+$/u), password: z.string().min(8).max(72), bio: z.string().max(500).optional() }).parse(req.body);
  const email = data.email.toLowerCase();
  if (await prisma.user.findFirst({ where: { OR: [{ email }, { username: data.username }] } })) throw new AppError(409, 'البريد الإلكتروني أو اسم المستخدم مستخدم بالفعل', 'ACCOUNT_EXISTS');
  const passwordHash = await bcrypt.hash(data.password, Number(process.env.BCRYPT_ROUNDS) || 12);
  const user = await prisma.user.create({ data: { email, username: data.username, passwordHash, bio: data.bio } });
  const tokens = setTokens(res, user); await prisma.user.update({ where: { id: user.id }, data: { refreshTokenHash: hashToken(tokens.refreshToken) } });
  ok(res, { user: publicUser(user), ...tokens }, 201);
}));
router.post('/login', asyncHandler(async (req, res) => {
  const data = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) throw new AppError(401, 'البريد الإلكتروني أو كلمة المرور غير صحيحة', 'INVALID_CREDENTIALS');
  const tokens = setTokens(res, user); await prisma.user.update({ where: { id: user.id }, data: { refreshTokenHash: hashToken(tokens.refreshToken) } });
  ok(res, { user: publicUser(user), ...tokens });
}));
router.post('/refresh', asyncHandler(async (req, res) => {
  const token = req.cookies?.basma_refresh || req.body?.refreshToken;
  if (!token) throw new AppError(401, 'رمز التجديد غير موجود', 'NO_REFRESH_TOKEN');
  let payload; try { payload = verifyRefresh(token); } catch { throw new AppError(401, 'رمز التجديد غير صالح', 'INVALID_REFRESH_TOKEN'); }
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user?.refreshTokenHash || user.refreshTokenHash !== hashToken(token)) throw new AppError(401, 'انتهت صلاحية الجلسة', 'REFRESH_REVOKED');
  const tokens = setTokens(res, user); await prisma.user.update({ where: { id: user.id }, data: { refreshTokenHash: hashToken(tokens.refreshToken) } });
  ok(res, tokens);
}));
router.post('/logout', asyncHandler(async (req, res) => {
  const token = req.cookies?.basma_refresh || req.body?.refreshToken;
  if (token) { try { const p = verifyRefresh(token); await prisma.user.updateMany({ where: { id: p.sub }, data: { refreshTokenHash: null } }); } catch {} }
  res.clearCookie('basma_access', cookieOptions(0)); res.clearCookie('basma_refresh', cookieOptions(0)); ok(res, { message: 'تم تسجيل الخروج' });
}));
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { id: true, email: true, username: true, bio: true, avatarUrl: true, coverUrl: true, isEmailVerified: true, createdAt: true } });
  ok(res, { user });
}));
router.patch('/password', authenticate, asyncHandler(async (req, res) => {
  const d = z.object({ currentPassword: z.string(), newPassword: z.string().min(8).max(72) }).parse(req.body);
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!await bcrypt.compare(d.currentPassword, user.passwordHash)) throw new AppError(400, 'كلمة المرور الحالية غير صحيحة');
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(d.newPassword, 12), refreshTokenHash: null } });
  res.clearCookie('basma_access'); res.clearCookie('basma_refresh'); ok(res, { message: 'تم تحديث كلمة المرور. سجّل الدخول مرة أخرى.' });
}));
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = z.object({ email: z.string().email() }).parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  // A production email provider should deliver this single-use token; do not expose account existence.
  let developmentToken;
  if (user) { const token = crypto.randomBytes(32).toString('hex'); await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 30 * 60 * 1000) } });
    if (process.env.NODE_ENV !== 'production') developmentToken = token; }
  ok(res, { message: 'إذا كان البريد مسجلًا، ستصلك تعليمات استعادة كلمة المرور عند إعداد مزود البريد.', ...(developmentToken ? { developmentToken } : {}) });
}));
router.post('/reset-password', asyncHandler(async (req, res) => {
  const d = z.object({ token: z.string().min(32), newPassword: z.string().min(8).max(72) }).parse(req.body);
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(d.token) } });
  if (!record || record.usedAt || record.expiresAt < new Date()) throw new AppError(400, 'رابط استعادة كلمة المرور غير صالح أو انتهت صلاحيته', 'RESET_TOKEN_INVALID');
  await prisma.$transaction([prisma.user.update({ where: { id: record.userId }, data: { passwordHash: await bcrypt.hash(d.newPassword, 12), refreshTokenHash: null } }), prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } })]);
  ok(res, { message: 'تم تغيير كلمة المرور بنجاح' });
}));
router.post('/resend-verification', authenticate, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (user.isEmailVerified) return ok(res, { message: 'البريد الإلكتروني موثّق بالفعل' });
  const token = crypto.randomBytes(32).toString('hex');
  await prisma.emailVerificationToken.create({ data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
  ok(res, { message: 'تم إنشاء رابط التحقق. يلزم إعداد مزود البريد لإرساله.', ...(process.env.NODE_ENV !== 'production' ? { developmentToken: token } : {}) });
}));
router.post('/verify-email', asyncHandler(async (req, res) => {
  const { token } = z.object({ token: z.string().min(32) }).parse(req.body);
  const record = await prisma.emailVerificationToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!record || record.usedAt || record.expiresAt < new Date()) throw new AppError(400, 'رابط التحقق غير صالح أو انتهت صلاحيته');
  await prisma.$transaction([prisma.user.update({ where: { id: record.userId }, data: { isEmailVerified: true } }), prisma.emailVerificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } })]);
  ok(res, { verified: true });
}));
router.get('/oauth/:provider', asyncHandler(async (req, res) => {
  if (!['google', 'facebook'].includes(req.params.provider)) throw new AppError(404, 'مزود OAuth غير مدعوم');
  throw new AppError(501, `تسجيل الدخول عبر ${req.params.provider} يحتاج إعداد مفاتيح OAuth وRedirect URL أولًا`, 'OAUTH_NOT_CONFIGURED');
}));
export default router;
