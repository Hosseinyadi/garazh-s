# Bil Flow - Deployment Readiness Checklist

## Backend (Express + SQLite)
- Env vars
  - PORT=3001
  - FRONTEND_URL=https://your-frontend-domain
  - JWT_SECRET=strong-secret
  - NODE_ENV=production
  - SMS_* (optional)
- Storage
  - Ensure persistent disk for server/database/bilflow.db
- Start command
  - npm ci --omit=dev && npm start
- Networking
  - Expose /api on HTTPS (e.g., https://api.example.com)

## Frontend (Vite React)
- Env var
  - VITE_API_URL=https://api.example.com/api
- Build
  - npm ci && npm run build
- Hosting
  - Netlify publish: dist/
  - netlify.toml: connect-src includes API domain

## Final Validation
- Health: GET https://api.example.com/health → 200
- OTP flow: send-otp, verify-otp, token
- Listings CRUD (auth)
- Favorites toggle (auth)
- Orders (create/list), status change (admin)
- Inquiries (create), list/update (admin)
