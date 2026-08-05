import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, DollarSign, MapPin, Clock } from 'lucide-react';
import { readEvents } from '@/lib/events-store';
import { readReservations, summarizeReservations, type EventAvailability } from '@/lib/event-reservations-store';
import { parseEventPrice } from '@/lib/ecwid-sync';
import { formatEventDuration, formatEventTimeRange } from '@/lib/event-time';
import ReserveSpotButton from '@/components/ReserveSpotButton';
import Navbar from '@/components/Navbar';

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
  let events = [];
  let availability: Record<string, EventAvailability> = {};
  try {
    events = await readEvents();
    const reservations = await readReservations();
    for (const event of events) {
      availability[event.id] = summarizeReservations(reservations, event.id);
    }
  } catch (e) {
    console.error("Could not load events", e);
  }

  return (
    <div className="min-h-screen bg-nursery-ivory">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-20">
        <header className="mb-20 text-center">
          <span className="text-nursery-terracotta font-bold tracking-[0.3em] uppercase mb-4 block">Community & Education</span>
          <h1 className="text-6xl font-serif text-nursery-midnight mb-6">Upcoming Events</h1>
          <p className="text-xl text-nursery-midnight/60 max-w-2xl mx-auto">
            Join us for workshops, seminars, and social events designed to inspire and educate the botanical community.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-nursery-sage/10 group hover:shadow-xl transition-shadow">
              <div className="h-64 bg-nursery-midnight relative overflow-hidden">
                 <Image src={event.image} alt={event.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                 <div className="absolute inset-0 bg-nursery-midnight/10 group-hover:bg-transparent transition-colors duration-500 z-0" />
                 <div className="absolute top-6 right-6 bg-nursery-terracotta text-nursery-ivory px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest shadow-lg z-10">
                    {event.type}
                 </div>
              </div>
              <div className="p-10">
                <h3 className="text-3xl font-serif text-nursery-midnight mb-6">{event.title}</h3>
                
                <div className="grid grid-cols-2 gap-6 mb-8 text-nursery-midnight/60">
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

                <p className="text-nursery-midnight/70 leading-relaxed mb-10">
                   {event.description}
                </p>

                <ReserveSpotButton
                   eventId={event.id}
                   eventTitle={event.title}
                   eventDate={event.date}
                   eventTime={formatEventTimeRange(event.startTime, event.endTime)}
                   eventLocation={event.location}
                   capacity={event.capacity}
                   reserved={availability[event.id]?.guestsReserved ?? 0}
                   timeSlots={event.timeSlots}
                   slotCounts={availability[event.id]?.slotCounts}
                   addOns={event.addOns}
                   addOnCounts={availability[event.id]?.addOnCounts}
                   ecwidProductId={event.ecwidProductId}
                   ticketPrice={parseEventPrice(event.price)}
                />
              </div>
            </div>
          ))}
        </div>

        <section className="mt-32 relative rounded-[40px] overflow-hidden min-h-[500px] flex items-center justify-center p-8 md:p-20 group">
           {/* Background Image with Parallax-like effect */}
           <div className="absolute inset-0 z-0">
              <Image 
                src="/images/private_workshop_bg.png" 
                alt="Private Workshop Atmosphere" 
                fill 
                className="object-cover scale-105 group-hover:scale-110 transition-transform duration-1000 ease-out" 
                unoptimized
              />
              <div className="absolute inset-0 bg-nursery-midnight/60 backdrop-blur-[2px]" />
           </div>

           <div className="relative z-10 max-w-3xl text-center">
              <span className="text-nursery-ochre font-bold tracking-[0.5em] uppercase text-xs mb-6 block animate-fade-in">For Groups &amp; Gatherings</span>
              <h2 className="text-5xl md:text-7xl font-serif text-nursery-ivory mb-8 leading-tight">Host a Private <span className="italic text-nursery-sage">Workshop</span></h2>
              <p className="text-xl md:text-2xl text-nursery-ivory/80 mb-12 font-light leading-relaxed">
                 Perfect for birthdays, corporate team building, or small gatherings. Customize your experience with our expert staff in an intimate, botanical setting.
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                 <button className="bg-nursery-ochre text-nursery-midnight px-12 py-5 rounded-full font-bold text-lg hover:bg-nursery-ivory hover:scale-105 transition-all shadow-2xl">
                    Inquire About Private Events
                 </button>
                 <Link href="/about" className="text-nursery-ivory/60 hover:text-nursery-ivory font-medium border-b border-nursery-ivory/20 pb-1 transition-colors">
                    Explore Our Space
                 </Link>
              </div>
           </div>

           {/* Artistic Corner Accents */}
           <div className="absolute top-0 right-0 p-12 opacity-20 pointer-events-none hidden md:block">
              <div className="w-24 h-24 border-t-2 border-r-2 border-nursery-ochre rounded-tr-3xl" />
           </div>
           <div className="absolute bottom-0 left-0 p-12 opacity-20 pointer-events-none hidden md:block">
              <div className="w-24 h-24 border-b-2 border-l-2 border-nursery-ochre rounded-bl-3xl" />
           </div>
        </section>
      </main>
    </div>
  );
}
