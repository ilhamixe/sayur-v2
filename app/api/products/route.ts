import { proxy, waNotify } from '../../lib/waNotify';

/** List products (public or admin) */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const admin = url.searchParams.get('admin');
  return proxy(() => waNotify(`/api/products${admin ? '?admin=1' : ''}`));
}

/** Create product */
export async function POST(req: Request) {
  const body = await req.json();
  return proxy(() => waNotify('/api/products', { method: 'POST', body }));
}
