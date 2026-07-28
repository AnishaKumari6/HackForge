# Deployment Guide

This covers deploying HackForge to production: a MongoDB Atlas database, the backend API on a Node host (Render used as the example), and the frontend on a static/edge host (Vercel used as the example). Any equivalent provider works the same way — the important part is the environment variables.

---

## 1. Database — MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Under **Database Access**, create a user with a strong password.
3. Under **Network Access**, add `0.0.0.0/0` (or your host's specific egress IPs) so your deployed backend can connect.
4. Copy the connection string — this is your `MONGO_URI`, e.g.
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/hackforge?retryWrites=true&w=majority`

---

## 2. File storage — Cloudinary

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. From the dashboard, copy `Cloud name`, `API Key`, and `API Secret` into the backend's `.env`.

## 3. Email — SMTP provider

Any SMTP provider works (Gmail App Password, Brevo, SendGrid SMTP, Mailtrap for testing). Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` in the backend's `.env`.

---

## 4. Backend deployment (Render example)

1. Push this repo to GitHub.
2. In Render, create a **New Web Service**, connect the repo, and set:
   - **Root directory:** `backend`
   - **Build command:** `npm install`
   - **Start command:** `npm start`
3. Add all variables from `backend/.env.example` under **Environment**, using your real Atlas/Cloudinary/SMTP values.
4. Set `CLIENT_URL` to your deployed frontend URL (added in step 5) — this is required for CORS and for links inside emails to work.
5. Deploy. Once live, note the backend URL (e.g. `https://hackforge-api.onrender.com`).
6. Run the seed script once via Render's shell tab if you want demo data in production: `npm run seed`.

---

## 5. Frontend deployment (Vercel example)

1. In Vercel, import the same repo and set:
   - **Root directory:** `frontend`
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
2. Add environment variables:
   - `VITE_API_URL` → `https://hackforge-api.onrender.com/api/v1` (your backend URL from step 4)
   - `VITE_SOCKET_URL` → `https://hackforge-api.onrender.com`
3. Deploy. Once live, go back to the backend's environment variables and set `CLIENT_URL` to this frontend URL, then redeploy the backend so CORS and cookies work correctly.

---

## 6. Post-deploy checklist

- [ ] Visit the frontend URL and confirm the homepage loads (hero, featured hackathons, stats)
- [ ] Register a new account and confirm the verification email arrives
- [ ] Log in, confirm the dashboard loads for your role
- [ ] As an organizer, create a hackathon and upload a banner (confirms Cloudinary works)
- [ ] As a participant, create a team and check for the real-time notification (confirms Socket.io + CORS are correctly configured)
- [ ] Check browser dev tools → Application → Cookies to confirm the `refreshToken` httpOnly cookie is being set (confirms `secure`/`sameSite` cookie settings match your domains)

## Notes on cookies & CORS in production

The refresh token is an httpOnly cookie scoped to `/api/v1/auth/refresh-token`. In production (`NODE_ENV=production`), the backend sets `secure: true` and `sameSite: "none"` on that cookie, which requires both frontend and backend to be served over **HTTPS**. Most managed hosts (Render, Vercel, Railway, Netlify) provide this by default — just make sure you're not mixing an `http://` backend with an `https://` frontend.
