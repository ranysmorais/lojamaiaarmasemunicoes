import { authenticated, authConfigured } from '../../lib/admin-auth';
import { listCategories, listProducts } from '../../lib/database';
import AdminLogin from '../../components/admin/AdminLogin';
import AdminDashboard from '../../components/admin/AdminDashboard';
import './admin.css';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const metadata = { title: 'Administração | MAIA', robots: { index: false, follow: false } };
export default async function AdminPage() {
  if (!await authenticated()) return <AdminLogin configured={authConfigured()} />;
  return <AdminDashboard initialProducts={listProducts()} initialCategories={listCategories()} />;
}
