# Project Contractor — Roadmap

## Progress Overview
- [x] 1. Backend foundation — core flows tested and working (register/login/profile/service/project), polish items remain below
- [x] 2. Connect login with JWT (auth middleware) — verification + protection done; refresh tokens and httpOnly cookies deferred
- [x] 3. Build the React UI — Vite app scaffolded and verified in a real browser (home, register, login, browse services/contractors, service/contractor detail, project chat)
- [x] 4. Contractor and client dashboards — role-aware `/dashboard`, contractor profile/services/project-requests management incl. mark-complete + reviews received, client project tracking + leave-a-review; verified end to end in a real browser
- [x] 5. Integrate the OpenAI API — problem-triage chatbot built and wired end to end, now auth-gated and rate-limited; needs your real `OPENAI_API_KEY` in `backend/.env` to actually call OpenAI
- [x] 6. Upload project photos
- [x] 7. Real-time messaging — socket.io chat scoped to each project, JWT-authenticated, message history persisted
- [x] 8. Deploy prep — repo is deployment-ready (locked-down CORS, `.env.example` files, `DEPLOYMENT.md`); no live deployment has actually happened yet since that needs your own hosting accounts

## ✅ 1. Backend foundation (you're here)
- [x] Express server + PostgreSQL pool (`backend/server.js`, `backend/db.js`)
- [x] Schema: `users`, `contractor_profiles`, `services`, `projects`, `project_images`, `reviews`, `messages`, `payments`
- [x] `users` — register (bcrypt) + login (JWT)
- [x] `contractor_profiles` — create profile
- [x] `services` — create service
- [x] `projects` — create project
- [x] `GET /api/services` (list), `GET /api/services/:id`, `GET /api/services/contractor/:contractorId`, `GET /api/projects/:id`, `GET /api/projects/client/:clientId`, `GET /api/projects/contractor/:contractorId`, `GET /api/contractors/profile/user/:userId`, `PATCH /api/projects/:id/status` — added to support the React UI and dashboards
- [x] Remaining CRUD: `GET /api/contractors` (all) + `GET /api/contractors/:id`, `PUT/DELETE /api/contractors/profile/:id`, `PUT/DELETE /api/services/:id`, `GET /api/projects` (all, authenticated-only — no admin role exists so this is the closest available gate), `PUT/DELETE /api/projects/:id`
- [x] `reviews` routes/controller/model — `POST /api/reviews` (client-only, project must be `completed`, one review per project), `GET /api/reviews/contractor/:contractorId` (public)
- [x] Basic required-field validation + correct status codes (400 missing fields, 409 duplicate email/profile, 400 invalid foreign key) on register/create-profile/create-service/create-project — was returning generic 500s before
- [x] Fixed: malformed JSON body used to leak a full stack trace via Express's default HTML error page — a JSON error-handling middleware in `backend/server.js` now returns `400 { message: "Malformed JSON body" }`, plus a catch-all error handler at the end of the chain for other thrown errors (e.g. multer)
- [x] Shared `backend/utils/validateId.js` — non-numeric `:id`-style params now return 400 instead of a raw DB error, across every route touched in this pass
- [x] Fixed `database/schema.sql` drift — `contractor_profiles` was missing `business_name`/`phone`/`availability`, which already existed on the live DB; schema file now matches reality
- [x] Confirm `database/schema.sql1` → rename back to `schema.sql` and commit

