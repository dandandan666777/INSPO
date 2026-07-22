'use client';

import Link, { type LinkProps } from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { MouseEvent, ReactNode } from 'react';

// Renders a normal Link, but when the user is already on the linked pathname
// (with no query), clicks trigger router.refresh() instead of a no-op nav.
// That re-invokes the server component and — because browseItems() uses
// random_items() — the user sees a fresh shuffle every click.
export function RefreshLink({
  href,
  children,
  className,
  refreshWhenOn,
}: LinkProps & {
  children: ReactNode;
  className?: string;
  refreshWhenOn: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (pathname === refreshWhenOn && !window.location.search) {
      event.preventDefault();
      router.refresh();
    }
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
