# Fix Frame

Studio website and (later) CRM.

## Run the website

```bash
cd web
npm install     # first time only
npm run dev
```

Open **http://localhost:3000**.

That is the whole thing. No Docker, no database, no API — the site reads
its content from typed files in `web/src/content/`.

## What's here

| Path | What it is | Status |
|---|---|---|
| `web/` | The public website — Next.js | **Built. Review this.** |
| `spec/` | Specification V2 — the implementation contract | Complete (3 increments) |
| `api/` | .NET API for the CRM | Built, parked until after launch |
| `infra/` | Postgres, MinIO, Mailpit for the CRM | Parked |
| `fixframe_*.pdf` | The original V1 specification | Superseded by `spec/` |

## The website

Thirteen public routes:

`/` · `/work` · `/work/[slug]` · `/services` · `/editing` · `/packages`
`/reels` · `/about` · `/contact` · `/privacy` · `/terms` · 404

### Changing content

Everything the site says lives in `web/src/content/`:

| File | Holds |
|---|---|
| `site.ts` | Studio name, tagline, contact details, navigation, hero copy, process, values, stats |
| `projects.ts` | The six case studies |
| `catalogue.ts` | Services, packages, reels, testimonials, team |
| `pages.ts` | Privacy and Terms copy |

Edit, save, and the page reloads. No build step, no CMS, no developer.

### Adding real photos and video

See `web/public/media/README.md`. Drop a file in, add its filename to the
matching slot in `web/src/content/`, and it replaces the placeholder —
layouts do not change.

Until then, every media slot renders a designed placeholder rather than a
grey box, so the site reads as unfinished-by-choice rather than broken.

### The one thing that needs a backend

The project brief form at `/start-a-project` posts to the CRM API. With the
API stopped it says so plainly and offers the studio email instead — it
never pretends a brief was received. Wiring it to a real inbox is a
launch-day task.

## Known placeholders before launch

- **Fonts** — Instrument Serif + Inter are stand-ins (spec `UNRESOLVED-001`).
- **Privacy and Terms copy** — needs legal review (`UNRESOLVED-015`).
- **Team names, stats, contact details** — in `site.ts` and `catalogue.ts`.
- **All media** — see above.

## Later: the CRM

```bash
cd infra && docker compose up -d      # Postgres, MinIO, Mailpit
cd api && dotnet run                  # API on :5180, migrates and seeds
```

Admin login: `owner@fixframe.local` / `fixframe-dev-2026`

When the CRM goes live, `web/src/lib/content.ts` is the single file that
repoints the site from local content to the API. No page changes.
