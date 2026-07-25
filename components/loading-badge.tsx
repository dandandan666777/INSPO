export function LoadingBadge({ label = 'Loading' }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="inline-flex items-center gap-2 border border-border bg-card px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
    >
      <span aria-hidden className="inline-flex gap-1 text-accent">
        <span className="animate-[pulse_1.4s_ease-in-out_infinite]">·</span>
        <span className="animate-[pulse_1.4s_ease-in-out_0.2s_infinite]">·</span>
        <span className="animate-[pulse_1.4s_ease-in-out_0.4s_infinite]">·</span>
      </span>
      <span>[{label}]</span>
    </div>
  );
}
