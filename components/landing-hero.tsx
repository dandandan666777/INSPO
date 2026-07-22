import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { collageItems } from '@/lib/search';
import { HeroCollage } from './hero-collage';

export async function LandingHero() {
  const items = await collageItems(6);
  return (
    <main className="mx-auto max-w-7xl px-6 py-12 lg:py-20">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="max-w-xl">
          <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            Get a diverse range of inspiration with{' '}
            <span className="text-accent">INSPO</span>
          </h1>
          <p className="mt-6 text-base text-muted-foreground sm:text-lg">
            Semantic search across the product-design web. Search by material, finish, form —
            not tags.
          </p>
          <Link
            href="/explore"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-base font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
          >
            Get inspired for free
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <HeroCollage items={items} />
      </div>
    </main>
  );
}
