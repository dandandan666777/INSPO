import { ExampleQueries } from '@/components/example-queries';
import { MasonryGrid } from '@/components/masonry-grid';
import { SiteHeader } from '@/components/site-header';
import { browseItems, searchItems } from '@/lib/search';

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function Home({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';
  const items = query ? await searchItems(query) : await browseItems();

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
          <div className="py-20 text-center text-muted-foreground">
            No product design inspiration found. Try a different query.
          </div>
        ) : (
          <MasonryGrid items={items} />
        )}
      </main>
    </>
  );
}
