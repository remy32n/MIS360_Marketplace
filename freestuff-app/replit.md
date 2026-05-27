# Free Stuff on Campus

A full-stack web app for DePaul University (MIS 360 prototype) where student orgs post free item giveaways and students discover and save them in real time.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/freestuff run dev` — run the React frontend (port 26210, proxied at `/`)
- `pnpm --filter @workspace/api-server run db:push` — push Prisma schema changes to DB
- `pnpm --filter @workspace/api-server run db:seed` — seed demo data
- `pnpm --filter @workspace/api-server run db:setup` — push + seed (full reset)
- `pnpm --filter @workspace/api-server exec prisma generate --schema=prisma/schema.prisma` — regenerate Prisma client after schema changes
- Required env: `DATABASE_URL` (Replit PostgreSQL), `SESSION_SECRET` (JWT signing)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- **Frontend:** React 19 + Vite, react-router-dom v6, Axios, Tailwind CSS v4, shadcn/ui
- **Backend:** Express 5, Prisma ORM v7 + pg driver adapter, PostgreSQL
- **Auth:** JWT in httpOnly cookies, bcryptjs password hashing
- **Validation:** express-rate-limit
- **Build:** esbuild (CJS bundle for API), Vite (frontend)

## Where things live

- `artifacts/api-server/` — Express API server
  - `src/modules/identity/` — auth routes (signup, login, logout, me)
  - `src/modules/listings/` — listing CRUD + admin approval flow
  - `src/modules/engagement/` — saved items, notifications, admin stats
  - `src/middleware/` — auth, requireAdmin, requireOrg, validate
  - `src/lib/prisma.ts` — Prisma singleton with pg adapter
  - `prisma/schema.prisma` — DB schema (source of truth)
  - `prisma/seed.js` — demo data seeder
  - `prisma.config.ts` — Prisma v7 config with DATABASE_URL
- `artifacts/freestuff/` — React frontend
  - `src/services/api.ts` — Axios service layer (authAPI, listingsAPI, engagementAPI)
  - `src/contexts/AuthContext.tsx` — global auth state, role helpers
  - `src/pages/` — auth/, student/, org/, admin/ pages
  - `src/components/` — Navbar, ListingCard, ApprovalCard, route guards

## Architecture decisions

- **Prisma v7 driver adapter pattern:** Prisma 7 dropped datasource `url` in schema files. Connection string goes in `prisma.config.ts` (for CLI) and the pg Pool adapter is passed to `PrismaClient({ adapter })` at runtime.
- **JWT in httpOnly cookies:** Tokens are stored server-side in cookies (not localStorage) to prevent XSS. Cookie name: `token`, `sameSite: lax`, secure in production.
- **Role-based middleware chain:** `requireAuth` → `requireAdmin` / `requireOrg` — composable Express middleware for each role.
- **Listing lifecycle:** PENDING → ACTIVE (admin approves) or REJECTED. ACTIVE listings auto-display; can be REMOVED by poster or admin. EXPIRED handled by endTime check.
- **Notification fan-out:** On listing approval, admin broadcasts IN_APP notifications to all STUDENT users.

## Product

Three user roles with distinct experiences:
- **Students** — browse active free-item listings by category, save items, get notifications
- **Orgs/Faculty** — post giveaway listings (require admin verification), manage their listings
- **Admins** — approve/reject pending listings, view all activity, platform stats

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@depaul.edu | admin123 |
| Student | student1@depaul.edu | student123 |
| Student | student2@depaul.edu | student123 |
| Student | student3@depaul.edu | student123 |
| Org (Verified) | robotics@depaul.edu | org123 |
| Org (Verified) | csclub@depaul.edu | org123 |
| Org (Pending) | sga@depaul.edu | org123 |

## User preferences

- Academic project for MIS 360 at DePaul University
- Exact file structure matters for academic presentation
- DePaul brand colors: Blue `#005EB8`, Red `#C8102E`, Green accent `#22c55e`
- Fonts: DM Sans (body), Fraunces (headings)

## Gotchas

- **Prisma v7:** Always use `prisma generate --schema=prisma/schema.prisma` and `prisma db push --schema=prisma/schema.prisma`. The config lives in `prisma.config.ts`, not in `schema.prisma`.
- **pnpm approve-builds:** After adding `@prisma/adapter-pg` or other native packages, run `pnpm approve-builds` if postinstall scripts are blocked.
- **Listing status APPROVED vs ACTIVE:** The DB enum has both, but `updateStatus` sets APPROVED→ACTIVE. The `APPROVED` enum value is kept for potential future partial-approval workflows.
- **Never call localhost:8080 directly** — use `localhost:80/api` through the shared proxy.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Prisma schema: `artifacts/api-server/prisma/schema.prisma`
- API routes mounted at `/api` — identity at `/api/auth/...`, listings at `/api/listings/...`, engagement at `/api/engagement/...`
