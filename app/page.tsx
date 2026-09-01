'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Sparkles, Salad, Carrot, Flame, PackageOpen, Apple, Leaf, SearchX } from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import FarmStory from './components/FarmStory';
import RecipeSection from './components/RecipeSection';
import Footer from './components/Footer';
import { CATEGORIES, PRODUCTS, RECIPES, TESTIMONIALS, VOUCHERS } from './data/products';
import type { CartItem, Product, Recipe, Voucher } from './types';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Sparkles,
  Salad,
  Carrot,
  Flame,
  PackageOpen,
  Apple,
  Leaf,
};

const CART_STORAGE_KEY = 'sayur_cart';

export default function Page() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [selectedCity, setSelectedCity] = useState('sukabumi_kota');
  const [selectedDeliverySlot, setSelectedDeliverySlot] = useState('pagi');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Restore keranjang dari localStorage (simpan id+qty saja, produk dibaca ulang
  // dari katalog supaya harga/stok selalu versi terbaru).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      const saved: { id: string; quantity: number }[] = raw ? JSON.parse(raw) : [];
      const restored = saved
        .map(({ id, quantity }) => {
          const product = PRODUCTS.find((p) => p.id === id);
          if (!product) return null;
          return { product, quantity: Math.min(Math.max(1, quantity), product.stock) };
        })
        .filter((item): item is CartItem => item !== null);
      if (restored.length) setCart(restored);
    } catch {
      /* keranjang rusak — mulai dari kosong */
    }
    setCartLoaded(true);
  }, []);

  useEffect(() => {
    if (!cartLoaded) return;
    const slim = cart.map((item) => ({ id: item.product.id, quantity: item.quantity }));
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(slim));
  }, [cart, cartLoaded]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    [cart]
  );

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      const matchCategory =
        activeCategory === 'all' ||
        (activeCategory === 'organik' ? p.isOrganic === true : p.category === activeCategory);
      if (!matchCategory) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.origin.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, activeCategory]);

  const addToCart = useCallback(
    (product: Product, quantity = 1) => {
      setCart((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);
        if (existing) {
          const next = Math.min(existing.quantity + quantity, product.stock);
          return prev.map((item) =>
            item.product.id === product.id ? { ...item, quantity: next } : item
          );
        }
        return [...prev, { product, quantity: Math.min(quantity, product.stock) }];
      });
      showToast(`${product.name} masuk keranjang`);
    },
    [showToast]
  );

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setCart((prev) => {
      if (quantity < 1) return prev.filter((item) => item.product.id !== productId);
      return prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(quantity, item.product.stock) }
          : item
      );
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedVoucher(null);
  }, []);

  const handleBuyNow = useCallback(
    (product: Product) => {
      addToCart(product);
      setDetailProduct(null);
      setIsCartOpen(false);
      setIsCheckoutOpen(true);
    },
    [addToCart]
  );

  const handleApplyVoucherCode = useCallback(
    (code: string) => {
      const found = VOUCHERS.find((v) => v.code === code);
      if (!found) return;
      if (subtotal < found.minSpend) {
        showToast(
          `Voucher ${found.code} butuh belanja min Rp ${found.minSpend.toLocaleString('id-ID')}`
        );
        setIsCartOpen(true);
        return;
      }
      setAppliedVoucher(found);
      showToast(`Voucher ${found.code} aktif — diskon ${found.discountPercent}%`);
    },
    [subtotal, showToast]
  );

  const handleQuickCategory = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
    document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleAddRecipeIngredients = useCallback(
    (recipe: Recipe) => {
      const matched = recipe.ingredients
        .map((ing) => (ing.productMatchId ? PRODUCTS.find((p) => p.id === ing.productMatchId) : null))
        .filter((p): p is Product => Boolean(p));

      if (!matched.length) {
        showToast('Bahan resep ini belum tersedia di katalog');
        return;
      }

      setCart((prev) => {
        const next = [...prev];
        for (const product of matched) {
          const idx = next.findIndex((item) => item.product.id === product.id);
          if (idx >= 0) {
            next[idx] = {
              ...next[idx],
              quantity: Math.min(next[idx].quantity + 1, product.stock),
            };
          } else {
            next.push({ product, quantity: 1 });
          }
        }
        return next;
      });
      showToast(`${matched.length} bahan resep masuk keranjang`);
    },
    [showToast]
  );

  const quantityOf = useCallback(
    (productId: string) => cart.find((item) => item.product.id === productId)?.quantity ?? 0,
    [cart]
  );

  return (
    <main className="min-h-screen bg-white dark:bg-[#111113] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        selectedCity={selectedCity}
        onChangeCity={setSelectedCity}
      />

      <Hero onQuickCategoryClick={handleQuickCategory} onApplyVoucherClick={handleApplyVoucherCode} />

      <section id="katalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Katalog Panen Hari Ini</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {filteredProducts.length} produk tersedia
              {searchQuery.trim() ? ` untuk "${searchQuery.trim()}"` : ''}
            </p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1">
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.icon] ?? Sparkles;
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                aria-pressed={active}
                className={`flex items-center gap-1.5 shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  active
                    ? 'bg-emerald-500 border-emerald-500 text-white dark:text-zinc-950 shadow-lg shadow-emerald-500/20'
                    : 'bg-zinc-100 dark:bg-white/[0.04] border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-zinc-200 dark:border-white/10">
            <SearchX className="w-10 h-10 mx-auto text-zinc-400" />
            <p className="text-sm text-zinc-500">Produk tidak ditemukan. Coba kata kunci lain.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white dark:text-zinc-950 text-xs font-bold cursor-pointer"
            >
              Reset Pencarian
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantityInCart={quantityOf(product.id)}
                onAddToCart={addToCart}
                onUpdateQuantity={updateQuantity}
                onQuickView={setDetailProduct}
                onBuyNow={handleBuyNow}
              />
            ))}
          </div>
        )}
      </section>

      <RecipeSection recipes={RECIPES} onAddRecipeIngredientsToCart={handleAddRecipeIngredients} />
      <FarmStory testimonials={TESTIMONIALS} />
      <Footer />

      <ProductDetailModal
        product={detailProduct}
        isOpen={detailProduct !== null}
        onClose={() => setDetailProduct(null)}
        quantityInCart={detailProduct ? quantityOf(detailProduct.id) : 0}
        onAddToCart={addToCart}
        onUpdateQuantity={updateQuantity}
        onBuyNow={handleBuyNow}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onClearCart={clearCart}
        selectedCity={selectedCity}
        onChangeCity={setSelectedCity}
        selectedDeliverySlot={selectedDeliverySlot}
        onChangeDeliverySlot={setSelectedDeliverySlot}
        appliedVoucher={appliedVoucher}
        onApplyVoucher={setAppliedVoucher}
        onProceedCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        selectedCity={selectedCity}
        selectedDeliverySlot={selectedDeliverySlot}
        appliedVoucher={appliedVoucher}
        onOrderCompleted={clearCart}
      />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-emerald-500 text-white dark:text-zinc-950 text-xs font-bold shadow-2xl"
        >
          {toast}
        </div>
      )}
    </main>
  );
}
