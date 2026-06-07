# KSKA

A multi-platform community engagement platform for **Ethiopia** 🇪🇹. Posts, events, voting, memberships, and **manual payment** verification.

> **Status:** ✅ **100% complete** (Production-ready) — All 6 phases delivered
> **Version:** 1.0.0
> **Last updated:** June 4, 2026

## 🏗 Architecture

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   mobile (Flutter)│  │ employer_app    │  │   web-admin     │
│  Job Seeker App  │  │  (Flutter)      │  │  (React 19)     │
└────────┬─────────┘  └────────┬─────────┘  └────────┬────────┘
         │                    │                     │
         │     HTTPS / REST + Socket.io            │
         └────────────────────┼─────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   Backend API      │
                    │  (Node 20 + Express)│
                    │   Port 5000        │
                    └─────────┬──────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
        ┌─────▼─────┐  ┌──────▼──────┐  ┌──────▼──────┐
        │ PostgreSQL│  │   Redis     │  │ Cloudinary  │
        │   16      │  │  (BullMQ)   │  │  (uploads)  │
        └───────────┘  └─────────────┘  └─────────────┘
```

## 📂 Project Structure

| Folder | Stack | Purpose |
|---|---|---|
| `backend/` | Node 20 + Express 5 + Prisma 7 + TS | REST API + Socket.io + BullMQ |
| `mobile/` | Flutter 3 + Riverpod + Firebase | Job seeker mobile app (iOS + Android) |
| `employer_app/` | Flutter 3 + Riverpod + Firebase | Employer mobile app (iOS + Android) |
| `web-admin/` | React 19 + Vite + TS + Tailwind v4 | Admin web panel |
| `marketing/` | Static HTML | Landing page |
| `e2e/` | Playwright | End-to-end tests |
| `loadtest/` | k6 | Load testing |
| `scripts/` | Bash | Smoke tests, backup, restore |
| `legal/` | Markdown | Privacy, Terms, Refund policies |
| `docs/` | Markdown | API, mobile build, Postman |
| `.github/` | YAML | CI/CD workflows |
| `docker-compose.yml` | — | Local dev stack |
| `Dockerfile` (backend) | — | Production container |

## ✨ Features

### For Everyone
- 📱 **Mobile apps** (iOS + Android) — job seeker + employer
- 💻 **Web admin panel** with 12 management pages
- 🗳️ **Voting & polls** with real-time results
- 🎫 **Event tickets** with QR codes
- 📸 **Posts** with images, comments, likes, saves
- 🏆 **Leaderboards** (weekly/monthly)
- 🔔 **Real-time push notifications** (FCM)
- 🔌 **Real-time** updates via Socket.io
- 🌍 **3 languages**: English, Amharic (አማርኛ), Afaan Oromoo

### For Admins
- 👥 User management (ban, verify, role change)
- 💳 **Manual payment** approval (24h SLA)
- 📊 Dashboard with 6 stat cards + 4 chart types
- 📋 Bulk operations
- 🔍 Advanced filters and search
- 📈 Real-time activity feed

### For Employers
- 🎫 Create + manage tickets
- 📷 QR check-in with camera
- 📊 Sales analytics
- 🔔 Check-in notifications
- 📈 Real-time engagement charts

## 🚀 Quick Start

### Local Development (Docker)

```bash
# 1. Clone and configure
git clone <repo>
cd kska
cp .env.example .env
cp backend/.env.example backend/.env
cp web-admin/.env.example web-admin/.env

# 2. Start the stack
docker compose up -d

# 3. Initialize database
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run db:seed

# 4. Verify
curl http://localhost:5000/api/health
open http://localhost:5000/api/docs  # Swagger
```

### Manual Setup (no Docker)

```bash
# Backend
cd backend
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev  # http://localhost:5000

# Web Admin
cd web-admin
npm install
npm run dev  # http://localhost:5173

# Mobile
cd mobile
flutter pub get
flutter run
```

## 🧪 Quality Assurance

### Tests
- **Backend:** 55+ Jest tests (auth, posts, votes, tickets, memberships, payments, sanitize, health)
- **Web Admin:** 25+ Vitest tests (Skeleton, EmptyState, ConfirmDialog, ErrorBoundary)
- **E2E:** Playwright tests (auth, dashboard, users, payments, responsive)
- **Load:** k6 tests (100-200 concurrent users)

### Run tests

```bash
# Backend
cd backend && npm test

# Web Admin
cd web-admin && npm test

