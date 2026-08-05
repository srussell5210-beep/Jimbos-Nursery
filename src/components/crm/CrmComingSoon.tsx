'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

export function CrmComingSoon({
  children,
  label = "This feature is coming soon.",
}: {
  children: ReactNode;
  label?: string;
}) {
  const [shown, setShown] = useState(false);

  function handleClick() {
    setShown(true);
    setTimeout(() => setShown(false), 2500);
  }

  return (
    <span className="relative inline-flex" onClick={handleClick}>
      {children}
      {shown && (
        <span className="absolute right-0 top-full z-50 mt-2 min-w-max rounded-lg bg-nursery-midnight px-4 py-2 text-sm font-medium text-nursery-ivory shadow-xl">
          {label}
        </span>
      )}
    </span>
  );
}
