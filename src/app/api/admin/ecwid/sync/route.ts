import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser, unauthorized } from '@/lib/admin-api';
import { readEvents, writeEvents } from '@/lib/events-store';
import { syncEventToEcwid } from '@/lib/ecwid-sync';

// Manual retry for admins when the automatic sync (on event create/update)
// failed — e.g. ECWID_API_TOKEN wasn't set yet at the time.
export async function POST(request: NextRequest) {
  if (!getAdminUser(request)) return unauthorized();

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    const events = await readEvents();
    const index = events.findIndex((e) => e.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    events[index] = await syncEventToEcwid(events[index]);
    await writeEvents(events);
    return NextResponse.json(events[index]);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
