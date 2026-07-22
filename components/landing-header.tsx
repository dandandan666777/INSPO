import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { getCurrentUserEmail } from '@/lib/user-saves';
import { SignInButton } from './signin-button';

export async function LandingHeader() {
  const email = await getCurrentUserEmail();
  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <Sparkles className="h-5 w-5 text-accent" aria-hidden />
          <span className="text-accent">INSPO</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/explore"
            className="rounded-full bg-border/60 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-border"
          >
            Explore
          </Link>
          <SignInButton email={email} />
        </div>
      </div>
    </header>
  );
}
