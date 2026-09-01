/**
 * Klien server-side ke wa-notify.
 *
 * API_TOKEN wa-notify TIDAK boleh sampai ke browser. Semua panggilan lewat
 * route handler Next (server) yang menyuntikkan token dari env.
 */
import { NextResponse } from 'next/server';

const BASE = process.env.WA_NOTIFY_URL || 'http://127.0.0.1:3201';
const TOKEN = process.env.WA_NOTIFY_TOKEN || '';

export class WaNotifyError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = 'WaNotifyError';
    this.status = status;
  }
}

export async function waNotify<T = unknown>(
  path: string,
  init: { method?: string; body?: unknown } = {}
): Promise<T> {
  if (!TOKEN) {
    throw new WaNotifyError('WA_NOTIFY_TOKEN belum diset di server.', 500);
  }

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: init.method || 'GET',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
      cache: 'no-store',
    });
  } catch {
    throw new WaNotifyError('Layanan wa-notify tidak bisa dihubungi. Pastikan sudah jalan.', 503);
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new WaNotifyError((data as { error?: string }).error || 'Permintaan gagal.', res.status);
  }
  return data as T;
}

/** Bungkus handler route: error wa-notify jadi JSON rapi, bukan stack trace. */
export async function proxy<T>(fn: () => Promise<T>) {
  try {
    return NextResponse.json(await fn());
  } catch (err) {
    const e = err as WaNotifyError;
    const status = e?.status && e.status >= 400 && e.status < 600 ? e.status : 502;
    return NextResponse.json({ error: e?.message || 'Gagal menghubungi wa-notify.' }, { status });
  }
}
