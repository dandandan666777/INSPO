import { Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <Sparkles className="h-8 w-8" aria-hidden />
        <h1 className="text-2xl font-semibold tracking-tight">Design Inspiration</h1>
        <p className="max-w-md text-sm text-neutral-500">
          Semantic search across the product-design web. Coming soon.
        </p>
      </div>
    </main>
  );
}
