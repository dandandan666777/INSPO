import { ItemCard } from './item-card';
import type { SearchResult } from '@/lib/search';

export function MasonryGrid({
  items,
  savedIds,
  signedIn,
}: {
  items: SearchResult[];
  savedIds: Set<number>;
  signedIn: boolean;
}) {
  return (
    <div className="columns-2 gap-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          isSaved={savedIds.has(item.id)}
          signedIn={signedIn}
        />
      ))}
    </div>
  );
}
