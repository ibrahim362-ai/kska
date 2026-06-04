# Changelog

All notable changes to Community Hub are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased] - 2026-06-04

### Added - Phase 6 (Cross-cutting Polish) — v1.0.0

#### Legal & Compliance
- **`legal/PRIVACY_POLICY.md`** — Compliant with Ethiopian Personal Data Protection Proclamation 808/2013
- **`legal/TERMS_OF_SERVICE.md`** — Comprehensive ToS with dispute resolution
- **`legal/REFUND_POLICY.md`** — Clear refund policy (7-day membership, prorated)

#### Testing Infrastructure
- **k6 load tests** in `loadtest/api.js` — tests 100-200 concurrent users, validates 95th percentile latency, custom metrics per endpoint
- **Playwright E2E tests** in `e2e/tests/` — auth, dashboard, users, payments, responsive (5 spec files, 25+ test cases)
- **CI integration** in CI workflow
- **HTML reports** auto-generated
- **Multi-browser support** (Chrome, Firefox, Safari, mobile Chrome, mobile Safari)

#### Operational Scripts
- **`scripts/smoke-test.sh`** — End-to-end smoke test (8 test categories, 25+ checks)
- **`scripts/backup.sh`** — Automated Postgres + uploads backup with retention
- **`scripts/restore.sh`** — Safe restore with confirmation prompt
- **Cron-friendly** with logging

#### Marketing
- **`marketing/index.html`** — Single-page landing site
  - Hero with stats
  - Features section (6 cards)
  - How it works (4 steps)
  - Pricing table (4 tiers)
  - CTA + footer
  - Mobile responsive
  - SEO optimized
  - No JavaScript (fast loading)
  - Lighthouse 95+ target

#### Documentation
- **Final README.md** — comprehensive project overview
- **DEPLOYMENT.md** — production deployment guide
- **CHANGELOG.md** — all changes documented
- All per-app READMEs updated
- Architecture diagrams

### Added - Phase 5 (Employer App)

#### Push Notifications (FCM)
- **Real FCM wiring** with `firebase_messaging` + `firebase_core` + `flutter_local_notifications`
- **`NotificationService`** singleton with permission handling, token registration
- **Token refresh** handler — re-registers with backend
- **Local notifications** as fallback

#### Real-time (Socket.io)
- **`SocketService`** with auto-connect on login
- **Reconnection** with exponential backoff
- **Event listeners**: notifications, ticket check-ins, ticket sold
- **Live updates** can be toggled on/off in dashboard

#### Localization (l10n)
- **3 locales**: English (default), Amharic (`am`), Afaan Oromoo (`om`)
- **60+ translatable strings** in `lib/l10n/`
- **`localeProvider`** with SharedPreferences persistence

#### Real-time Check-in Dashboard
- **Today counter** with live updates via socket
- **Last 12 hours bar chart** (fl_chart) showing hourly check-in distribution
- **Recent check-ins** list with timeago + precise timestamp
- **Live/offline toggle** (wifi icon in app bar)
- **Toast notifications** on each new check-in
- **Filter chips** (All / Unread)

#### QR Scanner Polish
- **Migrated to `mobile_scanner`** (modern, actively maintained)
- **Custom scan overlay** with rounded border
- **Live indicator** in top-left corner
- **Result overlay** with success/error icon
- **Torch toggle** button
- **Camera flip** button (front/back)
- **Manual entry fallback** when camera unavailable
- **Permission prompt** with retry + manual option
- **Camera error handling** with helpful messages

#### Dashboard Enhancements
- **5 stat cards**: Tickets, Sold, Check-ins, Revenue (ETB), more
- **Pie chart** (engagement) — checked-in vs pending
- **Live updates toggle** in app bar
- **Real-time toasts** for new check-ins
- **Quick actions**: Create, Bulk (placeholder), Scan, Check-ins

#### Notifications Inbox
- **Real-time updates** via socket
- **Type-based icons & colors** (TICKET_PURCHASED, TICKET_CHECKIN, PAYMENT)
- **Filter chips** (All / Unread) with counts
- **Mark single / mark all read**
- **Timeago + precise timestamp**
- **Empty states** for both filters

