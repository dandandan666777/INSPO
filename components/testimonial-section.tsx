export function TestimonialSection() {
  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto max-w-3xl px-6 py-24 text-center sm:py-32">
        <p className="mb-14 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground sm:mb-20">
          Built by a designer, for designers
        </p>
        <blockquote className="text-3xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-5xl">
          <span aria-hidden className="text-accent">
            &ldquo;
          </span>
          Before, finding inspiration meant opening ten different tabs and endlessly scrolling.
          This brings together the best design references from across the web, so I can spend less
          time searching and more time actually designing.
          <span aria-hidden className="text-accent">
            &rdquo;
          </span>
        </blockquote>
        <div className="mt-14 font-mono text-[11px] uppercase tracking-[0.18em]">
          <span className="font-semibold text-foreground">Alex</span>
          <span className="text-muted-foreground"> · Design Student</span>
        </div>
      </div>
    </section>
  );
}
