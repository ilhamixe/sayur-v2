'use client';

import React from 'react';
import { CustomerTestimonial } from '../types';
import { 
  Sprout, 
  Sun, 
  Droplets, 
  ShieldCheck, 
  Star, 
  HeartHandshake,
  Users
} from 'lucide-react';

interface FarmStoryProps {
  testimonials: CustomerTestimonial[];
}

export default function FarmStory({ testimonials }: FarmStoryProps) {
  return (
    <section className="py-16 border-t border-zinc-200 dark:border-white/10 relative overflow-hidden transition-colors duration-300">
      {/* Background ambient lighting */}
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-200/40 dark:bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none transition-colors duration-500"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Why Choose Us & Farm Transparency */}
        <div className="rounded-3xl bg-zinc-50/80 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 backdrop-blur-2xl p-8 sm:p-12 shadow-xl dark:shadow-2xl relative overflow-hidden transition-colors duration-300">
          <div className="max-w-3xl mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Sprout className="w-3.5 h-3.5" /> Dari Kebun ke Dapur Anda
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
              Mengapa Sayuran dari Tanah Sukabumi Lebih Manis & Segar?
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 mt-3 leading-relaxed">
              Sukabumi diberkahi dengan tanah vulkanik gembur kaya mineral dari Gunung Gede Pangrango & Gunung Salak serta pasokan air mata air alami pegunungan bersuhu sejuk (18°C - 24°C).
            </p>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 space-y-3 shadow-sm dark:shadow-none">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Sun className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-base">Panen Subuh Pukul 05.00</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Sayuran baru dipetik saat embun pagi masih menempel agar kadar air dan kerenyahan daun tetap maksimal 100%.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 space-y-3 shadow-sm dark:shadow-none">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-300 flex items-center justify-center">
                <Droplets className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-base">Air Mata Air Gunung</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Irigasi alami bebas polusi industri kota. Tanpa suntikan zat pengawet, pewarna daun, atau zat pemanis buatan.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 space-y-3 shadow-sm dark:shadow-none">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-base">Kesejahteraan Petani</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Sistem fair trade langsung bermitra dengan 1.200+ petani lokal di Selabintana, Cisaat, Sukaraja, dan Nagrak.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 space-y-3 shadow-sm dark:shadow-none">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-base">Garansi Tukar 100%</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Jika ada sayur yang busuk, layu parah, atau rusak saat pengiriman, kami ganti baru tanpa syarat berbelit.
              </p>
            </div>
          </div>
        </div>

        {/* Customer Testimonials Carousel/Grid */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Users className="w-3.5 h-3.5" /> Ulasan Pelanggan Setia
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Dipercaya Lebih dari 15.000+ Keluarga & Restoran
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Ulasan nyata dari para ibu rumah tangga, chef, dan pecinta gaya hidup sehat di Sukabumi & Jabodetabek.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div 
                key={t.id}
                className="p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 backdrop-blur-xl flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition-all shadow-lg shadow-zinc-200/50 dark:shadow-none"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] text-zinc-500">{t.date}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed italic">
                    &quot;{t.comment}&quot;
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-white/5 flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border border-emerald-200 dark:border-emerald-500/30"
                  />
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-white text-xs">{t.name}</h4>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400">{t.city}</div>
                    <div className="text-[9px] text-zinc-500 truncate max-w-[180px]">Beli: {t.purchasedItem}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
