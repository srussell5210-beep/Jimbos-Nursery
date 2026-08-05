import { NextResponse } from 'next/server';
import { readReservations, writeReservations, summarizeReservations, type ReservedAddOn } from '@/lib/event-reservations-store';
import { readEvents } from '@/lib/events-store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const reservations = await readReservations();
    if (eventId) {
      const { guestsReserved, slotCounts, addOnCounts } = summarizeReservations(reservations, eventId);
      return NextResponse.json({ count: guestsReserved, slotCounts, addOnCounts });
    }
    const counts: Record<string, number> = {};
    for (const r of reservations) {
      counts[r.eventId] = (counts[r.eventId] ?? 0) + r.guests;
    }
    return NextResponse.json({ counts });
  } catch {
    return NextResponse.json({ error: 'Failed to read reservations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const eventId = String(body.eventId ?? '').trim();
    const name = String(body.name ?? '').trim();
    const email = String(body.email ?? '').trim();
    const guests = Math.min(Math.max(parseInt(body.guests, 10) || 1, 1), 20);
    const timeSlotId = body.timeSlotId ? String(body.timeSlotId).trim() : null;
    const requestedAddOns: { id: string; quantity: number }[] = Array.isArray(body.addOns)
      ? body.addOns
          .map((a: any) => ({ id: String(a?.id ?? ''), quantity: parseInt(a?.quantity, 10) || 0 }))
          .filter((a: { id: string; quantity: number }) => a.id && a.quantity > 0)
      : [];

    if (!eventId || !name || !email) {
      return NextResponse.json({ error: 'Name, email, and event are required.' }, { status: 400 });
    }
    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    }

    const events = await readEvents();
    const event = events.find((e) => e.id === eventId);
    if (!event) {
      return NextResponse.json({ error: 'This event no longer exists.' }, { status: 404 });
    }

    const slots = event.timeSlots ?? [];
    let slot = null;
    if (slots.length > 0) {
      if (!timeSlotId) {
        return NextResponse.json({ error: 'Please select a time slot.' }, { status: 400 });
      }
      slot = slots.find((s) => s.id === timeSlotId);
      if (!slot) {
        return NextResponse.json({ error: 'That time slot is no longer available.' }, { status: 400 });
      }
    }

    const resolvedAddOns: ReservedAddOn[] = [];
    for (const requested of requestedAddOns) {
      const addOn = (event.addOns ?? []).find((a) => a.id === requested.id);
      if (!addOn) {
        return NextResponse.json({ error: 'One of the selected add-ons is no longer available.' }, { status: 400 });
      }
      resolvedAddOns.push({ id: addOn.id, name: addOn.name, quantity: requested.quantity });
    }

    const reservations = await readReservations();
    const { guestsReserved, slotCounts, addOnCounts } = summarizeReservations(reservations, eventId);

    if (event.capacity && event.capacity > 0) {
      const remaining = event.capacity - guestsReserved;
      if (remaining <= 0) {
        return NextResponse.json({ error: 'This event is fully booked.' }, { status: 409 });
      }
      if (guests > remaining) {
        return NextResponse.json({ error: `Only ${remaining} spot${remaining === 1 ? '' : 's'} left for this event.` }, { status: 409 });
      }
    }

    if (slot && slot.capacity && slot.capacity > 0) {
      const slotReserved = slotCounts[slot.id] ?? 0;
      const remaining = slot.capacity - slotReserved;
      if (remaining <= 0) {
        return NextResponse.json({ error: `The "${slot.label}" time slot is fully booked.` }, { status: 409 });
      }
      if (guests > remaining) {
        return NextResponse.json({ error: `Only ${remaining} spot${remaining === 1 ? '' : 's'} left for "${slot.label}".` }, { status: 409 });
      }
    }

    for (const addOn of resolvedAddOns) {
      const definition = (event.addOns ?? []).find((a) => a.id === addOn.id)!;
      if (definition.capacity && definition.capacity > 0) {
        const addOnReserved = addOnCounts[addOn.id] ?? 0;
        const remaining = definition.capacity - addOnReserved;
        if (addOn.quantity > remaining) {
          return NextResponse.json({
            error: remaining <= 0
              ? `"${definition.name}" is sold out.`
              : `Only ${remaining} of "${definition.name}" left.`,
          }, { status: 409 });
        }
      }
    }

    const reservation = {
      id: Date.now().toString(),
      eventId,
      eventTitle: event.title,
      name,
      email,
      guests,
      timeSlotId: slot?.id ?? null,
      timeSlotLabel: slot?.label ?? null,
      addOns: resolvedAddOns,
      createdAt: new Date().toISOString(),
    };
    reservations.push(reservation);
    await writeReservations(reservations);

    const updated = summarizeReservations(reservations, eventId);
    return NextResponse.json({
      reservation,
      count: updated.guestsReserved,
      slotCounts: updated.slotCounts,
      addOnCounts: updated.addOnCounts,
    }, { status: 201 });
  } catch (error) {
    console.error('Error saving reservation:', error);
    return NextResponse.json({ error: 'Failed to save reservation.' }, { status: 500 });
  }
}
