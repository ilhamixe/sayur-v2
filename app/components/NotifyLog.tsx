'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Inbox, RefreshCw, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { NotifyLogRow, OutboxRow, OutboxStats } from '../types/notify';

const STATUS_STYLE: Record<OutboxRow['status'], { label: string; cls: string; Icon: React.ElementType }> =
  {
    pending: {
      label: 'Menunggu',
      cls: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
      Icon: Clock,
    },
    sent: {
      label: 'Terkirim',
      cls: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
      Icon: CheckCircle2,
    },
    failed: {
      label: 'Gagal',
      cls: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300',
      Icon: XCircle,
    },
  };

export default function NotifyLog() {
  const [outbox, setOutbox] = useState<OutboxRow[]>([]);
  const [orders, setOrders] = useState<NotifyLogRow[]>([]);
  const [stats, setStats] = useState<OutboxStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/notify');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memuat log notifikasi.');
      setOutbox(data.outbox ?? []);
      setOrders(data.orders ?? []);
      setStats(data.stats ?? null);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [load]);

  const unmappedOrders = orders.filter((o) => {
    try {
      return (JSON.parse(o.unmapped || '[]') as string[]).length > 0;
    } catch {
      return false;
    }
  });

  return (
    <section className="bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Inbox className="w-5 h-5 text-emerald-500" />
            Log Notifikasi Supplier
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Pesan diantre dulu lalu dikirim worker dengan percobaan ulang bertahap. Order tetap masuk
            walau WhatsApp sedang mati.
          </p>
        </div>
        <button
          onClick={load}
          className="p-2.5 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-300 cursor-pointer"
          title="Segarkan log"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
          <span>{error}</span>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { label: 'Total', value: stats.total ?? 0, tone: 'text-zinc-900 dark:text-white' },
            { label: 'Menunggu', value: stats.pending ?? 0, tone: 'text-amber-600 dark:text-amber-400' },
            { label: 'Terkirim', value: stats.sent ?? 0, tone: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Gagal', value: stats.failed ?? 0, tone: 'text-red-500' },
          ].map((s) => (
            <div
              key={s.label}
              className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10"
            >
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                {s.label}
              </div>
              <div className={`text-xl font-black ${s.tone}`}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {unmappedOrders.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-xs space-y-1">
          <div className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> Ada item tanpa supplier
          </div>
          {unmappedOrders.slice(0, 5).map((o) => (
            <p key={o.id} className="text-amber-800 dark:text-amber-200">
              <span className="font-mono">{o.order_id}</span>:{' '}
              {(JSON.parse(o.unmapped || '[]') as string[]).join(', ')}
            </p>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-xs text-zinc-500 py-6 text-center">Memuat log...</p>
      ) : outbox.length === 0 ? (
        <div className="text-center py-10 bg-zinc-50 dark:bg-white/[0.02] rounded-xl border border-dashed border-zinc-200 dark:border-white/10">
          <p className="text-zinc-500 text-sm">Belum ada notifikasi terkirim.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 dark:bg-white/[0.04] text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium rounded-l-xl">Order</th>
                <th className="px-4 py-3 font-medium">Supplier</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium rounded-r-xl">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {outbox.map((row) => {
                const s = STATUS_STYLE[row.status];
                return (
                  <tr
                    key={row.id}
                    className="border-b border-zinc-100 dark:border-white/5 last:border-0 hover:bg-zinc-50 dark:hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 font-mono text-xs">{row.order_id}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-xs">{row.supplier_name || '—'}</div>
                      <div className="text-[11px] text-zinc-500 font-mono">
                        {row.to_jid.replace('@s.whatsapp.net', '')}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${s.cls}`}
                      >
                        <s.Icon className="w-2.5 h-2.5" />
                        {s.label}
                        {row.attempts > 0 && ` (${row.attempts}x)`}
                      </span>
                      {row.last_error && (
                        <div className="text-[10px] text-red-500 mt-1 max-w-[240px] truncate" title={row.last_error}>
                          {row.last_error}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {new Date(row.created_at.replace(' ', 'T') + 'Z').toLocaleString('id-ID')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
