# Bil Flow - Local and Production Readiness Test Report

Date: 2025-10-14

## Local Environment
- Backend
  - Start: cd server; npm ci; npm run dev
  - Health: GET http://localhost:3001/health → 200 OK
  - DB: SQLite auto-initialized (schema.sql applied)
- Frontend
  - Start: npm ci; npm run dev
  - Base URL: VITE_API_URL=http://localhost:3001/api

## API Smoke Tests (expected 2xx)
- Auth
  - POST /api/auth/send-otp { phone }
  - POST /api/auth/verify-otp { phone, otp } (dev-mode accepts simulated)
  - GET /api/auth/profile (with Bearer token)
- Listings
  - GET /api/listings?type=sale
  - POST /api/listings (auth required)
- Favorites
  - POST /api/favorites/toggle (auth required)
- Locations
  - GET /api/locations/provinces
- Admin
  - POST /api/auth/admin/login { username, password }
- Orders
  - POST /api/orders (auth required)
  - GET /api/orders?customer_id={id}
  - PATCH /api/orders/{id}/status (admin)
- Inquiries
  - POST /api/inquiries
  - GET /api/inquiries?ad_id={id} (admin)

## Production Readiness Checklist
- Environment
  - Backend: PORT, FRONTEND_URL, JWT_SECRET, NODE_ENV=production, optional SMS_*
  - Frontend: VITE_API_URL=https://api.example.com/api
- CSP
  - netlify.toml and _headers: connect-src includes your API domain
- Storage
  - Persistent disk for SQLite server/database/bilflow.db
- Security
  - Helmet enabled, rate limits applied (global, OTP)
  - JWT secret strong and rotated periodically
- Routing
  - orders and inquiries registered under /api

## Notes
- OTP in dev logs simulated code; in production configure SMS_*.
- If SQLite json1 is unavailable on your host, tags filter can fallback to LIKE.
