import Link from 'next/link';
import { ResetPasswordForm } from './reset-password-form';

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">
        Set a new password
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Enter the new password you&rsquo;d like to use. We&rsquo;ll sign you in with it right after.
      </p>
      <ResetPasswordForm />
      <p className="mt-6 text-center text-xs text-muted-foreground">
        <Link href="/" className="hover:text-accent">
          Back to home
        </Link>
      </p>
    </main>
  );
}
