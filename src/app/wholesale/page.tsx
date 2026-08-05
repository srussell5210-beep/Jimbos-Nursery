'use client';

import React from 'react';
import Image from 'next/image';
import { Briefcase, CheckCircle, FileText, Percent, Truck } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function WholesalePage() {
  const benefits = [
    { title: "Wholesale Pricing", icon: Percent, desc: "Discounts exclusively for landscape architects, contractors, and retail partners." },
    { title: "Tax-Free Purchases", icon: CheckCircle, desc: "Qualify for tax-exempt status by providing your valid Texas Sales and Use Tax Resale Certificate." },
    { title: "Curated Sourcing", icon: Briefcase, desc: "Direct access to our 3 greenhouses and 2-acre stock of rare Bromeliads, Cacti, and native perennials." },
    { title: "Priority Fulfillment", icon: Truck, desc: "Express loading and local job-site delivery options for project-critical timelines." }
  ];

  return (
    <div className="min-h-screen bg-nursery-ivory">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-20">
        <header className="mb-24 max-w-4xl">
           <span className="text-nursery-terracotta font-bold tracking-[0.4em] uppercase mb-4 block">Professional Partnerships</span>
           <h1 className="text-6xl font-serif text-nursery-midnight mb-8 leading-tight">Join Our Wholesale Program</h1>
           <p className="text-xl text-nursery-midnight/60 leading-relaxed max-w-2xl">
              Since 1975, Jimbo’s has helped local landscapers and garden professionals find
              unique, resilient, and high-quality plants for projects across Santa Fe and the greater
              Houston-Galveston area.
           </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
           {benefits.map((benefit, i) => (
             <div
               key={i}
               className="bg-white p-10 rounded-[2.5rem] border border-nursery-sage/10 shadow-sm transition-all hover:-translate-y-2 hover:shadow-2xl"
             >
                <div className="w-16 h-16 rounded-2xl bg-nursery-midnight flex items-center justify-center text-nursery-ivory mb-8">
                   <benefit.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-serif text-nursery-midnight mb-4">{benefit.title}</h3>
                <p className="text-nursery-midnight/50 leading-relaxed text-sm">
                   {benefit.desc}
                </p>
             </div>
           ))}
        </section>

        {/* Qualification Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center bg-nursery-midnight rounded-[4rem] p-12 lg:p-24 text-nursery-ivory overflow-hidden relative shadow-2xl">
           <div className="absolute top-0 right-0 w-64 h-64 bg-nursery-terracotta/20 blur-[100px] rounded-full" />
           
           <div>
              <h2 className="text-4xl font-serif mb-8 leading-tight">Become a <span className="italic text-nursery-sage">Registered Professional</span></h2>
              <p className="text-nursery-ivory/60 mb-12 leading-relaxed">
                 To qualify for wholesale pricing and tax-exempt status, we require a completed application and a valid resale certificate.
              </p>
              
              <div className="space-y-8">
                 <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 rounded-full border border-nursery-ivory/20 flex items-center justify-center flex-shrink-0">
                       <FileText className="w-5 h-5 text-nursery-sage" />
                    </div>
                    <div>
                       <h4 className="font-bold mb-1">Resale Certificate</h4>
                       <p className="text-sm text-nursery-ivory/40">Provide your Texas Sales and Use Tax Resale Certificate.</p>
                    </div>
                 </div>
              </div>

              <div className="mt-16 flex gap-6">
                 <a href="mailto:wholesale@jimbosnursery.com" className="bg-nursery-terracotta text-nursery-ivory px-10 py-5 rounded-full font-bold hover:bg-nursery-ochre transition-all shadow-xl">
                    Request Application
                 </a>
                 <a href="tel:4099256933" className="border border-nursery-ivory/20 text-nursery-ivory px-10 py-5 rounded-full font-bold hover:bg-white/5 transition-all">
                    Call the Yard
                 </a>
              </div>
           </div>

           <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
              <Image 
                 src="/images/event_propagation.jpg" 
                 alt="Wholesale Stock" 
                 fill 
                 className="object-cover brightness-75"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="p-12 text-center backdrop-blur-md bg-nursery-midnight/30 rounded-[3rem] border border-white/20">
                    <span className="text-7xl font-serif text-nursery-ivory mb-2 block">2+</span>
                    <span className="uppercase tracking-[0.2em] text-xs font-bold text-nursery-sage">Acres of specimen stock</span>
                 </div>
              </div>
           </div>
        </section>
      </main>

      <footer className="py-20 text-center text-nursery-midnight/30 text-xs uppercase tracking-[0.3em]">
         Jimbo's Nursery • Trade Division • Santa Fe, Texas
      </footer>
    </div>
  );
}
