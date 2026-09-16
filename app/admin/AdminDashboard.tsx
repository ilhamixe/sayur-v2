'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, LogOut, ShoppingBag, Package, Users, Settings, Tag } from 'lucide-react';
import OrdersTab from './tabs/OrdersTab';
import ProductManager from '../components/ProductManager';
import SupplierManager from '../components/SupplierManager';
import VoucherManager from '../components/VoucherManager';
import SettingsTab from './tabs/SettingsTab';

const TABS = [
  { id: 'orders', label: 'Pesanan', icon: ShoppingBag },
  { id: 'products', label: 'Produk', icon: Package },
  { id: 'suppliers', label: 'Supplier', icon: Users },
  { id: 'vouchers', label: 'Voucher', icon: Tag },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
] as const;

type TabId = typeof TABS[number]['id'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('orders');

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin';
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-zinc-50 dark:bg-[#09090b] border-b border-zinc-200 dark:border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-black text-emerald-600 dark:text-emerald-400">Dashboard Admin</h1>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors" title="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="flex gap-1 -mb-px">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors border border-b-0 ${
                    active
                      ? 'bg-white dark:bg-white/[0.05] border-zinc-200 dark:border-white/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-transparent border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-white/50 dark:hover:bg-white/[0.02]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6">
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'products' && <ProductManager />}
        {activeTab === 'suppliers' && <SupplierManager />}
        {activeTab === 'vouchers' && <VoucherManager />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}