#### Build & Release
- **App icon generator** config in `pubspec.yaml`
- **Splash screen generator** config
- **Asset placeholders** in `assets/icon/`, `assets/splash/`
- **Same MOBILE_BUILD.md** applies (just change bundle ID/package)

#### Dependencies Added
- `firebase_core: ^3.6.0`
- `firebase_messaging: ^15.1.3`
- `flutter_local_notifications: ^18.0.1`
- `permission_handler: ^11.3.1`
- `socket_io_client: ^3.1.4`
- `fl_chart: ^0.69.2`
- `csv: ^6.0.0`
- `file_picker: ^8.1.4`
- `timeago: ^3.7.0`
- `cached_network_image: ^3.4.1`
- `mobile_scanner: ^5.2.3` (replaces qr_code_scanner)
- `flutter_localizations` (SDK)
- Dev: `integration_test`, `flutter_launcher_icons`, `flutter_native_splash`

### Added - Phase 4 (Mobile App)

#### Push Notifications (FCM)
- **Real FCM wiring** with `firebase_messaging` + `firebase_core` + `flutter_local_notifications`
- **`NotificationService`** singleton with permission handling, token registration, topic subscriptions
- **Local notifications** (fallback) for foreground
- **Token refresh** handler — re-registers with backend on token rotation
- **Backend** `user.service.registerFcmToken` / `unregisterFcmToken` (stores tokens as array in `deviceSessions`)
- **FCM service** with multi-token send (`sendEachForMulticast`) and **automatic cleanup of invalid tokens**
- **AndroidManifest** permission for POST_NOTIFICATIONS (Android 13+)

#### Real-time (Socket.io)
- **Riverpod provider** for socket service
- **Auto-connect** on login, **auto-disconnect** on logout
- **Reconnection** with exponential backoff (1s → 5s)
- **User room** auto-join on connect
- **Event listeners** for: vote updates, notifications, leaderboard, ticket check-in, post created
- **`isConnected` reactive state** via StateProvider

#### Localization (l10n)
- **3 locales**: English (default), Amharic (`am`), Afaan Oromoo (`om`)
- **ARB files** in `lib/l10n/` with 80+ translatable strings
- **`localeProvider`** with SharedPreferences persistence
- **Language picker** in profile screen
- **Plural support** for likes, comments, votes counts
- **Built-in Material/Rich text plurals** via `intl`

#### Profile Screen
- **Edit profile bottom sheet** — full name, bio, phone, avatar
- **Avatar upload** via image_picker + multipart upload to backend
- **Pull-to-refresh** to reload profile
- **Logout confirmation** dialog
- **User stats**: role badge, verified badge, join date (formatted with intl)
- **Cached network images** for avatar
- **Language picker** modal

#### Search & Filters
- **Reusable `SearchBarWidget`** with debounce (400ms default)
- **Reusable `FilterChipsRow`** for horizontal filters
- **Clear button** when text present
- **Generic** — can be used in any screen

#### Notifications Inbox
- **Real-time updates** via socket listener
- **All / Unread filter chips** with counts
- **Type-based icons & colors** (PAYMENT, TICKET, MEMBERSHIP, POST, VOTE, etc.)
- **`timeago` formatting** ("2 hours ago") + precise timestamp
- **Swipe-to-delete** with Dismissible
- **Unread indicator** (blue dot)
- **Mark single / mark all read**
- **Empty states** for both filters

#### Build & Release
- **`docs/MOBILE_BUILD.md`** — comprehensive guide for:
  - Firebase setup
  - Android keystore generation + signing
  - iOS code signing
  - Play Store upload
  - App Store upload via Xcode/Transporter
  - Version updates
  - Crash reporting setup
- **App icon generator config** in `pubspec.yaml` (`flutter_launcher_icons`)
- **Splash screen generator config** (`flutter_native_splash`)
- **Pre-release checklist** (15 items)

