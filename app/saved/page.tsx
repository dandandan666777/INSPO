import Link from 'next/link';
import { Bookmark } from 'lucide-react';
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

        {!signedIn ? (
          <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
            <div className="rounded-full bg-border/60 p-4 text-muted-foreground">
              <Bookmark className="h-6 w-6" aria-hidden />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-semibold text-foreground">Sign in to see your saves</h2>
              <p className="text-sm text-muted-foreground">
                Saves are tied to your email so you can pick up on another device. Click any
                bookmark on an image to sign in and start a collection.
              </p>
            </div>
            <Link
              href="/explore"
              className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/85"
            >
              Browse images
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
            <div className="rounded-full bg-border/60 p-4 text-muted-foreground">
              <Bookmark className="h-6 w-6" aria-hidden />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-semibold text-foreground">Nothing saved yet</h2>
              <p className="text-sm text-muted-foreground">
                You&rsquo;re signed in as {email}. Click the bookmark on any image to add it here.
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
          <MasonryGrid items={items} savedIds={savedIds} signedIn={signedIn} />
        )}
      </main>
    </>
  );
}
