'use client';

import React from 'react';
import { Product } from '../types';
import { 
  Plus, 
  Minus, 
  Star, 
  MapPin, 
  Eye, 
  ShoppingBag
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onQuickView: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export default function ProductCard({
  product,
  quantityInCart,
  onAddToCart,
  onUpdateQuantity,
  onQuickView,
  onBuyNow
}: ProductCardProps) {
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'Panen Hari Ini':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Organik':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
      case 'Best Seller':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Diskon':
      case 'Promo Spesial':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <div className="group relative rounded-2xl bg-white dark:bg-white/[0.04] hover:bg-zinc-50 dark:hover:bg-white/[0.07] border border-zinc-200 dark:border-white/10 hover:border-emerald-500/40 backdrop-blur-xl p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-300 shadow-lg hover:shadow-emerald-500/10">
      <div>
        {/* Image Container with Badges */}
        <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-white/5">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
            loading="lazy"
          />

          {/* Gradient Overlay for legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>

          {/* Top Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.badge && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border backdrop-blur-md ${getBadgeColor(product.badge)} shadow`}>
                {product.badge}
              </span>
            )}
            {product.isOrganic && product.badge !== 'Organik' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-teal-500/20 text-teal-300 border-teal-500/30 backdrop-blur-md shadow">
                🌱 Organik
              </span>
            )}
          </div>

          {/* Quick View Button on Hover */}
          <button
            onClick={() => onQuickView(product)}
            aria-label={`Detail ${product.name}`}
            className="absolute top-2 right-2 p-2 rounded-xl bg-black/60 hover:bg-emerald-600 text-white backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-all active:scale-90 cursor-pointer shadow-lg"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Origin info pill */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-zinc-300 font-medium">
            <span className="flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 truncate max-w-[80%]">
              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate">{product.origin.split(',')[0]}</span>
            </span>

            <span className="flex items-center gap-0.5 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/10 text-amber-400 font-bold text-[10px]">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              {product.rating}
            </span>
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-1">
          <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide uppercase">
            {product.categoryLabel}
          </div>

          <h3 
            onClick={() => onQuickView(product)}
            className="font-bold text-zinc-900 dark:text-white text-sm sm:text-base leading-snug line-clamp-2 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors cursor-pointer"
          >
            {product.name}
          </h3>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
            {product.unit} • Stok {product.stock}
          </p>
        </div>
      </div>

      {/* Price & Action Section */}
      <div className="pt-3 mt-3 border-t border-zinc-200 dark:border-white/10 space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
                {formatRupiah(product.price)}
              </span>
            </div>
            {product.originalPrice && (
              <div className="text-[11px] text-zinc-400 dark:text-zinc-500 line-through">
                {formatRupiah(product.originalPrice)}
              </div>
            )}
          </div>

          {/* Stepper counter if already in cart */}
          {quantityInCart > 0 && (
            <div className="flex items-center gap-1 bg-black/60 border border-emerald-500/40 rounded-xl p-1 backdrop-blur-md">
              <button
                onClick={() => onUpdateQuantity(product.id, quantityInCart - 1)}
                className="w-5 h-5 flex items-center justify-center rounded-lg bg-white/10 hover:bg-red-500/30 text-zinc-200 hover:text-red-300 transition-colors cursor-pointer"
              >
                <Minus className="w-3 h-3 stroke-[3]" />
              </button>
              <span className="w-5 text-center text-xs font-bold text-emerald-300">
                {quantityInCart}
              </span>
              <button
                onClick={() => onUpdateQuantity(product.id, quantityInCart + 1)}
                disabled={quantityInCart >= product.stock}
                className="w-5 h-5 flex items-center justify-center rounded-lg bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3 stroke-[3]" />
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons: "+ Tambah" and "Checkout Sekarang" */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => onAddToCart(product)}
            className="flex items-center justify-center gap-1 py-2 px-2 bg-white/[0.08] hover:bg-white/[0.15] active:scale-95 text-white text-[11px] sm:text-xs font-bold rounded-xl border border-white/15 transition-all cursor-pointer truncate"
            title="Tambah ke Keranjang"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3] text-emerald-400 shrink-0" />
            <span className="truncate">+ Tambah</span>
          </button>

          <button
            onClick={() => onBuyNow(product)}
            className="flex items-center justify-center gap-1 py-2 px-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-zinc-950 text-[11px] sm:text-xs font-black rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer truncate"
            title="Checkout Sekarang"
          >
            <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
            <span className="truncate">Checkout <span className="hidden sm:inline">Sekarang</span></span>
          </button>
        </div>
      </div>
    </div>
  );
}
