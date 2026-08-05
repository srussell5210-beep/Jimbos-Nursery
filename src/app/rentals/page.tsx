import React from 'react';
import Image from 'next/image';
import { Leaf, Camera, PartyPopper, Briefcase } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function RentalsPage() {
  const categories = [
    { title: "Weddings & Celebrations", icon: PartyPopper, desc: "Add greenery to make your event feel fresh and inviting." },
    { title: "Photo Shoots", icon: Camera, desc: "Create a natural backdrop with plants that fit your style and space." },
    { title: "Corporate Events", icon: Briefcase, desc: "Bring life to offices, lobbies, conferences, and small business gatherings." },
    { title: "Residential Staging", icon: Leaf, desc: "Use plants to make homes feel warm, polished, and welcoming." }
  ];

  return (
    <div className="min-h-screen bg-nursery-ivory">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-3xl mb-24">
          <span className="text-nursery-terracotta font-bold tracking-[0.3em] uppercase mb-4 block">Botanical Staging</span>
          <h1 className="text-6xl font-serif text-nursery-midnight mb-8 leading-tight">Elevate Your Space with <br /> <span className="italic text-nursery-sage">Living Art</span></h1>
          <p className="text-xl text-nursery-midnight/60 leading-relaxed">
            Our plant rental service provides curated greenery for your event or residential
            staging across the South Houston area.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
           {categories.map((cat, i) => (
             <div key={i} className="bg-white p-10 rounded-2xl border border-nursery-sage/10 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-16 h-16 rounded-full bg-nursery-midnight flex items-center justify-center text-nursery-ivory mb-8 group-hover:bg-nursery-terracotta transition-colors">
                   <cat.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-serif text-nursery-midnight mb-4">{cat.title}</h3>
                <p className="text-nursery-midnight/60 leading-relaxed">
                   {cat.desc}
                </p>
             </div>
           ))}
        </div>

        <section className="bg-gradient-to-br from-nursery-midnight via-[#15251c] to-[#0a140f] rounded-[3rem] overflow-hidden text-nursery-ivory shadow-2xl border border-[#2a4034]">
           <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
              <div className="p-16 lg:p-24">
                 <h2 className="text-5xl font-serif mb-10 leading-tight">Plant Styling Consultation</h2>
                 <p className="text-xl text-nursery-ivory/70 mb-12 leading-relaxed">
                    We offer hands-on plant rental consultations to help you choose the right
                    plants for your space, event, lighting, and overall look. Our team can help source plants when
                    needed, provide basic setup guidance, and create a rental plan that feels beautiful, practical,
                    and manageable.
                 </p>
                 <ul className="space-y-6 mb-16">
                    <li className="flex gap-4 items-center">
                       <div className="w-2 h-2 rounded-full bg-nursery-ochre" />
                       <span className="text-lg">Plant Rental Consultation</span>
                    </li>
                    <li className="flex gap-4 items-center">
                       <div className="w-2 h-2 rounded-full bg-nursery-ochre" />
                       <span className="text-lg">Plant Sourcing</span>
                    </li>
                    <li className="flex gap-4 items-center">
                       <div className="w-2 h-2 rounded-full bg-nursery-ochre" />
                       <span className="text-lg">Setup Guidance</span>
                    </li>
                    <li className="flex gap-4 items-center">
                       <div className="w-2 h-2 rounded-full bg-nursery-ochre" />
                       <span className="text-lg">Flexible Rental Options</span>
                    </li>
                    <li className="flex gap-4 items-center">
                       <div className="w-2 h-2 rounded-full bg-nursery-ochre" />
                       <span className="text-lg">Pickup or Delivery Options When Available</span>
                    </li>
                 </ul>
                 <a
                    href={`mailto:jimbosnursery75@gmail.com?subject=${encodeURIComponent("Botanical Rental Quote Request – Jimbo's Nursery")}&body=${encodeURIComponent("Hello,\n\nI'm interested in renting plants or botanical arrangements from Jimbo's Nursery and would love to get a quote for my upcoming project.\n\nHere are a few details about my needs:\n\n- Event or Space Type: [e.g. wedding, corporate office, private residence, photo shoot]\n- Approximate Dates: [start date – end date]\n- Location / Venue: [city, venue name, or address]\n- Estimated Scale: [number of rooms, square footage, or number of arrangements]\n- Style Preference: [e.g. tropical, minimalist, lush greenery, flowering accents]\n- Additional Services Needed: [installation, on-site maintenance, post-event removal]\n\nI'd appreciate any information on availability, pricing, and your consultation process.\n\nThank you,\n[Your Name]\n[Your Phone Number]")}`}
                    className="inline-block bg-gradient-to-r from-nursery-terracotta to-[#a84d26] text-nursery-ivory px-12 py-5 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-2xl"
                 >
                    Request a Rental Quote
                 </a>
              </div>
              <div className="h-full min-h-[500px] relative">
                 <Image src="/images/rental_staging.jpg" alt="Professional Botanical Staging" fill className="object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-r from-nursery-midnight/80 to-transparent lg:hidden" />
              </div>
           </div>
        </section>
      </main>
    </div>
  );
}
