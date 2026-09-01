'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  MessageSquare,
  QrCode,
  Power,
  RotateCcw,
  Send,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';
import type { WaStatus } from '../types/notify';

const STATUS_LABEL: Record<WaStatus['status'], string> = {
  idle: 'Belum terhubung',
  qr: 'Menunggu scan QR',
  connecting: 'Menghubungkan...',
  connected: 'Terhubung',
  disconnected: 'Terputus',
  error: 'Error — perlu scan ulang',
};

const STATUS_TONE: Record<WaStatus['status'], string> = {
  idle: 'text-zinc-500',
  qr: 'text-amber-600 dark:text-amber-400',
  connecting: 'text-amber-600 dark:text-amber-400',
  connected: 'text-emerald-600 dark:text-emerald-400',
  disconnected: 'text-red-500',
  error: 'text-red-500',
};

export default function WaConnection() {
  const [status, setStatus] = useState<WaStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [pairPhone, setPairPhone] = useState('');
  const [pairCode, setPairCode] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/wa/status');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membaca status WhatsApp.');
      setStatus(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    refresh();
    // Polling ringan: QR & status berubah di sisi server (Baileys), jadi
    // dashboard perlu menarik ulang. 3s cukup responsif tanpa membebani.
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, [refresh]);

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const act = async (action: string, body?: Record<string, unknown>, okMsg?: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/wa/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body ?? {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Aksi gagal.');
      if (okMsg) flash(okMsg);
      if (action === 'pairing-code' && data.code) setPairCode(data.code);
      await refresh();
      return data;
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setBusy(false);
    }
  };

  const st = status?.status ?? 'idle';

  return (
    <section className="bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-500" />
            Koneksi WhatsApp Pengirim
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Nomor yang di-scan di sini yang mengirim notifikasi ke supplier. Pakai nomor khusus toko —
            jangan nomor yang sudah dipakai aplikasi WhatsApp-bot lain.
          </p>
        </div>
        <button
          onClick={refresh}
          className="p-2.5 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-300 cursor-pointer"
          title="Segarkan status"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Status</div>
          <div className={`text-sm font-black ${STATUS_TONE[st]}`}>{STATUS_LABEL[st]}</div>
          {status?.phoneNumber && (
            <div className="text-xs text-zinc-500 font-mono mt-0.5">{status.phoneNumber}</div>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => act('connect', {}, 'Koneksi dimulai')}
            disabled={busy || st === 'connected'}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Power className="w-4 h-4" /> Hubungkan
          </button>
          <button
            onClick={() => act('disconnect', {}, 'Koneksi diputus')}
            disabled={busy || st === 'idle'}
            className="px-4 py-2.5 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 disabled:opacity-40 text-zinc-700 dark:text-zinc-300 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Power className="w-4 h-4" /> Putuskan
          </button>
          <button
            onClick={() => {
              if (!confirm('Reset session? Nomor harus scan QR ulang dari awal.')) return;
              setPairCode(null);
              act('reset', {}, 'Session direset — scan QR ulang');
            }}
            disabled={busy}
            className="px-4 py-2.5 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 disabled:opacity-40 text-red-600 dark:text-red-300 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
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

      {status?.qr && st === 'qr' && (
        <div className="p-4 rounded-2xl bg-white border border-zinc-200 flex flex-col items-center gap-2">
          <div className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
            <QrCode className="w-4 h-4" /> Scan dari WhatsApp → Perangkat Tertaut
          </div>
          {/* QR datang sebagai data URL dari server; next/image tidak diperlukan. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={status.qr} alt="QR code pairing WhatsApp" width={260} height={260} />
          <p className="text-[11px] text-zinc-500 text-center max-w-xs">
            QR berganti otomatis tiap beberapa saat. Kalau kadaluarsa, tunggu QR berikutnya muncul.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 space-y-2">
          <label htmlFor="pair-phone" className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-emerald-500" /> Pairing Code (tanpa kamera)
          </label>
          <div className="flex gap-2">
            <input
              id="pair-phone"
              type="tel"
              value={pairPhone}
              onChange={(e) => setPairPhone(e.target.value)}
              placeholder="081234567890"
              className="flex-1 p-2.5 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/15 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => act('pairing-code', { phone: pairPhone })}
              disabled={busy || !pairPhone.trim() || st === 'connected'}
              className="px-3.5 py-2.5 bg-zinc-200 dark:bg-white/10 hover:bg-emerald-500 hover:text-white disabled:opacity-40 text-zinc-700 dark:text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Minta
            </button>
          </div>
          {pairCode && (
            <div className="text-center py-2">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Kode</div>
              <div className="text-xl font-black font-mono tracking-widest text-emerald-600 dark:text-emerald-400">
                {pairCode}
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">
                Masukkan di WhatsApp → Perangkat Tertaut → Tautkan dengan nomor telepon
              </p>
            </div>
          )}
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 space-y-2">
          <label htmlFor="test-phone" className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-emerald-500" /> Kirim Pesan Uji
          </label>
          <div className="flex gap-2">
            <input
              id="test-phone"
              type="tel"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="081234567890"
              className="flex-1 p-2.5 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/15 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => act('test', { phone: testPhone }, 'Pesan uji terkirim')}
              disabled={busy || !testPhone.trim() || !status?.ready}
              className="px-3.5 py-2.5 bg-zinc-200 dark:bg-white/10 hover:bg-emerald-500 hover:text-white disabled:opacity-40 text-zinc-700 dark:text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Kirim
            </button>
          </div>
          <p className="text-[10px] text-zinc-500">
            {status?.ready
              ? 'Pastikan pesan masuk sebelum mengandalkan notifikasi otomatis.'
              : 'Hubungkan WhatsApp dulu sebelum mengirim pesan uji.'}
          </p>
        </div>
      </div>
    </section>
  );
}
