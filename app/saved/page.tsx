import Link from 'next/link';
import { MasonryGrid } from '@/components/masonry-grid';
import { SiteHeader } from '@/components/site-header';
import { getItemsByIds } from '@/lib/search';
import { getCurrentUserEmail, getSavedItemIds } from '@/lib/user-saves';

export const dynamic = 'force-dynamic';

export default async function SavedPage() {
  const email = await getCurrentUserEmail();
  const savedIdList = email ? await getSavedItemIds() : [];
  const items = savedIdList.length > 0 ? await getItemsByIds(savedIdList) : [];
  const savedIds = new Set(savedIdList);
  const signedIn = Boolean(email);

  return (
    <>
      <SiteHeader />
      <main className="px-3 py-6 sm:px-4">
        <div className="mb-6 flex items-center justify-between border-b border-border pb-3 font-mono text-[11px] uppercase tracking-[0.18em]">
          <span className="text-foreground">Library</span>
          <span className="text-muted-foreground">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {!signedIn ? (
          <div className="mx-auto max-w-lg border border-border bg-card p-8 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Status
            </p>
            <p className="mt-2 font-mono text-sm uppercase tracking-[0.18em] text-foreground">
              [ Sign in to see your library ]
            </p>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              Saves are tied to your email so you can pick up on another device. Click any bookmark
              on an image to sign in and start a collection.
            </p>
            <Link
              href="/explore"
              className="mt-8 inline-flex items-center bg-accent px-5 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent-foreground transition-colors hover:bg-accent-hover"
            >
              Browse ↗
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="mx-auto max-w-lg border border-border bg-card p-8 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Status · Signed in as {email}
            </p>
            <p className="mt-2 font-mono text-sm uppercase tracking-[0.18em] text-foreground">
              [ Library empty ]
            </p>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              Hover any image and hit [Save +] to add it to your library.
            </p>
            <Link
              href="/explore"
              className="mt-8 inline-flex items-center bg-accent px-5 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent-foreground transition-colors hover:bg-accent-hover"
            >
              Browse ↗
            </Link>
          </div>
        ) : (
          <MasonryGrid items={items} savedIds={savedIds} signedIn={signedIn} />
        )}
      </main>
    </>
  );
}
