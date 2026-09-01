'use client';

import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import AdminDashboard from './AdminDashboard';

export default function AdminPageClient({ mode }: { mode: 'login' | 'dashboard' }) {
  const [authed, setAuthed] = useState(mode === 'dashboard');

  if (authed) {
    return <AdminDashboard />;
  }

  return <LoginForm onLogin={() => setAuthed(true)} />;
}

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError('Password salah');
        setLoading(false);
        return;
      }
      onLogin();
    } catch {
      setError('Gagal menghubungi server');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/10">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white">Dashboard Admin</h1>
          <p className="text-sm text-zinc-500 mt-1">Masukkan password untuk melanjutkan</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
              className="w-full p-3 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              required
            />
          </div>
          {error && (
            <p className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
        <div className="text-center mt-4">
          <a href="/" className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
            ← Kembali ke Beranda
          </a>
        </div>
      </div>
    </div>
  );
}
