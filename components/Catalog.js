'use client';

import { useEffect, useRef, useState } from 'react';
import Gallery from './Gallery';
import ProductContact from './ProductContact';
import { getImages } from '../lib/gallery';
import { priceToCurrency } from '../lib/pricing';

function CardSpecs({ product }) {
  const specs = product.cardSpecs ?? product.specs.slice(0, 3);
  return specs.length > 0 ? <dl className="product-specs" style={{ gridTemplateColumns: `repeat(${specs.length}, minmax(0, 1fr))` }} aria-label={`Especificações de ${product.name}`}>{specs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl> : null;
}

export default function Catalog({ products }) {
  const [category, setCategory] = useState('Todos');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const dialog = useRef(null);
  const opener = useRef(null);
  const categories = ['Todos', ...new Set(products.map(product => product.category))];
  const results = products.filter(product => (category === 'Todos' || product.category === category) && `${product.name} ${product.description} ${product.category}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')));

  useEffect(() => { if (selected) dialog.current?.showModal(); }, [selected]);
  function close() { dialog.current?.close(); }
  function open(product, event) { opener.current = event.currentTarget; setSelected(product); }

  return <>
    <div className="catalog-controls"><div className="filters" role="group" aria-label="Categorias da loja">{categories.map(item => <button key={item} onClick={() => setCategory(item)} aria-pressed={category === item}>{item}</button>)}</div><label className="search"><span className="sr-only">Buscar na loja</span><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar na loja" /></label></div>
    <div className="results-toolbar"><p className="result-count" role="status">{results.length} {results.length === 1 ? 'item encontrado' : 'itens encontrados'}<span>{category === 'Todos' ? 'Todas as categorias' : category}</span></p>{(category !== 'Todos' || query) && <button className="clear-filters" onClick={() => { setCategory('Todos'); setQuery(''); }}>Limpar filtros <span aria-hidden="true">×</span></button>}</div>
    <div className="product-grid">{results.map((product, index) => <article className="product" key={product.id}><button className="product-photo" aria-label={`Abrir galeria de ${product.name}`} onClick={event => open(product, event)}><span className="product-number">{String(index + 1).padStart(2, '0')}</span><img src={getImages(product)[0]} alt={product.name} width="800" height="800" loading="lazy" /><span className="photo-note">IMAGEM ILUSTRATIVA</span><span className="photo-open" aria-hidden="true">↗</span></button><div className="product-content"><p className="product-category">{product.category}</p><h3>{product.name}</h3>{product.priceCents != null && <p className="product-price">{priceToCurrency(product.priceCents)}</p>}<p>{product.description}</p><CardSpecs product={product} /><button className="detail-button" aria-label={`Ver ficha de ${product.name}`} onClick={event => open(product, event)}>Ver detalhes <span aria-hidden="true">↗</span></button><ProductContact product={product} /></div></article>)}</div>
    {!results.length && <div className="empty"><h3>Nenhuma referência encontrada.</h3><p>Tente outra categoria ou termo de busca.</p><button className="button" onClick={() => { setQuery(''); setCategory('Todos'); }}>Limpar filtros</button></div>}
    <dialog ref={dialog} className="product-dialog" aria-labelledby="detail-title" onClose={() => { setSelected(null); opener.current?.focus(); }} onClick={event => { if (event.target === event.currentTarget) { const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close(); } }}>
      {selected && <><button className="dialog-close" onClick={close} aria-label="Fechar ficha" autoFocus>×</button><Gallery key={selected.id} images={getImages(selected)} name={selected.name} /><div className="dialog-content"><p className="product-category">{selected.category}</p><h2 id="detail-title">{selected.name}</h2>{selected.priceCents != null && <p className="product-price">{priceToCurrency(selected.priceCents)}</p>}<p>{selected.description}</p><dl>{selected.specs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p className="technical-note">Imagem ilustrativa. Informações do material de referência; confirme as especificações na documentação do fabricante.</p><button className="button" onClick={close}>Voltar à loja</button></div></>}
    </dialog>
  </>;
}
