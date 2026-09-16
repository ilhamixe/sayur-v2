import { proxy, waNotify } from '../../lib/waNotify';

/** List vouchers (public or admin) */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const admin = url.searchParams.get('admin');
  return proxy(() => waNotify(`/api/vouchers${admin ? '?admin=1' : ''}`));
}

/** Create voucher */
export async function POST(req: Request) {
  const body = await req.json();
  return proxy(() => waNotify('/api/vouchers', { method: 'POST', body }));
}
