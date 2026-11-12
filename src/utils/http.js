export class AppError extends Error {
  constructor(status, message, code = 'REQUEST_ERROR', details) { super(message); this.status = status; this.code = code; this.details = details; }
}
export const ok = (res, data, status = 200, meta) => res.status(status).json({ success: true, data, ...(meta ? { meta } : {}) });
export const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
export const pageArgs = (query) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(query.limit, 10) || 20));
  return { skip: (page - 1) * limit, take: limit, page, limit };
};
