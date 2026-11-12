# BASMA Backend

Backend REST + realtime API for the BASMA Arabic art community. Built with Node.js 20+, Express 5, PostgreSQL, Prisma, JWT, Socket.IO and Cloudinary.

## 1. Requirements

- Node.js 20 or newer and npm
- PostgreSQL 14+
- Cloudinary account for image uploads (optional until upload is used)

## 2. Local setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set `DATABASE_URL`, two independent random JWT secrets (32+ characters), and `CLIENT_ORIGIN` to the exact frontend origin. Example PostgreSQL database creation:

```sql
CREATE DATABASE basma;
```

Then run:

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

API base: `http://localhost:8001/api/v1`  
Health check: `http://localhost:8001/health`

Seed creates `admin@basma.local` / `ChangeMe123!`. This is only a local seed account; change its password immediately and never deploy the seed credentials to production.

## 3. Frontend local server

If the static frontend runs at `http://localhost:8000`, keep `CLIENT_ORIGIN=http://localhost:8000`. Start it from the frontend folder with:

```bash
python3 -m http.server 8000
```

For another port/domain, update `CLIENT_ORIGIN` and restart the API. The API uses credentialed CORS and HTTP-only cookies. For production across separate sites, configure HTTPS and `COOKIE_SECURE=true`; `SameSite=None` is required only for genuinely cross-site cookie deployments and must be paired with Secure.

## 4. Environment variables

See `.env.example`. Never commit `.env`, database passwords, JWT secrets, or Cloudinary secrets. Cloudinary is configured server-side. Upload endpoint accepts one image in multipart field `image`, with optional `folder` (`avatars`, `covers`, `artworks`, `communities`, `messages`). MIME allowlist: JPEG, PNG, WebP, GIF. Maximum size defaults to 8 MB.

## 5. Socket.IO

Connect to the API origin with `withCredentials: true`. If cookies cannot be shared, pass a short-lived access token in `auth.token`. Socket authenticates every connection. Join rooms only through:

- `conversation:join` with `{ conversationId }`
- `community:join` with `{ communityId }`

Both are checked against database membership. Server emits `message:new`, `conversation:read`, and `notification:new`. Do not trust client-supplied sender IDs; sender identity always comes from the authenticated session. Send message content through REST endpoints; the API persists it before broadcasting.

## 6. Security notes

- Passwords use bcrypt; access/refresh tokens are signed with separate secrets and refresh tokens are stored hashed with rotation.
- HTTP-only cookies are set; JSON token values are also returned for clients that explicitly choose bearer-token storage. Prefer cookies in browser apps.
- Authorization and membership are checked server-side on every protected operation.
- Helmet, CORS allowlist, request rate limits, Zod validation, upload MIME/size checks, and Prisma parameterized queries are enabled.
- Messages support text and images only. No audio, voice, video, or calls are implemented.
- Reset/verification tokens are hashed and single-use. Email delivery is intentionally not faked: configure a transactional email provider and send the generated token from the relevant auth handlers before enabling those flows publicly. Development responses expose tokens for local testing only.
- Google/Facebook OAuth routes explicitly return `501 OAUTH_NOT_CONFIGURED` until real provider credentials, callback URLs, and account-linking strategy are configured.
- The announcement endpoint requires `ADMIN_API_KEY` (add it to `.env` before use); system announcements cannot be deleted by users.

## 7. Tests and checks

```bash
npm test
npm run check
```

These checks do not replace integration tests against a configured PostgreSQL instance. Run migrations and exercise the API in a staging environment before production.

## 8. Deploy

Provision PostgreSQL and a Node.js host, set production environment variables, run `npm ci`, `npx prisma generate`, `npx prisma migrate deploy`, then `npm start`. Configure HTTPS, exact frontend origin, secure cookies, strong secrets, database backups, Cloudinary, and email delivery. Do not run the seed script in production.
