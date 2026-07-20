# Design Inspiration

Semantic search engine for product and industrial design inspiration. Aggregates images from design magazine RSS feeds, generates CLIP embeddings, and lets designers search using natural language queries like "waterproof buttons" or "matte finish product enclosure".

## Wedge

Automated RSS aggregation (not user-submitted) + CLIP-based semantic search (physical-property queries) + industrial/product design focus (not graphic/UI). Every user-facing string says "product design" or "industrial design" specifically — this is NOT another Pinterest.

## Stack (locked — do not reopen)

- **Next.js 16** (App Router) + **TypeScript** (strict)
- **Tailwind CSS v4** + **shadcn/ui** (initialized in Phase 6)
- **Supabase** (Postgres + pgvector + Auth) — free tier
- **Cloudflare R2** — image storage, free tier
- **Replicate** — `andreasjansson/clip-features` (ViT-L/14, 768-dim vectors)
- **Vercel** — hosting, free tier
- **GitHub Actions** — daily ingestion cron
- **pnpm** — package manager

## Architecture

```
RSS feeds → cron → ingest into Postgres
                     ↓
              items with image_url, no image_r2_key
                     ↓
              download → sharp resize to 800px → R2 upload
                     ↓
              items with image_r2_key, no embedding
                     ↓
              Replicate CLIP → 768-dim vector → pgvector
                     ↓
              user query → CLIP text embed → pgvector cosine + BM25 → hybrid rank
```

## Data model

- `sources` — id, name, feed_url, homepage_url, active
- `items` — id, source_id, external_id, title, description, image_url, source_url, published_at, embedding vector(768), ingested_at, image_r2_key. Unique `(source_id, external_id)`.

## Conventions

- Strict TypeScript. No `any`. No non-null `!` on unverified values.
- Small focused files. Prefer many small over one large.
- No comments unless the WHY is non-obvious. Well-named identifiers replace most comments.
- No premature abstractions. Three similar lines beats a bad helper.
- Trust internal code — validate only at system boundaries (user input, external APIs).
- No backwards-compat shims, no dead code, no half-finished stubs.
- Prefer existing patterns already in the codebase.
- No `any`, no queues, no Redis, no microservices, no Docker for local dev, no GraphQL. Boring is good.
- No demo data / mocks in real code paths. Real sources from day one.

## Phase tracker

- [x] **Phase 1** — Skeleton: Next.js scaffold, CLAUDE.md, placeholder landing, Supabase client, `.env.local.example`
- [x] **Phase 2** — DB schema + seed sources (pgvector, `sources`/`items`, 5 seed feeds)
- [x] **Phase 3** — RSS ingestion (`scripts/ingest-feed.ts`)
- [ ] **Phase 4** — Image storage + resize (`scripts/download-images.ts`, sharp, R2)
- [ ] **Phase 5** — CLIP embeddings (`lib/embeddings.ts`, `scripts/embed-items.ts`)
- [ ] **Phase 6** — Search API + UI (`app/api/search`, masonry grid — WAIT FOR MOCKUPS)
- [ ] **Phase 7** — Polish + launch (SEO, Analytics, GitHub Actions cron)
- [ ] **Phase 8** — Scale sources (add ~15 more feeds)

At the start of every session, confirm the current phase before writing code.

## Design References

UI mockups will live in `/design/`. When starting Phase 6 or Phase 7, pause and ask the user to share the mockups **before** writing any visual design code. Match strictly per their guidance; iterate with side-by-side screenshots.

## Working rules

- **One phase per session.** Don't jump ahead.
- **Small steps within a phase** — schema, then seeder, then fetch script. Verify each.
- **Prompt for a commit after every working step.** Never commit unprompted.
- **Push back on scope creep.** If the user asks for something not in the current phase (auth in v1, saves/collections, Stripe, scraping user-submitted platforms), remind them of the brief.
- **Explain as you go** — this is a learning project. The user wants to understand every line.
- **Ask for exact error text** if something breaks. Don't guess.
- **Update this file** at the end of each session with decisions made.

## Anti-goals (v1)

- No auth, no accounts, no login. Anonymous search only.
- No saves, collections, or moodboards.
- No payments or Stripe.
- No scraping Pinterest, Cosmos, Savee, or any user-submitted platform. RSS only.
- No competing with Designspiration on graphic design or color-palette search.
- No over-engineering the corpus. 500 images across 5 sources is fine for launch.

Post-MVP (only after ~200 WAU): magic-link auth, saves/collections, Stripe subscription (20 searches/day free, £5-8/mo unlimited).

## Env vars (see `.env.local.example`)

- `SUPABASE_URL`, `SUPABASE_SECRET_KEY` — Supabase's modern (2025+) short-token key scheme. Server-only; v1 has no browser Supabase calls. Add `SUPABASE_PUBLISHABLE_KEY` when we introduce auth post-MVP.
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL`
- `REPLICATE_API_TOKEN`

## Session notes

- **Session 1 (2026-07-20):** Phase 1 complete. Chose Next 16 (latest stable) over the brief's Next 15 — ecosystem moved on. Chose 768-dim embeddings (ViT-L/14 default) over the brief's 512. pnpm 11 requires approving `sharp` build scripts before Phase 4 (via `pnpm approve-builds` or `onlyBuiltDependencies` in `pnpm-workspace.yaml`).
- **Session 1 (2026-07-20) cont'd:** Phase 2 complete. Migration in `supabase/migrations/0001_init.sql` applied via Supabase SQL editor. Seed script (`scripts/seed-sources.ts`) upserts 5 sources idempotently on `feed_url`. Adopted Supabase's modern (2025+) key scheme: `SUPABASE_URL` + `SUPABASE_SECRET_KEY` — no `NEXT_PUBLIC_` prefix because v1 has no client-side Supabase calls. Dropped unused `supabaseBrowser()` from `lib/supabase.ts`; re-add when introducing auth post-MVP. `pnpm run seed` is the command to (re-)apply.
- **Session 1 (2026-07-20) cont'd:** Phase 3 complete. `scripts/ingest-feed.ts` (via `pnpm run ingest` for all active sources, `pnpm run ingest <id>` for one) upserts items idempotently on `(source_id, external_id)`. Image extraction fallback chain: `enclosure.url` → `media:content` → `media:thumbnail` → first `<img>` in `content:encoded` → first `<img>` in `content`. First run yielded 97 items across all 5 sources (Dezeen 50, Core77 15, Design Milk 12, Yanko Design 10, Designboom 10), 100% with images. External IDs default to `guid`, fall back to `link`. `contentSnippet` (rss-parser's HTML-stripped text) used for description.
