'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Package, Plus, Trash2, Save, X, Pencil, Upload,
  Eye, EyeOff, GripVertical, Star
} from 'lucide-react';
import { CATEGORIES } from '../data/products';

interface Product {
  id: number;
  slug: string;
  name: string;
  category: string;
  category_label: string;
  price: number;
  original_price: number | null;
  unit: string;
  weight_grams: number;
  stock: number;
  rating: number;
  reviews_count: number;
  image: string;
  badge: string;
  origin: string;
  description: string;
  benefits: string;
  storage_tips: string;
  is_organic: number;
  active: number;
  sort_order: number;
}

const EMPTY_FORM: Partial<Product> = {
  name: '', slug: '', category: 'daun', category_label: 'Sayuran Daun Hijau',
  price: 0, original_price: null, unit: '', weight_grams: 0, stock: 0,
  rating: 0, reviews_count: 0, image: '', badge: '', origin: '',
  description: '', benefits: '[]', storage_tips: '', is_organic: 0, active: 1, sort_order: 0,
};

const BADGES = ['', 'Panen Hari Ini', 'Organik', 'Best Seller', 'Diskon', 'Promo Spesial'];

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products?admin=1');
      const data = await res.json();
      if (res.ok) setProducts(data.products ?? []);
    } catch (err) {
      console.error('Gagal memuat produk:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const flash = (type: 'ok' | 'err', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setEditProduct((p) => p ? { ...p, image: data.url } : null);
        flash('ok', 'Gambar berhasil diupload.');
      } else {
        flash('err', data.error || 'Gagal upload gambar.');
      }
    } catch {
      flash('err', 'Gagal upload gambar.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editProduct?.name) return flash('err', 'Nama produk wajib diisi.');
    setSaving(true);
    try {
      const isEdit = editProduct.id;
      const url = isEdit ? `/api/products/${editProduct.id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProduct),
      });
      const data = await res.json();
      if (res.ok) {
        flash('ok', isEdit ? 'Produk diperbarui.' : 'Produk ditambahkan.');
        setEditProduct(null);
        loadProducts();
      } else {
        flash('err', data.error || 'Gagal simpan.');
      }
    } catch {
      flash('err', 'Gagal simpan produk.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Hapus "${name}"?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        flash('ok', 'Produk dihapus.');
        loadProducts();
      }
    } catch {
      flash('err', 'Gagal hapus produk.');
    }
  };

  const toggleActive = async (p: Product) => {
    await fetch(`/api/products/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !p.active }),
    });
    loadProducts();
  };

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  return (
    <section className="bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Package className="w-5 h-5 text-emerald-500" />
          Manajemen Produk
          <span className="text-xs text-zinc-400 font-normal">({products.length} produk)</span>
        </h2>
        <button
          onClick={() => setEditProduct({ ...EMPTY_FORM })}
          className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Tambah Produk
        </button>
      </div>

      {msg && (
        <div className={`px-3 py-2 rounded-lg text-xs font-bold ${
          msg.type === 'ok'
            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
        }`}>{msg.text}</div>
      )}

      {loading ? (
        <p className="text-xs text-zinc-500 py-6 text-center">Memuat produk...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {products.map((p) => (
            <div
              key={p.id}
              className={`group relative rounded-xl border overflow-hidden transition-all ${
                p.active
                  ? 'border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.02] hover:border-emerald-500/40'
                  : 'border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.01] opacity-50'
              }`}
            >
              {/* Image */}
              <div className="relative aspect-square bg-zinc-100 dark:bg-black/40 overflow-hidden">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-300">
                    <Package className="w-8 h-8" />
                  </div>
                )}
                {p.badge && (
                  <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-white">
                    {p.badge}
                  </span>
                )}
                <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditProduct({ ...p })}
                    className="p-1.5 bg-black/60 hover:bg-emerald-600 text-white rounded-lg backdrop-blur-sm transition-colors"
                  ><Pencil className="w-3 h-3" /></button>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    className="p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-lg backdrop-blur-sm transition-colors"
                  ><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
              {/* Info */}
              <div className="p-2.5 space-y-1">
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase truncate">{p.category_label}</div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-2 leading-tight">{p.name}</h3>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{formatRupiah(p.price)}</span>
                  {p.original_price && <span className="text-[10px] text-zinc-400 line-through">{formatRupiah(p.original_price)}</span>}
                </div>
                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <span>Stok: {p.stock}</span>
                  <div className="flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    {p.rating}
                  </div>
                </div>
                <button
                  onClick={() => toggleActive(p)}
                  className={`w-full text-[10px] font-bold py-1 rounded flex items-center justify-center gap-1 transition-colors ${
                    p.active
                      ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100'
                      : 'text-zinc-400 bg-zinc-100 dark:bg-white/[0.03] hover:bg-zinc-200'
                  }`}
                >
                  {p.active ? <><Eye className="w-3 h-3" /> Aktif</> : <><EyeOff className="w-3 h-3" /> Nonaktif</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setEditProduct(null)}>
          <div className="bg-white dark:bg-[#09090b] rounded-2xl border border-zinc-200 dark:border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-white/10">
              <h3 className="font-bold text-sm">{editProduct.id ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
              <button onClick={() => setEditProduct(null)} className="p-1 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Gambar Produk</label>
                <div className="flex gap-3">
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="w-28 h-28 rounded-xl border-2 border-dashed border-zinc-200 dark:border-white/15 flex items-center justify-center cursor-pointer hover:border-emerald-500 transition-colors overflow-hidden bg-zinc-50 dark:bg-white/[0.03]"
                  >
                    {editProduct.image ? (
                      <img src={editProduct.image} alt="" className="w-full h-full object-cover" />
                    ) : uploading ? (
                      <span className="text-[10px] text-zinc-400 animate-pulse">Upload...</span>
                    ) : (
                      <Upload className="w-6 h-6 text-zinc-300" />
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f);
                    e.target.value = '';
                  }} />
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Atau tempel URL gambar..."
                      value={editProduct.image || ''}
                      onChange={(e) => setEditProduct({ ...editProduct, image: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[10px] text-zinc-400">Klik area gambar untuk upload dari komputer (max 5MB). Format: JPG, PNG, WebP.</p>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Nama Produk *</label>
                  <input type="text" value={editProduct.name || ''} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:border-emerald-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Kategori</label>
                  <select value={editProduct.category || ''} onChange={(e) => {
                    const cat = CATEGORIES.find(c => c.id === e.target.value);
                    setEditProduct({ ...editProduct, category: e.target.value, category_label: cat?.label || '' });
                  }} className="w-full px-3 py-2 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:border-emerald-500">
                    {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Badge</label>
                  <select value={editProduct.badge || ''} onChange={(e) => setEditProduct({ ...editProduct, badge: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:border-emerald-500">
                    {BADGES.map(b => <option key={b} value={b}>{b || 'Tanpa Badge'}</option>)}
                  </select>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Harga (Rp) *</label>
                  <input type="number" value={editProduct.price || ''} onChange={(e) => setEditProduct({ ...editProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:border-emerald-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Harga Coret (Rp)</label>
                  <input type="number" value={editProduct.original_price || ''} onChange={(e) => setEditProduct({ ...editProduct, original_price: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:border-emerald-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Stok</label>
                  <input type="number" value={editProduct.stock ?? ''} onChange={(e) => setEditProduct({ ...editProduct, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:border-emerald-500" />
                </div>
              </div>

              {/* Unit & Weight */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Satuan</label>
                  <input type="text" placeholder="ikat (250g)" value={editProduct.unit || ''} onChange={(e) => setEditProduct({ ...editProduct, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:border-emerald-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Berat (gram)</label>
                  <input type="number" value={editProduct.weight_grams || ''} onChange={(e) => setEditProduct({ ...editProduct, weight_grams: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:border-emerald-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Rating</label>
                  <input type="number" step="0.1" min="0" max="5" value={editProduct.rating || ''} onChange={(e) => setEditProduct({ ...editProduct, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:border-emerald-500" />
                </div>
              </div>

              {/* Origin */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Asal / Kebun</label>
                <input type="text" value={editProduct.origin || ''} onChange={(e) => setEditProduct({ ...editProduct, origin: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:border-emerald-500" />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Deskripsi</label>
                <textarea rows={3} value={editProduct.description || ''} onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:border-emerald-500 resize-none" />
              </div>

              {/* Storage Tips */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Tips Penyimpanan</label>
                <input type="text" value={editProduct.storage_tips || ''} onChange={(e) => setEditProduct({ ...editProduct, storage_tips: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:border-emerald-500" />
              </div>

              {/* Benefits */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Manfaat (satu per baris)</label>
                <textarea rows={3} value={
                  (() => { try { return JSON.parse(editProduct.benefits || '[]').join('\n'); } catch { return ''; } })()
                } onChange={(e) => setEditProduct({ ...editProduct, benefits: JSON.stringify(e.target.value.split('\n').filter(Boolean)) })}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:border-emerald-500 resize-none"
                  placeholder="Kaya Vitamin C&#10;Tinggi Serat&#10;Rendah Kalori" />
              </div>

              {/* Toggles */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!editProduct.is_organic} onChange={(e) => setEditProduct({ ...editProduct, is_organic: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Organik</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!editProduct.active} onChange={(e) => setEditProduct({ ...editProduct, active: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Aktif</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-zinc-100 dark:border-white/10">
              <button onClick={() => setEditProduct(null)} className="px-4 py-2 text-xs font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-lg transition-colors">Batal</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg flex items-center gap-1.5 transition-colors">
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Menyimpan...' : 'Simpan Produk'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
