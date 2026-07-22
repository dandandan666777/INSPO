import { Bookmark, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { RefreshLink } from './refresh-link';
import { SearchInput } from './search-input';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3">
        <RefreshLink
          href="/explore"
          refreshWhenOn="/explore"
          className="flex flex-shrink-0 items-center gap-2 text-base font-semibold tracking-tight"
        >
          <Sparkles className="h-5 w-5 text-accent" aria-hidden />
          <span className="hidden text-accent sm:inline">INSPO</span>
        </RefreshLink>
        <div className="mx-auto flex-1 max-w-3xl">
          <SearchInput />
        </div>
        <Link
          href="/saved"
          className="hidden flex-shrink-0 items-center gap-1.5 rounded-full bg-border/60 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-border sm:inline-flex"
        >
          <Bookmark className="h-4 w-4" aria-hidden />
          Saved
        </Link>
      </div>
    </header>
  );
}
