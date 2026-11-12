import { prisma } from '../config/prisma.js';
export async function notify(userId, type, title, body, actorId = null, data = null, io = null) {
  if (!userId || userId === actorId) return null;
  const notification = await prisma.notification.create({ data: { userId, actorId, type, title, body, data: data ?? undefined } });
  io?.to(`user:${userId}`).emit('notification:new', notification);
  return notification;
}
