import Link from 'next/link';
import { countEmbeddedItems, listActiveSources } from '@/lib/search';
import { getCurrentUserEmail } from '@/lib/user-saves';
import { SignInButton } from './signin-button';

export async function LandingHeader() {
  const [email, count, sources] = await Promise.all([
    getCurrentUserEmail(),
    countEmbeddedItems(),
    listActiveSources(),
  ]);
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em]">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Link href="/" className="font-semibold text-accent">
            INSPO
          </Link>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">v1.0</span>
          <span className="hidden text-muted-foreground sm:inline">·</span>
          <span className="hidden text-muted-foreground sm:inline">
            {count} images · {sources.length} sources
          </span>
        </div>
        <nav className="flex items-center gap-2">
          <Link
            href="/explore"
            className="border border-foreground px-3 py-1.5 transition-colors hover:bg-foreground hover:text-background"
          >
            [Search]
          </Link>
          <SignInButton email={email} />
        </nav>
      </div>
    </header>
  );
}
