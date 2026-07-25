import Link from 'next/link';
import { collageItems, countEmbeddedItems, listActiveSources } from '@/lib/search';
import { HeroCollage } from './hero-collage';

export async function LandingHero() {
  const [items, count, sources] = await Promise.all([
    collageItems(6),
    countEmbeddedItems(),
    listActiveSources(),
  ]);
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
        <div>
          <div className="mb-8 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Product Inspo · Search.001 · 2026
          </div>
          <h1 className="text-5xl font-bold leading-[0.95] tracking-tight text-foreground sm:text-6xl md:text-7xl">
            search
            <br />
            product
            <br />
            design.
          </h1>
          <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground">
            Semantic search across the product-design web. Query by material, finish, form —
            CLIP-embedded, hybrid-ranked, editorially curated.
          </p>
          <Link
            href="/explore"
            className="mt-10 inline-flex items-center gap-2 bg-accent px-6 py-3 font-mono text-sm uppercase tracking-[0.18em] text-accent-foreground transition-colors hover:bg-accent-hover"
          >
            Start ↗
          </Link>

          <div className="mt-14 grid grid-cols-2 gap-y-4 border-t border-border pt-6 font-mono text-[11px] uppercase tracking-[0.15em]">
            <div>
              <div className="text-muted-foreground">Corpus</div>
              <div className="mt-1 text-sm font-semibold text-foreground">{count} items</div>
            </div>
            <div>
              <div className="text-muted-foreground">Sources</div>
              <div className="mt-1 text-sm font-semibold text-foreground">
                {sources.length} publications
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Model</div>
              <div className="mt-1 text-sm font-semibold text-foreground">CLIP ViT-L/14</div>
            </div>
            <div>
              <div className="text-muted-foreground">Rank</div>
              <div className="mt-1 text-sm font-semibold text-foreground">Vector + BM25</div>
            </div>
          </div>
        </div>

        <HeroCollage items={items} />
      </div>
    </main>
  );
}
