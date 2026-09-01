'use client';

import React, { useState } from 'react';
import { Recipe } from '../types';
import { 
  ChefHat, 
  Clock, 
  Users, 
  ShoppingBag, 
  Check, 
  BookOpen
} from 'lucide-react';

interface RecipeSectionProps {
  recipes: Recipe[];
  onAddRecipeIngredientsToCart: (recipe: Recipe) => void;
}

export default function RecipeSection({
  recipes,
  onAddRecipeIngredientsToCart
}: RecipeSectionProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>(recipes[0]);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const handleAddAll = (recipe: Recipe) => {
    onAddRecipeIngredientsToCart(recipe);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  return (
    <section className="py-12 border-t border-zinc-200 dark:border-white/10 relative transition-colors duration-300">
      {/* Background glow */}
      <div className="absolute top-1/2 left-10 w-80 h-80 bg-teal-200/30 dark:bg-teal-600/5 rounded-full blur-[140px] pointer-events-none transition-colors duration-500"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <ChefHat className="w-3.5 h-3.5" /> Dapur Sayur Sukabumi
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Inspirasi Resep Masakan Segar
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xl">
              Bingung mau masak apa hari ini? Beli semua bahan paket resep segar khas Sunda hanya dalam 1 klik.
            </p>
          </div>

          {/* Recipe Selector Tabs */}
          <div className="flex flex-wrap gap-2">
            {recipes.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRecipe(r)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedRecipe.id === r.id
                    ? 'bg-emerald-500 text-white dark:text-zinc-950 shadow-lg shadow-emerald-500/20'
                    : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-white/10'
                }`}
              >
                {r.title.split(' ')[0]} {r.title.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Recipe Spotlight Display */}
        <div className="rounded-3xl bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/15 backdrop-blur-2xl p-6 sm:p-8 shadow-xl dark:shadow-2xl overflow-hidden transition-colors duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Image & Quick Stats */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative aspect-video sm:aspect-4/3 rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/10 shadow-lg bg-zinc-100 dark:bg-black/40">
                <img
                  src={selectedRecipe.image}
                  alt={selectedRecipe.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500 text-zinc-950 mb-1 inline-block">
                    Tingkat: {selectedRecipe.difficulty}
                  </span>
                  <h3 className="text-lg font-bold leading-snug">{selectedRecipe.title}</h3>
                </div>
              </div>

              {/* Meta stats bar */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-white/10 flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <div className="text-[10px] text-zinc-500 font-semibold uppercase">Waktu Masak</div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-200">{selectedRecipe.cookingTime}</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-white/10 flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <div className="text-[10px] text-zinc-500 font-semibold uppercase">Porsi Makan</div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-200">{selectedRecipe.servings}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Recipe Content & 1-Click Buy */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
                  {selectedRecipe.title}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-300 font-medium mt-0.5">
                  {selectedRecipe.subtitle}
                </p>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 mt-2 leading-relaxed">
                  {selectedRecipe.description}
                </p>
              </div>

              {/* Ingredients List with match status */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Bahan-Bahan Segar:
                  </h4>
                  <span className="text-[11px] text-zinc-500">Kualitas Kebun Sukabumi</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedRecipe.ingredients.map((ing, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5 text-xs text-zinc-800 dark:text-zinc-200 shadow-sm dark:shadow-none">
                      <span>{ing.name}</span>
                      <span className="text-zinc-500 dark:text-zinc-400 font-medium">{ing.amount}</span>
                    </div>
                  ))}
                </div>

                {/* 1-Click Buy Button */}
                <div className="pt-2">
                  <button
                    onClick={() => handleAddAll(selectedRecipe)}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer shadow-lg ${
                      addedSuccess
                        ? 'bg-teal-500 text-zinc-950'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950'
                    }`}
                  >
                    {addedSuccess ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Semua Bahan Berhasil Ditambahkan ke Keranjang!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                        <span>Beli Semua Bahan Resep Ini Sekaligus (1-Klik)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Cooking Steps Accordion / Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Langkah Memasak Praktis:
                </h4>
                <div className="space-y-2">
                  {selectedRecipe.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
