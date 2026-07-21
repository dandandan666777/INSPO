import Link from 'next/link';
import { SearchX } from 'lucide-react';

export function EmptySearch({ query }: { query: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
      <div className="rounded-full bg-border/60 p-4 text-muted-foreground">
        <SearchX className="h-6 w-6" aria-hidden />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold text-foreground">
          No matches for &ldquo;{query}&rdquo;
        </h2>
        <p className="text-sm text-muted-foreground">
          The corpus grows daily — this query might land tomorrow. Try a broader term, a material
          or finish, or browse what&rsquo;s here now.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/85"
      >
        Browse latest
      </Link>
    </div>
  );
}
