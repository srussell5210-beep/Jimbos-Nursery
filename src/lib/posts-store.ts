import { getStore } from '@netlify/blobs';
import fs from 'fs/promises';
import path from 'path';

export interface NurseryPost {
  id: string;
  title: string;
  author: string;
  date: string;
  publishedAt: string;
  excerpt: string;
  body: string;
  image: string;
  published: boolean;
}

const STORE_NAME = 'jimbos-posts';
const POSTS_KEY = 'posts';
// Bundled with the deploy, read-only in production. Used only as the seed
// the first time the blob store is empty, and as the read/write fallback
// for local dev where Netlify Blobs isn't available.
const SEED_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'posts.json');

async function readSeedFile(): Promise<NurseryPost[]> {
  try {
    const raw = await fs.readFile(SEED_FILE_PATH, 'utf8');
    return JSON.parse(raw) as NurseryPost[];
  } catch {
    return [];
  }
}

export function sortPosts(posts: NurseryPost[]): NurseryPost[] {
  return [...posts].sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
}

export async function readPosts(): Promise<NurseryPost[]> {
  try {
    const store = getStore(STORE_NAME);
    const existing = await store.get(POSTS_KEY, { type: 'json', consistency: 'strong' }) as NurseryPost[] | null;
    if (existing) return existing;
    // First run: seed the blob store from the bundled posts.json so the
    // posts already on the homepage aren't lost when this ships.
    const seed = await readSeedFile();
    await store.setJSON(POSTS_KEY, seed);
    return seed;
  } catch {
    // No Blobs context available (e.g. local dev without `netlify dev`).
    return readSeedFile();
  }
}

export async function writePosts(posts: NurseryPost[]): Promise<void> {
  try {
    const store = getStore(STORE_NAME);
    await store.setJSON(POSTS_KEY, posts);
  } catch {
    await fs.writeFile(SEED_FILE_PATH, JSON.stringify(posts, null, 2), 'utf8');
  }
}
