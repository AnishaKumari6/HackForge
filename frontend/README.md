# HackForge — Frontend

React 19 + Vite single-page app for the HackForge hackathon platform, styled with Tailwind CSS v4 using a custom "Forge" design system (dark/light mode, glassmorphism, signature violet→ember gradient).

## Stack
React 19 · Vite · React Router DOM · Tailwind CSS v4 · Axios · React Hook Form · Framer Motion · Recharts · Socket.io-client · react-hot-toast · react-icons

## Setup

```bash
cd frontend
npm install
cp .env.example .env   # defaults work for local dev against the backend on :5000
npm run dev              # http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:5000` (see `vite.config.js`), so make sure the backend is running first — see `../backend/README.md`.

## Structure

```
src/
  components/   ui primitives, layout (navbar/sidebar/footer), hackathon cards, home sections
  pages/        auth, public, and per-role dashboard pages (participant/organizer/judge/admin)
  layouts/      MainLayout (public site) and DashboardLayout (sidebar + role nav)
  context/      Auth, Theme, Socket providers
  services/     one module per backend resource, all API calls go through here
  routes/       ProtectedRoute / RoleRoute / GuestOnlyRoute guards
  utils/        formatters, role-based nav config
```

## Notable implementation details

- **Auth**: access token kept in memory (not localStorage) for XSS resistance; refresh token lives in an httpOnly cookie set by the backend. `services/api.js` auto-refreshes on 401 and retries the original request.
- **Real-time**: `context/SocketContext.jsx` joins a personal room on login to receive live `notification` events, and hackathon detail/leaderboard views can join a `leaderboard:<id>` room for live rank updates.
- **Design tokens**: all colors/fonts/animations are defined once in `src/index.css` under `@theme` and CSS variables — dark mode toggles a `.dark` class on `<html>`, persisted to `localStorage`.
- Every list view (hackathons, users, registrations, activity logs) uses the same backend pagination/filter/search contract via `?page&limit&sort&search`.

## Build

```bash
npm run build     # outputs to dist/
npm run preview   # serve the production build locally
```
