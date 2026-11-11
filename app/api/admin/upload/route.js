import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { authenticated, checkOrigin, readBody } from '../../../../lib/admin-auth';

export const runtime = 'nodejs';
export async function POST(request) {
  if (!await authenticated()) return Response.json({ error: 'Faça login para enviar fotos.' }, { status: 401 });
  if (!checkOrigin(request)) return Response.json({ error: 'Origem não permitida.' }, { status: 403 });
  try {
    const bytes = await readBody(request, 9 * 1024 * 1024);
    const form = await new Response(bytes, { headers: { 'Content-Type': request.headers.get('content-type') || '' } }).formData();
    const file = form.get('file');
    if (!(file instanceof File) || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) return Response.json({ error: 'Envie JPG, PNG ou WebP de até 8 MB.' }, { status: 400 });
    const image = await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 40000000, animated: false }).rotate().resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true }).webp({ quality: 88 }).toBuffer();
    const directory = path.join(process.cwd(), 'data', 'uploads');
    await mkdir(directory, { recursive: true });
    const name = `${randomUUID()}.webp`;
    await writeFile(path.join(directory, name), image);
    return Response.json({ url: `/uploads/${name}` });
  } catch { return Response.json({ error: 'Não foi possível ler a foto. Use um JPG, PNG ou WebP válido de até 8 MB.' }, { status: 400 }); }
}
