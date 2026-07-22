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
    <div className="group relative mb-2 break-inside-avoid">
      <Link href={`/items/${item.id}`} className="block">
        <div className="overflow-hidden rounded-2xl bg-card transition-all duration-300 group-hover:shadow-lg group-hover:shadow-accent/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={item.title}
            loading="lazy"
            className="block h-auto w-full transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="mt-2 px-1 text-xs font-medium tracking-wide text-muted-foreground">
          {item.source_name}
        </div>
      </Link>
      <SaveButton itemId={item.id} initialSaved={isSaved} signedIn={signedIn} />
    </div>
  );
}
