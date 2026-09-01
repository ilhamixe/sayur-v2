'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Save,
  X,
  Pencil,
  AlertCircle,
  CheckCircle2,
  Power,
  Package,
  Layers,
} from 'lucide-react';
import { CATEGORIES, PRODUCTS } from '../data/products';
import type { Supplier, SupplierMapping } from '../types/notify';

type FormMapping = { mapping_type: 'product' | 'category'; ref_id: string };

type FormState = {
  id: number | null;
  name: string;
  phone: string;
  mappings: FormMapping[];
  active: boolean;
};

const EMPTY_FORM: FormState = {
  id: null,
  name: '',
  phone: '',
  mappings: [{ mapping_type: 'product', ref_id: PRODUCTS[0]?.id ?? '' }],
  active: true,
};

const MAPPABLE_CATEGORIES = CATEGORIES.filter((c) => c.id !== 'all');

const PRODUCT_LABEL = new Map(PRODUCTS.map((p) => [p.id, p.name]));
const CATEGORY_LABEL = new Map(MAPPABLE_CATEGORIES.map((c) => [c.id, c.label]));

function refLabel(type: 'product' | 'category', ref_id: string) {
  return type === 'product' ? (PRODUCT_LABEL.get(ref_id) ?? ref_id) : (CATEGORY_LABEL.get(ref_id) ?? ref_id);
}

