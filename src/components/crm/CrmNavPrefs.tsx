'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  DollarSign,
  FileText,
  Package,
  Route,
  Sprout,
  Truck,
  Users,
} from 'lucide-react';
import { STORAGE_KEY } from '@/components/crm/CrmCustomizeButton';

const navItems = [
  { label: 'Command Center', href: '/crm', icon: BarChart3 },
  { label: 'Customers', href: '/crm/customers', icon: Users },
  { label: 'Leads', href: '/crm/leads', icon: Sprout },
  { label: 'Quotes', href: '/crm/quotes', icon: FileText },
  { label: 'Orders', href: '/crm/orders', icon: ClipboardList },
  { label: 'Invoices', href: '/crm/invoices', icon: DollarSign },
  { label: 'Inventory', href: '/crm/inventory', icon: Package },
  { label: 'Deliveries', href: '/crm/deliveries', icon: Truck },
  { label: 'Services', href: '/crm/services', icon: CalendarDays },
  { label: 'Vendors', href: '/crm/vendors', icon: Route },
];

export function CrmNavPrefs({ active, variant }: { active: string; variant: 'sidebar' | 'mobile' }) {
  const [hidden, setHidden] = useState<string[]>([]);

  useEffect(() => {
    function loadPrefs() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        setHidden(stored ? JSON.parse(stored) : []);
      } catch {}
    }

    loadPrefs();
    window.addEventListener('crm-prefs-changed', loadPrefs);
    return () => window.removeEventListener('crm-prefs-changed', loadPrefs);
  }, []);

  const visible = navItems.filter((item) => !hidden.includes(item.label));

  if (variant === 'mobile') {
    return (
      <>
        {visible.map((item) => {
          const Icon = item.icon;
          const isActive = item.label === active;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                isActive
                  ? 'bg-nursery-midnight text-nursery-ivory'
                  : 'bg-white text-nursery-midnight/70 ring-1 ring-nursery-sage/20'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </>
    );
  }

  return (
    <nav className="space-y-1 px-4 py-5">
      {visible.map((item) => {
        const Icon = item.icon;
        const isActive = item.label === active;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
              isActive
                ? 'bg-nursery-ivory text-nursery-midnight'
                : 'text-nursery-ivory/70 hover:bg-white/10 hover:text-nursery-ivory'
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
