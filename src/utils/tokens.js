import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
export const signAccess = user => jwt.sign({ sub: user.id, type: 'access' }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.ACCESS_TOKEN_TTL || '15m' });
export const signRefresh = user => jwt.sign({ sub: user.id, type: 'refresh', jti: crypto.randomUUID() }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_TOKEN_TTL || '7d' });
export const hashToken = hash;
export const verifyAccess = token => jwt.verify(token, process.env.JWT_ACCESS_SECRET);
export const verifyRefresh = token => jwt.verify(token, process.env.JWT_REFRESH_SECRET);
