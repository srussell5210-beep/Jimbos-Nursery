import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Leaf } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { readPosts, sortPosts } from '@/lib/posts-store';

export const dynamic = 'force-dynamic';

export default async function WhatsNewPage() {
  let posts: Awaited<ReturnType<typeof readPosts>> = [];
  try {
    posts = sortPosts(await readPosts()).filter((p) => p.published !== false);
  } catch (e) {
    console.error('Could not load posts', e);
  }

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
              See what’s new at Jimbo’s Nursery! Explore the latest plants to arrive in our greenhouses and
              discover something new for your garden.
            </p>
          </div>
        </section>

        {/* Posts */}
        {posts.length > 0 && (
          <section className="py-24 bg-white border-b border-nursery-sage/10">
            <div className="max-w-7xl mx-auto px-12">
              <div className="mb-16">
                <span className="text-nursery-terracotta font-bold tracking-[0.4em] uppercase text-xs mb-4 block">Learn about New Plants</span>
                <h2 className="text-4xl font-serif text-nursery-midnight mb-2">Latest Posts</h2>
                <div className="w-16 h-[2px] bg-nursery-terracotta" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {posts.map((post) => (
                  <Link key={post.id} href={`/field-notes/${post.id}`} className="group block">
                    <div className="aspect-[16/10] rounded-3xl overflow-hidden mb-8 relative border border-nursery-sage/10">
                      <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" unoptimized />
                    </div>
                    <span className="text-xs font-bold text-nursery-terracotta/60 uppercase tracking-widest block mb-2">{post.author} • {post.date}</span>
                    <h3 className="text-2xl font-serif text-nursery-midnight mb-4 group-hover:text-nursery-terracotta transition-colors">{post.title}</h3>
                    <p className="text-nursery-midnight/50 text-sm leading-relaxed mb-6">{post.excerpt}</p>
                    <span className="font-bold text-sm border-b-2 border-nursery-midnight/10 pb-1 group-hover:border-nursery-terracotta transition-colors">Read Note</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

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
