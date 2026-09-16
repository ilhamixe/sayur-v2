import { proxy, waNotify } from '../../../lib/waNotify';

/** Update voucher */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  return proxy(() => waNotify(`/api/vouchers/${id}`, { method: 'PUT', body }));
}

/** Delete voucher */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxy(() => waNotify(`/api/vouchers/${id}`, { method: 'DELETE' }));
}
