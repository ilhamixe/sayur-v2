import { NextResponse } from 'next/server';
import { proxy, waNotify } from '../../../lib/waNotify';

type Ctx = { params: Promise<{ action: string }> };

const GET_ACTIONS = new Set(['status', 'groups']);
const POST_ACTIONS = new Set(['connect', 'disconnect', 'reset', 'pairing-code', 'test']);

export async function GET(_req: Request, { params }: Ctx) {
  const { action } = await params;
  if (!GET_ACTIONS.has(action)) {
    return NextResponse.json({ error: 'Aksi tidak dikenal.' }, { status: 404 });
  }
  return proxy(() => waNotify(`/api/wa/${action}`));
}

export async function POST(req: Request, { params }: Ctx) {
  const { action } = await params;
  if (!POST_ACTIONS.has(action)) {
    return NextResponse.json({ error: 'Aksi tidak dikenal.' }, { status: 404 });
  }
  const body = await req.json().catch(() => ({}));
  return proxy(() => waNotify(`/api/wa/${action}`, { method: 'POST', body }));
}
