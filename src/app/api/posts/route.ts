import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth-check';
import { readPosts, writePosts, sortPosts, type NurseryPost } from '@/lib/posts-store';

const COOKIE_NAME = 'jn_session';

function isAuthenticated(): boolean {
  const token = cookies().get(COOKIE_NAME)?.value ?? '';
  return !!verifySessionToken(token);
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function uniqueId(title: string, posts: NurseryPost[]): string {
  const base = slugify(title) || 'post';
  if (!posts.some((p) => p.id === base)) return base;
  let n = 2;
  while (posts.some((p) => p.id === `${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export async function GET() {
  try {
    return NextResponse.json(sortPosts(await readPosts()));
  } catch {
    return NextResponse.json({ error: 'Failed to read posts data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'Post title required' }, { status: 400 });
    }
    const posts = await readPosts();
    const newPost: NurseryPost = {
      id: uniqueId(body.title, posts),
      title: body.title.trim(),
      author: body.author?.trim() || 'Jimbo’s Nursery',
      date: body.date ?? '',
      publishedAt: body.publishedAt ?? '',
      excerpt: body.excerpt?.trim() ?? '',
      body: body.body?.trim() ?? '',
      image: body.image || '/images/hero_placeholder.jpg',
      published: body.published !== false,
    };
    posts.push(newPost);
    await writePosts(posts);
    return NextResponse.json(newPost, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to save post data' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const updated = await request.json();
    if (!updated.id) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }
    const posts = await readPosts();
    const index = posts.findIndex((p) => p.id === updated.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    posts[index] = { ...posts[index], ...updated, id: posts[index].id };
    await writePosts(posts);
    return NextResponse.json(posts[index]);
  } catch {
    return NextResponse.json({ error: 'Failed to update post data' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    const posts = (await readPosts()).filter((p) => p.id !== id);
    await writePosts(posts);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
