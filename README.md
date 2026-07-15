# Project Contractor

A backend API for a contractor/services marketplace — connecting clients with contractors for projects, services, reviews, and payments.

## Status: Early backend scaffolding

This project is in its initial setup phase. Below is a snapshot of what exists so far.

## What's been built

### Backend server (`backend/`)
- Express 5 app (`server.js`) with CORS and JSON body parsing enabled
- Health check route (`GET /`) and a DB connectivity test route (`GET /database-test`)
- PostgreSQL connection pool (`db.js`) via `pg`, configured from environment variables
- `.env`-based configuration (loaded with `dotenv`, gitignored)

### Auth & Users
- `POST /api/users/register` — creates a user, hashing passwords with `bcrypt`
- `POST /api/users/login` — verifies credentials and issues a JWT (`jsonwebtoken`, 1-day expiry)
- MVC-style structure: `routes/userRoutes.js` → `controllers/userController.js` → `models/userModel.js`

### Database schema (`database/`)
Tables defined for the full marketplace domain, not just users yet:
- `users` — accounts with role and location
- `contractor_profiles` — skills, experience, hourly rate, linked 1:1 to a user
- `services` — offerings posted by contractors
- `projects` — client ↔ contractor engagements with status tracking
- `project_images` — images attached to a project
- `reviews` — ratings/comments tied to a completed project
- `messages` — direct messages between users, optionally scoped to a project
- `payments` — payment records per project

Only the `users` table is currently wired up to actual API code; the rest of the schema is scaffolded ahead of the corresponding routes/controllers/models.

## Not yet in place
- No routes/controllers/models beyond `users`
- No auth middleware to protect routes with the issued JWT
- No input validation
- No tests

## Housekeeping note
`database/schema.sql` shows as deleted in git status while `database/schema.sql1` is untracked — looks like the file may have been accidentally recreated with a stray `1` in the name. Worth confirming and renaming back to `schema.sql` before committing.

## Tech stack
- Node.js / Express 5
- PostgreSQL (`pg`)
- bcrypt, jsonwebtoken
- cors, dotenv
