'use client';

import React from 'react';
import Image from 'next/image';
import { Leaf, Wind, Compass, PenTool, Trees, Droplets } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function LandscapingPage() {
  const processSteps = [
    { title: "Garden Planning Session", icon: Compass, desc: "We walk your property with you to understand your space, your goals, and what will thrive in your conditions." },
    { title: "Custom Landscape Plan", icon: PenTool, desc: "We create a tailored design using plants from our nursery and provide a clear estimate for the project." },
    { title: "Professional Installation", icon: Trees, desc: "Our experienced team installs your landscape with care, using proven planting methods and quality materials." },
    { title: "Designed To Last", icon: Droplets, desc: "We choose the right plants for your environment so your landscape grows strong and looks better each season." }
  ];

  return (
    <div className="min-h-screen bg-nursery-ivory selection:bg-nursery-terracotta/20">
      <Navbar />

      <main>
        {/* Quote Banner */}
        <div className="w-full bg-nursery-midnight py-5 px-6 text-center">
          <blockquote className="text-nursery-ivory/90 font-serif italic text-lg md:text-xl leading-snug">
            “The best time to plant a tree was ten years ago. The second best time is today.”
          </blockquote>
          <cite className="text-nursery-sage text-xs uppercase tracking-[0.3em] mt-2 block not-italic">— Jimbo's Design Philosophy</cite>
        </div>

        {/* Artistic Hero Section */}
        <section className="relative h-[90vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
             <Image
               src="/images/landscaping_hero.jpg"
               alt="Masterpiece Landscape"
               fill
               className="object-cover scale-105 blur-sm"
               priority
             />
             <div className="absolute inset-0 bg-nursery-midnight/60" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="animate-slide-up">
              <span className="text-nursery-ochre font-bold tracking-[0.4em] uppercase mb-6 block text-sm">Landscaping Studio</span>
              <h1 className="text-7xl md:text-8xl font-serif text-nursery-ivory mb-10 leading-tight">
                Where <br /> <span className="italic text-nursery-sage">Gardens</span> <br /> Begin
              </h1>
              <p className="text-xl text-nursery-ivory/70 leading-relaxed max-w-xl mb-12">
                From first idea to final planting, we help bring your landscape to life.
              </p>
              <div className="flex gap-8">
                 <a href={`mailto:jimbosnursery75@gmail.com?subject=${encodeURIComponent("I'm Ready to Get Started – Landscape Design Inquiry")}&body=${encodeURIComponent("Hello,\n\nI just visited your Landscaping Studio page and I'm ready to get started on my landscape project.\n\nA little about my project:\n[Describe your property, vision, or any ideas you have in mind]\n\nMy timeline:\n[When are you hoping to get started?]\n\nBest way to reach me:\n[Your phone number and preferred contact time]\n\nLooking forward to working with you.\n\n[Your Name]")}`} className="bg-nursery-terracotta text-nursery-ivory px-10 py-5 rounded-full text-lg font-bold hover:bg-nursery-ochre transition-all shadow-2xl">
                    Let's Get Started
                 </a>
              </div>
            </div>

          </div>

          {/* Artistic Texas Landscape Motif */}
          <div className="absolute inset-0 pointer-events-none">
            <svg viewBox="0 0 1200 600" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
               {/* Softened Balanced Rolling Hills */}
               <path d="M0 400C200 400 300 300 500 350C700 400 800 250 1000 350C1150 450 1200 400 1200 400V600H0V400Z" fill="currentColor" opacity="0.1" />
               
            </svg>
          </div>
        </section>

        {/* The Blueprint Process */}
        <section className="py-32 bg-white relative overflow-hidden">
           <div className="max-w-7xl mx-auto px-12 relative z-10">
              <div className="text-center mb-24">
                 <h2 className="text-5xl font-serif text-nursery-midnight mb-6">The Masterpiece Methodology</h2>
                 <div className="w-24 h-1 bg-nursery-terracotta mx-auto mb-8" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                 {processSteps.map((step, i) => (
                    <div
                      key={i}
                      className="p-10 bg-nursery-ivory/30 border border-nursery-sage/10 rounded-3xl group transition-all hover:-translate-y-2 hover:bg-white hover:shadow-xl"
                    >
                       <step.icon className="w-12 h-12 text-nursery-terracotta mb-8 group-hover:scale-110 transition-transform" />
                       <h3 className="text-2xl font-serif text-nursery-midnight mb-4">{step.title}</h3>
                       <p className="text-nursery-midnight/60 leading-relaxed text-sm">
                          {step.desc}
                       </p>
                    </div>
                 ))}
              </div>
           </div>

           {/* Large Background Text Watermark */}
           <div className="absolute -bottom-10 -left-20 opacity-[0.02] pointer-events-none text-[20rem] font-serif font-black select-none">
              ARTISTRY
           </div>
        </section>

        {/* Call to Action: The Studio */}
        <section className="py-24 px-12">
           <div className="max-w-5xl mx-auto bg-nursery-midnight rounded-[5rem] overflow-hidden relative shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2">
                 <div className="p-16 flex flex-col justify-center">
                    <h2 className="text-5xl font-serif text-nursery-ivory mb-8">Ready to bring your <span className="italic text-nursery-sage">garden to life?</span></h2>
                    <p className="text-nursery-ivory/60 mb-12 leading-relaxed">
                       Our schedule fills up fast in spring and fall, so reach out to book your landscape consultation.
                    </p>
                    <a href={`mailto:jimbosnursery75@gmail.com?subject=${encodeURIComponent("Landscape Consultation Request – Jimbo's Nursery")}&body=${encodeURIComponent("Hello,\n\nI'd like to book a landscape consultation. I came across your Landscaping Studio and I'm interested in getting started on a project.\n\nHere's a little about what I'm looking for:\n[Describe your space, goals, or any specific plants/styles you have in mind]\n\nBest time to reach me:\n[Your preferred contact time and method]\n\nLooking forward to hearing from you.\n\n[Your Name]\n[Your Phone Number]")}`} className="inline-flex items-center gap-4 text-nursery-ivory group">
                       <span className="text-xl font-medium border-b border-nursery-ivory pb-1">Let's Get Started</span>
                       <div className="w-12 h-12 rounded-full bg-nursery-terracotta flex items-center justify-center group-hover:translate-x-4 transition-transform">
                          <Wind className="w-6 h-6 text-nursery-ivory" />
                       </div>
                    </a>
                 </div>
                 <div className="relative h-64 md:h-auto overflow-hidden">
                    <Image 
                       src="/images/seasonal_placeholder.jpg" 
                       alt="Design Studio" 
                       fill 
                       className="object-cover scale-110 grayscale hover:grayscale-0 transition-all duration-1000"
                    />
                 </div>
              </div>
           </div>
        </section>
      </main>

      <footer className="py-12 text-center border-t border-nursery-sage/10 text-nursery-midnight/40 text-xs uppercase tracking-widest">
         © 2026 Jimbo's Nursery Landscaping Studio • Santa Fe, TX
      </footer>
    </div>
  );
}
