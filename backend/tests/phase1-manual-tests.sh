#!/usr/bin/env bash
# Manual test log for Phase 1 (backend foundation).
# These were run against a local server (npm start) on 2026-07-14 to verify
# the auth, contractor, service, and project endpoints end to end.
# Uncomment and run individually against a local server if you need to re-verify.
#
# Setup: start the server first
#   cd backend && node server.js

# --- Health check ---
# curl -s -w "\n[status: %{http_code}]\n" http://localhost:5000/
# Expected: "The Contractor API is running", 200

# --- Database connectivity ---
# curl -s -w "\n[status: %{http_code}]\n" http://localhost:5000/database-test
# Expected: [{"now": "<timestamp>"}], 200

# --- Register a contractor user ---
# curl -s -w "\n[status: %{http_code}]\n" -X POST http://localhost:5000/api/users/register \
#   -H "Content-Type: application/json" \
#   -d '{"name":"Test Contractor","email":"phase1test_contractor@example.com","password":"pass1234","role":"contractor","location":"Austin, TX"}'
# Expected: 201, user object (no password in response)

# --- Register a client user ---
# curl -s -w "\n[status: %{http_code}]\n" -X POST http://localhost:5000/api/users/register \
#   -H "Content-Type: application/json" \
#   -d '{"name":"Test Client","email":"phase1test_client@example.com","password":"pass1234","role":"client","location":"Austin, TX"}'
# Expected: 201, user object

# --- Login: correct password ---
# curl -s -w "\n[status: %{http_code}]\n" -X POST http://localhost:5000/api/users/login \
#   -H "Content-Type: application/json" \
#   -d '{"email":"phase1test_contractor@example.com","password":"pass1234"}'
# Expected: 200, { message, token }

# --- Login: wrong password ---
# curl -s -w "\n[status: %{http_code}]\n" -X POST http://localhost:5000/api/users/login \
#   -H "Content-Type: application/json" \
#   -d '{"email":"phase1test_contractor@example.com","password":"wrongpass"}'
# Expected: 400, "Wrong password"

# --- Login: unknown email ---
# curl -s -w "\n[status: %{http_code}]\n" -X POST http://localhost:5000/api/users/login \
#   -H "Content-Type: application/json" \
#   -d '{"email":"doesnotexist@example.com","password":"whatever"}'
# Expected: 400, "User not found"

# --- Create contractor profile ---
# curl -s -w "\n[status: %{http_code}]\n" -X POST http://localhost:5000/api/contractors/profile \
#   -H "Content-Type: application/json" \
#   -d '{"user_id":3,"business_name":"Test Contracting Co","phone":"555-1234","availability":"weekdays","description":"General contracting","skills":"plumbing,electrical","experience_years":5,"hourly_rate":45.50}'
# Expected: 201, profile object (user_id must reference a real users.id)

# --- Create service ---
# curl -s -w "\n[status: %{http_code}]\n" -X POST http://localhost:5000/api/services \
#   -H "Content-Type: application/json" \
#   -d '{"contractor_id":2,"title":"Bathroom Remodel","category":"plumbing","description":"Full bathroom remodel","price":2500,"location":"Austin, TX"}'
# Expected: 201, service object (contractor_id must reference contractor_profiles.id)

# --- Create project ---
# curl -s -w "\n[status: %{http_code}]\n" -X POST http://localhost:5000/api/projects \
#   -H "Content-Type: application/json" \
#   -d '{"client_id":4,"contractor_id":2,"title":"Kitchen Renovation","description":"Full kitchen remodel","price":8000,"location":"Austin, TX"}'
# Expected: 201, project object with status "pending"
# (Regression check: verifies the missing-comma bug in models/projectModel.js stays fixed)

# --- KNOWN GAPS as of this run (see PLAN.md Phase 1) ---

# Duplicate email registration -> currently 500 instead of 409
# curl -s -w "\n[status: %{http_code}]\n" -X POST http://localhost:5000/api/users/register \
#   -H "Content-Type: application/json" \
#   -d '{"name":"Dup","email":"phase1test_contractor@example.com","password":"pass1234","role":"contractor","location":"X"}'
# Actual: 500, "Error creating user" (unique constraint 23505 not handled)

# Malformed JSON body -> leaks a full stack trace / file paths in the response
# curl -s -w "\n[status: %{http_code}]\n" -X POST http://localhost:5000/api/users/register \
#   -H "Content-Type: application/json" \
#   -d '{not valid json'
# Actual: 400, default Express HTML error page with stack trace (needs a JSON error handler)

# Missing required fields on project creation -> currently 500 instead of 400
# curl -s -w "\n[status: %{http_code}]\n" -X POST http://localhost:5000/api/projects \
#   -H "Content-Type: application/json" \
#   -d '{"title":"No client or contractor"}'
# Actual: 500, "Error creating project" (DB NOT NULL violation not handled, no request validation)
