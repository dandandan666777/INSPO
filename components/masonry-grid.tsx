import { ItemCard } from './item-card';
import type { SearchResult } from '@/lib/search';

// Pattern of spans across the grid. Every 9th tile is a 2×2 hero, every
// 5th is a wide 2×1, every 7th (with a different offset) is a tall 1×2,
// and the rest fill in as 1×1 cells. grid-auto-flow-dense reorders any
// gaps so the layout stays tight instead of leaving holes.
function tileSpan(index: number): string {
  if (index % 9 === 0) return 'col-span-2 row-span-2';
  if (index % 5 === 3) return 'col-span-2 row-span-1';
  if (index % 7 === 4) return 'col-span-1 row-span-2';
  return 'col-span-1 row-span-1';
}

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
    <div className="grid grid-flow-dense grid-cols-2 gap-2 auto-rows-[minmax(0,10rem)] sm:auto-rows-[minmax(0,11rem)] md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:auto-rows-[minmax(0,12rem)]">
      {items.map((item, index) => (
        <div key={item.id} className={tileSpan(index)}>
          <ItemCard
            item={item}
            isSaved={savedIds.has(item.id)}
            signedIn={signedIn}
          />
        </div>
      ))}
    </div>
  );
}
