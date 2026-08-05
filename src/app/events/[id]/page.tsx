import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, DollarSign, MapPin, Clock } from 'lucide-react';
import { readEvents } from '@/lib/events-store';
import { readReservations, summarizeReservations } from '@/lib/event-reservations-store';
import { parseEventPrice } from '@/lib/ecwid-sync';
import { formatEventDuration, formatEventTimeRange } from '@/lib/event-time';
import ReserveSpotButton from '@/components/ReserveSpotButton';
import Navbar from '@/components/Navbar';

export const dynamic = 'force-dynamic';

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const events = await readEvents();
  const event = events.find((e) => e.id === params.id);
  if (!event) notFound();

  const reservations = await readReservations();
  const { guestsReserved, slotCounts, addOnCounts } = summarizeReservations(reservations, event.id);

  return (
    <div className="min-h-screen bg-nursery-ivory">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-20">
        <Link href="/events" className="inline-flex items-center gap-2 text-sm text-nursery-midnight/60 hover:text-nursery-terracotta transition-colors mb-10">
           <ArrowLeft className="w-4 h-4" /> Back to All Events
        </Link>

        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-nursery-sage/10">
          <div className="h-80 md:h-96 bg-nursery-midnight relative overflow-hidden">
             <Image src={event.image} alt={event.title} fill className="object-cover" />
             <div className="absolute inset-0 bg-nursery-midnight/10" />
             <div className="absolute top-6 right-6 bg-nursery-terracotta text-nursery-ivory px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest shadow-lg z-10">
                {event.type}
             </div>
          </div>

          <div className="p-10 md:p-14">
            <h1 className="text-4xl md:text-5xl font-serif text-nursery-midnight mb-8">{event.title}</h1>

            <div className="grid grid-cols-2 gap-6 mb-10 text-nursery-midnight/60">
               <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-nursery-terracotta" />
                  <span>{event.date}</span>
               </div>
               <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-nursery-terracotta" />
                  <span>
                     {formatEventTimeRange(event.startTime, event.endTime)}
                     {event.startTime && event.endTime ? ` (${formatEventDuration(event.startTime, event.endTime)})` : ''}
                  </span>
               </div>
               <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-nursery-terracotta" />
                  <span>{event.location}</span>
               </div>
               <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-nursery-terracotta" />
                  <span>{event.price}</span>
               </div>
            </div>

            <p className="text-lg text-nursery-midnight/70 leading-relaxed mb-12">
               {event.description}
            </p>

            <div className="max-w-sm">
              <ReserveSpotButton
                 eventId={event.id}
                 eventTitle={event.title}
                 eventDate={event.date}
                 eventTime={formatEventTimeRange(event.startTime, event.endTime)}
                 eventLocation={event.location}
                 capacity={event.capacity}
                 reserved={guestsReserved}
                 timeSlots={event.timeSlots}
                 slotCounts={slotCounts}
                 addOns={event.addOns}
                 addOnCounts={addOnCounts}
                 ecwidProductId={event.ecwidProductId}
                 ticketPrice={parseEventPrice(event.price)}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
