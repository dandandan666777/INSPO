import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { getItemById } from '@/lib/search';

type PageProps = {
  params: Promise<{ id: string }>;
};

function padId(n: number): string {
  return String(n).padStart(3, '0');
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default async function ItemPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number.parseInt(id, 10);
  if (Number.isNaN(numericId)) notFound();

  const item = await getItemById(numericId);
  if (!item) notFound();

  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!publicUrl) throw new Error('R2_PUBLIC_URL is not set');
  const imageUrl = `${publicUrl}/${item.image_r2_key}`;
  const published = formatDate(item.published_at);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Link
          href="/explore"
          className="mb-6 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
        >
          [← Back to search]
        </Link>

        <div className="mb-4 flex items-center justify-between border-b border-border pb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <span>Item · #{padId(item.id)}</span>
          <span>{item.source_name}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-12">
          <div className="self-start overflow-hidden border border-border bg-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={item.title}
              className="block h-auto w-full"
            />
          </div>

          <div className="flex flex-col gap-6">
            <div className="space-y-4">
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
                {item.title}
              </h1>
              {item.description && (
                <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              )}
            </div>

            <dl className="grid grid-cols-2 gap-y-3 border-t border-border pt-6 font-mono text-[11px] uppercase tracking-[0.15em]">
              <dt className="text-muted-foreground">Source</dt>
              <dd className="text-foreground">{item.source_name}</dd>
              {published && (
                <>
                  <dt className="text-muted-foreground">Published</dt>
                  <dd className="text-foreground">{published}</dd>
                </>
              )}
              <dt className="text-muted-foreground">Item ID</dt>
              <dd className="text-foreground">#{padId(item.id)}</dd>
            </dl>

            <div className="mt-4 border-t border-border pt-6">
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Get further inspired
              </p>
              <a
                href={item.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-accent px-5 py-2.5 font-mono text-sm uppercase tracking-[0.18em] text-accent-foreground transition-colors hover:bg-accent-hover"
              >
                Go to the source ↗
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
