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

       <MobileNav />
    </nav>
  );
}
