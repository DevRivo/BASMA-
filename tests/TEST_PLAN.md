# Backend integration test plan

Run these checks against a disposable PostgreSQL database after `npm install`, `npx prisma generate`, and `npx prisma migrate dev`.

1. **Auth:** register, duplicate email/username conflict, valid/invalid login, `/auth/me`, refresh rotation, logout revocation, password change, expired/used reset token, expired/used email verification token.
2. **Authorization:** unauthenticated protected request returns 401; another user's profile remains public but private mutations return 403; expired JWT cannot join Socket.IO rooms.
3. **Artworks:** create/list/search/category/artist filter/pagination, owner edit/delete, non-owner edit/delete denied, like toggles, duplicate likes prevented, comment creation and owner-only deletion.
4. **Friendships/follows:** self-request denied, duplicate and reverse duplicate denied, only recipient accepts/rejects, requester can cancel, accepted friend can be removed, follow is independent and self/duplicate follow denied.
5. **Communities:** creator receives OWNER membership, duplicate join request denied, pending requester cannot read/send group messages or join socket room, only OWNER/ADMIN can accept/reject, accepted user becomes MEMBER, private community data is hidden from non-members, owner-only deletion.
6. **Private chat:** conversation created once for a user pair, non-participant cannot read/send/join, TEXT and IMAGE accepted, unsupported payload rejected, unread counts update per participant, read event emitted after persistence.
7. **Group chat:** accepted members can read/send/join, outsiders and pending requests denied, unread cursor is per community member, only TEXT and IMAGE are supported.
8. **Notifications:** correct notification types generated, read-all and single-read work, notification deletion does not delete messages, system announcements cannot be deleted.
9. **Uploads:** JPEG/PNG/WebP/GIF accepted within size limit; oversized and non-image MIME rejected; missing Cloudinary config returns 503; uploaded temporary file is cleaned up.
10. **Operational:** CORS rejects unknown origins, auth/global rate limits return 429, health endpoint responds, database disconnects cleanly on SIGINT/SIGTERM.

The current automated test suite contains small pure-unit checks only. This checklist is not a claim that the database integration tests have already passed.
