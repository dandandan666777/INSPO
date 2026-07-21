import type { SearchResult } from '@/lib/search';

export function ItemCard({ item }: { item: SearchResult }) {
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!publicUrl) throw new Error('R2_PUBLIC_URL is not set');
  const imageUrl = `${publicUrl}/${item.image_r2_key}`;

  return (
    <a
      href={item.source_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group mb-4 block break-inside-avoid"
    >
      <div className="overflow-hidden rounded-3xl bg-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={item.title}
          loading="lazy"
          className="block h-auto w-full transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-2 px-1 text-xs text-muted-foreground">{item.source_name}</div>
    </a>
  );
}