export default function SupplierManager() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/suppliers');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memuat supplier.');
      setSuppliers(data.suppliers ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const flash = useCallback((msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2500);
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError(null);
  };

  const openEdit = (s: Supplier) => {
    setForm({
      id: s.id,
      name: s.name,
      phone: s.phone,
      mappings: s.mappings.length > 0
        ? s.mappings.map((m) => ({ mapping_type: m.mapping_type, ref_id: m.ref_id }))
        : [{ mapping_type: 'product', ref_id: PRODUCTS[0]?.id ?? '' }],
      active: s.active === 1,
    });
    setShowForm(true);
    setError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.mappings.length === 0) {
      setError('Minimal satu mapping wajib dipilih.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        mappings: form.mappings,
        active: form.active,
      };
      const res = await fetch(form.id ? `/api/suppliers/${form.id}` : '/api/suppliers', {
        method: form.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan supplier.');
      setShowForm(false);
      setForm(EMPTY_FORM);
      flash(form.id ? 'Supplier diperbarui' : 'Supplier ditambahkan');
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (s: Supplier) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/suppliers/${s.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: s.name,
          phone: s.phone,
          mappings: s.mappings,
          active: s.active !== 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah status.');
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (s: Supplier) => {
    if (!confirm(`Hapus supplier "${s.name}"? Semua mapping akan dihapus.`)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/suppliers/${s.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus supplier.');
      flash('Supplier dihapus');
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  // --- Mapping helpers for form ---
  const addMapping = () => {
    setForm((f) => ({
      ...f,
      mappings: [...f.mappings, { mapping_type: 'product', ref_id: PRODUCTS[0]?.id ?? '' }],
    }));
  };

  const removeMapping = (idx: number) => {
    setForm((f) => ({
      ...f,
      mappings: f.mappings.filter((_, i) => i !== idx),
    }));
  };

  const updateMapping = (idx: number, patch: Partial<FormMapping>) => {
    setForm((f) => ({
      ...f,
      mappings: f.mappings.map((m, i) => {
        if (i !== idx) return m;
        const next = { ...m, ...patch };
        // Reset ref_id when switching type
        if (patch.mapping_type && patch.mapping_type !== m.mapping_type) {
          next.ref_id = patch.mapping_type === 'product'
            ? (PRODUCTS[0]?.id ?? '')
            : (MAPPABLE_CATEGORIES[0]?.id ?? '');
        }
        return next;
      }),
    }));
  };

  // Products not yet mapped by any active supplier
  const unmappedProducts = useMemo(() => {
    const active = suppliers.filter((s) => s.active === 1);
    const coveredProducts = new Set<string>();
    const coveredCategories = new Set<string>();
    for (const s of active) {
      for (const m of s.mappings) {
        if (m.mapping_type === 'product') coveredProducts.add(m.ref_id);
        else coveredCategories.add(m.ref_id);
      }
    }
    return PRODUCTS.filter((p) => !coveredProducts.has(p.id) && !coveredCategories.has(p.category));
  }, [suppliers]);

  const refOptionsFor = (type: 'product' | 'category') =>
    type === 'product'
      ? PRODUCTS.map((p) => ({ value: p.id, label: `${p.name} — ${p.categoryLabel}` }))
      : MAPPABLE_CATEGORIES.map((c) => ({ value: c.id, label: c.label }));

  return (
    <section className="bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" />
            Supplier / Tukang Sayur
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            1 supplier bisa punya banyak mapping. Saat order masuk, item yang cocok dikirim ke nomor WA supplier.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Tambah Supplier
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {notice}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={submit}
          className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {form.id ? 'Edit Supplier' : 'Supplier Baru'}
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 cursor-pointer"
              aria-label="Tutup formulir"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="sup-name" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Nama Supplier *
              </label>
              <input
                id="sup-name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Pak Budi Tomat"
                className="w-full p-2.5 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/15 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="sup-phone" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Nomor WhatsApp *
              </label>
              <input
                id="sup-phone"
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="081234567890"
                className="w-full p-2.5 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/15 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Mappings */}
          <fieldset className="space-y-2">
            <legend className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Pemetaan Produk / Kategori *
            </legend>
            {form.mappings.map((m, idx) => (
              <div key={idx} className="flex items-center gap-2 flex-wrap">
                <select
                  value={m.mapping_type}
                  onChange={(e) => updateMapping(idx, { mapping_type: e.target.value as 'product' | 'category' })}
                  className="p-2.5 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/15 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="product">Per Produk</option>
                  <option value="category">Per Kategori</option>
                </select>
                <select
                  value={m.ref_id}
                  onChange={(e) => updateMapping(idx, { ref_id: e.target.value })}
                  className="flex-1 min-w-[180px] p-2.5 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/15 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                >
                  {refOptionsFor(m.mapping_type).map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {form.mappings.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMapping(idx)}
                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Hapus mapping ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addMapping}
              className="px-3 py-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Tambah Mapping
            </button>
          </fieldset>

          <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="w-4 h-4 accent-emerald-500"
            />
            Aktif (ikut menerima notifikasi order)
          </label>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={busy}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" /> {busy ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 font-bold text-xs rounded-xl cursor-pointer"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-xs text-zinc-500 py-6 text-center">Memuat supplier...</p>
      ) : suppliers.length === 0 ? (
        <div className="text-center py-10 bg-zinc-50 dark:bg-white/[0.02] rounded-xl border border-dashed border-zinc-200 dark:border-white/10">
          <p className="text-zinc-500 text-sm">Belum ada supplier.</p>
          <p className="text-zinc-400 text-xs mt-1">
            Tambah minimal satu supplier supaya order bisa diteruskan.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {suppliers.map((s) => (
            <div
              key={s.id}
              className="flex items-start justify-between gap-3 p-3 rounded-xl border border-zinc-100 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm">{s.name}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      s.active === 1
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        : 'bg-zinc-100 dark:bg-white/5 text-zinc-400'
                    }`}
                  >
                    {s.active === 1 ? 'Aktif' : 'Off'}
                  </span>
                </div>
                <div className="text-xs text-zinc-500 font-mono mt-0.5">{s.phone}</div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {s.mappings.map((m, i) => (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        m.mapping_type === 'product'
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          : 'bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300'
                      }`}
                    >
                      {m.mapping_type === 'product' ? <Package className="w-2.5 h-2.5" /> : <Layers className="w-2.5 h-2.5" />}
                      {refLabel(m.mapping_type, m.ref_id)}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => toggleActive(s)}
                  disabled={busy}
                  className="p-2 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                  title={s.active === 1 ? 'Nonaktifkan' : 'Aktifkan'}
                >
                  <Power className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openEdit(s)}
                  className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => remove(s)}
                  disabled={busy}
                  className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && unmappedProducts.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-xs space-y-1.5">
          <div className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            {unmappedProducts.length} produk belum punya supplier
          </div>
          <p className="text-amber-700/80 dark:text-amber-200/80">
            Order yang berisi produk ini tetap masuk, tapi tidak ada notifikasi WA dikirim:
          </p>
          <p className="text-amber-800 dark:text-amber-200">
            {unmappedProducts.map((p) => p.name).join(', ')}
          </p>
        </div>
      )}
    </section>
  );
}
