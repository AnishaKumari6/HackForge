# HackForge — Hackathon Management Platform

A full-stack MERN application for running end-to-end hackathons: discovery, team formation, organizer approvals, project submission, judge scoring, live leaderboards, and platform-wide admin analytics.

**Stack:** React 19 + Vite + Tailwind CSS v4 (frontend) · Node.js + Express + MongoDB/Mongoose (backend) · JWT auth · Cloudinary uploads · Nodemailer · Socket.io real-time.

---

## Project structure

```
HackForge/
├── backend/     Express API — see backend/README.md
└── frontend/    React SPA — see frontend/README.md
```

Each folder is independently runnable and has its own README with setup steps, environment variables, and architecture notes. This file covers running the two together.

---

## Quick start (local development)

You'll need Node.js 18+ and a MongoDB instance (local `mongod` or a free MongoDB Atlas cluster).

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env        # fill in MONGO_URI, JWT secrets, Cloudinary + SMTP (optional to start)
npm run seed                # loads demo data — admin/organizer/judge/participant accounts
npm run dev                 # http://localhost:5000

# 2. Frontend (separate terminal)
cd frontend
npm install
cp .env.example .env        # defaults already point at the backend above
npm run dev                  # http://localhost:5173
```

Open `http://localhost:5173` and log in with any seeded account (all use password `Password@123`):

| Role | Email |
|---|---|
| Admin | `admin@hackforge.dev` |
| Organizer | `organizer1@hackforge.dev` |
| Judge | `judge1@hackforge.dev` |
| Participant | `aditya@hackforge.dev` |

---

## What's implemented

**Auth & roles** — JWT access tokens + httpOnly-cookie refresh tokens, email verification, forgot/reset password, role-based route protection for Admin / Organizer / Judge / Participant.

**Hackathons** — full CRUD, draft → published → ongoing → completed lifecycle, banner upload, rich public filtering (mode, prize range, registration status, search), featured/trending sections, countdown timers.

**Teams** — create, email-token invites, accept/decline, leave, transfer leadership, organizer approve/reject (auto-generates registrations on approval).

**Registrations** — QR code generation, organizer check-in, CSV export, cancellation.

**Submissions** — draft autosave, image/PDF/video upload to Cloudinary, finalize/lock, public project gallery.

**Judging** — 7-criteria scoring (auto-averaged), assigned-projects queue per judge, evaluation history, live leaderboard pushed over Socket.io as scores/results change.

**Notifications & Bookmarks** — real-time in-app notifications (team invites, approvals, results), save-for-later hackathons.

**Admin** — dashboard with user/hackathon/registration counters, 12-month growth charts, full user management (block/unblock/role/delete), hackathon moderation, activity-log audit trail, top-hackathons/top-organizers reports.

---

## Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for a full guide to deploying the backend (Render/Railway) and frontend (Vercel/Netlify) with a production MongoDB Atlas cluster.

## Documentation

- [`backend/README.md`](./backend/README.md) — API reference, environment variables, seed data, architecture notes
- [`frontend/README.md`](./frontend/README.md) — component structure, design system, real-time setup

## Future improvements

- Payment integration for paid hackathon registrations
- In-app team chat during live events
- Automated plagiarism/similarity checks on GitHub submissions
- Public API tokens for third-party integrations
- Mobile app (React Native) sharing the same backend
