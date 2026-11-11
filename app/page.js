import Catalog from '../components/Catalog';
import { publicProducts } from '../lib/database';
import ThemeToggle from '../components/ThemeToggle';

function Brand({ small = false }) {
  return <a className={`brand ${small ? 'brand-small' : ''}`} href="#inicio" aria-label="MAIA, início"><img className="brand-logo" src="/maia-logo.svg" alt="" width="200" height="200" /><span className="brand-type">MAIA<small>ARMAS E MUNIÇÕES</small></span></a>;
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export default function Page() {
  const products = publicProducts();
  return <>
    <a className="skip" href="#conteudo">Pular para o conteúdo</a>
    <div className="topline"><span> SENADOR CANEDO · GOIÁS</span><span>INFORMAÇÃO & TRADIÇÃO</span></div>
    <header><div className="shell header-inner"><Brand /><div className="header-actions"><nav aria-label="Navegação principal"><a href="#loja">Loja</a><a href="#sobre">A Maia</a><a href="#localizacao">Localização <span aria-hidden="true">↗</span></a></nav><a className="admin-login-link" href="/admin" aria-label="Entrar no painel do administrador"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg><span>Admin</span></a><ThemeToggle /></div></div></header>
    <main id="conteudo">
      <section className="introduction" id="inicio" aria-labelledby="intro-title">
        <div className="shell intro-grid">
          <div className="intro-copy">
            <p className="eyebrow"><span /> MAIA ARMAS E MUNIÇÕES</p>
            <h1 id="intro-title">A MAIA,<br /><em>de perto.</em></h1>
            <p className="intro-description">Nossa identidade tem endereço. Conheça o espaço da Maia em Senador Canedo e explore nossa loja.</p>
            <div className="intro-actions"><a className="button" href="#loja">Conhecer a loja <span aria-hidden="true">↗</span></a><a className="intro-location-link" href="#localizacao">Onde estamos <span aria-hidden="true">↓</span></a></div>
            <div className="intro-signature"><span className="signature-line" /><span>CUTELARIA · EQUIPAMENTOS · INFORMAÇÃO</span></div>
          </div>
          <figure className="store-feature">
            <div className="store-photo-heading"><span><i aria-hidden="true" /> NOSSO ESPAÇO</span><span>SENADOR CANEDO / GO</span></div>
            <div className="store-photo"><img src="/img/loja.png" alt="Interior da loja Maia, com área de atendimento, poltronas e vitrines de equipamentos" width="1257" height="734" fetchPriority="high" /><span className="store-photo-index" aria-hidden="true">01 — MAIA</span></div>
            <figcaption className="store-caption"><div><span className="store-caption-label">DE PORTAS ABERTAS PARA O CONHECIMENTO</span><p>Um espaço. Nossa identidade.</p></div><a href="#localizacao" aria-label="Ver localização da Maia"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg></a></figcaption>
            <div className="store-address"><span>Vila São Sebastião</span><span>Rua 101 com 115 · Qd 64, Lt 01</span></div>
          </figure>
        </div>
      </section>
      <div className="ticker" aria-hidden="true"><div className="shell">CUTELARIA <span>✳</span> EQUIPAMENTOS <span>✳</span> CONHECIMENTO <span>✳</span> MAIA</div></div>
      <section className="shell catalog-section" id="loja" aria-labelledby="store-title"><div className="section-heading"><div><p className="eyebrow">LOJA MAIA / CATÁLOGO</p><h2 id="store-title">Explore os detalhes<span>.</span></h2><p className="catalog-intro">Encontre por categoria. Conheça cada peça de perto.</p></div><div className="catalog-caption"><span className="catalog-symbol" aria-hidden="true">↗</span><p>Fotografias, materiais<br />e especificações em um só lugar.</p></div></div><Catalog products={products.filter(product => product.visible)} /><p className="catalog-disclaimer">Catálogo informativo · Imagens ilustrativas · A apresentação dos itens não indica disponibilidade comercial.</p></section>
      <section className="about" id="sobre"><div className="shell about-grid"><div><p className="eyebrow">03 / NOSSA IDENTIDADE</p><h2>MAIA.<br /><span>De Senador Canedo.</span></h2></div><div><p className="about-lead">Armas e Munições</p><p>A Maia está em Senador Canedo, Goiás. Este espaço reúne referências visuais e informações sobre cutelaria e equipamentos, com atenção à identificação e às características de cada peça.</p><div className="about-note"><span aria-hidden="true">↗</span><p>Conhecer começa pela informação.<br />Especificações devem ser confirmadas na documentação de cada fabricante.</p></div></div></div></section>
      <section className="shell location location-contact" id="localizacao" aria-labelledby="location-title">
        <div className="location-intro"><p className="eyebrow">04 / LOCALIZAÇÃO E CONTATO</p><h2 id="location-title">Senador Canedo<span>, GO.</span></h2><p>Encontre a Maia e entre em contato com a loja.</p></div>
        <div className="location-details">
          <div className="location-block"><p className="contact-label">NOSSO ENDEREÇO</p><address>Rua 101 com 115, Qd 64, Lt 01<br />Vila São Sebastião<br />Senador Canedo · Goiás</address><a className="map-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Maia Armas e Munições, Rua 101 com 115, Quadra 64, Lote 01, Vila São Sebastião, Senador Canedo, Goiás, Brasil')}`} target="_blank" rel="noopener noreferrer">Abrir no Google Maps <span aria-hidden="true">↗</span><span className="sr-only"> (abre em nova aba)</span></a></div>
          <div className="location-block contact-block"><p className="contact-label">ENTRE EM CONTATO</p><a className="contact-phone" href="tel:+5562993257816">(62) 99325-7816</a><p>Telefone e WhatsApp da loja</p><div className="contact-actions"><a className="button whatsapp-button" href={`https://wa.me/5562993257816?text=${encodeURIComponent('Olá! Gostaria de informações gerais sobre a Maia.')}`} target="_blank" rel="noopener noreferrer"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M21 11.5a9 9 0 0 1-13.5 7.8L3 21l1.7-4.5A9 9 0 1 1 21 11.5Z"/><path d="M8.5 7.5c-.8 1.5 0 3.4 1.6 5s3.5 2.4 5 1.6l.6-1.3-2-1-1 1c-1.3-.6-2.2-1.5-2.8-2.8l1-1-1-2Z"/></svg>Conversar pelo WhatsApp <span aria-hidden="true">↗</span><span className="sr-only"> (abre em nova aba)</span></a><a className="contact-call-link" href="tel:+5562993257816">Ligar para a Maia</a></div></div>
        </div>
      </section>
    </main><footer className="shell"><Brand small /><p>© {new Date().getFullYear()} Maia Armas e Munições.<br />Loja · Conteúdo informativo · Imagens ilustrativas.</p><a href="#inicio">Voltar ao topo ↑</a></footer>
  </>;
}
