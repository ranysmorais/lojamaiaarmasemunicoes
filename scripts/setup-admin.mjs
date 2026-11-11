import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

let content = existsSync('.env.local') ? readFileSync('.env.local', 'utf8') : '';
const defaults = { ADMIN_EMAIL: 'admin@maia.local', ADMIN_PASSWORD: randomBytes(18).toString('base64url'), ADMIN_SESSION_SECRET: randomBytes(48).toString('hex') };
let changed = false;
for (const [name, value] of Object.entries(defaults)) {
  const pattern = new RegExp(`^${name}=(.*)$`, 'm');
  const found = content.match(pattern);
  if (!found || !found[1].trim()) {
    if (found) content = content.replace(pattern, `${name}=${value}`);
    else content += `\n${name}=${value}\n`;
    changed = true;
  }
}
if (changed) writeFileSync('.env.local', content);
console.log(changed ? 'Credenciais administrativas criadas em .env.local. Mantenha esse arquivo privado.' : 'Credenciais existentes preservadas. Consulte .env.local para acessar o painel.');
