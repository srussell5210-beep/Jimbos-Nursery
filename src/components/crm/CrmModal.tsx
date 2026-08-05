'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

export function CrmModal({
  title,
  closeHref,
  children,
}: {
  title: string;
  closeHref: string;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <Link
        href={closeHref}
        className="absolute inset-0 bg-nursery-midnight/60 backdrop-blur-sm"
        aria-label="Close"
      />
      <div className="relative z-10 flex w-full max-w-lg flex-col rounded-xl bg-white shadow-2xl" style={{ maxHeight: 'min(90vh, 700px)' }}>
        <div className="flex shrink-0 items-center justify-between border-b border-nursery-sage/20 px-6 py-4">
          <h2 className="font-serif text-xl font-semibold text-nursery-midnight">{title}</h2>
          <Link
            href={closeHref}
            className="rounded-lg p-1.5 text-nursery-midnight/40 transition hover:bg-nursery-sage/10 hover:text-nursery-midnight"
          >
            <X className="h-5 w-5" />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
