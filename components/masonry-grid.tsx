import { ItemCard } from './item-card';
import type { SearchResult } from '@/lib/search';

export function MasonryGrid({ items }: { items: SearchResult[] }) {
  return (
    <div className="columns-2 gap-4 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
