import Link from 'next/link';
import { collageItems, countEmbeddedItems, listActiveSources } from '@/lib/search';

// Isolated TE-style preview. All styles are inline / arbitrary Tailwind so
// nothing here leaks into the main app's palette. Compare side-by-side
// with / (the current INSPO landing) to decide whether to adopt the look.

const PALETTE = {
  base: '#F1EEE6',
  text: '#0A0A0A',
  accent: '#FF4A17',
  muted: '#8A8580',
  border: '#DDD8CC',
} as const;

export default async function TePreview() {
  const [items, count, sources] = await Promise.all([
    collageItems(6),
    countEmbeddedItems(),
    listActiveSources(),
  ]);

  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!publicUrl) throw new Error('R2_PUBLIC_URL is not set');

  return (
    <div style={{ background: PALETTE.base, color: PALETTE.text }} className="min-h-screen">
      {/* Header — technical status bar */}
      <header
        style={{ borderColor: PALETTE.border }}
        className="sticky top-0 z-20 border-b bg-[color:var(--te-base,#F1EEE6)] px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em]"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-semibold">INSPO</span>
            <span style={{ color: PALETTE.muted }}>·</span>
            <span style={{ color: PALETTE.muted }}>v1.0</span>
            <span style={{ color: PALETTE.muted }}>·</span>
            <span style={{ color: PALETTE.muted }}>
              {count} images · {sources.length} sources
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <Link
              href="/explore"
              style={{ borderColor: PALETTE.text }}
              className="border px-3 py-1.5 transition-colors hover:bg-[color:var(--te-text,#0A0A0A)] hover:text-[color:var(--te-base,#F1EEE6)]"
            >
              [Search]
            </Link>
            <button
              type="button"
              style={{ background: PALETTE.accent, color: '#FFF' }}
              className="px-3 py-1.5"
            >
              [Auth]
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          {/* Left: display + spec */}
          <div>
            <div
              className="mb-8 font-mono text-[11px] uppercase tracking-[0.18em]"
              style={{ color: PALETTE.muted }}
            >
              Inspo · Search.001 · 2026
            </div>
            <h1 className="text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
              search
              <br />
              product
              <br />
              design.
            </h1>
            <p
              className="mt-8 max-w-md text-base leading-relaxed"
              style={{ color: PALETTE.muted }}
            >
              Semantic search across the product-design web. Query by material, finish, form —
              CLIP-embedded, hybrid-ranked, editorially curated.
            </p>
            <Link
              href="/explore"
              style={{ background: PALETTE.accent, color: '#FFF' }}
              className="mt-10 inline-flex items-center gap-2 px-6 py-3 font-mono text-sm uppercase tracking-[0.18em]"
            >
              Start ↗
            </Link>

            {/* Spec sheet */}
            <div
              style={{ borderColor: PALETTE.border }}
              className="mt-14 grid grid-cols-2 gap-y-4 border-t pt-6 font-mono text-[11px] uppercase tracking-[0.15em]"
            >
              <div>
                <div style={{ color: PALETTE.muted }}>Corpus</div>
                <div className="mt-1 text-sm font-semibold" style={{ color: PALETTE.text }}>
                  {count} items
                </div>
              </div>
              <div>
                <div style={{ color: PALETTE.muted }}>Sources</div>
                <div className="mt-1 text-sm font-semibold" style={{ color: PALETTE.text }}>
                  {sources.length} publications
                </div>
              </div>
              <div>
                <div style={{ color: PALETTE.muted }}>Model</div>
                <div className="mt-1 text-sm font-semibold" style={{ color: PALETTE.text }}>
                  CLIP ViT-L/14
                </div>
              </div>
              <div>
                <div style={{ color: PALETTE.muted }}>Rank</div>
                <div className="mt-1 text-sm font-semibold" style={{ color: PALETTE.text }}>
                  Vector + BM25
                </div>
              </div>
            </div>
          </div>

          {/* Right: collage with technical labels */}
          <div className="grid grid-cols-3 gap-3">
            {items.slice(0, 6).map((item, i) => {
              const paddedId = String(item.id).padStart(3, '0');
              const slot = String(i + 1).padStart(2, '0');
              return (
                <figure key={item.id} className="space-y-1.5">
                  <div
                    style={{ background: PALETTE.border, borderColor: PALETTE.border }}
                    className="aspect-square overflow-hidden border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${publicUrl}/${item.image_r2_key}`}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <figcaption
                    className="flex justify-between font-mono text-[10px] uppercase tracking-[0.18em]"
                    style={{ color: PALETTE.muted }}
                  >
                    <span>#{paddedId}</span>
                    <span>Img.{slot}</span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>

        {/* Comparison strip */}
        <div
          style={{ borderColor: PALETTE.border, color: PALETTE.muted }}
          className="mt-24 flex flex-col justify-between gap-2 border-t pt-6 font-mono text-[11px] uppercase tracking-[0.18em] sm:flex-row"
        >
          <span>
            ← Original:{' '}
            <Link href="/" className="underline hover:text-[color:var(--te-text,#0A0A0A)]">
              /
            </Link>
          </span>
          <span>Style: TE-06 · 2026.07.23</span>
        </div>
      </main>
    </div>
  );
}
