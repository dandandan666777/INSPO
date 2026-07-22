type CollageItem = { id: number; title: string; image_r2_key: string };

// Offset masonry composition modeled after the Pinterest landing collage:
// 3 columns, each with 2 images, staggered vertically so the whole cluster
// reads as a dynamic floating group rather than a rigid grid.
const COLUMN_OFFSETS = ['mt-8', 'mt-0', 'mt-16'];
const IMAGE_ASPECTS = [
  ['aspect-[4/5]', 'aspect-square'],
  ['aspect-[3/4]', 'aspect-[4/3]'],
  ['aspect-square', 'aspect-[3/4]'],
];

export function HeroCollage({ items }: { items: CollageItem[] }) {
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!publicUrl) throw new Error('R2_PUBLIC_URL is not set');
  if (items.length < 6) return null;

  const columns = [items.slice(0, 2), items.slice(2, 4), items.slice(4, 6)];

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {columns.map((columnItems, colIndex) => (
        <div key={colIndex} className={`space-y-3 sm:space-y-4 ${COLUMN_OFFSETS[colIndex]}`}>
          {columnItems.map((item, rowIndex) => (
            <div
              key={item.id}
              className={`overflow-hidden rounded-2xl bg-card shadow-sm ${IMAGE_ASPECTS[colIndex][rowIndex]}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${publicUrl}/${item.image_r2_key}`}
                alt={item.title}
                loading="eager"
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
