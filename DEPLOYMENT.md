# Deployment — Netlify + Supabase Postgres

Manual deployment guide.

## 1. Create the Supabase database

1. Create a project at https://supabase.com.
2. Go to **Project Settings → Database → Connection string**.
3. Copy the **Connection pooling** (Transaction mode, port `6543`) string — this is your
   runtime `DATABASE_URL`. Append `?pgbouncer=true` if not present.
   ```
   postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
4. Also copy the **direct** string (port `5432`) — used only for schema push / seed from your
   machine.

## 2. Initialize the database schema (run locally, once)

The build does NOT touch the database. Push the schema and seed from your machine using the
**direct (5432)** connection.

```bash
# point to the direct (non-pooled) Supabase URL just for these commands
export DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres"

npm install
npm run db:push     # creates all tables
npm run db:seed     # inserts demo data (idempotent — safe to re-run)
```

`db:seed` uses upserts with deterministic IDs, so running it multiple times does not duplicate data.

## 3. Connect the repo to Netlify

1. New site → **Import from Git** → select this repository and branch.
2. Build settings are read from `netlify.toml`:
   - Build command: `prisma generate && next build`
   - Publish directory: `.next`
   - Plugin: `@netlify/plugin-nextjs` (handles SSR/route handlers as Node functions)
3. No build-time DB access is required.

## 4. Set environment variables in Netlify

**Site configuration → Environment variables** — add:

| Variable              | Value                                                            |
| --------------------- | ---------------------------------------------------------------- |
| `DATABASE_URL`        | Supabase **pooled** string (port 6543, `?pgbouncer=true`)        |
| `AUTH_SECRET`         | 32+ char random string — `openssl rand -base64 32`               |
| `NEXT_PUBLIC_APP_URL` | Your site URL, e.g. `https://your-site.netlify.app`              |
| `EMAIL_PROVIDER`      | `mock`                                                           |

## 5. Deploy

Trigger a deploy (push to the branch or "Trigger deploy"). After it goes live:

- App: `https://your-site.netlify.app`
- Login: `admin@cabinet.ro` / `parola123`
- Public booking: `https://your-site.netlify.app/book`

## Notes

- All Prisma access runs in the **Node.js runtime** (route handlers declare
  `export const runtime = "nodejs"`; pages/server actions are Node by default).
- The **middleware runs on Edge** and uses only `jose` for JWT verification — it never imports Prisma.
- Schema changes: re-run `npm run db:push` locally against the direct URL, then redeploy.
