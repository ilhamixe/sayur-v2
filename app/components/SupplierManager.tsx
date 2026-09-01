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
import type { Supplier } from '../types/notify';

type FormState = {
  id: number | null;
  name: string;
  phone: string;
  mapping_type: 'product' | 'category';
  ref_id: string;
  active: boolean;
};

const EMPTY_FORM: FormState = {
  id: null,
  name: '',
  phone: '',
  mapping_type: 'product',
  ref_id: PRODUCTS[0]?.id ?? '',
  active: true,
};

// Kategori 'all' cuma filter tampilan katalog, bukan target supplier.
const MAPPABLE_CATEGORIES = CATEGORIES.filter((c) => c.id !== 'all');

const PRODUCT_LABEL = new Map(PRODUCTS.map((p) => [p.id, p.name]));
const CATEGORY_LABEL = new Map(MAPPABLE_CATEGORIES.map((c) => [c.id, c.label]));

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

  useEffect(() => {
    load();
  }, [load]);

  const flash = useCallback((msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2500);
  }, []);

  const refOptions = useMemo(
    () =>
      form.mapping_type === 'product'
        ? PRODUCTS.map((p) => ({ value: p.id, label: `${p.name} — ${p.categoryLabel}` }))
        : MAPPABLE_CATEGORIES.map((c) => ({ value: c.id, label: c.label })),
    [form.mapping_type]
  );

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
      mapping_type: s.mapping_type,
      ref_id: s.ref_id,
      active: s.active === 1,
    });
    setShowForm(true);
    setError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        mapping_type: form.mapping_type,
        ref_id: form.ref_id,
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
          mapping_type: s.mapping_type,
          ref_id: s.ref_id,
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
    if (!confirm(`Hapus supplier "${s.name}"? Order berikutnya tidak akan dikirim ke nomor ini.`)) {
      return;
    }
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

  const targetLabel = (s: Supplier) =>
    s.mapping_type === 'product'
      ? PRODUCT_LABEL.get(s.ref_id) ?? s.ref_id
      : CATEGORY_LABEL.get(s.ref_id) ?? s.ref_id;

  // Produk yang belum punya supplier langsung maupun lewat kategorinya.
  const unmappedProducts = useMemo(() => {
    const active = suppliers.filter((s) => s.active === 1);
    const byProduct = new Set(active.filter((s) => s.mapping_type === 'product').map((s) => s.ref_id));
    const byCategory = new Set(
      active.filter((s) => s.mapping_type === 'category').map((s) => s.ref_id)
    );
    return PRODUCTS.filter((p) => !byProduct.has(p.id) && !byCategory.has(p.category));
  }, [suppliers]);

  return (
    <section className="bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" />
            Supplier / Tukang Sayur
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Saat order masuk, tiap item dikirim ke nomor supplier-nya. Pemetaan produk didahulukan;
            kalau tidak ada, dipakai pemetaan kategori.
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

          <fieldset className="space-y-1.5">
            <legend className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Jenis Pemetaan *
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'product', label: 'Per Produk', desc: 'Satu produk tertentu', icon: Package },
                  { id: 'category', label: 'Per Kategori', desc: 'Semua produk kategori', icon: Layers },
                ] as const
              ).map((opt) => {
                const Icon = opt.icon;
                const active = form.mapping_type === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        mapping_type: opt.id,
                        ref_id:
                          opt.id === 'product'
                            ? PRODUCTS[0]?.id ?? ''
                            : MAPPABLE_CATEGORIES[0]?.id ?? '',
                      })
                    }
                    aria-pressed={active}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      active
                        ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-zinc-900 dark:text-white'
                        : 'bg-white dark:bg-white/[0.03] border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 mb-1.5 ${active ? 'text-emerald-600 dark:text-emerald-400' : ''}`}
                    />
                    <div className="text-xs font-bold">{opt.label}</div>
                    <div className="text-[10px] text-zinc-500">{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="space-y-1">
            <label htmlFor="sup-ref" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              {form.mapping_type === 'product' ? 'Produk' : 'Kategori'} Target *
            </label>
            <select
              id="sup-ref"
              required
              value={form.ref_id}
              onChange={(e) => setForm({ ...form, ref_id: e.target.value })}
              className="w-full p-2.5 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/15 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
            >
              {refOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 dark:bg-white/[0.04] text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium rounded-l-xl">Supplier</th>
                <th className="px-4 py-3 font-medium">Target</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right rounded-r-xl">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-zinc-100 dark:border-white/5 last:border-0 hover:bg-zinc-50 dark:hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3">
                    <div className="font-bold">{s.name}</div>
                    <div className="text-xs text-zinc-500 font-mono">{s.phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        s.mapping_type === 'product'
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          : 'bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300'
                      }`}
                    >
                      {s.mapping_type === 'product' ? (
                        <Package className="w-2.5 h-2.5" />
                      ) : (
                        <Layers className="w-2.5 h-2.5" />
                      )}
                      {s.mapping_type === 'product' ? 'Produk' : 'Kategori'}
                    </span>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{targetLabel(s)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] font-bold ${
                        s.active === 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'
                      }`}
                    >
                      {s.active === 1 ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && unmappedProducts.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-xs space-y-1.5">
          <div className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            {unmappedProducts.length} produk belum punya supplier
          </div>
          <p className="text-amber-700/80 dark:text-amber-200/80">
            Order yang berisi produk ini tetap masuk, tapi tidak ada notifikasi WhatsApp yang dikirim:
          </p>
          <p className="text-amber-800 dark:text-amber-200">
            {unmappedProducts.map((p) => p.name).join(', ')}
          </p>
        </div>
      )}
    </section>
  );
}
