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
- `npm test` — Jest + Supertest suite in `backend/tests/`. Needs no Postgres or OpenAI: each test file `jest.mock`s the `models/*Model.js` it touches (and `openai` in `ai.test.js`), and `tests/setupEnv.js` sets `JWT_SECRET`/blanks `OPENAI_API_KEY` before dotenv loads. Run one file with `npx jest projects`. Mint auth headers with `bearer(user)` from `tests/helpers.js`.
- `/api/ai/ask` is rate-limited to 10 req/min per IP for the whole test file — `ai.test.js` keeps its rate-limit test last for that reason.

Frontend (run from `frontend/`):
- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the production build
- `npm run lint` — `oxlint`
- `npm test` — Vitest (jsdom + Testing Library), config in `vite.config.js`. Tests sit next to the source as `*.test.jsx`; `src/test/utils.js` has `fakeToken()` for seeding `localStorage`.

CI (`.github/workflows/test.yml`) runs backend tests, plus frontend lint/test/build, on pushes to `master` and on PRs.

Required backend env vars (`backend/.env`, gitignored): `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT`, `PORT`, `JWT_SECRET`, `OPENAI_API_KEY`, `OPENAI_MODEL` (optional, defaults to `gpt-4o-mini`), `FRONTEND_URL` (optional, defaults to `http://localhost:5173` — locks down CORS for both the REST API and the socket.io handshake). See `backend/.env.example`.
Frontend optionally reads `VITE_API_URL` (defaults to `http://localhost:5000`). See `frontend/.env.example`.

## Backend architecture

Plain MVC, no ORM — routes call controllers call models, models issue raw parameterized SQL via a single shared `pg` `Pool` (`backend/db.js`):

`routes/*Routes.js` → `controllers/*Controller.js` → `models/*Model.js` → `db.js`

Each domain (`user`, `contractor`, `service`, `project`, `ai`, `review`, `message`) has its own route/controller/model file mounted in `app.js` under `/api/<domain>`. `app.js` builds and exports the Express app (so tests can import it without binding a port); `server.js` wraps it in an HTTP server, attaches socket.io, and listens.

**Auth:** `userController.loginUser` issues a JWT (`{ id, role }`, 1 day expiry); the frontend sends it as `Authorization: Bearer <token>` (`frontend/src/api/client.js`). `middleware/authMiddleware.js` provides `authenticate` (verifies the token, sets `req.user`) and `authorize(...roles)`, applied per-route in `routes/*Routes.js`. Most GET/list routes are public; writes are authenticated, and controllers additionally check ownership (e.g. project `client_id === req.user.id`, contractor profile `user_id === req.user.id`). The frontend's `ProtectedRoute` only gates rendering.

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
