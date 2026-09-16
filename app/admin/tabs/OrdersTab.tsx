'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag, Save, CheckCircle2, Trash2,
  Clock, Check, Truck, Package, XCircle, ChevronDown, MapPin, ExternalLink,
  Download, Filter
} from 'lucide-react';

interface Order {
  id: number;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  note: string;
  delivery_slot: string;
  payment_method: string;
  lat: number | null;
  lng: number | null;
  total: number;
  status: string;
  created_at: string;
  updated_at: string;
  courier_name: string | null;
  items: OrderItem[];
}

interface OrderItem {
  product_id: string;
  category: string;
  name: string;
  qty: number;
  price: number;
  unit: string;
}

interface OrderStats {
  total: number;
  pending: number;
  confirmed: number;
  preparing: number;
  shipping: number;
  delivered: number;
  cancelled: number;
  revenue: number;
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

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [revenueData, setRevenueData] = useState<{ month: string; total_orders: number; revenue: number; delivered: number }[]>([]);

  const loadOrders = useCallback(async (from?: string, to?: string) => {
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const qs = params.toString();
      const res = await fetch(`/api/orders${qs ? '?' + qs : ''}`);
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

  const loadRevenue = useCallback(async () => {
    try {
      const res = await fetch('/api/orders/revenue');
      const data = await res.json();
      if (res.ok) setRevenueData(data.monthly ?? []);
    } catch {}
  }, []);

  useEffect(() => { loadOrders(); loadRevenue(); }, [loadOrders, loadRevenue]);

  const applyFilter = () => {
    setLoading(true);
    loadOrders(dateFrom || undefined, dateTo || undefined);
  };

  const clearFilter = () => {
    setDateFrom('');
    setDateTo('');
    setLoading(true);
    loadOrders();
  };

  const exportExcel = () => {
    const rows = orders.map((o) => ({
      'No. Order': o.order_id,
      'Tanggal': new Date(o.created_at).toLocaleString('id-ID'),
      'Pelanggan': o.customer_name || '-',
      'Telepon': o.customer_phone || '-',
      'Alamat': o.address || '-',
      'Slot Antar': o.delivery_slot || '-',
      'Pembayaran': o.payment_method?.toUpperCase() || '-',
      'Kurir': o.courier_name || '-',
      'Status': o.status,
      'Total': o.total,
      'Item': o.items.map((it) => `${it.name} ${it.qty}x`).join(', ') || '-',
    }));

    import('xlsx').then((XLSX) => {
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Pesanan');
      XLSX.writeFile(wb, `pesanan_${dateFrom || 'semua'}_${dateTo || 'semua'}.xlsx`);
    });
  };

  const updateStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });
      if (res.ok) await loadOrders(dateFrom || undefined, dateTo || undefined);
    } catch (err) {
      console.error('Gagal update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-5">
      {/* Stats */}
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
          <p className="text-xl font-black">{formatRupiah(stats?.revenue ?? 0)}</p>
        </div>
      </div>

      {/* Date Filter & Export */}
      <section className="bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-500" />
            Filter & Export
          </h2>
          <button onClick={exportExcel} className="px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg flex items-center gap-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors cursor-pointer">
            <Download className="w-3.5 h-3.5" />
            Export Excel
          </button>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Dari Tanggal</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Sampai</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors" />
          </div>
          <button onClick={applyFilter} className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer">
            Terapkan
          </button>
          {(dateFrom || dateTo) && (
            <button onClick={clearFilter} className="px-3 py-2 text-xs font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer">
              Reset
            </button>
          )}
        </div>
      </section>

      {/* Revenue by Month */}
      {revenueData.length > 0 && (
        <section className="bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold mb-3">Statistik Pendapatan Bulanan</h2>
          <div className="space-y-2">
            {revenueData.map((m) => {
              const maxRev = Math.max(...revenueData.map((r) => r.revenue), 1);
              const pct = Math.round((m.revenue / maxRev) * 100);
              return (
                <div key={m.month} className="flex items-center gap-3 text-xs">
                  <span className="w-20 font-mono font-bold text-zinc-600 dark:text-zinc-400 shrink-0">{m.month}</span>
                  <div className="flex-1 h-6 bg-zinc-100 dark:bg-white/[0.03] rounded-lg overflow-hidden relative">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-lg transition-all" style={{ width: `${pct}%` }} />
                    <span className="absolute inset-0 flex items-center px-2 font-bold text-zinc-700 dark:text-zinc-200">{m.total_orders} order</span>
                  </div>
                  <span className="w-28 text-right font-bold text-emerald-600 dark:text-emerald-400 shrink-0">{formatRupiah(m.revenue)}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Orders List */}
      <section className="bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-500" />
            Riwayat Pesanan
          </h2>
          <button onClick={() => loadOrders(dateFrom || undefined, dateTo || undefined)} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg transition-colors">
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
                        {order.lat && order.lng && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                            <MapPin className="w-2.5 h-2.5 inline mr-0.5" />
                            Ada Peta
                          </span>
                        )}
                        {order.courier_name && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400">
                            🚚 {order.courier_name}
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
                      {order.items.length > 0 && (
                        <button
                          onClick={() => setExpandedOrder(expandedOrder === order.order_id ? null : order.order_id)}
                          className="mt-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 cursor-pointer hover:underline"
                        >
                          {expandedOrder === order.order_id ? 'Tutup' : `Rincian (${order.items.length})`}
                          <ChevronDown className={`w-3 h-3 transition-transform ${expandedOrder === order.order_id ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>

                  {expandedOrder === order.order_id && (
                    <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-white/5 space-y-3">
                      <div>
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Rincian Item</div>
                        <div className="space-y-1">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-xs bg-zinc-50 dark:bg-white/[0.03] rounded-lg px-3 py-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-zinc-700 dark:text-zinc-300 font-medium">{item.name}</span>
                                <span className="text-zinc-400">x{item.qty}{item.unit ? ` ${item.unit}` : ''}</span>
                                {item.category && <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-white/5 text-zinc-400">{item.category}</span>}
                              </div>
                              <span className="text-zinc-500 font-medium">{formatRupiah(item.price * item.qty)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {order.address && (
                          <div className="bg-zinc-50 dark:bg-white/[0.03] rounded-lg px-3 py-2">
                            <div className="text-[10px] font-bold text-zinc-400 mb-0.5">Alamat</div>
                            <div className="text-zinc-700 dark:text-zinc-300">{order.address}</div>
                          </div>
                        )}
                        {order.note && (
                          <div className="bg-zinc-50 dark:bg-white/[0.03] rounded-lg px-3 py-2">
                            <div className="text-[10px] font-bold text-zinc-400 mb-0.5">Catatan</div>
                            <div className="text-zinc-700 dark:text-zinc-300">{order.note}</div>
                          </div>
                        )}
                      </div>
                      {order.lat && order.lng && (
                        <div>
                          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Lokasi Pelanggan</div>
                          <div className="flex items-center gap-2">
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${order.lat},${order.lng}&travelmode=driving`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                            >
                              <MapPin className="w-3 h-3" />
                              Buka Rute di Google Maps
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <span className="text-[10px] text-zinc-400">{order.lat.toFixed(6)}, {order.lng.toFixed(6)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

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
  );
}
