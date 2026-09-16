import { proxy, waNotify } from '../../../lib/waNotify';

/** Revenue stats by month + daily range */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = new URLSearchParams();
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const qs = params.toString();
  return proxy(() => waNotify(`/api/notify/orders/revenue${qs ? '?' + qs : ''}`));
}
