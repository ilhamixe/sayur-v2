'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings, ShoppingBag, Save, CheckCircle2, Trash2, LogOut } from 'lucide-react';
import SupplierManager from '../components/SupplierManager';
import WaConnection from '../components/WaConnection';
import NotifyLog from '../components/NotifyLog';

interface Order {
  id: string;
  date: string;
  customer: string;
  phone: string;
  address: string;
  total: number;
  status: string;
}

export default function AdminDashboard() {
  const [waNumber, setWaNumber] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedWa = localStorage.getItem('adminWhatsApp');
    if (savedWa) setWaNumber(savedWa);
    const savedOrders = JSON.parse(localStorage.getItem('sayur_orders') || '[]');
    setOrders(savedOrders.reverse());
  }, []);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin';
  };

  const handleSaveWa = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('adminWhatsApp', waNumber);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleDeleteOrder = (id: string) => {
    if (!confirm('Yakin ingin menghapus pesanan ini?')) return;
    const newOrders = orders.filter(o => o.id !== id);
    setOrders(newOrders);
    localStorage.setItem('sayur_orders', JSON.stringify([...newOrders].reverse()));
  };

  const handleClearAll = () => {
    if (!confirm('Yakin ingin menghapus SEMUA pesanan?')) return;
    setOrders([]);
    localStorage.setItem('sayur_orders', '[]');
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="p-2 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">Dashboard Admin</h1>
              <p className="text-xs text-zinc-500">Kelola toko Sayur Sukabumi Anda</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-zinc-600 dark:text-zinc-400">Total Pesanan</h3>
            </div>
            <p className="text-3xl font-black">{orders.length}</p>
          </div>
          <div className="bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-lg">
                <Settings className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-zinc-600 dark:text-zinc-400">Total Pendapatan</h3>
            </div>
            <p className="text-3xl font-black">{formatRupiah(totalRevenue)}</p>
          </div>
        </div>

        {/* WhatsApp Config Section */}
        <section className="bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-500" />
              Pengaturan WhatsApp
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Nomor WhatsApp ini akan menerima pesanan baru dari pelanggan.</p>
          </div>
          
          <form onSubmit={handleSaveWa} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 block">Nomor Admin (Gunakan format 62...)</label>
              <input
                type="tel"
                value={waNumber}
                onChange={(e) => setWaNumber(e.target.value)}
                placeholder="6281234567890"
                className="w-full p-3 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {isSaved ? 'Tersimpan' : 'Simpan'}
              </button>
            </div>
          </form>
        </section>

        <WaConnection />
        <SupplierManager />
        <NotifyLog />

        {/* Orders List Section */}
        <section className="bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-500" />
              Riwayat Pesanan
            </h2>
            {orders.length > 0 && (
              <button 
                onClick={handleClearAll}
                className="text-xs font-bold text-red-500 hover:text-red-600 px-3 py-1.5 bg-red-50 dark:bg-red-500/10 rounded-lg transition-colors"
              >
                Hapus Semua
              </button>
            )}
          </div>
          
          {orders.length === 0 ? (
            <div className="text-center py-10 bg-zinc-50 dark:bg-white/[0.02] rounded-xl border border-dashed border-zinc-200 dark:border-white/10">
              <p className="text-zinc-500 text-sm">Belum ada pesanan.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-zinc-50 dark:bg-white/[0.04] text-zinc-500 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-3 font-medium rounded-l-xl">ID Pesanan</th>
                    <th className="px-4 py-3 font-medium">Tanggal</th>
                    <th className="px-4 py-3 font-medium">Pelanggan</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium text-right rounded-r-xl">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-zinc-100 dark:border-white/5 last:border-0 hover:bg-zinc-50 dark:hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-mono text-xs">{order.id}</td>
                      <td className="px-4 py-3 text-xs">{new Date(order.date).toLocaleString('id-ID')}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold">{order.customer}</div>
                        <div className="text-xs text-zinc-500">{order.phone}</div>
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                        {formatRupiah(order.total)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Hapus Pesanan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
