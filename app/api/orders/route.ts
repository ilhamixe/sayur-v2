import { proxy, waNotify } from '../../lib/waNotify';

/** Orders list + stats */
export async function GET() {
  return proxy(() => waNotify('/api/notify/orders'));
}

/** Update order status */
export async function PUT(req: Request) {
  const body = await req.json();
  return proxy(() => waNotify(`/api/notify/orders/${encodeURIComponent(body.orderId)}/status`, {
    method: 'PUT',
    body: { status: body.status },
  }));
}
