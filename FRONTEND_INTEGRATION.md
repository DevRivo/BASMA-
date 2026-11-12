# BASMA Frontend → Backend Integration

The current frontend is a static Vanilla JS demo and stores demo state in `localStorage`. To use real multi-user data, replace each local read/write action with the API below; do not keep localStorage as the source of truth for account, friendship, community membership, messages, likes, or notifications.

## API helper

```js
const API = 'http://localhost:8001/api/v1';
async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    credentials: 'include',
    headers: { ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...options.headers },
  });
  const payload = await response.json();
  if (!response.ok || !payload.success) {
    const error = new Error(payload.error?.message || 'حدث خطأ');
    error.status = response.status;
    error.code = payload.error?.code;
    throw error;
  }
  return payload;
}
```

## Login / registration

- Register: `POST /auth/register` with `{email, username, password}`.
- Login: `POST /auth/login` with `{email, password}`.
- On page load call `GET /auth/me`. A `401` means show the signed-out state.
- Logout: `POST /auth/logout`, then clear only UI cache/state.
- Cookies are HTTP-only. Do not read access/refresh cookies from JavaScript or put passwords/tokens in localStorage.

## Main page mapping

- `js/data.js` demo arrays (`ARTISTS`, `ARTS`, `COMMS`) are seed/demo display data only. Replace them with `GET /users`, `GET /artworks`, and `GET /communities`.
- Gallery filters: `GET /artworks?q=...&category=...&artistId=...&page=1&limit=20`.
- Shared category dropdowns: `GET /categories` (same list for gallery and communities).
- Artist profile: `GET /users/:id`; edit own profile: `PATCH /users/me`.
- Publish artwork: upload file to `/uploads/image` with folder `artworks`, then `POST /artworks` using returned `url` as `imageUrl`.
- Like/comment: `POST /artworks/:id/like` and `POST /artworks/:id/comments`.
- Friend requests: `POST /friend-requests/:userId`, then `PATCH /friend-requests/:id` with accept/reject. Follow is separate: `POST /follows/:userId`.
- Community create: upload optional cover to folder `communities`, then `POST /communities`. Joining uses `POST /communities/:id/join-requests`; only after accepted should the frontend show the chat entry point.
- Private chat: `POST /conversations` with `{userId}`, then `GET/POST /conversations/:id/messages`.
- Group chat: `GET/POST /communities/:id/messages`.
- Notifications: `GET /notifications`; marking read or deleting a notification must not delete its related message or conversation.

## Upload helper

```js
async function uploadImage(file, folder) {
  const form = new FormData();
  form.append('image', file);
  form.append('folder', folder);
  return api('/uploads/image', { method: 'POST', body: form });
}
```

Allowed folders: `avatars`, `covers`, `artworks`, `communities`, `messages`. Accepted formats: JPEG, PNG, WebP, GIF. Maximum size defaults to 8 MB.

## Realtime chat / notifications

Install Socket.IO client in the frontend package or load a compatible client build. Connect with cookies:

```js
const socket = io('http://localhost:8001', { withCredentials: true });
socket.emit('conversation:join', { conversationId }, result => {
  if (!result.success) console.error('Conversation access denied');
});
socket.on('message:new', message => renderMessage(message));
socket.on('notification:new', notification => addNotification(notification));
socket.on('conversation:read', event => updateReadReceipt(event));
```

For community chat use `community:join` with `communityId`. The server validates membership. Use REST POST endpoints to send messages; they persist first and then broadcast. Never send a sender ID from the browser.

## Important frontend cleanup

- Remove demo login `demo@basma.art / 123456` from production UI.
- Do not treat seeded/mock artist and community arrays as real users.
- Do not use client-provided `ownerId`, `senderId`, membership role, like count, or follower count as authority. The API derives identity and permissions from the authenticated user.
- Keep notification unread state separate from conversation/community unread cursors.
- The API currently returns ISO timestamps; format them in the UI using `Intl.DateTimeFormat('ar-EG')`.
- Google/Facebook buttons should remain hidden/disabled until provider credentials and callback URLs are configured. Email reset/verification screens need a configured email delivery service before public launch.
