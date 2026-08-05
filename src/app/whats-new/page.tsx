'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Leaf, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';

const plants = [
  {
    name: 'Mexican Sycamore',
    category: 'Shade Tree',
    desc: 'A fast-growing native with striking silver-white undersides on its leaves. Exceptional Gulf Coast performer.',
    image: '/images/Mexican-Sycamore.jpeg',
    tag: 'New Arrival',
  },
  {
    name: 'Monstera Deliciosa',
    category: 'Tropical',
    desc: 'Bold, split leaves that bring the tropics indoors or onto a shaded patio. A statement plant in any space.',
    image: '/images/Monstera-Deliciosa.jpeg',
    tag: 'In Stock',
  },
  {
    name: 'Red Yucca',
    category: 'Native',
    desc: 'Tall coral-red flower spikes beloved by hummingbirds. Drought-tough and thrives in South Texas heat.',
    image: '/images/Red-Yucca.jpeg',
    tag: 'Gulf Coast Favorite',
  },
  {
    name: 'Sago Palm',
    category: 'Cycad',
    desc: 'A living fossil with deep architectural presence. Slow-growing, incredibly long-lived, and endlessly elegant.',
    image: '/images/Sago-Palm.jpeg',
    tag: 'In Stock',
  },
];

const tagColors: Record<string, string> = {
  'New Arrival': 'bg-nursery-terracotta text-nursery-ivory',
  'In Stock': 'bg-nursery-sage/20 text-nursery-midnight',
  'Gulf Coast Favorite': 'bg-nursery-ochre/20 text-nursery-midnight',
};

export default function WhatsNewPage() {
  return (
    <div className="min-h-screen bg-nursery-ivory selection:bg-nursery-terracotta/20">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative h-[50vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/hero_placeholder.jpg"
              alt="Garden Center"
              fill
              className="object-cover scale-105 blur-sm"
              priority
            />
            <div className="absolute inset-0 bg-nursery-midnight/65" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-12 w-full">
            <span className="text-nursery-ochre font-bold tracking-[0.4em] uppercase mb-4 block text-sm">Garden Center</span>
            <h1 className="text-6xl md:text-7xl font-serif text-nursery-ivory leading-tight">
              What's <span className="italic text-nursery-sage">New</span>
            </h1>
            <p className="text-lg text-nursery-ivory/70 mt-6 max-w-xl leading-relaxed">
              Hand-picked plants for Gulf Coast gardens — natives, tropicals, cactus, succulents, and seasonal favorites.
            </p>
          </div>
        </section>

        {/* Plant Grid */}
        <section className="py-24 bg-nursery-ivory">
          <div className="max-w-7xl mx-auto px-12">
            <div className="flex items-center justify-between mb-16">
              <div>
                <h2 className="text-4xl font-serif text-nursery-midnight mb-2">Current Inventory Highlights</h2>
                <div className="w-16 h-[2px] bg-nursery-terracotta" />
              </div>
              <Link href="/" className="inline-flex items-center gap-2 text-nursery-midnight/50 hover:text-nursery-terracotta transition-colors text-sm font-medium uppercase tracking-widest">
                <ArrowLeft className="w-4 h-4" /> Back Home
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {plants.map((plant) => (
                <div key={plant.name} className="group bg-white border border-nursery-sage/10 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={plant.image}
                      alt={plant.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <span className={`absolute top-4 left-4 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${tagColors[plant.tag]}`}>
                      {plant.tag}
                    </span>
                  </div>
                  <div className="p-8">
                    <span className="text-nursery-terracotta text-xs font-bold uppercase tracking-widest">{plant.category}</span>
                    <h3 className="text-xl font-serif text-nursery-midnight mt-1 mb-3">{plant.name}</h3>
                    <p className="text-nursery-midnight/60 text-sm leading-relaxed">{plant.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-nursery-midnight">
          <div className="max-w-3xl mx-auto px-12 text-center">
            <Leaf className="w-10 h-10 text-nursery-sage mx-auto mb-6 opacity-60" />
            <h2 className="text-4xl font-serif text-nursery-ivory mb-4">
              Visit Us to See What's <span className="italic text-nursery-sage">In Season</span>
            </h2>
            <p className="text-nursery-ivory/60 leading-relaxed mb-10">
              Inventory changes weekly. Stop by and let us help you find the right plant for your space.
            </p>
            <Link
              href="mailto:jimbosnursery75@gmail.com"
              className="inline-block bg-nursery-terracotta text-nursery-ivory px-10 py-4 rounded-full text-lg font-bold hover:bg-nursery-ochre transition-all shadow-2xl"
            >
              Get in Touch
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-12 text-center border-t border-nursery-sage/10 text-nursery-midnight/40 text-xs uppercase tracking-widest bg-nursery-ivory">
        © 2026 Jimbo's Nursery & Landscaping. Sanctuary by Design.
      </footer>
    </div>
  );
}
