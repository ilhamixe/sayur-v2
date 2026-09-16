import { NextResponse } from 'next/server';

const BASE = process.env.WA_NOTIFY_URL || 'http://127.0.0.1:3201';
const TOKEN = process.env.WA_NOTIFY_TOKEN || '';

/** Upload image to wa-notify */
export async function POST(req: Request) {
  if (!TOKEN) {
    return NextResponse.json({ error: 'WA_NOTIFY_TOKEN belum diset.' }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const res = await fetch(`${BASE}/api/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}` },
      body: formData,
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Gagal upload ke wa-notify.' }, { status: 502 });
  }
}
