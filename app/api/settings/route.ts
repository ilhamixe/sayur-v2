import { proxy, waNotify } from '../../lib/waNotify';

/** Get settings */
export async function GET() {
  return proxy(() => waNotify('/api/settings'));
}

/** Update settings */
export async function PUT(req: Request) {
  const body = await req.json();
  return proxy(() => waNotify('/api/settings', { method: 'PUT', body }));
}
