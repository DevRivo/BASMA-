import { verifyAccess } from '../utils/tokens.js';
import { AppError, asyncHandler } from '../utils/http.js';
export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  const token = req.cookies?.basma_access || (header?.startsWith('Bearer ') ? header.slice(7) : null);
  if (!token) throw new AppError(401, 'يجب تسجيل الدخول أولًا', 'UNAUTHENTICATED');
  try { const payload = verifyAccess(token); if (payload.type !== 'access') throw new Error(); req.user = { id: payload.sub }; next(); }
  catch { throw new AppError(401, 'جلسة الدخول غير صالحة أو انتهت', 'INVALID_TOKEN'); }
});
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.basma_access || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);
  if (token) { try { const p = verifyAccess(token); if (p.type === 'access') req.user = { id: p.sub }; } catch {} }
  next();
});