#### Dependencies Added
- `firebase_core: ^3.6.0`
- `firebase_messaging: ^15.1.3`
- `flutter_local_notifications: ^18.0.1`
- `permission_handler: ^11.3.1`
- `app_links: ^6.3.2` (deep links, prepared for Phase 4.8)
- `flutter_svg: ^2.0.16`
- `shimmer: ^3.0.0`
- `flutter_animate: ^4.5.0`
- `pull_to_refresh: ^2.0.0`
- `smooth_page_indicator: ^1.2.1`
- `timeago: ^3.7.0`
- `flutter_localizations` (SDK)
- Dev: `integration_test` (SDK), `flutter_launcher_icons`, `flutter_native_splash`

### Added - Phase 3 (Web Admin)

#### Reusable UI Components
- **`<DataTable>`** — TanStack Table-based with sort, filter, paginate, optional row selection
- **`<Toast>` / `showSuccess/showError/showPromise/...`** — react-hot-toast wrapper, themed
- **`<ErrorBoundary>`** — Catches React errors, reports to Sentry, shows user-friendly fallback with reset/reload
- **`<Skeleton>` family** — Text, Card, Table, Avatar, StatCard variants for loading states
- **`<EmptyState>`** — 5 variants (default, search, error, users, file) with custom icon/action support
- **`<ConfirmDialog>`** — Reusable confirmation modal (danger/warning/info variants) with loading state

#### Dashboard
- **6 stat cards** with trend indicators
- **User growth area chart** (7-day trend)
- **Revenue line chart** (7-day trend)
- **Distribution pie chart** (Users/Posts/Votes/Tickets)
- **Recent users** widget
- **Live activity feed** — real-time via Socket.io
- **Realtime connection indicator** (green dot when live, gray when offline)
- **Auto-refresh every 30 seconds**

#### User Management
- **Action menu** (3-dot) per user with: verify, reset password, change role, ban/unban, delete
- **Role filter** (USER, EMPLOYER, ADMIN, SUPER_ADMIN)
- **Status filter** (ALL, ACTIVE, BANNED)
- **Ban with reason** modal
- **Delete with confirmation** — warns about cascading data
- **Reset password** with generated password shown in toast
- **Role change** with role picker
- **ConfirmDialog integration** for all destructive actions
- **Toast notifications** for all actions (success/error)

#### Real-time (Socket.io)
- **Admin room** — admins receive all user notifications
- **`joinAdminRoom()`** / **`leaveAdminRoom()`** helpers
- **Connection state** — `isSocketConnected()` for UI feedback
- **Reconnection** — automatic with exponential backoff
- **Event handlers** — `onUserActivity` for new activity feed

#### Form Validation
- **Zod schemas** in `src/validation/schemas.ts` — reusable across forms
- **Common schemas**: signin, signup, changePassword, manualPaymentProof, reviewProof
- **Type inference** — `z.infer<typeof schema>` for type-safe forms
- **Password complexity** — uppercase, lowercase, number, min 8 chars
- **Phone validation** — E.164-ish format
- **`flattenZodErrors()`** helper for react-hook-form integration

#### Testing
- **Vitest + Testing Library** setup with jsdom
- **Coverage thresholds** — 50% lines/functions (configurable)
- **Test files**:
  - `Skeleton.test.tsx` — 7 test cases
  - `EmptyState.test.tsx` — 5 test cases
  - `ConfirmDialog.test.tsx` — 8 test cases
  - `ErrorBoundary.test.tsx` — 5 test cases
- **Test scripts**: `npm test` (watch), `npm run test:run`, `npm run test:coverage`
- **CI integration** — GitHub Actions runs web-admin tests

#### Dependencies Added
- `@tanstack/react-table` ^8.20.5
- `react-hook-form` ^7.54.0
- `react-hot-toast` ^2.4.1
- `@testing-library/react` ^16.1.0
- `@testing-library/jest-dom` ^6.6.3
- `@testing-library/user-event` ^14.5.2
- `vitest` ^2.1.8
- `jsdom` ^25.0.1

### Added - Phase 2 (Backend Hardening)

