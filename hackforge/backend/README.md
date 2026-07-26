# HackForge — Backend API

Production-style REST API for the HackForge hackathon management platform, built with Node.js, Express, and MongoDB (Mongoose).

## Stack
Express 4 · MongoDB/Mongoose 8 · JWT (access + refresh) · bcryptjs · Multer + Cloudinary · Nodemailer · Socket.io

## Setup

```bash
cd backend
npm install
cp .env.example .env   # then fill in real values (see below)
npm run seed            # optional but recommended — loads demo data
npm run dev              # starts on http://localhost:5000
```

## Required environment variables

See `.env.example` for the full list. At minimum you need:
- `MONGO_URI` — a running MongoDB instance (local or Atlas)
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EMAIL_SECRET` — any long random strings
- `CLOUDINARY_*` — free Cloudinary account, needed for all file uploads (avatars, banners, submission assets)
- `SMTP_*` — needed for verification/reset/invite/results emails (Gmail App Password, Mailtrap, Brevo, etc. all work)

The server will boot and most endpoints will work without Cloudinary/SMTP configured — only the upload and email-sending endpoints will fail until those are set.

## Seed data

`npm run seed` wipes and repopulates every collection with a realistic demo dataset: 1 admin, 2 organizers, 3 judges, 8 participants, 4 hackathons (draft/published/ongoing/completed), teams, registrations, submissions, reviews, notifications, and activity logs.

All seeded accounts use the password `Password@123`. Login as `admin@hackforge.dev` to see the admin dashboard, `organizer1@hackforge.dev` to manage hackathons, `judge1@hackforge.dev` to score projects, or `aditya@hackforge.dev` as a participant.

Run `npm run seed -- --destroy` to wipe all collections without reseeding.

## API surface (all prefixed `/api/v1`)

| Module | Base path | Highlights |
|---|---|---|
| Auth | `/auth` | register, login, refresh-token (httpOnly cookie), logout, email verification, forgot/reset password |
| Users | `/users` | profile, avatar upload, admin: list/block/unblock/role/delete |
| Hackathons | `/hackathons` | CRUD, publish, banner upload, judges assignment, publish-results, featured/trending/stats, filter+search+paginate |
| Teams | `/teams` | create, invite (email + token), accept/decline, leave, transfer leadership, organizer approve/reject |
| Registrations | `/registrations` | mine, QR code, check-in, cancel, organizer view + CSV export |
| Submissions | `/submissions` | draft autosave, finalize, images/PDF/video upload, public gallery |
| Reviews | `/reviews` | judge scoring (auto-averaged), assigned projects, leaderboard |
| Notifications | `/notifications` | list, mark read/all-read, delete |
| Bookmarks | `/bookmarks` | toggle, list |
| Admin | `/admin` | dashboard stats, monthly growth, activity logs, reports |

Every list endpoint supports `?page=&limit=&sort=&search=` and, where relevant, field filters like `?status=published` or `?prizePool[gte]=10000`.

## Real-time events (Socket.io)

Clients join a personal room via `socket.emit("join", userId)` to receive `notification` events, and a leaderboard room via `socket.emit("joinLeaderboard", hackathonId)` to receive `leaderboardUpdated` events whenever scores or results change.

## Architecture notes

- MVC layout: `routes → controllers → models`, with `middlewares/`, `validators/`, and `utils/` kept thin and reusable.
- Every route handler is wrapped in `asyncHandler`; all errors flow through the centralized `errorHandler` middleware, which normalizes Mongoose/JWT/Multer errors into consistent JSON.
- `utils/apiFeatures.js` is the single implementation of pagination/filter/search/sort, reused by every list endpoint instead of being duplicated per-controller.
- Sensitive admin/organizer actions are recorded via `middlewares/activityLogger.js` into the `ActivityLog` collection.
