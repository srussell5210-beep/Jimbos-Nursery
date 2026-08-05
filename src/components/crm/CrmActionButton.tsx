'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Barcode,
  CalendarDays,
  ClipboardList,
  FileText,
  MapPinned,
  ReceiptText,
  UserPlus,
} from 'lucide-react';

const icons = {
  UserPlus,
  FileText,
  ClipboardList,
  ReceiptText,
  Barcode,
  MapPinned,
  CalendarDays,
} as const;

type IconKey = keyof typeof icons;

export default function CrmActionButton({
  icon,
  label,
  toast,
  href,
}: {
  icon: IconKey;
  label: string;
  toast?: string;
  href?: string;
}) {
  const [shown, setShown] = useState(false);
  const Icon = icons[icon];

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-nursery-midnight px-4 py-2 text-sm font-bold text-nursery-ivory transition hover:bg-nursery-terracotta"
      >
        <Icon className="h-4 w-4" />
        {label}
      </Link>
    );
  }

  function handleClick() {
    setShown(true);
    setTimeout(() => setShown(false), 2500);
  }

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-nursery-midnight px-4 py-2 text-sm font-bold text-nursery-ivory"
      >
        <Icon className="h-4 w-4" />
        {label}
      </button>
      {shown && (
        <span className="absolute right-0 top-full z-50 mt-2 min-w-max rounded-lg bg-nursery-midnight px-4 py-2 text-sm font-medium text-nursery-ivory shadow-xl">
          {toast}
        </span>
      )}
    </span>
  );
}
