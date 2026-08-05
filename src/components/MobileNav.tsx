'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-nursery-midnight p-1"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[100]">
          <div
            className="absolute inset-0 bg-nursery-midnight/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-0 right-0 h-full w-72 bg-nursery-ivory shadow-2xl flex flex-col">
            <div className="flex justify-end p-6">
              <button
                onClick={() => setOpen(false)}
                className="text-nursery-midnight"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex flex-col gap-2 px-6 pb-10">
              {[
                { label: "What's New", href: "/whats-new" },
                { label: "Events", href: "/events" },
                { label: "Gift Cards", href: "/gift-cards" },
                { label: "Landscaping", href: "/landscaping" },
                { label: "Wholesale", href: "/wholesale" },
                { label: "Plant Rentals", href: "/rentals" },
                { label: "Our History", href: "/about" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium text-nursery-midnight hover:text-nursery-terracotta transition-colors py-3 border-b border-nursery-sage/20"
                >
                  {item.label}
                </Link>
              ))}
              <div className="grid grid-cols-2 gap-3 mt-2">
                <Link
                  href="/login?redirect=/crm"
                  onClick={() => setOpen(false)}
                  className="border border-nursery-sage/40 bg-white px-4 py-3 rounded-full font-medium text-center text-nursery-midnight hover:border-nursery-terracotta hover:text-nursery-terracotta transition-all duration-300"
                >
                  CRM
                </Link>
                <Link
                  href="/login?redirect=/admin"
                  onClick={() => setOpen(false)}
                  className="border border-nursery-sage/40 bg-white px-4 py-3 rounded-full font-medium text-center text-nursery-midnight hover:border-nursery-terracotta hover:text-nursery-terracotta transition-all duration-300"
                >
                  Admin
                </Link>
              </div>
            </nav>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
