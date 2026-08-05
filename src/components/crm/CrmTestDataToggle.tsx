'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Database, ToggleLeft, ToggleRight } from 'lucide-react';

const COOKIE_NAME = 'crm_test_data';
const ONE_YEAR = 60 * 60 * 24 * 365;

export default function CrmTestDataToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [pending, startTransition] = useTransition();
  const ToggleIcon = enabled ? ToggleRight : ToggleLeft;

  const handleToggle = () => {
    const nextEnabled = !enabled;
    setEnabled(nextEnabled);
    document.cookie = `${COOKIE_NAME}=${nextEnabled ? 'on' : 'off'}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax`;
    startTransition(() => router.refresh());
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={enabled}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-bold shadow-sm transition-colors ${
        enabled
          ? 'border-nursery-sage/35 bg-nursery-sage/10 text-nursery-midnight hover:bg-nursery-sage/20'
          : 'border-nursery-terracotta/35 bg-nursery-terracotta/10 text-nursery-terracotta hover:bg-nursery-terracotta/15'
      } ${pending ? 'opacity-70' : ''}`}
    >
      <Database className="h-4 w-4" />
      <span className="whitespace-nowrap">{enabled ? 'Test Data On' : 'Test Data Off'}</span>
      <ToggleIcon className="h-5 w-5" />
    </button>
  );
}
