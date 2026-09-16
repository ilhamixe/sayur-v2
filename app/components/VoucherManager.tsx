'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

interface Voucher {
  id: number;
  code: string;
  discount_percent: number;
  min_spend: number;
  description: string;
  active: number;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  created_at: string;
}

const EMPTY_VOUCHER = {
  code: '',
  discount_percent: 15,
  min_spend: 50000,
  description: '',
  active: 1,
  max_uses: 0,
  expires_at: null as string | null,
};

function formatRupiah(num: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
}

export default function VoucherManager() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_VOUCHER);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadVouchers = useCallback(async () => {
    try {
      const res = await fetch('/api/vouchers?admin=1');
      const data = await res.json();
      if (res.ok) setVouchers(data.vouchers || []);
    } catch {}
  }, []);

  useEffect(() => { loadVouchers(); }, [loadVouchers]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/vouchers/${editingId}` : '/api/vouchers';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan voucher');
        return;
      }
      setIsAdding(false);
      setEditingId(null);
      setForm(EMPTY_VOUCHER);
      loadVouchers();
    } catch {
      setError('Gagal menghubungi server');
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus voucher ini?')) return;
    try {
      await fetch(`/api/vouchers/${id}`, { method: 'DELETE' });
      loadVouchers();
    } catch {}
  };

  const handleToggleActive = async (v: Voucher) => {
    try {
      await fetch(`/api/vouchers/${v.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...v, active: v.active ? 0 : 1 }),
      });
      loadVouchers();
    } catch {}
  };

  const startEdit = (v: Voucher) => {
    setEditingId(v.id);
    setIsAdding(true);
    setForm({
      code: v.code,
      discount_percent: v.discount_percent,
      min_spend: v.min_spend,
      description: v.description,
      active: v.active,
      max_uses: v.max_uses,
      expires_at: v.expires_at,
    });
  };

  const startAdd = () => {
    setEditingId(null);
    setIsAdding(true);
    setForm(EMPTY_VOUCHER);
  };

  const cancelForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setForm(EMPTY_VOUCHER);
    setError('');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-500" />
            Voucher
          </h3>
          <p className="text-[11px] text-zinc-500">Kelola voucher diskon untuk pelanggan.</p>
        </div>
        <button
          onClick={startAdd}
          className="px-3 py-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg flex items-center gap-1 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Tambah Voucher
        </button>
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 space-y-3">
          <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
            {editingId ? 'Edit Voucher' : 'Tambah Voucher Baru'}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Kode Voucher</label>
              <input
                type="text"
                placeholder="SEGARHEMAT"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full p-2 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Diskon (%)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={form.discount_percent}
                onChange={(e) => setForm({ ...form, discount_percent: Number(e.target.value) })}
                className="w-full p-2 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Min. Belanja (Rp)</label>
              <input
                type="number"
                min="0"
                value={form.min_spend}
                onChange={(e) => setForm({ ...form, min_spend: Number(e.target.value) })}
                className="w-full p-2 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Maks. Pemakaian (0=unlimited)</label>
              <input
                type="number"
                min="0"
                value={form.max_uses}
                onChange={(e) => setForm({ ...form, max_uses: Number(e.target.value) })}
                className="w-full p-2 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Deskripsi</label>
            <input
              type="text"
              placeholder="Diskon 15% untuk belanja minimal Rp 50.000"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-2 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
          {error && <div className="text-[11px] text-red-500 font-bold">{error}</div>}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !form.code}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition-colors"
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button
              onClick={cancelForm}
              className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 rounded-lg transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Voucher List */}
      <div className="space-y-2">
        {vouchers.length === 0 && (
          <div className="text-center py-8 text-xs text-zinc-400">Belum ada voucher</div>
        )}
        {vouchers.map((v) => (
          <div
            key={v.id}
            className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
              v.active
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
                : 'bg-zinc-50 dark:bg-white/[0.02] border-zinc-200 dark:border-white/10 opacity-60'
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 font-mono">{v.code}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  {v.discount_percent}% OFF
                </span>
                {v.max_uses > 0 && (
                  <span className="text-[10px] text-zinc-400">
                    ({v.used_count}/{v.max_uses} terpakai)
                  </span>
                )}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5 truncate">{v.description}</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">
                Min. belanja {formatRupiah(v.min_spend)}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <button
                onClick={() => handleToggleActive(v)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                title={v.active ? 'Nonaktifkan' : 'Aktifkan'}
              >
                {v.active ? (
                  <ToggleRight className="w-5 h-5 text-emerald-500" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-zinc-400" />
                )}
              </button>
              <button
                onClick={() => startEdit(v)}
                className="px-2 py-1 text-[10px] font-bold text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(v.id)}
                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
