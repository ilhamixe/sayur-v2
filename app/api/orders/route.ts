import { proxy, waNotify } from '../../lib/waNotify';

/** Orders list + stats */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = new URLSearchParams();
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const qs = params.toString();
  return proxy(() => waNotify(`/api/notify/orders${qs ? '?' + qs : ''}`));
}

/** Update order status */
export async function PUT(req: Request) {
  const body = await req.json();
  return proxy(() => waNotify(`/api/notify/orders/${encodeURIComponent(body.orderId)}/status`, {
    method: 'PUT',
    body: { status: body.status },
  }));
}
