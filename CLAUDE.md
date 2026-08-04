# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Project Contractor — a home-services marketplace connecting clients with contractors, plus an AI triage assistant that reads a client's problem description (and optional photo) and routes them to the right trade/service.

Two independent apps in one repo, no shared workspace/monorepo tooling:
- `backend/` — Express 5 REST API
- `frontend/` — React 19 + Vite SPA
- `database/schema.sql` — hand-maintained Postgres schema (no migration tool; edit this file and re-apply manually when the schema changes)

## Commands

Backend (run from `backend/`):
- `npm start` — runs `node server.js` on `process.env.PORT` (default 5000). No dev/watch script configured.
- No test suite exists yet (`npm test` is the default placeholder).

Frontend (run from `frontend/`):
- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the production build
- `npm run lint` — `oxlint`

Required backend env vars (`backend/.env`, gitignored): `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT`, `PORT`, `JWT_SECRET`, `OPENAI_API_KEY`, `OPENAI_MODEL` (optional, defaults to `gpt-4o-mini`), `FRONTEND_URL` (optional, defaults to `http://localhost:5173` — locks down CORS for both the REST API and the socket.io handshake). See `backend/.env.example`.
Frontend optionally reads `VITE_API_URL` (defaults to `http://localhost:5000`). See `frontend/.env.example`.

## Backend architecture

Plain MVC, no ORM — routes call controllers call models, models issue raw parameterized SQL via a single shared `pg` `Pool` (`backend/db.js`):

`routes/*Routes.js` → `controllers/*Controller.js` → `models/*Model.js` → `db.js`

Each domain (`user`, `contractor`, `service`, `project`, `ai`) has its own route/controller/model file mounted in `server.js` under `/api/<domain>`.

**Auth is not enforced server-side.** `userController.loginUser` issues a JWT (`{ id, role }`, 1 day expiry) and the frontend attaches it as `Authorization: Bearer <token>` on every request (`frontend/src/api/client.js`), but there is no verification middleware anywhere in `backend/` — no route ever calls `jwt.verify`. Every API route is currently reachable unauthenticated; gating happens only client-side via `ProtectedRoute` (`frontend/src/components/ProtectedRoute.jsx`), which just checks whether a token is present in `localStorage`/`AuthContext`. Keep this in mind before assuming an endpoint is protected — if you add auth-sensitive backend work, you'll likely need to add the missing middleware rather than extend something that already exists.

**AI assistant** (`backend/controllers/aiController.js`): calls the OpenAI chat completions API with `response_format: json_object` and a system prompt that enforces strict JSON output (`needs_more_info` + `question`, or `explanation`/`category`/`suggestions`). Safety rules (gas smell, flooding, exposed wiring, fire) always short-circuit to an immediate answer, never a clarifying question. Once the model returns a category, `Service.searchServicesByKeyword` does an `ILIKE` match against `services.category/title/description` to produce `matches`. If editing this prompt, preserve the "ask unless genuinely obvious" and one-sentence-per-field constraints — they're load-bearing for the UX in `frontend/src/pages/Assistant.jsx`.

**Real-time messaging** (`backend/sockets/chatSocket.js`, registered on a `socket.io` server wrapping the same Express app in `server.js`): sockets authenticate via the same JWT as the REST API (`socket.handshake.auth.token`, verified with the shared `verifyToken` helper in `authMiddleware.js`). Clients `join_project` a `project:<id>` room (server checks the caller is that project's client or assigned contractor via `utils/projectAccess.js`) and `send_message` to persist + broadcast. Message history is REST-only (`GET /api/messages/project/:projectId`); sending is socket-only — there's no `POST /api/messages`.

`backend/server.js` now has a JSON body-parse error handler plus a catch-all error handler at the end of the middleware chain, so malformed request bodies and other thrown errors (e.g. from `multer`) return a JSON `400` instead of Express's default HTML stack trace.

## Frontend architecture

- `src/api/*.js` — thin Axios wrappers per domain, all going through the shared `client.js` instance (which injects the bearer token).
- `src/context/AuthContext.jsx` — decodes the JWT client-side (no signature check, just `atob` on the payload) to derive `user` from the stored token; this is the sole source of truth for whether a route renders.
- `src/pages/` — one file per route, wired up in `src/App.jsx`. Dashboards are role-split: `Dashboard` picks between `ClientDashboard`/`ContractorDashboard`.
- Routing is React Router 7 (`Routes`/`Route`), with `ProtectedRoute` wrapping any page that requires a logged-in user.

## Database

`database/schema.sql` defines: `users` → `contractor_profiles` → `services`/`projects`, plus `project_images`, `reviews`, `messages`, `payments` hanging off `projects`/`users`. Foreign keys are declared but there's no seed data or migration history — apply the schema by hand against a local Postgres instance matching the `backend/.env` DB_* vars.
