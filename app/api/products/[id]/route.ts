import { proxy, waNotify } from '../../../lib/waNotify';

/** Update product */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  return proxy(() => waNotify(`/api/products/${id}`, { method: 'PUT', body }));
}

/** Delete product */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxy(() => waNotify(`/api/products/${id}`, { method: 'DELETE' }));
}