#### Security
- **Per-user rate limiting** — Redis-backed (falls back to in-memory) with named limiters for auth, password reset, uploads, posts, votes, purchases, admin actions
- **XSS sanitization middleware** — Strips `<script>`, `javascript:`, `on*` event handlers, `<iframe>` from all string inputs
- **CORS whitelist** — Env-based, no wildcards in production
- **Helmet CSP** — Content-Security-Policy enabled in production
- **Request ID middleware** — UUID per request, exposed via `X-Request-Id` header for tracing
- **API versioning headers** — `X-API-Version`, `X-API-Name`, `X-API-Released`
- **DB composite indexes** for hot paths: `Post(userId,createdAt)`, `Notification(userId,isRead)`, `TicketPurchase(ticketId,status)`, `ManualPaymentProof(userId,status)`

#### Monitoring
- **Deep health check** at `/api/health/deep` — checks Postgres, Redis, disk space; returns 200/503 based on status

#### Testing
- **8 new test suites**:
  - `auth.test.ts` — signup, signin, JWT, RBAC, rate limiting (15+ cases)
  - `post.test.ts` — CRUD, like, comment, ownership (8 cases)
  - `vote.test.ts` — create, cast, double-vote prevention, results (8 cases)
  - `ticket.test.ts` — create, purchase, sold count, double-purchase (7 cases)
  - `membership.test.ts` — list, purchase, conflict, public access (5 cases)
  - `manualPayment.test.ts` — instructions, submit, review, RBAC (5 cases)
  - `healthDeep.test.ts` — basic + deep health (2 cases)
  - `sanitize.test.ts` — XSS prevention (3 cases)

#### Documentation
- **`docs/postman/community-hub.postman_collection.json`** — Full Postman collection (50+ requests) with auto-save tokens, environment variables
- **`backend/docs/INDEXES.md`** — DB index audit with query path documentation
- **Swagger/OpenAPI** at `/api/docs` (auto-generated from JSDoc)

### Added - Phase 1 (Manual Payment)
- **`ManualPaymentProof` Prisma model** — receipt URL, sender info, status, review tracking
- **Public endpoint** `GET /api/manual-payments/instructions` — bank accounts (CBE, Telebirr, Awash)
- **User endpoints**: `POST /:paymentId/proof` (multipart upload), `GET /proofs/my`
- **Admin endpoints**: `GET /proofs`, `GET /proofs/:id`, `PUT /proofs/:id/review` (approve/reject with reason)
- **Auto-activation** — On approval, backend activates related membership or ticket + creates notification + queues email
- **Mobile UI** — `mobile/lib/features/payments/screens/manual_payment_screen.dart` with image picker, date picker, form validation
- **Admin UI** — `web-admin/src/pages/payments/PaymentsPage.tsx` with tabs, image preview, approve/reject modals
- **Chapa + Telebirr services stubbed** — throw informative error if called

### Added - Phase 0 (Foundation)
- **Docker Compose** — Postgres 16 + Redis 7 + Backend with health checks
- **Multi-stage Dockerfile** — production-optimized with tini, non-root user, OpenSSL for Prisma
- **GitHub Actions CI** — lint, typecheck, test (Postgres + Redis services), build, security audit
- **Sentry integration** — backend (with tracing) + web admin (browser + router)
- **BullMQ background jobs** — email queue, push notification queue, leaderboard recompute (Redis-backed)
- **Graceful shutdown** — SIGTERM/SIGINT handlers, queue draining
- **Jest setup** — ts-jest, supertest, coverage thresholds
- **ESLint** — TypeScript-aware, custom rules
- **`.env.example`** templates (root + backend + web-admin)
- **Root `.gitignore`** — comprehensive
- **README + DEPLOYMENT docs**

## [1.0.0] - 2025-XX-XX (Pre-launch)

Initial project scaffold with 4 apps: backend, mobile, employer_app, web-admin.

---

## Migration Notes

### v1 → v2 (manual payment introduction)

If you have an existing database:

```bash
# 1. Update schema
npx prisma db pull  # if you have schema changes to detect
# or just run migrate dev to create the new table
npx prisma migrate dev --name add_manual_payment_proof

# 2. Restart services
docker compose restart backend
```

### v1 → v2 (rate limiting introduction)

No DB changes, but you must:
```bash
cd backend
npm install  # picks up rate-limit-redis
```

If Redis is unavailable, the rate limiter falls back to in-memory (works but doesn't sync across instances).
