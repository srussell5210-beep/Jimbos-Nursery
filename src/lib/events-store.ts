import { getStore } from '@netlify/blobs';
import fs from 'fs/promises';
import path from 'path';

export interface EventTimeSlot {
  id: string;
  label: string;
  capacity?: number | null;
}

export interface EventAddOn {
  id: string;
  name: string;
  capacity?: number | null;
  price?: number | null;
  ecwidProductId?: number | null;
}

export interface NurseryEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  price: string;
  type: string;
  image: string;
  images?: string[];
  capacity?: number;
  timeSlots?: EventTimeSlot[];
  addOns?: EventAddOn[];
  ecwidProductId?: number | null;
}

const STORE_NAME = 'jimbos-events';
const EVENTS_KEY = 'events';
// Bundled with the deploy, read-only in production. Used only as the seed
// the first time the blob store is empty, and as the read/write fallback
// for local dev where Netlify Blobs isn't available.
const SEED_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'events.json');

async function readSeedFile(): Promise<NurseryEvent[]> {
  try {
    const raw = await fs.readFile(SEED_FILE_PATH, 'utf8');
    return JSON.parse(raw) as NurseryEvent[];
  } catch {
    return [];
  }
}

export async function readEvents(): Promise<NurseryEvent[]> {
  try {
    const store = getStore(STORE_NAME);
    const existing = await store.get(EVENTS_KEY, { type: 'json', consistency: 'strong' }) as NurseryEvent[] | null;
    if (existing) return existing;
    // First run: seed the blob store from the bundled events.json so
    // existing events aren't lost when this ships.
    const seed = await readSeedFile();
    await store.setJSON(EVENTS_KEY, seed);
    return seed;
  } catch {
    // No Blobs context available (e.g. local dev without `netlify dev`).
    return readSeedFile();
  }
}

export async function writeEvents(events: NurseryEvent[]): Promise<void> {
  try {
    const store = getStore(STORE_NAME);
    await store.setJSON(EVENTS_KEY, events);
  } catch {
    await fs.writeFile(SEED_FILE_PATH, JSON.stringify(events, null, 2), 'utf8');
  }
}
