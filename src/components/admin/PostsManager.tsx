'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Eye, EyeOff, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import type { NurseryPost } from '@/lib/posts-store';

const EMPTY_POST = {
  title: '', author: '', date: '', publishedAt: '', excerpt: '', body: '',
  image: '/images/hero_placeholder.jpg', published: true,
};

function formatPostDate(isoDate: string): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PostsManager() {
  const [posts, setPosts] = useState<NurseryPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...EMPTY_POST });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts', { cache: 'no-store' });
      setPosts(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ ...EMPTY_POST });
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/posts', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { ...form, id: editingId } : form),
      });
      if (res.ok) {
        resetForm();
        await fetchPosts();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Could not save this post.');
      }
    } catch (err) {
      console.error(err);
      setError('Could not save this post.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (post: NurseryPost) => {
    setEditingId(post.id);
    setForm({
      title: post.title ?? '',
      author: post.author ?? '',
      date: post.date ?? '',
      publishedAt: post.publishedAt ?? '',
      excerpt: post.excerpt ?? '',
      body: post.body ?? '',
      image: post.image ?? '/images/hero_placeholder.jpg',
      published: post.published !== false,
    });
    setError('');
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/posts?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (editingId === id) resetForm();
        await fetchPosts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const togglePublished = async (post: NurseryPost) => {
    try {
      const res = await fetch('/api/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: post.id, published: !post.published }),
      });
      if (res.ok) await fetchPosts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Upload failed.');
      else setForm(prev => ({ ...prev, image: data.url }));
    } catch (err) {
      console.error(err);
      setError('Upload failed.');
    } finally {
      setImageUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="flex gap-12 flex-col lg:flex-row w-full">
      {/* Left: post list */}
      <div className="flex-1">
        <h2 className="text-2xl font-serif pb-2 border-b-2 border-nursery-terracotta text-nursery-midnight mb-8">
          Manage Posts
        </h2>

        {loading ? (
          <p>Loading posts...</p>
        ) : posts.length === 0 ? (
          <div className="bg-white p-10 rounded-xl border border-dashed border-nursery-sage/40 text-center">
            <p className="text-nursery-midnight/60">No posts yet. Add your first one using the form.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className={`bg-white p-6 rounded-xl border shadow-sm flex justify-between items-start gap-4 group transition-colors ${
                post.id === editingId ? 'border-nursery-terracotta' : 'border-nursery-sage/20 hover:border-nursery-terracotta'
              }`}>
                <div className="flex gap-4 min-w-0">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-nursery-sage/20">
                    <Image src={post.image} alt="" fill className="object-cover" unoptimized />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs uppercase tracking-widest text-nursery-terracotta font-bold block mb-1">
                      {post.author} • {post.date}
                    </span>
                    <h4 className="text-xl font-serif text-nursery-midnight mb-1 truncate">{post.title}</h4>
                    <p className="text-sm text-nursery-midnight/50 line-clamp-2">{post.excerpt}</p>
                    <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      post.published
                        ? 'bg-nursery-sage/10 text-nursery-midnight/70'
                        : 'bg-nursery-terracotta/10 text-nursery-terracotta'
                    }`}>
                      {post.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      {post.published ? 'Live on site' : 'Draft — hidden'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all">
                  <button onClick={() => togglePublished(post)} aria-label={post.published ? 'Unpublish post' : 'Publish post'}
                          className="w-10 h-10 rounded-full hover:bg-nursery-sage/10 flex items-center justify-center text-nursery-midnight/60">
                    {post.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleEdit(post)} aria-label="Edit post"
                          className="w-10 h-10 rounded-full hover:bg-nursery-sage/10 flex items-center justify-center text-nursery-midnight/60">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(post.id)} aria-label="Delete post"
                          className="w-10 h-10 rounded-full hover:bg-red-50 flex items-center justify-center text-red-500">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: add/edit form */}
      <div className="w-full lg:w-96">
        <div ref={formRef} className="bg-white p-8 rounded-2xl border border-nursery-sage/20 shadow-xl sticky top-28">
          <h3 className="text-xl font-serif text-nursery-midnight mb-6 flex items-center gap-2">
            {editingId ? <Pencil className="w-5 h-5 text-nursery-terracotta" /> : <Plus className="w-5 h-5 text-nursery-terracotta" />}
            {editingId ? 'Edit Post' : 'Add New Post'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label htmlFor="post-title" className="block text-xs uppercase tracking-widest text-nursery-midnight/60 mb-1">Title</label>
              <input id="post-title" required type="text"
                     className="w-full border border-nursery-sage/30 rounded-lg p-3 bg-nursery-ivory/30 focus:outline-none focus:border-nursery-terracotta"
                     value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label htmlFor="post-author" className="block text-xs uppercase tracking-widest text-nursery-midnight/60 mb-1">
                Author <span className="normal-case text-nursery-midnight/30">(optional)</span>
              </label>
              <input id="post-author" type="text" placeholder="Jimbo’s Nursery"
                     className="w-full border border-nursery-sage/30 rounded-lg p-3 bg-nursery-ivory/30 focus:outline-none focus:border-nursery-terracotta"
                     value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
            </div>
            <div>
              <label htmlFor="post-date" className="block text-xs uppercase tracking-widest text-nursery-midnight/60 mb-1">Date</label>
              <input id="post-date" required type="date"
                     className="w-full border border-nursery-sage/30 rounded-lg p-3 bg-nursery-ivory/30 focus:outline-none focus:border-nursery-terracotta"
                     value={form.publishedAt}
                     onChange={e => setForm({ ...form, publishedAt: e.target.value, date: formatPostDate(e.target.value) })} />
            </div>
            <div>
              <label htmlFor="post-excerpt" className="block text-xs uppercase tracking-widest text-nursery-midnight/60 mb-1">Card Summary</label>
              <textarea id="post-excerpt" required
                        className="w-full border border-nursery-sage/30 rounded-lg p-3 bg-nursery-ivory/30 focus:outline-none focus:border-nursery-terracotta h-20"
                        value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} />
              <p className="text-[11px] text-nursery-midnight/40 mt-1">Shown on the homepage card.</p>
            </div>
            <div>
              <label htmlFor="post-body" className="block text-xs uppercase tracking-widest text-nursery-midnight/60 mb-1">Full Post</label>
              <textarea id="post-body" required
                        className="w-full border border-nursery-sage/30 rounded-lg p-3 bg-nursery-ivory/30 focus:outline-none focus:border-nursery-terracotta h-40"
                        value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} />
              <p className="text-[11px] text-nursery-midnight/40 mt-1">Blank lines start a new paragraph.</p>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-widest text-nursery-midnight/60 mb-1">Cover Image</span>
              <label className={`flex items-center justify-center gap-2 border border-dashed rounded-lg py-3 text-xs font-semibold cursor-pointer transition-colors ${
                imageUploading
                  ? 'border-nursery-sage/30 text-nursery-midnight/40 cursor-not-allowed'
                  : 'border-nursery-sage/40 text-nursery-midnight/60 hover:border-nursery-terracotta hover:text-nursery-terracotta'
              }`}>
                <Upload className="w-4 h-4" />
                {imageUploading ? 'Uploading…' : 'Upload Image'}
                <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden"
                       disabled={imageUploading} onChange={handleImageUpload} />
              </label>
              <div className="relative mt-3 h-16 w-16 overflow-hidden rounded-lg border border-nursery-sage/30 bg-nursery-ivory/30">
                <Image src={form.image} alt="Cover preview" fill className="object-cover" unoptimized />
              </div>
            </div>
            <label className="flex items-center gap-3 pt-1">
              <input type="checkbox" checked={form.published}
                     onChange={e => setForm({ ...form, published: e.target.checked })}
                     className="h-4 w-4 rounded border-nursery-sage/40 accent-nursery-terracotta" />
              <span className="text-sm text-nursery-midnight/70">Publish to the website</span>
            </label>

            {error && <p className="text-xs text-red-600" role="alert">{error}</p>}

            <div className="flex gap-3 mt-4">
              {editingId && (
                <button type="button" onClick={resetForm}
                        className="flex-1 bg-nursery-ivory border border-nursery-sage/30 text-nursery-midnight font-bold py-4 rounded-xl hover:bg-nursery-sage/10 transition-colors">
                  Cancel
                </button>
              )}
              <button type="submit" disabled={saving}
                      className="flex-1 bg-nursery-midnight text-nursery-ivory font-bold py-4 rounded-xl hover:bg-nursery-terracotta transition-colors disabled:opacity-50">
                {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Publish Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
