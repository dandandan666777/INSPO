import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { SearchInput } from './search-input';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3">
        <Link
          href="/"
          className="flex flex-shrink-0 items-center gap-2 text-base font-semibold tracking-tight text-foreground"
        >
          <Sparkles className="h-5 w-5 text-accent" aria-hidden />
          <span className="hidden sm:inline">Design Inspiration</span>
        </Link>
        <div className="mx-auto flex-1 max-w-3xl">
          <SearchInput />
        </div>
      </div>
    </header>
  );
}
