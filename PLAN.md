# Project Contractor — Roadmap

## Progress Overview
- [x] 1. Backend foundation — core flows tested and working (register/login/profile/service/project), polish items remain below
- [ ] 2. Connect login with JWT (auth middleware)
- [x] 3. Build the React UI — Vite app scaffolded and verified in a real browser (home, register, login, browse services, service detail); dashboards/uploads/messaging/payments still stubs
- [ ] 4. Contractor and client dashboards
- [ ] 5. Integrate the OpenAI API
- [ ] 6. Upload project photos
- [ ] 7. Real-time messaging
- [ ] 8. Stripe payments
- [ ] 9. Deploy

## ✅ 1. Backend foundation (you're here)
- [x] Express server + PostgreSQL pool (`server/server.js`, `server/db.js`)
- [x] Schema: `users`, `contractor_profiles`, `services`, `projects`, `project_images`, `reviews`, `messages`, `payments`
- [x] `users` — register (bcrypt) + login (JWT)
- [x] `contractor_profiles` — create profile
- [x] `services` — create service
- [x] `projects` — create project
- [x] `GET /api/services` (list) and `GET /api/services/:id`, `GET /api/projects/:id` — added to support the React UI
- [ ] Remaining CRUD: GET (contractors, all projects), PUT/DELETE across the board
- [ ] `reviews` routes/controller/model (schema exists, no code yet)
- [ ] Input validation on request bodies (e.g. `express-validator` or `zod`)
- [ ] Confirm `database/schema.sql1` → rename back to `schema.sql` and commit

## 🔐 2. Connect login with JWT (auth middleware)
- [ ] `middleware/authMiddleware.js` — verify `Authorization: Bearer <token>`, attach `req.user`
- [ ] Protect write routes (create project, create service, create profile) with the middleware
- [ ] Role-based guards (`client` vs `contractor`) where relevant
- [ ] Refresh-token or re-login flow once the 1-day JWT expires
- [ ] Frontend: store token (httpOnly cookie preferred over localStorage), attach to API calls

## 🎨 3. Build the React UI
- [x] Scaffold `client/` (Vite + React)
- [x] Routing (`react-router`): landing, login/register, browse services, service detail, project detail
- [x] API layer (axios wrapper in `client/src/api/`, JWT attached via interceptor)
- [x] Shared layout (`Navbar`/`Layout`), forms for register/login/create-service/create-project
- [x] Env-based API base URL (`VITE_API_URL` in `client/.env`) for local vs deployed backend
- [ ] Browse/detail pages for projects and contractors (only services browse exists so far)
- [ ] Create-service/create-project forms currently require typing in raw `contractor_id`/`client_id` — needs the profile-lookup wiring from Phase 4

## 👤 4. Contractor and client dashboards
- [ ] Role-aware routing after login (redirect based on `user.role`)
- [ ] Contractor dashboard: manage profile, services, incoming project requests
- [ ] Client dashboard: post projects, browse/hire contractors, track project status
- [ ] Shared: project status view (pending/active/completed), reviews left/received

## 🤖 5. Integrate the OpenAI API
- [ ] Decide the use case (e.g. auto-generate service descriptions, project summaries, or a support chatbot)
- [ ] Backend route that calls OpenAI server-side (never expose the API key to the client)
- [ ] Store `OPENAI_API_KEY` in `server/.env` (gitignored, already set up)

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
- [ ] Backend: deploy `server/` to Render or Railway, set env vars (DB, JWT secret, OpenAI, Stripe)
- [ ] Frontend: deploy `client/` to Vercel, point API base URL at deployed backend
- [ ] CORS: lock down `cors()` to the deployed frontend origin instead of wide open
- [ ] Smoke test full flow in production (register → login → post project → hire → pay)

## Suggested order
1 (finish backend CRUD + reviews) → 2 (auth middleware) → 3 (React shell) → 4 (dashboards) →
6 (photo upload, since projects/services need it) → 7 (messaging) → 8 (Stripe) → 5 (OpenAI, can slot in anytime) → 9 (deploy)

Adjust freely — 5 (OpenAI) has no dependencies on the others and can be pulled earlier or later.