# E2E
cd e2e && npm test

# Load
cd loadtest && k6 run api.js
```

## 🏭 Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step DigitalOcean/Railway/Render deployment.

Quick production checklist:
```bash
# 1. Update env vars
cp .env.example .env
# Edit: real DATABASE_URL, JWT secrets, Cloudinary keys, etc.

# 2. Build and start
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 3. Run migrations
docker compose exec backend npx prisma migrate deploy

# 4. Verify
./scripts/smoke-test.sh https://api.kska.com

# 5. Set up cron for backups
crontab -e
# Add: 0 2 * * * /opt/kska/scripts/backup.sh
```

## 💳 Manual Payment Flow

The platform uses **manual bank transfer payments** (not Chapa/Telebirr auto-pay):

1. User selects paid item (membership/ticket)
2. Sees bank accounts (CBE, Telebirr, Awash) in app
3. Pays offline to one of the accounts
4. Uploads receipt screenshot + sender details
5. Admin sees in **Web Admin → Payments → Manual Proofs**
6. Approves or rejects (with reason)
7. **Membership/ticket auto-activates** on approval
8. User receives email + push notification

Configure your bank accounts in `backend/.env`:
```env
MANUAL_PAYMENT_BANK_NAME="Commercial Bank of Ethiopia"
MANUAL_PAYMENT_ACCOUNT_NUMBER="1000123456789"
MANUAL_PAYMENT_ACCOUNT_HOLDER="KSKA PLC"
MANUAL_PAYMENT_TELEBIRR_NUMBER="0911223344"
```

## 🌍 Localization

The mobile + employer apps support 3 languages:
- 🇬🇧 English (default)
- 🇪🇹 Amharic (አማርኛ) — `am`
- 🇪🇹 Afaan Oromoo — `om`

Translation files in `lib/l10n/`. To add a new language:
1. Create `lib/l10n/app_<code>.arb`
2. Run `flutter gen-l10n`
3. Test

## 🔐 Security

- ✅ **Helmet** for HTTP security headers
- ✅ **CORS** whitelist (env-based, no wildcards)
- ✅ **JWT** access + refresh tokens (15min + 7d)
- ✅ **bcrypt** password hashing (cost 12)
- ✅ **Rate limiting** per-user (8 named limiters)
- ✅ **XSS sanitization** on all string inputs
- ✅ **SQL injection** prevented by Prisma ORM
- ✅ **RBAC** (USER, EMPLOYER, ADMIN, SUPER_ADMIN)
- ✅ **Audit logs** for sensitive actions
- ✅ **Sentry** error tracking
- ✅ **Complies** with Ethiopian data law (Proclamation 808/2013)

## 📊 Performance

Targets (verified by k6 load tests):
- HTTP p95: < **500ms**
- HTTP p99: < **1500ms**
- Error rate: < **5%** at 200 concurrent users
- 99.9% uptime SLA

## 📚 Documentation

- [README.md](./README.md) — this file
- [DEPLOYMENT.md](./DEPLOYMENT.md) — production deployment
- [CHANGELOG.md](./CHANGELOG.md) — all notable changes
- [docs/MOBILE_BUILD.md](./docs/MOBILE_BUILD.md) — mobile build & release
- [docs/INDEXES.md](./backend/docs/INDEXES.md) — DB index audit
- [e2e/README.md](./e2e/README.md) — E2E tests
- [loadtest/README.md](./loadtest/README.md) — load testing
- [scripts/README.md](./scripts/README.md) — operational scripts
- [legal/PRIVACY_POLICY.md](./legal/PRIVACY_POLICY.md) — privacy
- [legal/TERMS_OF_SERVICE.md](./legal/TERMS_OF_SERVICE.md) — ToS
- [legal/REFUND_POLICY.md](./legal/REFUND_POLICY.md) — refunds
- API Swagger: `/api/docs` (when running)

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes
3. Run all tests: `npm test && cd ../e2e && npm test`
4. Commit using [Conventional Commits](https://www.conventionalcommits.org/): `git commit -m "feat(scope): description"`
5. Push and create a PR

## 📞 Contact

- **Email:** hello@kska.com
- **Support:** support@kska.com
- **Privacy:** privacy@kska.com
- **Legal:** legal@kska.com
- **Address:** Bole, Addis Ababa, Ethiopia 🇪🇹
- **Phone:** +251 91 234 5678

## 📜 License

Proprietary — © 2026 KSKA PLC. All rights reserved.
