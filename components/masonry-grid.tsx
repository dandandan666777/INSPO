import { ItemCard } from './item-card';
import type { SearchResult } from '@/lib/search';

export function MasonryGrid({ items }: { items: SearchResult[] }) {
  return (
    <div className="columns-2 gap-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
