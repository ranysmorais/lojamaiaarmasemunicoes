import { authenticated, checkOrigin, readJson } from '../../../lib/admin-auth';
import { listCategories, listProducts } from '../../../lib/database';
import { saveCategory, saveProduct, removeItem, ValidationError } from '../../../lib/admin-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const snapshot = () => ({ categories: listCategories(), products: listProducts() });
export async function GET() {
  if (!await authenticated()) return Response.json({ error: 'Faça login para continuar.' }, { status: 401 });
  return Response.json(snapshot(), { headers: { 'Cache-Control': 'no-store' } });
}
export async function POST(request) {
  if (!await authenticated()) return Response.json({ error: 'Sua sessão expirou. Entre novamente.' }, { status: 401 });
  if (!checkOrigin(request)) return Response.json({ error: 'Origem não permitida.' }, { status: 403 });
  try {
    const { action, data } = await readJson(request);
    if (action === 'save-product') saveProduct(data);
    else if (action === 'save-category') saveCategory(data);
    else if (action === 'delete-product') removeItem('product', data.id);
    else if (action === 'delete-category') removeItem('category', data.id);
    else throw new ValidationError('Operação desconhecida.');
    return Response.json(snapshot(), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof ValidationError) return Response.json({ error: error.message }, { status: 400 });
    console.error('Admin mutation failed:', error.message);
    return Response.json({ error: 'Não foi possível salvar. Confira os dados e tente novamente.' }, { status: 400 });
  }
}
