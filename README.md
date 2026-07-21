# Project Contractor

A home-services marketplace connecting clients with contractors — post a service, request work, track project status, and get AI-assisted help figuring out what kind of contractor you need.

Full roadmap and detailed progress tracking: [PLAN.md](PLAN.md).

## Stack

- **Backend**: Node.js / Express 5, PostgreSQL (`pg`), bcrypt + JWT auth, OpenAI SDK
- **Frontend**: React 19 + Vite, React Router, Axios
- **Database**: PostgreSQL, schema in [`database/schema.sql`](database/schema.sql)

## Project structure

```
backend/     Express API (routes → controllers → models), MVC-style
frontend/    React app (Vite)
database/    SQL schema
```

## Running locally

Requires a local PostgreSQL database matching `backend/.env` (`DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT`), plus `JWT_SECRET` and `OPENAI_API_KEY` set there too.

```
cd backend && node server.js      # http://localhost:5000
cd frontend && npm run dev        # http://localhost:5173
```

## What's built

### Auth & users
Register/login with bcrypt-hashed passwords and JWT issuance. Roles: `client` or `contractor`.

### Contractors
Create a profile (business name, skills, rate, availability) and post services. Dashboard shows your own services and incoming project requests, with accept/decline actions.

### Clients
Browse posted services, request a contractor directly from a service page (auto-fills the request — no manual IDs), and track your posted projects' status (pending → accepted/declined → in progress → completed) from your dashboard.

### AI Assistant (`/assistant`)
Describe a problem in plain language; OpenAI explains what's likely wrong and classifies it into a trade category, then the backend matches it against real posted services — the AI never invents contractors, it only classifies. Requires a valid `OPENAI_API_KEY` in `backend/.env`.

### API surface
MVC structure per resource (`routes/` → `controllers/` → `models/`) for `users`, `contractors`, `services`, `projects`, and `ai`. Endpoints return proper status codes (400 for bad input, 409 for conflicts, 404 for missing records) rather than generic 500s.

## Not yet in place

See [PLAN.md](PLAN.md) for the full breakdown, but the big gaps:
- No server-side auth middleware yet — JWTs are issued and used by the frontend, but no route currently verifies them, so the API trusts whatever `client_id`/`contractor_id` it's given
- No reviews, photo uploads, real-time messaging, or payments
- Not deployed — local dev only
