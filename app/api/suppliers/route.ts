import { proxy, waNotify } from '../../lib/waNotify';

export async function GET() {
  return proxy(() => waNotify('/api/suppliers'));
}

export async function POST(req: Request) {
  const body = await req.json();
  return proxy(() => waNotify('/api/suppliers', { method: 'POST', body }));
}
