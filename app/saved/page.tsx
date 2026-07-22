import { cookies } from 'next/headers';
import Link from 'next/link';
import { Bookmark } from 'lucide-react';
import { MasonryGrid } from '@/components/masonry-grid';
import { SiteHeader } from '@/components/site-header';
import { getItemsByIds } from '@/lib/search';

export const dynamic = 'force-dynamic';

const COOKIE_NAME = 'inspo-saved';

export default async function SavedPage() {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value ?? '';
  const ids = raw
    .split(',')
    .map((chunk) => Number.parseInt(chunk, 10))
    .filter((n) => Number.isFinite(n));
  const items = ids.length > 0 ? await getItemsByIds(ids) : [];

  return (
    <>
      <SiteHeader />
      <main className="px-3 py-6 sm:px-4">
        <div className="mb-6 flex items-baseline justify-between">
          <h1 className="text-lg font-semibold text-foreground">
            Saved images
            {items.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({items.length})
              </span>
            )}
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
            <div className="rounded-full bg-border/60 p-4 text-muted-foreground">
              <Bookmark className="h-6 w-6" aria-hidden />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-semibold text-foreground">Nothing saved yet</h2>
              <p className="text-sm text-muted-foreground">
                Click the bookmark on any image to add it here. Saves live in your browser, no
                account needed.
              </p>
            </div>
            <Link
              href="/explore"
              className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/85"
            >
              Browse images
            </Link>
          </div>
        ) : (
          <MasonryGrid items={items} />
        )}
      </main>
    </>
  );
}
