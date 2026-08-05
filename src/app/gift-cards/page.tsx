import React from 'react';
import Image from 'next/image';
import { Truck, CheckCircle, HelpCircle } from 'lucide-react';
import GiftCardForm from '../../components/GiftCardForm';
import Navbar from '@/components/Navbar';

export default function GiftCardsPage() {
  const faqs = [
    {
      q: 'How do I redeem my gift card?',
      a: 'Gift cards can be redeemed in-person at our Santa Fe nursery using our Clover point-of-sale system. Just present the card code at checkout.',
    },
    {
      q: 'Do gift cards expire?',
      a: "No, Jimbo's Nursery gift cards never expire and maintain their full value until used.",
    },
    {
      q: 'Can I use a gift card for landscaping services?',
      a: 'Yes, gift cards can be applied toward design consultations and installation fees for our landscaping services.',
    },
  ];

  return (
    <div className="min-h-screen bg-nursery-ivory">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">

          {/* Gift Card Purchase */}
          <section>
            <span className="text-nursery-terracotta font-bold tracking-[0.3em] uppercase mb-4 block">
              Gifts of Growth
            </span>
            <h1 className="text-6xl font-serif text-nursery-midnight mb-10 leading-tight">
              Jimbo's Nursery <br /> Gift Cards
            </h1>
            <p className="text-xl text-nursery-midnight/60 mb-12">
              Perfect for new homeowners, botanical enthusiasts, or professional partners.
              Delivered instantly via email.
            </p>

            <div className="bg-white p-12 rounded-3xl border border-nursery-sage/20 shadow-xl mb-12">
              <div className="h-64 relative rounded-2xl overflow-hidden mb-10 border border-nursery-sage/20 shadow-md">
                <Image
                  src="/images/gift_cards_hero.jpg"
                  alt="Jimbo's Nursery Premium Gift Card"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>

              <GiftCardForm />
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="flex items-center gap-4">
                <CheckCircle className="text-nursery-sage w-6 h-6" />
                <span className="font-medium">Instant Email Delivery</span>
              </div>
              <div className="flex items-center gap-4">
                <Truck className="text-nursery-sage w-6 h-6" />
                <span className="font-medium">Redeemable In-Store</span>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-nursery-midnight p-16 rounded-[3rem] text-nursery-ivory lg:mt-24">
            <div className="flex items-center gap-4 mb-10">
              <HelpCircle className="w-8 h-8 text-nursery-ochre" />
              <h2 className="text-4xl font-serif">Frequently Asked</h2>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, i) => (
                <div key={i} className="border-b border-nursery-ivory/10 pb-8 last:border-0">
                  <h4 className="text-xl font-serif mb-4 text-nursery-ochre">{faq.q}</h4>
                  <p className="text-nursery-ivory/60 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>

            <div className="mt-16 p-8 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-sm italic opacity-60">
                Questions about bulk orders for contractors? Contact our professional services
                desk at (409) 925-6933.
              </p>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
