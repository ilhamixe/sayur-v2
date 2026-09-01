'use client';

import React from 'react';
import { 
  Leaf, 
  MapPin, 
  Phone, 
  Clock, 
  Heart,
  Truck
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950/90 backdrop-blur-2xl text-zinc-500 dark:text-zinc-400 text-xs transition-colors duration-300">
      {/* Top Banner */}
      <div className="border-b border-zinc-200 dark:border-white/10 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-zinc-900 dark:text-white text-sm">Pesan Hari Ini Sebelum 15:00 WIB</div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Diantar fresh dengan armada berpendingin khusus sayuran</div>
            </div>
          </div>

          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/20 hover:bg-emerald-500 hover:text-white dark:hover:text-zinc-950 text-emerald-700 dark:text-emerald-300 font-bold rounded-xl border border-emerald-200 dark:border-emerald-500/30 transition-all active:scale-95 cursor-pointer shadow-sm dark:shadow-none"
          >
            Konsultasi Kebutuhan Sayur Resto / Catering
          </a>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1 & 2: Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-zinc-900 dark:text-white">
                Sayur<span className="text-emerald-600 dark:text-emerald-400">Sukabumi</span>
              </span>
            </div>

            <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed max-w-sm">
              Platform e-commerce penyedia sayuran hidroponik, sayuran organik, buah segar, dan rempah bumbu dapur langsung dari petani lokal lereng Gunung Gede Pangrango, Sukabumi.
            </p>

            <div className="space-y-1.5 text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Central Hub: Jl. Selabintana KM 4.5, Cisaat, Sukabumi</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Jam Panen & Packing: 05:00 - 18:00 WIB</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>WhatsApp: +62 812-3456-7890</span>
              </div>
            </div>
          </div>

          {/* Col 3: Kategori */}
          <div className="space-y-3">
            <h4 className="font-bold text-emerald-600 dark:text-emerald-400 text-xs uppercase tracking-wider">
              Kategori Sayuran
            </h4>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer text-zinc-600 dark:text-zinc-400">Sayuran Daun Hijau</span></li>
              <li><span className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer text-zinc-600 dark:text-zinc-400">Umbi & Sayur Buah</span></li>
              <li><span className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer text-zinc-600 dark:text-zinc-400">Paket Masak Siap Saji</span></li>
              <li><span className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer text-zinc-600 dark:text-zinc-400">Bumbu & Rempah Dapur</span></li>
              <li><span className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer text-zinc-600 dark:text-zinc-400">Sayuran Organik Gede</span></li>
              <li><span className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer text-zinc-600 dark:text-zinc-400">Buah Lokal Segar</span></li>
            </ul>
          </div>

          {/* Col 4: Layanan & Wilayah */}
          <div className="space-y-3">
            <h4 className="font-bold text-emerald-600 dark:text-emerald-400 text-xs uppercase tracking-wider">
              Jangkauan Kirim
            </h4>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li><span>Kota & Kab. Sukabumi (Gratis Ongkir)</span></li>
              <li><span>Kota & Kab. Bogor (Sameday)</span></li>
              <li><span>DKI Jakarta (Sameday Cold)</span></li>
              <li><span>Depok, Tangerang & Bekasi</span></li>
              <li><span>Kota Bandung & Cimahi</span></li>
            </ul>
          </div>

          {/* Col 5: Bantuan & Jaminan */}
          <div className="space-y-3">
            <h4 className="font-bold text-emerald-600 dark:text-emerald-400 text-xs uppercase tracking-wider">
              Jaminan Layanan
            </h4>
            <div className="p-3 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 space-y-1.5 shadow-sm dark:shadow-none">
              <div className="font-bold text-zinc-900 dark:text-white text-xs flex items-center gap-1">
                <span>🛡️ Garansi 100% Segar</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
                Foto sayur yang tidak sesuai saat tiba, kirim ke CS, dana kami kembalikan 100%.
              </p>
            </div>
            <div className="text-[11px] text-zinc-500">
              Metode Pembayaran: QRIS, Transfer BCA/Mandiri/BRI, dan Bayar di Tempat (COD).
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500">
          <div>
            © {new Date().getFullYear()} Sayur Sukabumi. Segar dari Petani untuk Keluarga Anda.
          </div>
          <div className="flex items-center gap-1 text-zinc-400">
            <span>Dibuat dengan bangga untuk pertanian Indonesia</span>
            <Heart className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
