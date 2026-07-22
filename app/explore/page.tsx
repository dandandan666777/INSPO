import { EmptySearch } from '@/components/empty-search';
import { ExampleQueries } from '@/components/example-queries';
import { MasonryGrid } from '@/components/masonry-grid';
import { SiteHeader } from '@/components/site-header';
import { browseItems, searchItems } from '@/lib/search';
import { getCurrentUserEmail, getSavedItemIds } from '@/lib/user-saves';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function Explore({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';
  const [items, email, savedIdList] = await Promise.all([
    query ? searchItems(query) : browseItems(),
    getCurrentUserEmail(),
    getSavedItemIds(),
  ]);
  const savedIds = new Set(savedIdList);
  const signedIn = Boolean(email);

  return (
    <>
      <SiteHeader />
      <main className="px-3 py-6 sm:px-4">
        {query ? (
          <p className="mb-6 text-sm text-muted-foreground">
            {items.length} result{items.length === 1 ? '' : 's'} for &ldquo;{query}&rdquo;
          </p>
        ) : (
          <ExampleQueries />
        )}
        {items.length === 0 ? (
          <EmptySearch query={query} />
        ) : (
          <MasonryGrid items={items} savedIds={savedIds} signedIn={signedIn} />
        )}
      </main>
    </>
  );
}
