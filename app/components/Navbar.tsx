'use client';

import React, { useEffect, useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Leaf, 
  MapPin, 
  PhoneCall, 
  Sparkles,
  X,
  Sun,
  Moon,
  Settings
} from 'lucide-react';
import Link from 'next/link';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  selectedCity: string;
  onChangeCity: (city: string) => void;
}

export default function Navbar({
  searchQuery,
  onSearchChange,
  cartCount,
  onOpenCart,
  selectedCity,
  onChangeCity
}: NavbarProps) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setMounted(true);
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      setIsDark(true);
    }
  };
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-white/80 dark:bg-[#09090b]/80 border-b border-zinc-200 dark:border-white/10 transition-colors duration-300">
      {/* Top micro bar for announcements */}
      <div className="bg-gradient-to-r from-emerald-50 via-zinc-100 to-emerald-50 dark:from-emerald-950/80 dark:via-zinc-900/90 dark:to-emerald-950/80 border-b border-emerald-500/20 py-1.5 px-4 text-xs transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 dark:bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600 dark:bg-emerald-500"></span>
            </span>
            <span className="font-medium text-[11px] sm:text-xs">Panen Segar Subuh Tadi (05:00 WIB) Langsung dari Petani Sukabumi</span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-zinc-600 dark:text-zinc-400 text-[11px]">
            <div className="flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors">
              <MapPin className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>Lokasi Kirim:</span>
              <select 
                value={selectedCity} 
                onChange={(e) => onChangeCity(e.target.value)}
                className="bg-transparent border border-zinc-300 dark:border-white/10 rounded px-1.5 py-0.5 text-zinc-700 dark:text-zinc-200 focus:outline-none focus:border-emerald-500 text-xs"
              >
                <option value="sukabumi_kota" className="bg-white dark:bg-zinc-900">Sukabumi Kota (Gratis Ongkir)</option>
                <option value="sukabumi_kab" className="bg-white dark:bg-zinc-900">Kabupaten Sukabumi</option>
                <option value="jakarta" className="bg-white dark:bg-zinc-900">DKI Jakarta (Sameday)</option>
                <option value="bogor" className="bg-white dark:bg-zinc-900">Bogor</option>
                <option value="depok_tangerang_bekasi" className="bg-white dark:bg-zinc-900">Depok / Tangerang / Bekasi</option>
                <option value="bandung" className="bg-white dark:bg-zinc-900">Bandung</option>
              </select>
            </div>

            <a 
              href="https://wa.me/6281234567890?text=Halo%20Admin%20Sayur%20Sukabumi%2C%20saya%20mau%20tanya%20stok%20sayur%20hari%20ini" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <PhoneCall className="w-3 h-3" />
              <span>CS WhatsApp: 0812-3456-7890</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer select-none">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/25 border border-emerald-400/30">
            <Leaf className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-zinc-900 dark:text-white">
                Sayur<span className="text-emerald-600 dark:text-emerald-400 font-black">Sukabumi</span>
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-semibold uppercase tracking-wider">
                <Sparkles className="w-2.5 h-2.5" /> 100% Fresh
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium">Petik Segar Kaki Gunung Gede & Salak</p>
          </div>
        </div>

        {/* Real-time Search Input */}
        <div className="flex-1 max-w-md hidden md:block relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari kangkung, bayam, wortel, alpukat, paket sop..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/15 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all shadow-inner"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-3 p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Mobile search toggle trigger or info */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Garansi Kesegaran</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">100% Uang Kembali</span>
            </div>
          </div>

          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer"
              title={isDark ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          {/* Admin Link */}
          <Link
            href="/admin"
            className="p-2.5 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer hidden sm:flex"
            title="Dashboard Admin"
          >
            <Settings className="w-4 h-4" />
          </Link>

          {/* Cart Trigger */}
          <button
            onClick={onOpenCart}
            id="cart-trigger-btn"
            className="relative flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-600/30 border border-emerald-400/30 active:scale-95 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Keranjang</span>
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-white text-emerald-800 text-xs font-black rounded-full shadow">
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar (Visible on small screens) */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari sayur, bumbu, buah, paket masak..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/15 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all shadow-inner"
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange('')}
              className="absolute right-3 p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
