import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Leaf, Info } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { readEvents } from '@/lib/events-store';
import { readPosts, sortPosts } from '@/lib/posts-store';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let events = [];
  try {
    events = (await readEvents()).slice(0, 4); // Only show top 4
  } catch (e) {
    console.error("Could not load data", e);
  }

  let posts: Awaited<ReturnType<typeof readPosts>> = [];
  try {
    posts = sortPosts(await readPosts()).filter(p => p.published !== false).slice(0, 3);
  } catch (e) {
    console.error("Could not load posts", e);
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-nursery-midnight/60 via-nursery-midnight/40 to-nursery-midnight/80 z-10" />
          <Image 
            src="/images/hero_placeholder.jpg" 
            alt="Lush Nursery Atmosphere" 
            fill 
            className="object-cover scale-105 animate-subtle-zoom blur-[3px]"
            priority
            unoptimized
          />
        </div>
        
        <div className="relative z-20 text-center px-6 max-w-4xl drop-shadow-xl">
          <span className="text-nursery-ochre font-bold tracking-[0.2em] uppercase mb-4 block animate-fade-in drop-shadow-md">Established 1975</span>
          <h1 className="text-6xl md:text-8xl text-nursery-ivory font-serif mb-8 leading-[1.1] animate-slide-up text-shadow-sm">
            Jimbo’s <span className="italic">Nursery</span>
          </h1>
          <p className="text-xl text-white mb-10 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md">
            Growing Gulf Coast gardens since 1975
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/whats-new" className="bg-nursery-terracotta text-nursery-ivory px-10 py-4 rounded-full text-lg font-medium hover:scale-105 transition-transform shadow-lg">
              Explore New Plants
            </Link>
            <Link href="/landscaping" className="bg-nursery-ivory/10 backdrop-blur-md border border-nursery-ivory/30 text-nursery-ivory px-10 py-4 rounded-full text-lg font-medium hover:bg-nursery-ivory hover:text-nursery-midnight transition-all">
              Landscaping Services
            </Link>
          </div>
        </div>

        {/* Floating Stats */}
        <div className="absolute bottom-12 left-0 right-0 z-20 hidden lg:block">
           <div className="max-w-7xl mx-auto px-6 flex justify-between items-end">
              <div className="text-nursery-ivory/60 text-sm font-medium tracking-widest flex items-center gap-4">
                 <span>SCROLL TO DISCOVER</span>
                 <div className="w-12 h-[1px] bg-nursery-ivory/30" />
              </div>
              <div className="flex gap-20">
                 <div className="text-nursery-ivory">
                    <span className="block text-4xl font-serif">250+</span>
                    <span className="text-xs uppercase tracking-tighter opacity-70">Unique Species</span>
                 </div>
                 <div className="text-nursery-ivory">
                    <span className="block text-4xl font-serif">51yr</span>
                    <span className="text-xs uppercase tracking-tighter opacity-70">Expertise</span>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Services Highlight */}
      <section id="services" className="py-24 bg-nursery-ivory">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-xl">
              <h2 className="text-5xl text-nursery-midnight mb-6 leading-tight">Grow With <br /> Jimbo’s</h2>
              <p className="text-lg text-nursery-midnight/70">Discover unique plants, personalized landscaping, and hands-on workshops designed to help your garden grow!</p>
            </div>
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-full border border-nursery-sage/30 flex items-center justify-center text-nursery-sage">01</div>
              <div className="w-16 h-16 rounded-full border border-nursery-sage/30 flex items-center justify-center text-nursery-sage opacity-40">02</div>
              <div className="w-16 h-16 rounded-full border border-nursery-sage/30 flex items-center justify-center text-nursery-sage opacity-40">03</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Garden Center', desc: 'Hand-picked plants for Gulf Coast gardens, from natives and tropicals to cactus, succulents, and seasonal favorites.', icon: Leaf, link: "/about#greenhouses" },
              { title: 'Landscaping', desc: 'Full-service design and installation to help bring your landscape vision to life.', icon: Info, link: "/landscaping" },
              { title: 'Garden Workshops', desc: 'Fun, hands-on workshops for kids and adults to get creative, learn about plants, and get their hands dirty.', icon: Calendar, link: "/events" },
            ].map((service, i) => (
              <Link key={i} href={service.link} className="group block p-10 bg-white border border-nursery-sage/10 rounded-2xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <service.icon className="w-12 h-12 text-nursery-terracotta mb-8 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-serif text-nursery-midnight mb-4">{service.title}</h3>
                <p className="text-nursery-midnight/60 leading-relaxed mb-8">{service.desc}</p>
                <span className="inline-flex items-center gap-2 text-nursery-midnight font-bold border-b-2 border-nursery-terracotta pb-1 group-hover:gap-4 transition-all">
                  Learn More
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Events Preview */}
      <section id="events" className="py-24 bg-nursery-ivory border-t border-nursery-sage/10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-5xl text-nursery-midnight mb-16">Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.map((event: any) => (
              <Link key={event.id} href={`/events/${event.id}`} className="bg-white p-8 rounded-xl border border-nursery-sage/20 hover:border-nursery-terracotta transition-colors text-left relative overflow-hidden group block">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                   <Calendar className="w-10 h-10 text-nursery-terracotta" />
                </div>
                <span className="text-nursery-terracotta font-bold text-lg block mb-2 uppercase">{event.date.split(',')[0]}</span>
                <h4 className="text-xl font-serif text-nursery-midnight mb-4">{event.title}</h4>
                <span className="text-xs uppercase tracking-widest text-nursery-sage">{event.type}</span>
              </Link>
            ))}
          </div>
          <Link href="/events" className="mt-16 inline-block bg-gradient-to-r from-nursery-midnight to-[#15251c] shadow-lg text-nursery-ivory px-12 py-4 rounded-full font-medium hover:from-nursery-terracotta hover:to-[#a84d26] transition-all">
             Full Event Calendar
          </Link>
        </div>
      </section>

      {/* Section Divider */}
      <div className="flex items-center gap-8 max-w-7xl mx-auto px-6 py-2">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-nursery-sage/30 to-transparent" />
        <Image 
          src="/images/jimbo_logo.png" 
          alt="divider" 
          width={62} 
          height={48} 
          className="opacity-20 grayscale brightness-0" 
          unoptimized 
        />
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-nursery-sage/30 to-transparent" />
      </div>


      {/* The Living Legacy: Monarchs & About Us */}
      <section className="py-32 bg-nursery-midnight text-nursery-ivory overflow-hidden relative">
         {/* Artistic Texas Landscape Motif */}
         <div className="absolute inset-0 pointer-events-none">
            <svg viewBox="0 0 1200 600" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
               {/* Softened Balanced Rolling Hills */}
               <path d="M0 400C200 400 300 300 500 350C700 400 800 250 1000 350C1150 450 1200 400 1200 400V600H0V400Z" fill="currentColor" opacity="0.1" />
               
               <defs>
                  <linearGradient id="sunGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                     <stop offset="0%" stopColor="#FB923C" /> {/* Orange */}
                     <stop offset="100%" stopColor="#FDE68A" /> {/* Yellow */}
                  </linearGradient>
                  <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                     <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.3" />
                     <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
                  </radialGradient>
               </defs>

               {/* Setting Sun with Glow Aura */}
               <g opacity="0.7">
                  {/* Sun Glow (Halo) */}
                  <circle cx="580" cy="160" r="120" fill="url(#sunGlow)" />
                  {/* Core Sun */}
                  <circle cx="580" cy="160" r="51" fill="url(#sunGradient)" />
               </g>

               {/* Wildflowers */}
               <g fill="#4B69FF" opacity="0.4">
                  <rect x="200" y="450" width="4" height="12" rx="2" />
                  <rect x="600" y="420" width="4" height="12" rx="2" />
               </g>
               <g fill="#FF4B4B" opacity="0.4">
                  <rect x="250" y="465" width="4" height="8" rx="1" />
                  <rect x="650" y="435" width="4" height="8" rx="1" />
               </g>
            </svg>
         </div>
         
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative z-10">
            <div className="relative group">
               <div className="aspect-[4/5] rounded-[100px] overflow-hidden border border-nursery-ivory/20 relative shadow-2xl isolate" style={{ maskImage: 'radial-gradient(white, black)', WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}>
                  <Image 
                     src="/images/monarch_sanctuary.png" 
                     alt="Monarch Sanctuary" 
                     fill 
                     className="object-cover group-hover:scale-110 transition-transform duration-1000 rounded-[100px]" 
                     unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-nursery-midnight via-transparent to-transparent" />
                  <div className="absolute bottom-12 left-12 right-12">
                     <span className="text-nursery-sage font-bold tracking-[0.3em] uppercase text-xs mb-4 block">Conservation Spotlight</span>
                     <h3 className="text-4xl font-serif mb-6 leading-tight">The Monarch Movement</h3>
                     <p className="text-nursery-ivory/70 leading-relaxed mb-8">
                        Our beloved monarchs are in need of food & shelter for their great migration. Learn how you can turn your yard into a certified Monarch Habitat with our native milkweed and nectar selections.
                     </p>
                     <Link href="/whats-new" className="inline-flex items-center gap-3 text-nursery-sage font-medium group/link">
                        Create Your Sanctuary <span className="group-hover/link:translate-x-2 transition-transform">→</span>
                     </Link>
                  </div>
               </div>
            </div>

            <div className="space-y-8">
               <span className="text-nursery-sage font-bold tracking-[0.3em] uppercase text-xs block">About Us</span>
               <h2 className="text-5xl font-serif leading-tight">Family-owned, <span className="italic text-nursery-sage">Gulf Coast grown</span></h2>

               <p className="text-lg text-nursery-ivory/70 leading-relaxed">
                  Jimbo’s Nursery is a second-generation, family-owned garden center that’s served Santa Fe and
                  Galveston County for more than 50 years. Across five greenhouses, we grow everything from native
                  perennials to one of the largest bromeliad collections in Texas, with a knowledgeable team on
                  hand to help you find what will actually thrive in a Gulf Coast garden.
               </p>

               <Link href="/about" className="inline-block bg-nursery-terracotta text-nursery-ivory px-10 py-4 rounded-full font-medium hover:scale-105 transition-transform shadow-lg">
                  Learn More
               </Link>
            </div>
         </div>
      </section>

      {/* Field Notes (Blog/Learn Hub) */}
      <section id="field-notes" className="py-32 bg-nursery-ivory">
         <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-end mb-16">
               <div>
                  <span className="text-nursery-terracotta font-bold tracking-[0.4em] uppercase text-xs mb-4 block">Learn about New Plants</span>
                  <h2 className="text-5xl font-serif text-nursery-midnight">What’s New at the Nursery</h2>
               </div>
               <Link href="/about" className="text-nursery-midnight/60 font-medium border-b border-nursery-midnight/20 pb-1 hover:text-nursery-terracotta hover:border-nursery-terracotta transition-all">
                  See More
               </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               {posts.map((post) => (
                  <Link key={post.id} href={`/field-notes/${post.id}`} className="group block">
                     <div className="aspect-[16/10] rounded-3xl overflow-hidden mb-8 relative border border-nursery-sage/10">
                        <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" unoptimized />
                     </div>
                     <span className="text-xs font-bold text-nursery-terracotta/60 uppercase tracking-widest block mb-2">{post.author} • {post.date}</span>
                     <h3 className="text-2xl font-serif text-nursery-midnight mb-4 group-hover:text-nursery-terracotta transition-colors">{post.title}</h3>
                     <p className="text-nursery-midnight/50 text-sm leading-relaxed mb-6">{post.excerpt}</p>
                     <span className="font-bold text-sm border-b-2 border-nursery-midnight/10 pb-1 group-hover:border-nursery-terracotta transition-colors">Read Note</span>
                  </Link>
               ))}
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-[#0a1a12] via-[#1b2b23] to-[#0d1410] pt-32 pb-16 text-nursery-ivory relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 opacity-[0.1] pointer-events-none">
           <svg viewBox="0 0 1200 200" className="w-full h-[300px]" preserveAspectRatio="none">
              <defs>
                 <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FDE68A" /> {/* Yellow */}
                    <stop offset="100%" stopColor="#FB923C" /> {/* Orange */}
                 </linearGradient>
              </defs>
              <g transform="translate(150, 0)" stroke="url(#buildingGradient)">
                 {/* Foundation */}
                 <path d="M-150 180H1200V182H-150V180Z" fill="url(#buildingGradient)" />
                 
                 {/* Greenhouse 1 (Small) */}
                 <path d="M100 180V100L200 60L300 100V180" fill="none" strokeWidth="2" />
                 <path d="M120 180V108M140 180V116M160 180V124M180 180V132M220 180V132M240 180V124M260 180V116M280 180V108" fill="none" strokeWidth="0.3" opacity="0.4" />
                 <path d="M100 140H300M100 160H300" fill="none" strokeWidth="0.3" opacity="0.4" />
                 <path d="M100 100L200 180M300 100L200 180" fill="none" strokeWidth="0.2" opacity="0.2" />
                 
                 {/* Main Greenhouse (Maximum Detail) */}
                 <path d="M400 180V80L600 30L800 80V180" fill="none" strokeWidth="3" />
                 <path d="M425 180V90M450 180V100M475 180V110M500 180V120M525 180V125M550 180V130M575 180V130M625 180V130M650 180V130M675 180V125M700 180V120M725 180V110M750 180V100M775 180V90" fill="none" strokeWidth="0.2" opacity="0.5" />
                 <path d="M400 100H800M400 120H800M400 140H800M400 160H800" fill="none" strokeWidth="0.3" opacity="0.4" />
                 <rect x="420" y="150" width="100" height="2" fill="url(#buildingGradient)" opacity="0.3" stroke="none" />
                 <rect x="680" y="150" width="100" height="2" fill="url(#buildingGradient)" opacity="0.3" stroke="none" />
                 
                 <circle cx="480" cy="110" r="3" fill="url(#buildingGradient)" opacity="0.4" stroke="none" />
                 <path d="M480 100V107" strokeWidth="0.5" opacity="0.4" />
                 <circle cx="720" cy="110" r="3" fill="url(#buildingGradient)" opacity="0.4" stroke="none" />
                 <path d="M720 100V107" strokeWidth="0.5" opacity="0.4" />
                 
                 <path d="M400 80L600 80L800 80" fill="none" strokeWidth="0.5" opacity="0.3" />
                 <path d="M500 55L500 80M700 55L700 80" fill="none" strokeWidth="0.5" opacity="0.3" />
                 <circle cx="600" cy="55" r="10" fill="none" strokeWidth="1" opacity="0.4" />
                 
                 {/* Greenhouse 3 (Small) */}
                 <path d="M900 180V110L1000 70L1100 110V180" fill="none" strokeWidth="2" />
                 <path d="M925 180V120M950 180V130M975 180V135M1025 180V135M1050 180V130M1075 180V120" fill="none" strokeWidth="0.3" opacity="0.4" />
                 <path d="M900 140H1100M900 160H1100" fill="none" strokeWidth="0.3" opacity="0.4" />

                 {/* People Inside (Subtle Silhouettes) */}
                 <g fill="url(#buildingGradient)" opacity="0.4" stroke="none">
                    <circle cx="200" cy="140" r="4" />
                    <path d="M190 180Q200 145 210 180" />
                    <circle cx="550" cy="140" r="4" />
                    <path d="M540 180Q550 145 560 180" />
                    <circle cx="650" cy="145" r="4" />
                    <path d="M640 180Q650 150 660 180" />
                 </g>

                 {/* Detailed Botanical Base */}
                 <g fill="url(#buildingGradient)" opacity="0.8" stroke="none">
                    <path d="M80 180Q85 155 90 180Q95 160 100 180Q105 155 110 180" />
                    <path d="M320 180Q330 140 340 180Q350 150 360 180" />
                    <path d="M820 180Q830 130 840 180Q850 145 860 180" />
                    <path d="M1120 180Q1130 150 1140 180Q1150 140 1160 180" />
                 </g>
              </g>
           </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 mb-24 items-start">
            <div className="lg:col-span-5 space-y-10">
               <Image src="/images/jimbo_logo.png" alt="Jimbo's Nursery" width={140} height={140} className="brightness-0 invert opacity-90" unoptimized />
               <p className="text-2xl font-serif text-nursery-ivory/80 leading-tight tracking-tight max-w-md">
                  Growing great plants for <span className="italic text-nursery-sage">Gulf Coast Gardens</span> since 1975.
               </p>
               <div className="flex gap-10 text-xs font-bold tracking-[0.3em] uppercase text-nursery-sage">
                  <a href="https://www.facebook.com/Jimbosnursery1975" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Facebook</a>
                  <a href="https://www.instagram.com/jimbosnursery" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
                  <a href={`mailto:jimbosnursery75@gmail.com?subject=${encodeURIComponent("General Information Request – Jimbo's Nursery")}`} className="hover:text-white transition-colors">Contact Us</a>
               </div>
            </div>

            <div className="lg:col-span-3 space-y-8">
               <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-nursery-terracotta">Visit the Yard</h4>
               <div className="space-y-4 text-xl text-nursery-ivory/60 leading-snug">
                  <p>15019 8th Street West<br />Santa Fe, TX 77517</p>
                  <p className="text-nursery-sage font-bold">409-925-6933</p>
               </div>
               <div className="pt-2">
                  <h5 className="text-[10px] font-bold uppercase tracking-[0.4em] text-nursery-ivory/40 mb-2">Hours</h5>
                  <ul className="text-base space-y-1 opacity-60">
                     <li className="flex justify-between"><span>Monday-Saturday</span> <span>8am - 4pm</span></li>
                     <li className="flex justify-between font-bold text-nursery-sage"><span>Sunday</span> <span>8am - 2pm</span></li>
                  </ul>
               </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
               <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-nursery-terracotta">Exploration</h4>
               <ul className="grid grid-cols-1 gap-y-3 text-xl font-serif italic text-nursery-ivory/70">
                  <li><Link href="/about" className="hover:text-nursery-sage transition-all hover:pl-2">Our History</Link></li>
                  <li><Link href="/landscaping" className="hover:text-nursery-sage transition-all hover:pl-2">Landscaping</Link></li>
                  <li><Link href="/wholesale" className="hover:text-nursery-sage transition-all hover:pl-2">Wholesale</Link></li>
                  <li><Link href="/rentals" className="hover:text-nursery-sage transition-all hover:pl-2">Rentals</Link></li>
                  <li><Link href="/events" className="hover:text-nursery-sage transition-all hover:pl-2">Events</Link></li>
                  <li><Link href="/shop" className="hover:text-nursery-sage transition-all hover:pl-2">Online Store</Link></li>
                  <li><Link href="/gift-cards" className="hover:text-nursery-sage transition-all hover:pl-2">Gift Cards</Link></li>
               </ul>
            </div>

            <div className="lg:col-span-2 space-y-4">
               <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-nursery-terracotta">Contact Us</h4>
               <div className="space-y-4 text-nursery-ivory/60 leading-snug">
                  <p className="text-base">Questions, orders, or just want to talk plants?</p>
                  <a
                    href="mailto:jimbosnursery75@gmail.com"
                    className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-nursery-terracotta text-nursery-ivory text-sm font-semibold rounded hover:bg-nursery-terracotta/80 transition-colors"
                  >
                    jimbosnursery75@gmail.com
                  </a>
               </div>
            </div>
          </div>
          
          <div className="pt-3 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-nursery-ivory/20 mb-8">
             <p>© 2026 Jimbo's Nursery & Landscaping. Sanctuary by Design.</p>
             <div className="flex gap-8">
                <span>Privacy</span>
                <span>Terms</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
