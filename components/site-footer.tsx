import { countEmbeddedItems, listActiveSources } from '@/lib/search';
import { SourcesDialog } from './sources-dialog';

export async function SiteFooter() {
  const [sources, itemCount] = await Promise.all([listActiveSources(), countEmbeddedItems()]);
  return (
    <footer className="mt-16 border-t border-border/50 py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:text-sm">
        <span>
          Aggregated from {sources.length} editorial product-design publications —{' '}
          {itemCount.toLocaleString()} items indexed
        </span>
        <SourcesDialog sources={sources} />
      </div>
    </footer>
  );
}
