import Link from 'next/link';
import { getCurrentUserEmail } from '@/lib/user-saves';
import { RefreshLink } from './refresh-link';
import { SearchInput } from './search-input';
import { SignInButton } from './signin-button';

export async function SiteHeader() {
  const email = await getCurrentUserEmail();
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3">
        <RefreshLink
          href="/explore"
          refreshWhenOn="/explore"
          className="flex flex-shrink-0 items-center font-mono text-[13px] font-semibold uppercase tracking-[0.18em] text-accent"
        >
          INSPO
        </RefreshLink>
        <div className="mx-auto flex-1 max-w-3xl">
          <SearchInput />
        </div>
        <Link
          href="/saved"
          className="hidden flex-shrink-0 border border-foreground px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-foreground hover:text-background sm:inline-flex"
        >
          [Library]
        </Link>
        <SignInButton email={email} />
      </div>
    </header>
  );
}
