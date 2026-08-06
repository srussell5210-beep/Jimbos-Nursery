'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MobileNav from './MobileNav';

interface NavbarProps {
  logoSize?: number;
  transparent?: boolean;
}

export default function Navbar({ logoSize = 80, transparent = false }: NavbarProps) {
  return (
    <nav className={`h-24 border-b border-nursery-sage/20 flex items-center justify-between px-8 sticky top-0 z-50 ${transparent ? 'bg-transparent border-none' : 'bg-nursery-ivory/80 backdrop-blur-md'}`}>
       <Link href="/" className="hover:scale-105 transition-transform duration-500 flex items-center gap-6">
          <Image src="/images/jimbo_logo.png" alt="Jimbo's Nursery Logo" width={logoSize} height={logoSize} />
       </Link>

       <div className="hidden lg:flex items-center gap-8 text-sm font-bold tracking-widest uppercase text-nursery-midnight/60">
          <Link href="/#services" className="hover:text-nursery-terracotta transition-colors">Services</Link>
          <Link href="/about" className="hover:text-nursery-terracotta transition-colors">About Us</Link>
          <Link href="/landscaping" className="hover:text-nursery-terracotta transition-colors">Landscaping</Link>
          <Link href="/rentals" className="hover:text-nursery-terracotta transition-colors">Plant Rentals</Link>
          <Link href="/wholesale" className="hover:text-nursery-terracotta transition-colors text-nursery-terracotta">Wholesale</Link>
          <Link href="/events" className="hover:text-nursery-terracotta transition-colors">Events</Link>
          <Link href="/whats-new" className="hover:text-nursery-terracotta transition-colors">What&apos;s New</Link>
          <Link href="/gift-cards" className="hover:text-nursery-terracotta transition-colors">Gift Cards</Link>
       </div>

       <div className="lg:hidden">
          <MobileNav />
       </div>
    </nav>
  );
}
