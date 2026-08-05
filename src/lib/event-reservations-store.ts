import { getStore } from '@netlify/blobs';
import fs from 'fs/promises';
import path from 'path';

export interface ReservedAddOn {
  id: string;
  name: string;
  quantity: number;
  optionId?: string | null;
  optionLabel?: string | null;
}

export interface EventReservation {
  id: string;
  eventId: string;
  eventTitle: string;
  name: string;
  email: string;
  guests: number;
  timeSlotId?: string | null;
  timeSlotLabel?: string | null;
  addOns?: ReservedAddOn[];
  createdAt: string;
  paid?: boolean;
  totalPaid?: number;
  ecwidOrderId?: string;
}

export interface EventAvailability {
  guestsReserved: number;
  slotCounts: Record<string, number>;
  addOnCounts: Record<string, number>;
}

export function summarizeReservations(reservations: EventReservation[], eventId: string): EventAvailability {
  const forEvent = reservations.filter((r) => r.eventId === eventId);
  const summary: EventAvailability = { guestsReserved: 0, slotCounts: {}, addOnCounts: {} };
  for (const r of forEvent) {
    summary.guestsReserved += r.guests;
    if (r.timeSlotId) {
      summary.slotCounts[r.timeSlotId] = (summary.slotCounts[r.timeSlotId] ?? 0) + r.guests;
    }
    for (const addOn of r.addOns ?? []) {
      summary.addOnCounts[addOn.id] = (summary.addOnCounts[addOn.id] ?? 0) + addOn.quantity;
    }
  }
  return summary;
}

const STORE_NAME = 'jimbos-event-reservations';
const RESERVATIONS_KEY = 'reservations';
// Bundled with the deploy, read-only in production. Used only as the seed
// the first time the blob store is empty, and as the read/write fallback
// for local dev where Netlify Blobs isn't available.
const SEED_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'event-reservations.json');

async function readSeedFile(): Promise<EventReservation[]> {
  try {
    const raw = await fs.readFile(SEED_FILE_PATH, 'utf8');
    return JSON.parse(raw) as EventReservation[];
  } catch {
    return [];
  }
}

export async function readReservations(): Promise<EventReservation[]> {
  try {
    const store = getStore(STORE_NAME);
    const existing = await store.get(RESERVATIONS_KEY, { type: 'json', consistency: 'strong' }) as EventReservation[] | null;
    if (existing) return existing;
    const seed = await readSeedFile();
    await store.setJSON(RESERVATIONS_KEY, seed);
    return seed;
  } catch {
    return readSeedFile();
  }
}

export async function writeReservations(reservations: EventReservation[]): Promise<void> {
  try {
    const store = getStore(STORE_NAME);
    await store.setJSON(RESERVATIONS_KEY, reservations);
  } catch {
    await fs.writeFile(SEED_FILE_PATH, JSON.stringify(reservations, null, 2), 'utf8');
  }
}
