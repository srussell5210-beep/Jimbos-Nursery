import React from 'react';
import Image from 'next/image';
import { History, Leaf, Users, Sprout } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function AboutPage() {
  const milestones = [
    {
      year: "1975",
      title: "A Backyard Beginning",
      description: "Jimmy Woolsey starts Jimbo’s Nursery, trucking plants from his mother’s nursery in the Valley and selling them out of the back of his truck to local florists in the Houston Area.",
      icon: Leaf
    },
    {
      year: "1983",
      title: "Putting Down Roots",
      description: "After the market crash makes trucking unsustainable, he purchases land in Santa Fe and builds the first greenhouse—establishing Jimbo’s as a permanent nursery.",
      icon: History
    },
    {
      year: "2000",
      title: "A Passion for Bromeliads",
      description: "A growing interest in bromeliads leads to the start of a now-extensive collection, becoming a signature part of Jimbo’s.",
      icon: Sprout
    },
    {
      year: "2021",
      title: "Expanding the Vision",
      description: "In 2021, Claire, Jimmy’s daughter, joined the nursery and became part of the next generation helping carry Jimbo’s forward. Working alongside her business partner Anita, whose background in farming brought valuable growing experience, the two have helped expand the nursery’s social media presence, events, plant selection, and community-focused offerings.",
      icon: Users
    },
    {
      year: "Today",
      title: "Growing Forward",
      description: "Today, Jimbo’s continues to grow as a family-owned nursery, offering a wider selection of plants, hands-on workshops, community events, and personalized garden services for customers of all ages.",
      icon: Leaf
    }
  ];

  return (
    <div className="min-h-screen bg-nursery-ivory">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-20">
        <header className="mb-32 text-center max-w-3xl mx-auto">
          <span className="text-nursery-terracotta font-bold tracking-[0.3em] uppercase mb-4 block">Our Story</span>
          <h1 className="text-6xl font-serif text-nursery-midnight mb-8 leading-tight">About Us</h1>
          <p className="text-xl text-nursery-midnight/60 leading-relaxed">
            Since 1975, Jimbo’s Nursery has grown from a small backyard nursery into a second-generation, family-run garden center and landscaping team serving the Gulf Coast.
          </p>
        </header>

        {/* Timeline Section */}
        <section className="relative">
          {/* The Vine (Center Line) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-nursery-sage/20 -translate-x-1/2 hidden md:block" />
          
          <div className="space-y-24 relative">
            {milestones.map((item, i) => (
              <div key={i} className={`flex flex-col md:flex-row items-center gap-12 ${i % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                {/* Content Side */}
                <div className={`flex-1 text-center ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <span className="text-5xl font-serif text-nursery-terracotta mb-4 block">{item.year}</span>
                  <h3 className="text-2xl font-serif text-nursery-midnight mb-4">{item.title}</h3>
                  <p className="text-lg text-nursery-midnight/60 leading-relaxed max-w-md mx-auto md:mx-0 inline-block">
                    {item.description}
                  </p>
                </div>

                {/* Icon Marker */}
                <div className="relative z-10 w-20 h-20 rounded-full bg-nursery-midnight flex items-center justify-center text-nursery-ivory shadow-xl border-4 border-nursery-ivory group hover:scale-110 transition-transform cursor-pointer">
                   <item.icon className="w-8 h-8 group-hover:text-nursery-ochre transition-colors" />
                </div>

                {/* Empty Space for Balance */}
                <div className="flex-1 hidden md:block" />
              </div>
            ))}
          </div>
        </section>

        <section className="mt-40 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
           <div className="bg-gradient-to-br from-nursery-midnight via-[#15251c] to-[#0a140f] p-16 rounded-3xl text-nursery-ivory shadow-2xl border border-[#2a4034] relative overflow-hidden group">
              {/* Artistic Background Flourish */}
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-1000">
                 <Leaf className="w-64 h-64 -rotate-12 translate-x-1/4 -translate-y-1/4" />
              </div>

              <h2 className="text-4xl font-serif mb-12 leading-tight relative z-10">
                 <span className="bg-clip-text text-transparent bg-gradient-to-r from-nursery-ivory to-nursery-sage">Our Philosophy</span>
                 <div className="w-12 h-px bg-nursery-terracotta mt-6" />
              </h2>
              
              <p className="relative z-10 text-xl text-nursery-ivory/80 leading-relaxed">
                 Jimbo’s Nursery is a family-owned garden center in Santa Fe, TX, serving the Gulf Coast since
                 1975. We are on 2 acres of land with 4 greenhouses and offer a wide range of quality plants,
                 from native and landscape staples to bromeliads, tropicals, cactus, and succulents—including
                 one of the largest selections of bromeliads in Texas. From workshops and community events to
                 hands-on landscaping, we’re here to help you grow and create something that lasts.
              </p>
           </div>
           
           <div className="relative aspect-square md:aspect-auto md:h-full rounded-3xl overflow-hidden shadow-2xl border border-[#2a4034]">
              <Image src="/images/about_philosophy.jpg" alt="Botanical Artistry and Philosophy" fill className="object-cover hover:scale-105 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-nursery-midnight/10 hover:bg-transparent transition-colors duration-700" />
           </div>
        </section>
      </main>
    </div>
  );
}
