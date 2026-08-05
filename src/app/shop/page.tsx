import type { Metadata } from 'next';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import EcwidStore from '@/components/EcwidStore';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: "Shop Jimbo's Nursery | Online Store",
  description: "Shop Jimbo's Nursery online store for plants, garden goods, and seasonal nursery favorites.",
};

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-nursery-ivory">
      <Navbar />

      <main>
        <section className="border-b border-nursery-sage/15 bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <span className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.35em] text-nursery-terracotta">
                <ShoppingBag className="h-4 w-4" />
                Online Store
              </span>
              <h1 className="text-5xl font-serif leading-tight text-nursery-midnight md:text-6xl">
                Shop Jimbo&apos;s Nursery
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-nursery-midnight/65">
                Browse the same Ecwid storefront from jimbosnursery.com for nursery goods, seasonal favorites, and online orders.
              </p>
            </div>
            <div className="rounded-lg border border-nursery-sage/20 bg-nursery-ivory px-5 py-4 text-sm text-nursery-midnight/65">
              <p className="font-semibold text-nursery-midnight">Need a gift instead?</p>
              <Link href="/gift-cards" className="mt-1 inline-block font-bold text-nursery-terracotta hover:underline">
                Order a Jimbo&apos;s gift card
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <EcwidStore />
        </section>
      </main>
    </div>
  );
}