## 🔐 2. Connect login with JWT (auth middleware)
- [x] `middleware/authMiddleware.js` — `authenticate` verifies `Authorization: Bearer <token>` and attaches `req.user`; `authorize(...roles)` for role checks
- [x] Protect write routes (create/update/delete project, service, contractor profile, review) with the middleware, plus ownership checks (e.g. a contractor can only edit their own services/profile; a client can only create/edit/delete their own projects; only the assigned contractor can transition a project's status)
- [x] Role-based guards (`client` vs `contractor`) — enforced server-side via `authorize()`, and client-side via a new `role` prop on `ProtectedRoute`
- [x] `role` is now validated at registration (`client`/`contractor` only, 400 otherwise)
- [ ] Refresh-token or re-login flow once the 1-day JWT expires — **deliberately deferred**, users re-login after expiry for now
- [ ] Frontend: httpOnly cookie storage — **deliberately deferred**, token stays in `localStorage` (bigger change: CORS credentials, login response shape, every axios call); auth is otherwise fully enforced server-side now

## 🎨 3. Build the React UI
- [x] Scaffold `frontend/` (Vite + React)
- [x] Routing (`react-router`): landing, login/register, browse services, service detail, project detail
- [x] API layer (axios wrapper in `frontend/src/api/`, JWT attached via interceptor)
- [x] Shared layout (`Navbar`/`Layout`), forms for register/login/create-service/create-project
- [x] Env-based API base URL (`VITE_API_URL` in `frontend/.env`) for local vs deployed backend
- [x] Browse/detail pages for contractors directly (`Contractors.jsx`/`ContractorDetail.jsx`, mirrors the services pattern; contractor detail shows their services + reviews)
- [x] Create-service/create-project forms auto-resolve `contractor_id`/`client_id` from the logged-in user (Phase 4)
- [x] Browse Services, Browse Contractors, Service/Contractor Detail, Project Detail, and AI Assistant are all login-gated (routes wrapped in `ProtectedRoute`, some role-restricted); direct URL access redirects to `/login` or `/dashboard`. Now backed by real server-side auth (Phase 2), not just client-side gating.

## 👤 4. Contractor and client dashboards
- [x] Role-aware routing after login (`/dashboard` renders `ContractorDashboard` or `ClientDashboard` based on `user.role`)
- [x] Contractor dashboard: create/view profile (`/contractors/profile/new`), manage own services, view + accept/decline incoming project requests, mark `in_progress` projects complete, view received reviews
- [x] Client dashboard: view posted projects with live status, quick link to browse services, leave a review on completed projects
- [x] Project status view (pending/accepted/declined/in_progress/completed) reflected on both dashboards
- [x] Reviews left/received — `CreateReview.jsx` (client, on completed projects) + reviews list on `ContractorDetail.jsx` and `ContractorDashboard.jsx`
- [x] Contractor-initiated status transitions beyond accept/decline — "Mark Complete" button for `in_progress → completed`

## 🤖 5. Integrate the OpenAI API
- [x] Use case decided: client describes a problem in a chat UI, AI explains what's likely wrong and picks a trade category, backend queries the real `services` table for matches (AI never invents contractor names — grounded in actual DB data)
- [x] Backend route `POST /api/ai/ask` (`backend/controllers/aiController.js`) calls OpenAI server-side; API key never reaches the client
- [x] `OPENAI_API_KEY` added to `backend/.env` (real key in place, gitignored) — verified live: real OpenAI calls return correct explanations, correct trade-category classification, and correctly matched real services from the DB
- [x] Frontend: `/assistant` page with chat bubble UI, linked from the navbar, open to all visitors
- [x] Fixed a real bug found during setup: the `openai` SDK throws at construction time if the key is missing, which was crashing the *entire* backend on boot, not just the AI feature. Client is now lazily constructed inside the request handler; missing key now returns a clean 503 instead of taking down the whole API.
- [x] Multi-turn triage: AI defaults to asking a clarifying question (up to 3) when the problem could point to more than one trade, instead of guessing — with an explicit safety-first override so dangerous situations (gas smell, flooding, exposed wiring) always get an immediate warning instead of a question. Every AI text field is capped at one short sentence.
- [x] Photo upload: client can attach a photo (max 5MB, client-side check) alongside their message; sent to OpenAI's vision-capable model (`gpt-4o-mini` already supports this) as a base64 data URL. Backend `express.json()` limit raised from Express's 100kb default to 10mb to fit image payloads. AI is instructed to use the photo to skip straight to a confident answer when possible, or ask about what the photo doesn't show.
- [x] `POST /api/ai/ask` now requires a logged-in user (`authenticate`) and is rate-limited (10 requests/minute per IP via `express-rate-limit`)
- [x] Image-resend optimization: `Assistant.jsx`'s `toApiMessages` now only attaches `imageDataUrl` for the most recent image in the conversation — earlier turns' images are no longer re-sent in full on every subsequent request
- [ ] Not yet done: conversation history isn't persisted (resets on page reload) — **deliberately deferred**, would need a new DB table/schema change

## 📷 6. Upload project photos
- [x] File upload middleware (`multer`) on the server (`backend/middleware/uploadMiddleware.js` — disk storage, randomized filenames, image-mime filter, 5MB limit)
- [x] Storage target: local `/uploads` for dev (served via `express.static`), already gitignored — cloud storage (S3/Cloudinary) for prod still open
- [x] Wire to `project_images` table (`POST/GET /api/projects/:id/images`, ownership-checked — only the project's client or assigned contractor can upload)
- [x] Frontend upload UI + image gallery on project detail page (`ProjectDetail.jsx`)

## 💬 7. Real-time messaging
- [x] `socket.io` on the server for live delivery (`backend/sockets/chatSocket.js`, attached to the same HTTP server as Express in `server.js`)
- [x] Persist messages to the existing `messages` table; sockets for push (`send_message`/`new_message` events), REST for history (`GET /api/messages/project/:projectId`)
- [x] Frontend chat UI scoped to a project (`ProjectDetail.jsx` "Messages" section, reuses the `Assistant.jsx` chat-bubble styling with new `mine`/`theirs` variants)
- [x] Auth on socket connections — handshake middleware verifies the same JWT as the REST API (shared `verifyToken` helper in `authMiddleware.js`), and `join_project`/`send_message` both re-check the caller is that project's client or assigned contractor (`utils/projectAccess.js`)

## 🚀 8. Deploy (prep only — no live deployment yet)
- [x] CORS: `cors()` locked down to `FRONTEND_URL` (defaults to `http://localhost:5173` for local dev) instead of wide open; same origin applied to the socket.io server
- [x] `backend/.env.example` and `frontend/.env.example` document every required env var
- [x] `DEPLOYMENT.md` — step-by-step guide for provisioning Neon/Supabase Postgres, deploying `backend/` to Render or Railway (explicitly not Vercel serverless, since `socket.io` needs a persistent process), deploying `frontend/` to Vercel, and a production smoke-test checklist
- [ ] Actually provisioning the database, backend host, and frontend host — **not done**, needs your own hosting accounts/credentials; follow `DEPLOYMENT.md` when ready
- [ ] Smoke test full flow in production — pending the above

