import { AppError } from '../utils/http.js';
export function notFound(_req, _res, next) { next(new AppError(404, 'المسار غير موجود', 'NOT_FOUND')); }
export function errorHandler(err, _req, res, _next) {
  if (err?.name === 'ZodError') return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'البيانات المرسلة غير صحيحة', details: err.issues?.map(i => ({ path: i.path.join('.'), message: i.message })) } });
  if (err?.name === 'MulterError') return res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ success: false, error: { code: err.code, message: err.code === 'LIMIT_FILE_SIZE' ? 'حجم الصورة أكبر من الحد المسموح' : 'تعذر معالجة الملف المرفوع' } });
  if (err?.code === 'P2002') return res.status(409).json({ success: false, error: { code: 'DUPLICATE', message: 'هذا السجل موجود بالفعل' } });
  if (err?.code === 'P2025') return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'العنصر المطلوب غير موجود' } });
  const status = err instanceof AppError ? err.status : 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ success: false, error: { code: err.code || 'INTERNAL_ERROR', message: status >= 500 ? 'حدث خطأ داخلي في الخادم' : err.message, ...(err.details ? { details: err.details } : {}) } });
}
