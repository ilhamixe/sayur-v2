import { proxy, waNotify } from '../../../lib/waNotify';

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json();
  return proxy(() => waNotify(`/api/suppliers/${encodeURIComponent(id)}`, { method: 'PUT', body }));
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  return proxy(() => waNotify(`/api/suppliers/${encodeURIComponent(id)}`, { method: 'DELETE' }));
}
