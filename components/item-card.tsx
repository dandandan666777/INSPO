import Link from 'next/link';
import type { SearchResult } from '@/lib/search';
import { SaveButton } from './save-button';

export function ItemCard({
  item,
  isSaved,
  signedIn,
}: {
  item: SearchResult;
  isSaved: boolean;
  signedIn: boolean;
}) {
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!publicUrl) throw new Error('R2_PUBLIC_URL is not set');
  const imageUrl = `${publicUrl}/${item.image_r2_key}`;

  return (
    <div className="group relative h-full">
      <Link href={`/items/${item.id}`} className="block h-full">
        <div className="h-full overflow-hidden border border-border bg-card transition-colors group-hover:border-foreground">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </div>
      </Link>
      <SaveButton itemId={item.id} initialSaved={isSaved} signedIn={signedIn} />
    </div>
  );
}
