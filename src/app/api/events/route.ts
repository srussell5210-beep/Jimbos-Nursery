import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth-check';
import { readEvents, writeEvents } from '@/lib/events-store';
import { syncEventToEcwid } from '@/lib/ecwid-sync';

const COOKIE_NAME = 'jn_session';

function isAuthenticated(): boolean {
  const token = cookies().get(COOKIE_NAME)?.value ?? '';
  return !!verifySessionToken(token);
}

export async function GET() {
  try {
    return NextResponse.json(await readEvents());
  } catch {
    return NextResponse.json({ error: 'Failed to read events data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const newEvent = await request.json();
    const events = await readEvents();
    newEvent.id = Date.now().toString();
    events.push(newEvent);
    await writeEvents(events);

    const synced = await syncEventToEcwid(newEvent).catch((e) => {
      console.error('Failed to sync new event to Ecwid:', e);
      return newEvent;
    });
    if (synced !== newEvent) {
      const idx = events.findIndex((e) => e.id === synced.id);
      if (idx !== -1) {
        events[idx] = synced;
        await writeEvents(events);
      }
    }

    return NextResponse.json(synced, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to save event data' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const updatedEvent = await request.json();
    if (!updatedEvent.id) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }
    const events = await readEvents();
    const index = events.findIndex((e) => e.id === updatedEvent.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    events[index] = { ...events[index], ...updatedEvent };

    events[index] = await syncEventToEcwid(events[index]).catch((e) => {
      console.error('Failed to sync updated event to Ecwid:', e);
      return events[index];
    });
    await writeEvents(events);
    return NextResponse.json(events[index]);
  } catch {
    return NextResponse.json({ error: 'Failed to update event data' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    const events = (await readEvents()).filter((e) => e.id !== id);
    await writeEvents(events);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
