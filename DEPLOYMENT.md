# Deployment — Browser only (GitHub + Netlify UI + Supabase UI)

No local machine needed. The database is initialized automatically during the **first** Netlify build.

---

## 1. Supabase — create the database (browser)

1. Go to https://supabase.com → **New project**. Pick a region and set a database password.
2. After it provisions, open **Project Settings → Database → Connection string**.
3. Select **Session pooler** (port `5432`) and copy it. Replace `[YOUR-PASSWORD]` with your
   real password. This single string is your `DATABASE_URL` — it works both for schema setup
   and at runtime.
   ```
   postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
   ```
   > Use the **Session** pooler, not the Transaction pooler (6543) — the first deploy runs
   > `prisma db push`, which the Transaction pooler does not support.

---

## 2. GitHub

The code is already pushed to the repository (branch `claude/epic-cori-Dub3u`).
Nothing to do here unless you want to merge it to `main` first (optional).

---

## 3. Netlify — import the site (browser)

1. https://app.netlify.com → **Add new site → Import an existing project**.
2. Connect GitHub, pick this repository, and select the branch you want to deploy.
3. Build settings are read from `netlify.toml` (build `npm run build`, publish `.next`,
   Next.js plugin). **Leave them for now — you'll override the command for the first deploy
   in step 5.**

---

## 4. Netlify — environment variables (browser)

**Site configuration → Environment variables → Add a variable** (add all four):

| Variable              | Value                                                        |
| --------------------- | ------------------------------------------------------------ |
| `DATABASE_URL`        | Supabase **Session pooler** string from step 1 (port 5432)   |
| `AUTH_SECRET`         | Any 32+ char random string                                   |
| `NEXT_PUBLIC_APP_URL` | Your site URL, e.g. `https://your-site.netlify.app`          |
| `EMAIL_PROVIDER`      | `mock`                                                        |

> Tip for `AUTH_SECRET`: paste any long random string (40+ characters of letters/numbers).

---

## 5. First deploy — initialize the database

For the **first** deploy only, set the build command to `deploy:init`, which runs
`prisma generate → prisma db push → prisma db seed → next build`:

1. **Site configuration → Build & deploy → Build settings → Edit settings**.
2. Set **Build command** to:
   ```
   npm run deploy:init
   ```
3. Save, then **Deploys → Trigger deploy → Deploy site**.

This creates all tables and inserts the demo data. The seed is **idempotent** (upserts with
fixed IDs), so re-running it never duplicates data.

---

## 6. Switch back to the normal build command

After the first successful deploy, change the build command back so future deploys don't
re-run db push/seed:

1. **Build settings → Build command** → set it to:
   ```
   npm run build
   ```
   (or just clear the override so it falls back to `netlify.toml`).
2. Save.

---

## Done

- App: `https://your-site.netlify.app`
- Login: `admin@cabinet.ro` / `parola123`
- Public booking: `https://your-site.netlify.app/book`

Update `NEXT_PUBLIC_APP_URL` to the final URL if it changed, then redeploy.

---

## Notes

- All Prisma access runs in the **Node.js runtime** (route handlers set
  `export const runtime = "nodejs"`; pages/server actions are Node by default).
- **Middleware runs on Edge** and uses only `jose` — it never imports Prisma.
- Schema changes later: temporarily set the build command to `npm run deploy:init` again
  (safe — db push and seed are idempotent), deploy, then switch back to `npm run build`.
