'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Settings, ShoppingBag, Save, CheckCircle2, Trash2, LogOut,
  Clock, Check, Truck, Package, XCircle, ChevronDown
} from 'lucide-react';
import SupplierManager from '../components/SupplierManager';
import WaConnection from '../components/WaConnection';
import NotifyLog from '../components/NotifyLog';

interface Order {
  id: number;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  note: string;
  delivery_slot: string;
  payment_method: string;
  total: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface OrderStats {
  total: number;
  pending: number;
  confirmed: number;
  preparing: number;
  shipping: number;
  delivered: number;
  cancelled: number;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-500/20' },
  { value: 'confirmed', label: 'Dikonfirmasi', icon: Check, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/20' },
  { value: 'preparing', label: 'Disiapkan', icon: Package, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-500/20' },
  { value: 'shipping', label: 'Dikirim', icon: Truck, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-500/20' },
  { value: 'delivered', label: 'Selesai', icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/20' },
  { value: 'cancelled', label: 'Dibatalkan', icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-500/20' },
];

const STATUS_MAP = Object.fromEntries(STATUS_OPTIONS.map(s => [s.value, s]));

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders ?? []);
        setStats(data.stats ?? null);
      }
    } catch (err) {
      console.error('Gagal memuat orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin';
  };

  const updateStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });
      if (res.ok) await loadOrders();
    } catch (err) {
      console.error('Gagal update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">Dashboard Admin</h1>
              <p className="text-xs text-zinc-500">Kelola toko Sayur Sukabumi Anda</p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors" title="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-bold text-zinc-500 mb-1">Total Pesanan</div>
            <p className="text-2xl font-black">{stats?.total ?? 0}</p>
          </div>
          <div className="bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-bold text-amber-600 mb-1">Pending</div>
            <p className="text-2xl font-black text-amber-600">{stats?.pending ?? 0}</p>
          </div>
          <div className="bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-bold text-emerald-600 mb-1">Selesai</div>
            <p className="text-2xl font-black text-emerald-600">{stats?.delivered ?? 0}</p>
          </div>
          <div className="bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-bold text-zinc-500 mb-1">Pendapatan</div>
            <p className="text-xl font-black">{formatRupiah(totalRevenue)}</p>
          </div>
        </div>

        <WaConnection />
        <SupplierManager />
        <NotifyLog />

        {/* Orders List */}
        <section className="bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-500" />
              Riwayat Pesanan
            </h2>
            <button onClick={loadOrders} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg transition-colors">
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-xs text-zinc-500 py-6 text-center">Memuat pesanan...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-10 bg-zinc-50 dark:bg-white/[0.02] rounded-xl border border-dashed border-zinc-200 dark:border-white/10">
              <p className="text-zinc-500 text-sm">Belum ada pesanan.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.map((order) => {
                const st = STATUS_MAP[order.status] || STATUS_MAP.pending;
                const StatusIcon = st.icon;
                return (
                  <div key={order.order_id} className="p-4 rounded-xl border border-zinc-100 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-zinc-600 dark:text-zinc-400">#{order.order_id}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${st.bg} ${st.color}`}>
                            <StatusIcon className="w-2.5 h-2.5 inline mr-1" />
                            {st.label}
                          </span>
                          {order.payment_method && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-white/5 text-zinc-500">
                              {order.payment_method.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-bold mt-1">{order.customer_name || 'Tanpa Nama'}</div>
                        <div className="text-xs text-zinc-500">{order.customer_phone} &middot; {order.delivery_slot}</div>
                        {order.address && <div className="text-xs text-zinc-400 mt-0.5 truncate max-w-md">{order.address}</div>}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">{formatRupiah(order.total)}</div>
                        <div className="text-[10px] text-zinc-400">{new Date(order.created_at).toLocaleString('id-ID')}</div>
                      </div>
                    </div>

                    {/* Status changer */}
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-zinc-100 dark:border-white/5">
                      {STATUS_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const active = order.status === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => updateStatus(order.order_id, opt.value)}
                            disabled={updatingId === order.order_id}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40 ${
                              active
                                ? `${opt.bg} ${opt.color}`
                                : 'bg-zinc-50 dark:bg-white/[0.03] text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10'
                            }`}
                          >
                            <Icon className="w-3 h-3" />
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
