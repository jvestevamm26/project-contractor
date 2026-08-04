# Deployment Guide

This app has two independent deployables (`backend/`, `frontend/`) plus a hand-maintained
Postgres schema (`database/schema.sql`). This guide is written for the stack named in
`PLAN.md`: Neon or Supabase for Postgres, Render or Railway for the backend, Vercel for the
frontend. Nothing here has been provisioned yet — follow it once you have accounts on those
services.

**Hard constraint:** the backend uses `socket.io` for real-time messaging, which needs a
long-lived Node process with WebSocket support. Do **not** deploy `backend/` to Vercel
serverless functions — use Render or Railway (or any host that runs a persistent Node
process). Vercel is fine for the frontend static build.

## 1. Database

1. Create a Postgres instance on Neon or Supabase.
2. Run `database/schema.sql` against it (e.g. `psql <connection-string> -f database/schema.sql`,
   or paste it into your provider's SQL editor).
3. Note the connection details (host, port, database name, user, password) — you'll need them
   as `DB_HOST`/`DB_PORT`/`DB_NAME`/`DB_USER`/`DB_PASSWORD` below.

## 2. Backend (Render or Railway)

1. Create a new Node web service pointed at this repo's `backend/` directory.
2. Build/start commands: no build step needed, start command is `npm start` (runs `node server.js`).
3. Set environment variables (see `backend/.env.example` for the full list):
   - `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT` — from step 1.
   - `PORT` — most hosts inject this automatically; only set it if your provider requires it.
   - `JWT_SECRET` — a long random string, different from any local dev value.
   - `OPENAI_API_KEY` — your real key. `OPENAI_MODEL` is optional (defaults to `gpt-4o-mini`).
   - `FRONTEND_URL` — the deployed frontend's URL (step 3 below). This locks down CORS for
     both the REST API and the socket.io handshake — requests from any other origin are rejected.
4. Deploy, then confirm `GET /` on the deployed URL returns `"The Contractor API is running"`.

## 3. Frontend (Vercel)

1. Import this repo into Vercel, set the project root to `frontend/`.
2. Framework preset: Vite. Build command `npm run build`, output directory `dist`.
3. Set `VITE_API_URL` to the backend's deployed URL from step 2.
4. Deploy, then go back to step 2 and set the backend's `FRONTEND_URL` to this Vercel URL
   (redeploy the backend after changing it, since CORS/socket.io origin checks read it at boot).

## 4. Smoke test

Once both are live, walk through the full flow against the deployed URLs:

1. Register a client and a contractor account.
2. Log in as the contractor, create a profile and a service.
3. Log in as the client, request the contractor, confirm the project appears on both dashboards.
4. Accept the project as the contractor, move it to `in_progress`, then `completed`.
5. Open the project detail page as both users (two browser sessions) and confirm chat messages
   sent from one appear live in the other without a refresh.
6. Leave a review as the client and confirm it shows up on the contractor's dashboard and
   public contractor detail page.
7. Upload a project photo and confirm it renders from the deployed backend's `/uploads` path.

There is no Stripe/payments step — that phase was dropped from the roadmap.

## Known gaps at deploy time

- No refresh-token flow: the JWT expires after 1 day and users must log back in.
- The JWT stays in `localStorage`, not an httpOnly cookie.
- No automated test suite exists in this repo — the smoke test above is manual.
