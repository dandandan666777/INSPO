import { ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { getItemById } from '@/lib/search';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ItemPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number.parseInt(id, 10);
  if (Number.isNaN(numericId)) notFound();

  const item = await getItemById(numericId);
  if (!item) notFound();

  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!publicUrl) throw new Error('R2_PUBLIC_URL is not set');
  const imageUrl = `${publicUrl}/${item.image_r2_key}`;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to search
        </Link>
        <div className="overflow-hidden rounded-3xl bg-card shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={item.title} className="block h-auto w-full" />
        </div>
        <div className="mt-8 space-y-5">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground">
            {item.title}
          </h1>
          {item.description && (
            <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          )}
          <div className="flex flex-col items-start gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-muted-foreground">
              Source: <span className="font-medium text-foreground">{item.source_name}</span>
            </span>
            <a
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
            >
              View original article
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
