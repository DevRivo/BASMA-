import 'dotenv/config';
import http from 'node:http';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import app from './app.js';
import { prisma } from './config/prisma.js';
for (const key of ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET']) {
  if (!process.env[key] || process.env[key].length < (key.startsWith('JWT_') ? 32 : 1)) throw new Error(`Missing or weak required environment variable: ${key}`);
}
const server = http.createServer(app);
const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:8000,http://127.0.0.1:8000').split(',').map(x => x.trim());
const io = new Server(server, { cors: { origin: origins, credentials: true }, maxHttpBufferSize: 1e6 });
app.set('io', io);
function parseCookies(raw = '') { return Object.fromEntries(raw.split(';').map(x => x.trim()).filter(Boolean).map(x => { const i = x.indexOf('='); return [x.slice(0, i), decodeURIComponent(x.slice(i + 1))]; })); }
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token || parseCookies(socket.handshake.headers.cookie).basma_access;
    if (!token) return next(new Error('UNAUTHENTICATED'));
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    if (payload.type !== 'access') return next(new Error('INVALID_TOKEN'));
    socket.userId = payload.sub; next();
  } catch { next(new Error('INVALID_TOKEN')); }
});
io.on('connection', socket => {
  socket.join(`user:${socket.userId}`);
  socket.on('conversation:join', async ({ conversationId } = {}, ack = () => {}) => {
    if (typeof conversationId !== 'string' || conversationId.length > 100) return ack({ success: false, error: 'INVALID_PAYLOAD' });
    const member = await prisma.conversationParticipant.findUnique({ where: { conversationId_userId: { conversationId, userId: socket.userId } } }).catch(() => null);
    if (!member) return ack({ success: false, error: 'FORBIDDEN' });
    socket.join(`conversation:${conversationId}`); ack({ success: true });
  });
  socket.on('community:join', async ({ communityId } = {}, ack = () => {}) => {
    if (typeof communityId !== 'string' || communityId.length > 100) return ack({ success: false, error: 'INVALID_PAYLOAD' });
    const member = await prisma.communityMember.findUnique({ where: { communityId_userId: { communityId, userId: socket.userId } } }).catch(() => null);
    if (!member) return ack({ success: false, error: 'FORBIDDEN' });
    socket.join(`community:${communityId}`); ack({ success: true });
  });
  socket.on('room:leave', ({ room } = {}) => { if (typeof room === 'string' && (room.startsWith('conversation:') || room.startsWith('community:'))) socket.leave(room); });
});
const port = Number(process.env.PORT) || 8000;
server.listen(port, () => console.log(`BASMA API listening on port ${port}`));
async function shutdown() { server.close(); await prisma.$disconnect(); process.exit(0); }
process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown);
