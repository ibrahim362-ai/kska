# Prisma Migrations

This directory contains versioned database migrations. **DO NOT** edit files here manually — Prisma generates them.

## Workflow

### First-time setup (initial migration)

```bash
cd backend
npx prisma migrate dev --name init
```

This will:
1. Create the initial SQL migration in `prisma/migrations/<timestamp>_init/migration.sql`
2. Apply it to the database
3. Regenerate the Prisma client

### Creating a new migration (schema changes)

```bash
# 1. Edit prisma/schema.prisma
# 2. Run:
npx prisma migrate dev --name descriptive_name
# Example: --name add_manual_payment_proof
```

This will:
1. Compare your schema to the current DB
2. Generate a new SQL migration
3. Apply it
4. Regenerate the Prisma client

### Applying migrations (production / CI / Docker)

```bash
npx prisma migrate deploy
```

This applies any pending migrations **without** prompting. Safe for production.

### Resetting the database (DESTRUCTIVE - dev only)

```bash
npx prisma migrate reset
```

This will:
1. Drop the database
2. Re-apply all migrations
3. Run the seed script (if configured)

## Why migrations instead of `prisma db push`?

- `db push` = sync schema to DB without version control. Fine for prototypes, **dangerous in production**.
- `migrate dev` = versioned, reviewable, reversible (with caveats), production-safe.

## CI / Production

The Dockerfile runs `npx prisma migrate deploy` before starting the server.
GitHub Actions runs the same command in the `test` job.
