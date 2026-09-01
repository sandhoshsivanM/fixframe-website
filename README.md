# Fix Frame

College-event videography in Coimbatore — plus wedding and commercial work.

**Live: https://sandhoshsivanm.github.io/fixframe-website/**

> **Status: in review.** The website is built and running. Content, imagery and
> team details are still placeholders — see [Before launch](#before-launch).

## Run the website

```bash
cd web
npm install     # first time only
npm run dev
```

Open **http://localhost:3000**.

That is the whole thing. No Docker, no database, no API — the site reads its
content from typed files in `web/src/content/`.

## What's here

| Path | What it is | Status |
|---|---|---|
| `web/` | The public website — Next.js 16 | **Built. Review this.** |
| `spec/` | Specification V2 — the implementation contract | Complete (3 increments) |
| `api/` | .NET API for the CRM | Built, parked until after launch |
| `infra/` | Postgres, MinIO, Mailpit for the CRM | Parked |
| `fixframe_*.pdf` | The original V1 specification | Superseded by `spec/` |

## The website

Fifteen routes:

`/` · `/work` · `/work/[slug]` · `/services` · `/editing` · `/packages` ·
`/reels` · `/about` · `/blog` · `/blog/[slug]` · `/contact` ·
`/start-a-project` · `/privacy` · `/terms` · 404

Every page is statically prerendered except `/work` and `/start-a-project`,
which read filters from the URL.

### Changing content

Everything the site says lives in `web/src/content/`:

| File | Holds |
|---|---|
| `site.ts` | Studio name, tagline, contact details, navigation, hero copy, clients, process, values, stats |
| `projects.ts` | The six case studies |
| `catalogue.ts` | Services, packages, reels, testimonials, team |
| `posts.ts` | Blog posts |
| `pages.ts` | Privacy and Terms copy |

Edit, save, and the page reloads. No build step, no CMS, no developer.

### Adding real photos and video

See `web/public/media/README.md`, which maps every filename to the slot it
fills. Drop a file in, point the matching entry in `web/src/content/` at it,
and it replaces the placeholder — layouts do not change.

## Deploying

### Now: GitHub Pages (live)

Every push to `main` that touches `web/` rebuilds and redeploys automatically
via `.github/workflows/pages.yml`. Nothing to run by hand.

Pages cannot execute server code, so that workflow sets `PAGES=1`, which
turns on `output: export` and `basePath` in `next.config.ts`. Both are gated
on that variable — `npm run dev` and any server deployment are unaffected.

### Later: Vercel

Worth moving to when you want a custom domain, server rendering or preview
deployments. Nothing needs changing first.

1. Import the repository at [vercel.com/new](https://vercel.com/new).
2. Set **Root Directory** to `web` — the only setting that matters, because
   the Next.js app is not at the repository root.
3. Deploy. Framework, build command and output directory are detected.

Leave `PAGES` unset there and the site server-renders as normal.

### Environment variables

Neither is required. See `web/.env.example`.

| Variable | Effect if unset |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Falls back to the Vercel deployment hostname. Set it to the real domain once live, so link previews, canonical URLs and `sitemap.xml` point at the right place. |
| `NEXT_PUBLIC_API` | The enquiry forms report that they could not send and offer the studio email instead. `/admin` returns 404. This is the correct state until the CRM is deployed. |

### The one thing that needs a backend

The forms at `/contact` and `/start-a-project` are the only part of the site
that needs a server. With no API configured they say so plainly, keep every
answer on screen, and point at the studio email — they never claim a brief
was received. Wiring them to a real inbox is a launch-day task.

## Before launch

These are placeholders and must be settled before the site goes to a real
domain:

- **All photography** — 43 stock images stand in for real work. See
  `web/public/media/README.md`.
- **Logo** — the wordmark is set in type; there is no logo file yet.
- **Team** — names, roles and portraits in `catalogue.ts` are invented.
- **Client list** — the brands in `site.ts` under "Our Clients".
- **Contact details** — the email, phone and address in `site.ts`.
- **Privacy and Terms** — placeholder copy, needs legal review
  (spec `UNRESOLVED-015`).
- **Fonts** — Anton and Inter are working choices, not a decision
  (spec `UNRESOLVED-001`).

## Later: the CRM

Parked until the website is live.

```bash
cd infra && docker compose up -d      # Postgres, MinIO, Mailpit
cd api && dotnet run                  # API on :5180, migrates and seeds
```

Local dev sign-in is `owner@fixframe.local` / `fixframe-dev-2026`. These only
work against a database on your own machine, and are pre-filled in the form
in development only.

When the CRM goes live, `web/src/lib/content.ts` is the single file that
repoints the site from local content files to the API. No page changes.
