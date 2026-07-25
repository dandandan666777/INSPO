import { LoadingBadge } from '@/components/loading-badge';
import { SiteHeader } from '@/components/site-header';

export default function ExploreLoading() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-6 py-16">
        <LoadingBadge label="Searching" />
      </main>
    </>
  );
}
