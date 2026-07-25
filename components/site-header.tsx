import Link from 'next/link';
import { getCurrentUserEmail } from '@/lib/user-saves';
import { RefreshLink } from './refresh-link';
import { SearchInput } from './search-input';
import { SignInButton } from './signin-button';

export async function SiteHeader() {
  const email = await getCurrentUserEmail();
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-center justify-between gap-3 sm:contents">
          <RefreshLink
            href="/explore"
            refreshWhenOn="/explore"
            className="flex min-h-11 flex-shrink-0 items-center font-mono text-[13px] font-semibold uppercase tracking-[0.18em] text-accent lg:min-h-0"
          >
            PRODUCT INSPO
          </RefreshLink>
          <div className="flex items-center gap-2 sm:contents">
            <Link
              href="/saved"
              className="hidden min-h-11 flex-shrink-0 items-center border border-foreground px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-foreground hover:text-background sm:inline-flex sm:order-2 lg:min-h-0"
            >
              [Library]
            </Link>
            <SignInButton email={email} />
          </div>
        </div>
        <div className="w-full sm:mx-auto sm:max-w-3xl sm:flex-1 sm:order-1">
          <SearchInput />
        </div>
      </div>
    </header>
  );
}
