import { NextResponse } from 'next/server';
import { authConfigured, authenticated, checkCredentials, checkOrigin, createSession, COOKIE_NAME, SESSION_AGE, readJson } from '../../../../lib/admin-auth';

export const runtime = 'nodejs';
const attempts = globalThis.__maiaLoginAttempts ||= { count: 0, reset: 0 };
export async function POST(request) {
  if (!checkOrigin(request)) return NextResponse.json({ error: 'Origem não permitida.' }, { status: 403 });
  if (!authConfigured()) return NextResponse.json({ error: 'Configure as credenciais administrativas no servidor.' }, { status: 503 });
  if (attempts.reset < Date.now()) { attempts.count = 0; attempts.reset = Date.now() + 15 * 60 * 1000; }
  if (attempts.count >= 20) return NextResponse.json({ error: 'Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.' }, { status: 429 });
  try {
    const input = await readJson(request);
    attempts.count++;
    if (!checkCredentials(input.email, input.password)) return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 });
    attempts.count = 0;
    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, createSession(), { httpOnly: true, sameSite: 'strict', secure: process.env.RENDER === 'true' || new URL(request.url).protocol === 'https:', path: '/', maxAge: SESSION_AGE });
    return response;
  } catch { return NextResponse.json({ error: 'Não foi possível processar o acesso.' }, { status: 400 }); }
}
export async function DELETE(request) {
  if (!checkOrigin(request) || !await authenticated()) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, '', { httpOnly: true, sameSite: 'strict', path: '/', maxAge: 0 });
  return response;
}
