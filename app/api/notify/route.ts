import { proxy, waNotify } from '../../lib/waNotify';

/** Checkout memanggil ini saat order dibuat — item diteruskan ke supplier. */
export async function POST(req: Request) {
  const body = await req.json();
  return proxy(() => waNotify('/api/notify', { method: 'POST', body }));
}

/** Log pengiriman untuk dashboard admin. */
export async function GET(req: Request) {
  const orderId = new URL(req.url).searchParams.get('orderId');
  const path = orderId
    ? `/api/notify/logs/${encodeURIComponent(orderId)}`
    : '/api/notify/logs?limit=50';
  return proxy(() => waNotify(path));
}
