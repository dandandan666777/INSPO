import Link from 'next/link';

export function EmptySearch({ query }: { query: string }) {
  return (
    <div className="mx-auto max-w-lg border border-border bg-card p-8 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Status
      </p>
      <p className="mt-2 font-mono text-sm uppercase tracking-[0.18em] text-foreground">
        [ No matches for &ldquo;{query}&rdquo; ]
      </p>
      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
        The corpus grows daily. Try a broader term, a material or finish, or browse what&rsquo;s
        indexed now.
      </p>
      <Link
        href="/explore"
        className="mt-8 inline-flex items-center bg-accent px-5 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent-foreground transition-colors hover:bg-accent-hover"
      >
        Browse ↗
      </Link>
    </div>
  );
}
