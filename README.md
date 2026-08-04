# Project Contractor

A home-services marketplace connecting clients with contractors — post a service, request work, track project status, chat in real time, leave reviews, and get AI-assisted help figuring out what kind of contractor you need.

Full roadmap and detailed progress tracking: [PLAN.md](PLAN.md). Local bug tracking: [Bugs.local.md](Bugs.local.md) (not pushed for public visibility reasons beyond this repo's own history).

## Stack

- **Backend**: Node.js / Express 5, PostgreSQL (`pg`), bcrypt + JWT auth, `socket.io` for real-time chat, `multer` for uploads, OpenAI SDK
- **Frontend**: React 19 + Vite, React Router, Axios, `socket.io-client`
- **Database**: PostgreSQL, schema in [`database/schema.sql`](database/schema.sql)

## Project structure

```
backend/     Express API (routes → controllers → models), MVC-style, + socket.io chat layer
frontend/    React app (Vite)
database/    SQL schema
```

## Running locally

Requires a local PostgreSQL database matching `backend/.env` (`DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT`), plus `JWT_SECRET` and `OPENAI_API_KEY` set there too. See `backend/.env.example` and `frontend/.env.example` for the full list of variables.

```
cd backend && npm start           # http://localhost:5000
cd frontend && npm run dev        # http://localhost:5173
```

## What's built

### Auth & users
Register/login with bcrypt-hashed passwords and JWT issuance. Roles: `client` or `contractor` (validated at registration). Server-side middleware (`authenticate`/`authorize`) verifies the JWT and role on every write route, with ownership checks so a contractor can only edit their own profile/services and a client can only edit their own projects.

### Contractors
Create a profile (business name, phone, availability, skills, rate) and post services — full CRUD, including edit/delete. Dashboard shows your own services, incoming project requests with accept/decline, a "Mark Complete" action once a project is `in_progress`, and reviews you've received.

### Clients
Browse posted services and contractors directly, request a contractor from a service page (auto-fills the request — no manual IDs), track your posted projects' status (`pending → accepted/declined → in_progress → completed`, enforced as a state machine — no skipping steps), and leave a review once a project is completed.

### Reviews
Clients rate (1–5) and comment on completed projects; one review per project. Shown on the contractor's public detail page and their dashboard.

### Real-time messaging
Each project has its own chat, scoped to a `socket.io` room, authenticated with the same JWT as the REST API. Message history persists to Postgres and loads via REST; live delivery is socket-only.

### Project photos
Upload photos to a project (5MB limit, image types only) via `multer`, served from `/uploads`, shown as a gallery on the project detail page.

### AI Assistant (`/assistant`)
Describe a problem in plain language (optionally with a photo); OpenAI explains what's likely wrong and classifies it into a trade category, then the backend matches it against real posted services — the AI never invents contractors, it only classifies. Requires login, is rate-limited, and sanitizes incoming messages (no client-supplied `system` role can override the assistant's instructions). Requires a valid `OPENAI_API_KEY` in `backend/.env`.

### API surface
MVC structure per resource (`routes/` → `controllers/` → `models/`) for `users`, `contractors`, `services`, `projects`, `reviews`, `messages`, and `ai`. Endpoints return proper status codes (400 for bad input, 401/403 for auth failures, 404 for missing records, 409 for conflicts) rather than generic 500s.

