export function TestimonialSection() {
  return (
    <section className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-3xl px-6 py-24 text-center sm:py-32">
        <p className="mb-14 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground sm:mb-20">
          Built by a designer, for designers
        </p>
        <blockquote className="font-serif text-3xl leading-[1.15] tracking-tight text-foreground sm:text-4xl md:text-5xl">
          <span aria-hidden className="text-muted-foreground">
            &ldquo;
          </span>
          Before, finding inspiration meant opening ten different tabs and endlessly scrolling.
          This brings together the best design references from across the web, so I can spend less
          time searching and more time actually designing.
          <span aria-hidden className="text-muted-foreground">
            &rdquo;
          </span>
        </blockquote>
        <div className="mt-12 text-sm sm:mt-14">
          <span className="font-medium text-foreground">Alex</span>
          <span className="text-muted-foreground">, Design Student</span>
        </div>
      </div>
    </section>
  );
}
