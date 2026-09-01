'use client';

import React from 'react';
import { 
  Truck, 
  ShieldCheck, 
  Leaf, 
  Clock, 
  ArrowRight,
  Tag
} from 'lucide-react';

interface HeroProps {
  onQuickCategoryClick: (categoryId: string) => void;
  onApplyVoucherClick: (code: string) => void;
}

export default function Hero({ onQuickCategoryClick, onApplyVoucherClick }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-6 pb-12">
      {/* Background ambient lighting */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-200/40 dark:bg-emerald-600/5 rounded-full blur-[140px] pointer-events-none transition-colors duration-500"></div>
      <div className="absolute top-20 right-10 w-96 h-96 bg-teal-200/40 dark:bg-teal-600/5 rounded-full blur-[160px] pointer-events-none transition-colors duration-500"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Hero Card with Frosted Glass */}
        <div className="relative rounded-3xl p-6 sm:p-10 md:p-12 bg-white/70 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 backdrop-blur-2xl shadow-xl dark:shadow-2xl overflow-hidden transition-colors duration-300">
          {/* Subtle Grid Accent Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] dark:opacity-[0.02] pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold backdrop-blur-md shadow-inner">
                <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Panen Subuh Langsung dari Petani Sukabumi</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight leading-[1.15]">
                Sayuran & Buah Segar Berkualitas,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 dark:from-emerald-400 dark:via-teal-400 dark:to-emerald-300">
                  Sampai di Meja Makan Anda.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed max-w-xl">
                Dipetik dari tanah vulkanik subur lereng Gunung Gede & Salak, Sukabumi. Nikmati sayuran hidroponik, sayur organik, dan paket bumbu siap masak tanpa perantara dengan garansi 100% segar.
              </p>

              {/* Quick Action Badges / Promo Banner */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-white/80 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 backdrop-blur-md">
                  <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Gratis Ongkir Sukabumi Kota</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white/80 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 backdrop-blur-md">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Garansi Ganti Jika Layu</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-zinc-300 backdrop-blur-md">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Pengiriman Setiap Hari 07.00-17.00</span>
                </div>
              </div>

              {/* Voucher Clip Bar */}
              <div className="p-3 sm:p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-300">VOUCHER SPESIAL: SEGARHEMAT</div>
                    <div className="text-[11px] text-zinc-400">Diskon 15% untuk semua produk sayuran hari ini</div>
                  </div>
                </div>
                <button
                  onClick={() => onApplyVoucherClick('SEGARHEMAT')}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold rounded-lg transition-all active:scale-95 cursor-pointer shadow-md shadow-emerald-500/20 whitespace-nowrap"
                >
                  Klaim Voucher
                </button>
              </div>
            </div>

            {/* Right Card / Visual Grid */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* Highlight Package Card */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/15 backdrop-blur-2xl shadow-xl relative overflow-hidden group">
                <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-bold uppercase tracking-wider">
                  🔥 Paling Dicari
                </div>

                <div className="flex gap-4 items-center">
                  <img
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80"
                    alt="Paket Sayur Asem"
                    className="w-20 h-20 rounded-xl object-cover border border-white/10 shadow-md group-hover:scale-105 transition-transform"
                  />
                  <div className="space-y-1 flex-1">
                    <h3 className="font-bold text-white text-base">Paket Sayur Asem Komplit</h3>
                    <p className="text-xs text-zinc-400 line-clamp-1">Jagung, labu siam, kacang panjang + bumbu Sunda</p>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-emerald-400 font-extrabold text-sm">Rp 13.500</span>
                        <span className="text-zinc-500 text-[11px] line-through">Rp 16.000</span>
                      </div>
                      <button 
                        onClick={() => onQuickCategoryClick('paket_masak')}
                        className="text-[11px] text-emerald-300 hover:text-emerald-200 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        Lihat Paket <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time stats row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-xl text-center">
                  <div className="text-xl font-black text-white">45+</div>
                  <div className="text-[10px] text-zinc-400 font-medium">Jenis Sayuran</div>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-xl text-center">
                  <div className="text-xl font-black text-emerald-400">100%</div>
                  <div className="text-[10px] text-zinc-400 font-medium">Petani Lokal</div>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-xl text-center">
                  <div className="text-xl font-black text-teal-300">4.9/5</div>
                  <div className="text-[10px] text-zinc-400 font-medium">Rating Kepuasan</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
