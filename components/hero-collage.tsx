type CollageItem = { id: number; title: string; image_r2_key: string };

export function HeroCollage({ items }: { items: CollageItem[] }) {
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!publicUrl) throw new Error('R2_PUBLIC_URL is not set');
  if (items.length < 6) return null;

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.slice(0, 6).map((item, i) => {
        const paddedId = String(item.id).padStart(3, '0');
        const slot = String(i + 1).padStart(2, '0');
        return (
          <figure key={item.id} className="space-y-1.5">
            <div className="aspect-square overflow-hidden border border-border bg-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${publicUrl}/${item.image_r2_key}`}
                alt={item.title}
                loading="eager"
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption className="flex justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <span>#{paddedId}</span>
              <span>Img.{slot}</span>
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
