import 'server-only';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const COOKIE_NAME = 'maia-admin';
export const SESSION_AGE = 60 * 60 * 12;
const digest = value => createHash('sha256').update(value).digest();
const signature = value => createHmac('sha256', process.env.ADMIN_SESSION_SECRET || '').update(value).digest('base64url');
export function authConfigured() { return !!(process.env.ADMIN_PASSWORD?.length >= 12 && process.env.ADMIN_SESSION_SECRET?.length >= 32); }
export function checkCredentials(email, password) {
  if (!authConfigured()) return false;
  return timingSafeEqual(digest(String(email).trim().toLowerCase()), digest((process.env.ADMIN_EMAIL || '').trim().toLowerCase())) && timingSafeEqual(digest(String(password)), digest(process.env.ADMIN_PASSWORD));
}
export function createSession() {
  const payload = Buffer.from(JSON.stringify({ email: process.env.ADMIN_EMAIL, exp: Date.now() + SESSION_AGE * 1000 })).toString('base64url');
  return `${payload}.${signature(payload)}`;
}
export async function authenticated() {
  if (!authConfigured()) return false;
  const token = (await cookies()).get(COOKIE_NAME)?.value || '';
  const [payload, mac, extra] = token.split('.');
  if (!payload || !mac || extra) return false;
  const expected = signature(payload);
  if (mac.length !== expected.length || !timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return false;
  try { const data = JSON.parse(Buffer.from(payload, 'base64url').toString()); return data.exp > Date.now() && data.email === process.env.ADMIN_EMAIL; } catch { return false; }
}
export function checkOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  const allowed = [new URL(request.url).origin];
  for (const configured of [process.env.RENDER_EXTERNAL_URL, process.env.APP_ORIGIN]) {
    if (!configured) continue;
    try { allowed.push(new URL(configured).origin); } catch { /* Ignore malformed server configuration. */ }
  }
  return allowed.includes(origin);
}
export async function readJson(request) {
  const bytes = await readBody(request, 1024 * 1024);
  try { return JSON.parse(bytes.toString('utf8')); } catch { throw new Error('Dados inválidos.'); }
}
export async function readBody(request, limit) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Envie os dados do formulário.');
  const chunks = []; let total = 0;
  while (true) { const { done, value } = await reader.read(); if (done) break; total += value.byteLength; if (total > limit) { await reader.cancel(); throw new Error('Arquivo ou formulário maior que o permitido.'); } chunks.push(Buffer.from(value)); }
  return Buffer.concat(chunks);
}
