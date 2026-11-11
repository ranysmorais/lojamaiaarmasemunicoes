import './globals.css';
import './refinements.css';
import './introduction.css';
import './storefront.css';

export const metadata = {
  title: 'MAIA | Armas e Munições · Senador Canedo',
  description: 'Conheça a MAIA em Senador Canedo, Goiás. Loja e catálogo informativo de cutelaria e equipamentos, com descrições e características técnicas.'
};

export default function RootLayout({ children }) {
  return <html lang="pt-BR" data-theme="dark" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: `(function(){var t;try{t=localStorage.getItem('maia-theme')}catch(e){}document.documentElement.dataset.theme=t==='light'||t==='dark'?t:window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'})()` }} /></head><body>{children}</body></html>;
}
