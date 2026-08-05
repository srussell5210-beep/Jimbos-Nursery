import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { readPosts } from '@/lib/posts-store';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const post = (await readPosts()).find(p => p.id === params.id);
  if (!post) return { title: 'Post Not Found | Jimbo’s Nursery' };
  return { title: `${post.title} | Jimbo’s Nursery`, description: post.excerpt };
}

export default async function FieldNotePage({ params }: { params: { id: string } }) {
  const posts = await readPosts();
  const post = posts.find(p => p.id === params.id && p.published !== false);
  if (!post) notFound();

  const paragraphs = post.body.split(/\n\s*\n/).filter(Boolean);

  return (
    <div className="min-h-screen bg-nursery-ivory">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-20">
        <Link
          href="/#field-notes"
          className="inline-flex items-center gap-2 text-nursery-midnight/50 hover:text-nursery-terracotta transition-colors text-sm font-medium uppercase tracking-widest mb-12"
        >
          <ArrowLeft className="w-4 h-4" /> All Notes
        </Link>

        <article>
          <header className="mb-12">
            <span className="text-xs font-bold text-nursery-terracotta/70 uppercase tracking-widest block mb-4">
              {post.author} • {post.date}
            </span>
            <h1 className="text-5xl font-serif text-nursery-midnight leading-tight">{post.title}</h1>
          </header>

          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden mb-12 border border-nursery-sage/10">
            <Image src={post.image} alt={post.title} fill className="object-cover" unoptimized />
          </div>

          <div className="space-y-6">
            {paragraphs.map((para, i) => (
              <p key={i} className="text-lg text-nursery-midnight/70 leading-relaxed whitespace-pre-line">
                {para}
              </p>
            ))}
          </div>
        </article>
      </main>

      <footer className="py-12 text-center border-t border-nursery-sage/10 text-nursery-midnight/40 text-xs uppercase tracking-widest">
        © 2026 Jimbo&apos;s Nursery &amp; Landscaping. Sanctuary by Design.
      </footer>
    </div>
  );
}
