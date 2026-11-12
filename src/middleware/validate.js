import { AppError } from '../utils/http.js';
export const validate = schema => (req, _res, next) => {
  const parsed = schema.safeParse({ body: req.body, params: req.params, query: req.query });
  if (!parsed.success) return next(new AppError(400, 'البيانات المرسلة غير صحيحة', 'VALIDATION_ERROR', parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message }))));
  req.validated = parsed.data; next();
};
