import React from 'react';
import type { Metadata } from 'next';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Contact Us | Jimbo’s Nursery',
  description:
    'Visit Jimbo’s Nursery at 15019 8th Street West, Santa Fe, TX 77517. Call 409-925-6933 or email jimbosnursery75@gmail.com.',
};

const PHONE_DISPLAY = '409-925-6933';
const PHONE_HREF = '+14099256933';
const EMAIL = 'jimbosnursery75@gmail.com';
const ADDRESS_LINE = '15019 8th Street West';
const ADDRESS_CITY = 'Santa Fe, TX 77517';
const DIRECTIONS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${ADDRESS_LINE}, ${ADDRESS_CITY}`,
)}`;

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-nursery-ivory">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-20">
        <header className="mb-20 max-w-3xl">
          <span className="text-nursery-terracotta font-bold tracking-[0.3em] uppercase mb-4 block text-xs">
            Get in Touch
          </span>
          <h1 className="text-6xl font-serif text-nursery-midnight mb-8 leading-tight">
            Contact <span className="italic text-nursery-terracotta">Us</span>
          </h1>
          <p className="text-xl text-nursery-midnight/60 leading-relaxed">
            Questions about a plant, a landscaping project, or a workshop? Call the yard, send an
            email, or stop by — we’re happy to talk plants.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <a
            href={`tel:${PHONE_HREF}`}
            className="group block p-10 bg-white border border-nursery-sage/10 rounded-2xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
          >
            <Phone className="w-10 h-10 text-nursery-terracotta mb-6 group-hover:scale-110 transition-transform" />
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-nursery-midnight/50 mb-3">
              Call the Yard
            </h2>
            <p className="text-2xl font-serif text-nursery-midnight group-hover:text-nursery-terracotta transition-colors">
              {PHONE_DISPLAY}
            </p>
            <p className="text-sm text-nursery-midnight/50 mt-3">Tap to call from a phone</p>
          </a>

          <a
            href={`mailto:${EMAIL}`}
            className="group block p-10 bg-white border border-nursery-sage/10 rounded-2xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
          >
            <Mail className="w-10 h-10 text-nursery-terracotta mb-6 group-hover:scale-110 transition-transform" />
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-nursery-midnight/50 mb-3">
              Email Us
            </h2>
            {/* Shown in full rather than hidden behind a label: if the visitor has no
                mail app, the address is still readable and can be copied. */}
            <p className="text-lg font-serif text-nursery-midnight break-all group-hover:text-nursery-terracotta transition-colors">
              {EMAIL}
            </p>
            <p className="text-sm text-nursery-midnight/50 mt-3">Select the address to copy it</p>
          </a>

          <a
            href={DIRECTIONS}
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-10 bg-white border border-nursery-sage/10 rounded-2xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
          >
            <MapPin className="w-10 h-10 text-nursery-terracotta mb-6 group-hover:scale-110 transition-transform" />
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-nursery-midnight/50 mb-3">
              Visit the Yard
            </h2>
            <address className="not-italic text-lg font-serif text-nursery-midnight leading-snug group-hover:text-nursery-terracotta transition-colors">
              {ADDRESS_LINE}
              <br />
              {ADDRESS_CITY}
            </address>
            <p className="text-sm text-nursery-midnight/50 mt-3">Open directions in Maps</p>
          </a>
        </div>

        <section
          aria-labelledby="hours-heading"
          className="bg-gradient-to-br from-nursery-midnight via-[#15251c] to-[#0a140f] p-12 md:p-16 rounded-3xl text-nursery-ivory shadow-2xl border border-[#2a4034]"
        >
          <div className="flex items-center gap-4 mb-10">
            <Clock className="w-6 h-6 text-nursery-sage" />
            <h2
              id="hours-heading"
              className="text-sm font-bold uppercase tracking-[0.3em] text-nursery-sage"
            >
              Hours
            </h2>
          </div>

          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-5 max-w-2xl text-xl">
            <div className="flex justify-between border-b border-nursery-ivory/10 pb-4">
              <dt className="text-nursery-ivory/70">Monday – Saturday</dt>
              <dd className="font-serif">8am – 4pm</dd>
            </div>
            <div className="flex justify-between border-b border-nursery-ivory/10 pb-4">
              <dt className="text-nursery-ivory/70">Sunday</dt>
              <dd className="font-serif">8am – 2pm</dd>
            </div>
          </dl>

          <div className="mt-12 pt-8 border-t border-nursery-ivory/10 flex flex-wrap gap-8 text-xs font-bold tracking-[0.3em] uppercase text-nursery-sage">
            <a
              href="https://www.facebook.com/Jimbosnursery1975"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors py-2"
            >
              Facebook
            </a>
            <a
              href="https://www.instagram.com/jimbosnursery"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors py-2"
            >
              Instagram
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
