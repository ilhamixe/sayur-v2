'use client';

import React from 'react';
import { Product } from '../types';
import { 
  X, 
  Star, 
  MapPin, 
  Plus, 
  Minus, 
  ShoppingBag, 
  CheckCircle2, 
  Lightbulb, 
  ShieldCheck,
  Leaf
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  quantityInCart: number;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onBuyNow?: (product: Product) => void;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  quantityInCart,
  onAddToCart,
  onUpdateQuantity,
  onBuyNow
}: ProductDetailModalProps) {
  if (!isOpen || !product) return null;

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 transition-colors">
      <div 
        className="relative w-full max-w-2xl bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-white/15 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl max-h-[90vh] flex flex-col transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 dark:bg-black/60 hover:bg-zinc-100 dark:hover:bg-white/20 text-zinc-600 dark:text-white backdrop-blur-md border border-zinc-200 dark:border-white/10 transition-colors cursor-pointer shadow-sm dark:shadow-none"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content Scrollable */}
        <div className="overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
            {/* Left Image */}
            <div className="sm:col-span-5 relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-white/10">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-emerald-500 text-white dark:text-zinc-950 text-xs font-black shadow-lg">
                  {product.badge}
                </div>
              )}
            </div>

            {/* Right Meta */}
            <div className="sm:col-span-7 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase">
                  <span>{product.categoryLabel}</span>
                  {product.isOrganic && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-300 text-[10px] border border-teal-200 dark:border-teal-500/30">
                      <Leaf className="w-2.5 h-2.5" /> Organik
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mt-1">
                  {product.name}
                </h2>

                <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 dark:fill-amber-400 text-amber-500 dark:text-amber-400" />
                    <span>{product.rating}</span>
                    <span className="text-zinc-500 font-normal">({product.reviewsCount} ulasan)</span>
                  </div>
                  <span>•</span>
                  <span>Satuan: <strong className="text-zinc-700 dark:text-zinc-200">{product.unit}</strong></span>
                </div>

                <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Asal: <strong className="text-zinc-700 dark:text-zinc-300">{product.origin}</strong></span>
                </div>
              </div>

              {/* Price & Action Box */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Harga per {product.unit}</div>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {formatRupiah(product.price)}
                    </div>
                    {product.originalPrice && (
                      <div className="text-xs text-zinc-400 dark:text-zinc-500 line-through">
                        {formatRupiah(product.originalPrice)}
                      </div>
                    )}
                  </div>

                  {/* Counter if already in cart */}
                  {quantityInCart > 0 && (
                    <div className="flex items-center gap-2 bg-zinc-200 dark:bg-black/60 border border-zinc-300 dark:border-emerald-500/40 rounded-xl p-1.5 backdrop-blur-md">
                      <button
                        onClick={() => onUpdateQuantity(product.id, quantityInCart - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-white/10 hover:bg-red-100 dark:hover:bg-red-500/30 text-zinc-700 dark:text-zinc-200 hover:text-red-600 dark:hover:text-red-300 transition-colors cursor-pointer shadow-sm dark:shadow-none"
                      >
                        <Minus className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                      <span className="w-7 text-center font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        {quantityInCart}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(product.id, quantityInCart + 1)}
                        disabled={quantityInCart >= product.stock}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-500 text-white dark:text-zinc-950 font-bold hover:bg-emerald-400 disabled:opacity-40 transition-colors cursor-pointer shadow-sm dark:shadow-none"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Two Action Buttons side by side */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => onAddToCart(product)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-zinc-200 dark:bg-white/10 hover:bg-zinc-300 dark:hover:bg-white/20 active:scale-95 text-zinc-900 dark:text-white font-bold text-xs rounded-xl border border-zinc-300 dark:border-white/15 transition-all cursor-pointer shadow-sm dark:shadow-none"
                  >
                    <Plus className="w-4 h-4 stroke-[3] text-emerald-600 dark:text-emerald-400" />
                    <span>+ Tambah</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onBuyNow) {
                        onBuyNow(product);
                      } else {
                        onAddToCart(product);
                      }
                      onClose();
                    }}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-white dark:text-zinc-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                    <span>Checkout Sekarang</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Farm Story */}
          <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-white/10">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                Deskripsi Produk
              </h4>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Health Benefits */}
            {product.benefits && product.benefits.length > 0 && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/20 space-y-2">
                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Manfaat Nutrisi & Kesehatan:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Storage Tips */}
            {product.storageTips && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-white/[0.03] border border-amber-200 dark:border-white/10 flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-zinc-700 dark:text-zinc-300">
                  <strong className="text-amber-600 dark:text-amber-300">Tips Penyimpanan Segar:</strong> {product.storageTips}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
