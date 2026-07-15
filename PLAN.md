# Project Contractor — Roadmap

## Progress Overview
- [x] 1. Backend foundation — core flows tested and working (register/login/profile/service/project), polish items remain below
- [ ] 2. Connect login with JWT (auth middleware)
- [x] 3. Build the React UI — Vite app scaffolded and verified in a real browser (home, register, login, browse services, service detail); dashboards/uploads/messaging/payments still stubs
- [x] 4. Contractor and client dashboards — role-aware `/dashboard`, contractor profile/services/project-requests management, client project tracking; verified end to end in a real browser
- [x] 5. Integrate the OpenAI API — problem-triage chatbot built and wired end to end; needs your real `OPENAI_API_KEY` in `backend/.env` to actually call OpenAI
- [ ] 6. Upload project photos
- [ ] 7. Real-time messaging
- [ ] 8. Stripe payments
- [ ] 9. Deploy

## ✅ 1. Backend foundation (you're here)
- [x] Express server + PostgreSQL pool (`backend/server.js`, `backend/db.js`)
- [x] Schema: `users`, `contractor_profiles`, `services`, `projects`, `project_images`, `reviews`, `messages`, `payments`
- [x] `users` — register (bcrypt) + login (JWT)
- [x] `contractor_profiles` — create profile
- [x] `services` — create service
- [x] `projects` — create project
- [x] `GET /api/services` (list), `GET /api/services/:id`, `GET /api/services/contractor/:contractorId`, `GET /api/projects/:id`, `GET /api/projects/client/:clientId`, `GET /api/projects/contractor/:contractorId`, `GET /api/contractors/profile/user/:userId`, `PATCH /api/projects/:id/status` — added to support the React UI and dashboards
- [ ] Remaining CRUD: GET all projects/contractors, PUT/DELETE across the board
- [ ] `reviews` routes/controller/model (schema exists, no code yet)
- [x] Basic required-field validation + correct status codes (400 missing fields, 409 duplicate email/profile, 400 invalid foreign key) on register/create-profile/create-service/create-project — was returning generic 500s before
- [ ] BUG (deferred, see comment in `backend/server.js`): malformed JSON body leaks a full stack trace via Express's default HTML error page — needs a JSON error-handling middleware
- [x] Confirm `database/schema.sql1` → rename back to `schema.sql` and commit

## 🔐 2. Connect login with JWT (auth middleware)
- [ ] `middleware/authMiddleware.js` — verify `Authorization: Bearer <token>`, attach `req.user`
- [ ] Protect write routes (create project, create service, create profile) with the middleware
- [ ] Role-based guards (`client` vs `contractor`) where relevant
- [ ] Refresh-token or re-login flow once the 1-day JWT expires
- [ ] Frontend: store token (httpOnly cookie preferred over localStorage), attach to API calls

## 🎨 3. Build the React UI
- [x] Scaffold `frontend/` (Vite + React)
- [x] Routing (`react-router`): landing, login/register, browse services, service detail, project detail
- [x] API layer (axios wrapper in `frontend/src/api/`, JWT attached via interceptor)
- [x] Shared layout (`Navbar`/`Layout`), forms for register/login/create-service/create-project
- [x] Env-based API base URL (`VITE_API_URL` in `frontend/.env`) for local vs deployed backend
- [ ] Browse/detail pages for contractors directly (only services browse exists so far)
- [x] Create-service/create-project forms auto-resolve `contractor_id`/`client_id` from the logged-in user (Phase 4)

## 👤 4. Contractor and client dashboards
- [x] Role-aware routing after login (`/dashboard` renders `ContractorDashboard` or `ClientDashboard` based on `user.role`)
- [x] Contractor dashboard: create/view profile (`/contractors/profile/new`), manage own services, view + accept/decline incoming project requests
- [x] Client dashboard: view posted projects with live status, quick link to browse services
- [x] Project status view (pending/accepted/declined/in_progress/completed) reflected on both dashboards
- [ ] Reviews left/received (blocked on Phase 1's still-unbuilt `reviews` routes/controller/model)
- [ ] Contractor-initiated status transitions beyond accept/decline (in_progress → completed) — no UI yet

## 🤖 5. Integrate the OpenAI API
- [x] Use case decided: client describes a problem in a chat UI, AI explains what's likely wrong and picks a trade category, backend queries the real `services` table for matches (AI never invents contractor names — grounded in actual DB data)
- [x] Backend route `POST /api/ai/ask` (`backend/controllers/aiController.js`) calls OpenAI server-side; API key never reaches the client
- [x] `OPENAI_API_KEY` added to `backend/.env` (real key in place, gitignored) — verified live: real OpenAI calls return correct explanations, correct trade-category classification, and correctly matched real services from the DB
- [x] Frontend: `/assistant` page with chat bubble UI, linked from the navbar, open to all visitors
- [x] Fixed a real bug found during setup: the `openai` SDK throws at construction time if the key is missing, which was crashing the *entire* backend on boot, not just the AI feature. Client is now lazily constructed inside the request handler; missing key now returns a clean 503 instead of taking down the whole API.
- [ ] Not yet done: rate limiting / abuse protection on the AI endpoint, conversation history isn't persisted (resets on page reload), no auth requirement

## 📷 6. Upload project photos
- [ ] File upload middleware (`multer`) on the server
- [ ] Storage target: local `/uploads` (already gitignored) for dev, cloud storage (S3/Cloudinary) for prod
- [ ] Wire to `project_images` table
- [ ] Frontend upload UI + image gallery on project detail page

## 💬 7. Real-time messaging
- [ ] `socket.io` (or similar) on the server for live delivery
- [ ] Persist messages to the existing `messages` table; sockets for push, REST for history
- [ ] Frontend chat UI scoped to a project/conversation
- [ ] Auth on socket connections (reuse JWT)

## 💳 8. Stripe payments
- [ ] Stripe account + test keys in `.env`
- [ ] Backend: create payment intent / checkout session tied to a `projects` row
- [ ] Webhook endpoint to confirm payment and update `payments` table status
- [ ] Frontend: Stripe Elements or Checkout redirect on project acceptance

## 🚀 9. Deploy
- [ ] Database: provision Neon or Supabase Postgres, run schema, update `.env`
- [ ] Backend: deploy `backend/` to Render or Railway, set env vars (DB, JWT secret, OpenAI, Stripe)
- [ ] Frontend: deploy `frontend/` to Vercel, point API base URL at deployed backend
- [ ] CORS: lock down `cors()` to the deployed frontend origin instead of wide open
- [ ] Smoke test full flow in production (register → login → post project → hire → pay)

## Suggested order
1 (finish backend CRUD + reviews) → 2 (auth middleware) → 3 (React shell) → 4 (dashboards) →
6 (photo upload, since projects/services need it) → 7 (messaging) → 8 (Stripe) → 5 (OpenAI, can slot in anytime) → 9 (deploy)

Adjust freely — 5 (OpenAI) has no dependencies on the others and can be pulled earlier or later.
