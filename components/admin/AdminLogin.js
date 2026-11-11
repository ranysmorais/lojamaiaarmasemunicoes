'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '../ThemeToggle';

export default function AdminLogin({ configured }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  async function submit(event) {
    event.preventDefault(); setPending(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/admin/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.get('email'), password: form.get('password') }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      router.refresh();
    } catch (error) { setError(error.message || 'Não foi possível entrar.'); setPending(false); }
  }
  return <main className="admin-login"><div className="admin-login-top"><a href="/">← Voltar para a loja</a><ThemeToggle /></div><section className="login-card"><img src="/maia-logo.svg" width="90" height="90" alt="MAIA" /><p className="eyebrow">ÁREA ADMINISTRATIVA</p><h1>Seu catálogo,<br /><em>sob controle.</em></h1><p>Gerencie os itens, as fotos e as categorias da Maia.</p>{!configured ? <p className="admin-error">Configure ADMIN_EMAIL, ADMIN_PASSWORD e ADMIN_SESSION_SECRET no servidor antes de acessar.</p> : <form onSubmit={submit}><label>E-mail<input name="email" type="email" autoComplete="username" required placeholder="Seu e-mail de acesso" /></label><label>Senha<input name="password" type="password" autoComplete="current-password" required placeholder="Sua senha" /></label>{error && <p className="admin-error" role="alert">{error}</p>}<button className="admin-primary" disabled={pending}>{pending ? 'Entrando…' : 'Entrar no painel'} <span aria-hidden="true">↗</span></button></form>}<p className="login-footnote">Acesso exclusivo à administração da loja.</p></section></main>;
}
