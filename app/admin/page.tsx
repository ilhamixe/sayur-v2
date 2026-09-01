import { cookies } from 'next/headers';
import AdminPageClient from './AdminPageClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');

  if (!session) {
    return <AdminPageClient mode="login" />;
  }

  return <AdminPageClient mode="dashboard" />;
}
