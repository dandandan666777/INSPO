import { getCurrentUserEmail } from '@/lib/user-saves';
import { FeedbackForm } from './feedback-form';

export async function FeedbackSection() {
  const email = await getCurrentUserEmail();
  const signedIn = Boolean(email);
  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto max-w-2xl px-6 py-20 sm:py-24">
        <div className="text-center">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Feedback · Requests
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Got something you want to see? Or any feedback.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Source ideas, feature requests, gripes, anything. We read every one.
          </p>
        </div>
        <FeedbackForm signedIn={signedIn} />
      </div>
    </section>
  );
}
