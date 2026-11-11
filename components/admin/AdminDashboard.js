'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '../ThemeToggle';
import { blankProduct, templates } from '../../lib/spec-templates';
import { allowsPrice, priceToCurrency } from '../../lib/pricing';

const copy = value => JSON.parse(JSON.stringify(value));
const uid = () => `field_${crypto.randomUUID().replaceAll('-', '')}`;
const emptyCategory = () => ({ name: '', description: '', template: 'livre', active: true, fields: [] });
function specRows(product, category) {
  return [...(category?.fields || []).map(field => ({ ...field, value: product.values[field.id] || '' })), ...product.customSpecs].filter(field => String(field.value).trim());
}
function move(array, index, direction) {
  const result = [...array]; const target = index + direction;
  if (target < 0 || target >= array.length) return result;
  [result[index], result[target]] = [result[target], result[index]]; return result;
}

export default function AdminDashboard({ initialProducts, initialCategories }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [section, setSection] = useState('products');
  const [editor, setEditor] = useState(null);
  const [draft, setDraft] = useState(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    const warn = event => { event.preventDefault(); event.returnValue = ''; };
    if (dirty) window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  useEffect(() => { if (error) document.querySelector('.admin-main > .admin-error')?.scrollIntoView({ block: 'center' }); }, [error]);
  const selectedCategory = draft && editor === 'product' ? categories.find(item => item.id === draft.categoryId) : null;
  const priceAllowed = allowsPrice(selectedCategory);
  const previewPrice = editor === 'product' && priceAllowed && /^\d{1,7}(?:[.,]\d{1,2})?$/.test(draft.price || '') ? priceToCurrency(Math.round(Number(draft.price.replace(',', '.')) * 100)) : '';
  const previews = editor === 'product' ? specRows(draft, selectedCategory).filter(field => field.card).slice(0, 3) : [];
  const categoryName = id => categories.find(item => item.id === id)?.name || 'Sem categoria';
  const isPublic = item => item.visible && categories.find(category => category.id === item.categoryId)?.active;
  const visibleProducts = products.filter(item => `${item.name} ${categoryName(item.categoryId)}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')) && (filter === 'all' || filter === 'public' && isPublic(item) || filter === 'draft' && !item.visible));

  function update(patch) { setDraft(previous => ({ ...previous, ...patch })); setDirty(true); setMessage(''); }
  function exitEditor() {
    if (busy) return false;
    if (dirty && !window.confirm('Descartar as alterações que ainda não foram salvas?')) return false;
    setEditor(null); setDraft(null); setDirty(false); setError(''); return true;
  }
  function navigate(next) { if (exitEditor()) { setSection(next); setQuery(''); setMessage(''); } }
  function openEditor(type, item) {
    if (busy || dirty && !window.confirm('Descartar as alterações não salvas?')) return;
    const record = item || (type === 'product' ? { ...blankProduct(), categoryId: categories.find(item => item.active)?.id || categories[0]?.id || '' } : emptyCategory());
    setDraft(copy(record)); setEditor(type); setDirty(false); setError(''); setMessage(''); window.scrollTo({ top: 0 });
  }
  async function mutate(action, data) {
    setBusy(true); setError(''); setMessage('');
    try {
      const response = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, data }) });
      const payload = await response.json();
      if (response.status === 401) { window.location.reload(); return false; }
      if (!response.ok) throw new Error(payload.error);
      setProducts(payload.products); setCategories(payload.categories); setMessage('Alterações salvas. O site já está atualizado.'); router.refresh(); return true;
    } catch (error) { setError(error.message || 'Não foi possível salvar.'); return false; }
    finally { setBusy(false); }
  }
  async function save(event) {
    event.preventDefault();
    if (await mutate(editor === 'product' ? 'save-product' : 'save-category', draft)) { setEditor(null); setDraft(null); setDirty(false); window.scrollTo({ top: 0 }); }
  }
  async function remove(type, item) {
    if (!window.confirm(`Excluir “${item.name}”? Esta ação não pode ser desfeita.`)) return;
    await mutate(`delete-${type}`, { id: item.id });
  }
  async function upload(event) {
    const files = [...event.target.files]; event.target.value = '';
    if (!files.length) return;
    if (draft.images.length + files.length > 12) { setError('O item pode ter no máximo 12 fotos.'); return; }
    setBusy(true); setError('');
    try {
      for (const file of files) {
        if (file.size > 8 * 1024 * 1024) throw new Error(`${file.name}: o limite é 8 MB por foto.`);
        const form = new FormData(); form.append('file', file);
        const response = await fetch('/api/admin/upload', { method: 'POST', body: form }); const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setDraft(previous => ({ ...previous, images: [...previous.images, data.url] })); setDirty(true);
      }
    } catch (error) { setError(error.message); } finally { setBusy(false); }
  }
  function changeCategory(id) {
    if (Object.values(draft.values).some(Boolean) && !window.confirm('Ao mudar a categoria, os campos do modelo serão limpos para evitar misturar unidades e especificações. Continuar?')) return;
    update({ categoryId: id, values: {}, price: allowsPrice(categories.find(item => item.id === id)) ? draft.price : '' });
  }
  function changeTemplate(id) {
    if (draft.fields.length && !window.confirm('Substituir os campos desta categoria pelo modelo selecionado? Os produtos existentes precisarão ser revisados.')) return;
    update({ template: id, fields: copy(templates.find(item => item.id === id)?.fields || []) });
  }
  function updateField(index, patch) { update({ fields: draft.fields.map((field, i) => i === index ? { ...field, ...patch } : field) }); }
  function updateExtra(index, patch) { update({ customSpecs: draft.customSpecs.map((field, i) => i === index ? { ...field, ...patch } : field) }); }
  async function logout() {
    if (dirty && !window.confirm('Sair e descartar as alterações não salvas?')) return;
    const response = await fetch('/api/admin/session', { method: 'DELETE' }); if (response.ok) router.refresh(); else setError('Não foi possível sair. Tente novamente.');
  }

  return <div className="admin-app">
    <aside className="admin-sidebar"><a className="admin-brand" href="/admin"><img src="/maia-logo.svg" width="52" height="52" alt="MAIA" /><span>MAIA<small>ADMINISTRAÇÃO</small></span></a><p className="admin-nav-label">GERENCIAMENTO</p><nav aria-label="Administração"><button aria-current={section === 'products' ? 'page' : undefined} onClick={() => navigate('products')}><span aria-hidden="true">▦</span> Produtos <small>{products.length}</small></button><button aria-current={section === 'categories' ? 'page' : undefined} onClick={() => navigate('categories')}><span aria-hidden="true">⊞</span> Categorias <small>{categories.length}</small></button></nav><div className="admin-sidebar-foot"><p>Catálogo informativo</p><span>Organize informações, imagens e especificações em um só lugar.</span><a href="/" target="_blank" rel="noopener noreferrer">Ver loja ↗</a></div></aside>
    <div className="admin-workspace"><header className="admin-topbar"><p>PAINEL MAIA <span>/ {section === 'products' ? 'Produtos' : 'Categorias'}{editor ? ' / Editar' : ''}</span></p><div><ThemeToggle /><button className="admin-text-button" disabled={busy} onClick={logout}>Sair</button></div></header>
      <main className="admin-main">
        <p className="admin-success" role="note"><strong>Modo demonstração.</strong> As alterações ficam disponíveis apenas enquanto o servidor estiver em execução. Um reinício restaura os produtos e categorias de exemplo.</p>
        <div className="admin-page-heading"><div><p className="eyebrow">{editor ? draft.id ? 'EDITAR REGISTRO' : 'NOVO REGISTRO' : 'SEU CATÁLOGO, ORGANIZADO'}</p><h1>{editor ? editor === 'product' ? draft.id ? 'Editar produto' : 'Novo produto' : draft.id ? 'Editar categoria' : 'Nova categoria' : section === 'products' ? 'Produtos' : 'Categorias'}<span>.</span></h1><p>{editor === 'product' ? 'Preencha os dados, organize as fotos e confira a prévia.' : editor === 'category' ? 'Defina o modelo de especificações para os itens desta categoria.' : section === 'products' ? 'Gerencie o que aparece na loja e mantenha cada ficha completa.' : 'Cada categoria pode ter seus próprios campos, unidades e destaques.'}</p></div>{!editor && <button className="admin-primary" disabled={busy || section === 'products' && !categories.length} onClick={() => openEditor(section === 'products' ? 'product' : 'category')}>+ {section === 'products' ? 'Novo produto' : 'Nova categoria'}</button>}</div>
        {error && <div className="admin-error" role="alert">{error}</div>}{message && <div className="admin-success" role="status">{message}</div>}
        {!editor && section === 'products' && <><div className="admin-stats"><div><span>Total de itens</span><strong>{products.length}</strong></div><div><span>Exibidos no site</span><strong>{products.filter(isPublic).length}</strong></div><div><span>Rascunhos</span><strong>{products.filter(item => !item.visible).length}</strong></div><div><span>Categorias</span><strong>{categories.length}</strong></div></div><div className="admin-list-controls"><label><span className="sr-only">Buscar produto</span><input type="search" placeholder="Buscar por nome ou categoria" value={query} onChange={event => setQuery(event.target.value)} /></label><label><span className="sr-only">Status do produto</span><select value={filter} onChange={event => setFilter(event.target.value)}><option value="all">Todos os status</option><option value="public">Exibidos no site</option><option value="draft">Rascunhos</option></select></label><span>{visibleProducts.length} itens</span></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Produto</th><th>Categoria</th><th>Exibição</th><th>Fotos</th><th>Ações</th></tr></thead><tbody>{visibleProducts.map(item => <tr key={item.id}><td><div className="admin-product-cell"><img src={item.images[0] || '/placeholder.svg'} alt="" width="56" height="56" /><div><strong>{item.name}</strong><span>{Object.values(item.values).filter(Boolean).length + item.customSpecs.length} especificações</span></div></div></td><td>{categoryName(item.categoryId)}</td><td><button className={`admin-badge ${isPublic(item) ? 'published' : ''}`} disabled={busy} onClick={() => mutate('save-product', { ...item, visible: !item.visible })} title="Alternar exibição no site">{isPublic(item) ? 'No site' : item.visible ? 'Categoria oculta' : 'Rascunho'}</button></td><td>{item.images.length}</td><td><div className="admin-row-actions"><button onClick={() => openEditor('product', item)} disabled={busy}>Editar</button><button disabled={busy} onClick={() => { const duplicate = copy(item); delete duplicate.id; duplicate.name += ' (cópia)'; duplicate.visible = false; openEditor('product', duplicate); }}>Duplicar</button><button className="danger" disabled={busy} onClick={() => remove('product', item)}>Excluir</button></div></td></tr>)}</tbody></table>{!visibleProducts.length && <div className="admin-empty">Nenhum item encontrado. Adicione um produto ou ajuste a busca.</div>}</div></>}
        {!editor && section === 'categories' && <div className="admin-category-grid">{categories.map(item => <article className="admin-category-card" key={item.id}><div><span className="admin-category-icon" aria-hidden="true">⊞</span><span className={`admin-badge ${item.active ? 'published' : ''}`}>{item.active ? 'Ativa' : 'Oculta'}</span></div><h2>{item.name}</h2><p>{item.description || 'Campos personalizados para organizar as informações desta categoria.'}</p><div className="admin-category-metrics"><span>{products.filter(product => product.categoryId === item.id).length} itens</span><span>{item.fields.length} campos</span></div><div className="admin-field-tags">{item.fields.slice(0, 4).map(field => <span key={field.id}>{field.label}</span>)}</div><div className="admin-row-actions"><button onClick={() => openEditor('category', item)} disabled={busy}>Editar categoria ↗</button><button className="danger" disabled={busy} onClick={() => remove('category', item)}>Excluir</button></div></article>)}</div>}
        {editor && <form onSubmit={save} className="admin-editor"><fieldset disabled={busy} className="admin-form-fieldset"><div className="admin-editor-grid"><div className="admin-editor-sections">
          <section className="admin-panel"><div className="admin-panel-heading"><span>01</span><div><h2>Informações principais</h2><p>{editor === 'product' ? 'Nome e descrição que aparecem na loja.' : 'Nome e visibilidade da categoria.'}</p></div></div><label>Nome {editor === 'product' ? 'do produto' : 'da categoria'} <span className="required">*</span><input autoFocus required maxLength={editor === 'product' ? 100 : 70} value={draft.name} onChange={event => update({ name: event.target.value })} placeholder={editor === 'product' ? 'Ex.: Mochila de trilha 40 L' : 'Ex.: Mochilas'} /></label><label>Descrição {editor === 'product' && draft.visible && <span className="required">*</span>}<textarea rows="4" maxLength={editor === 'product' ? 2500 : 500} required={editor === 'product' && draft.visible} value={draft.description} onChange={event => update({ description: event.target.value })} placeholder="Descreva o item com informações objetivas e verificadas." /></label>{editor === 'product' && <label>Categoria <span className="required">*</span><select required value={draft.categoryId} onChange={event => changeCategory(event.target.value)}><option value="">Selecione a categoria</option>{categories.map(item => <option key={item.id} value={item.id}>{item.name}{!item.active ? ' (oculta)' : ''}</option>)}</select></label>}{editor === 'product' && <label className="admin-price-field">Preço (R$)<div className="input-unit"><span>R$</span><input inputMode="decimal" maxLength="12" value={draft.price || ''} onChange={event => update({ price: event.target.value })} disabled={!priceAllowed} placeholder="Ex.: 129,90" /></div><small>{priceAllowed ? 'Opcional. Aparece no cartão e na ficha quando preenchido.' : 'Não usado nesta categoria; o valor não é salvo nem exibido.'}</small></label>}</section>
          {editor === 'product' ? <>
            <section className="admin-panel"><div className="admin-panel-heading"><span>02</span><div><h2>Fotos e galeria</h2><p>A primeira foto é a capa. Reordene as imagens pelas setas.</p></div><small>{draft.images.length}/12</small></div><label className="admin-upload"><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={upload} disabled={busy || draft.images.length >= 12} /><span aria-hidden="true">↑</span><strong>{busy ? 'Enviando fotos…' : 'Selecionar fotos'}</strong><small>JPG, PNG ou WebP · Até 8 MB cada</small></label><div className="admin-images">{draft.images.map((image, index) => <div key={image} className="admin-image"><img src={image} alt={`Foto ${index + 1}`} width="160" height="120" /><span>{index === 0 ? 'CAPA' : `FOTO ${index + 1}`}</span><div><button type="button" aria-label={`Mover foto ${index + 1} para antes`} disabled={index === 0} onClick={() => update({ images: move(draft.images, index, -1) })}>←</button><button type="button" aria-label={`Mover foto ${index + 1} para depois`} disabled={index === draft.images.length - 1} onClick={() => update({ images: move(draft.images, index, 1) })}>→</button><button type="button" className="danger" aria-label={`Remover foto ${index + 1}`} onClick={() => update({ images: draft.images.filter((_, i) => i !== index) })}>×</button></div></div>)}</div></section>
            <section className="admin-panel"><div className="admin-panel-heading"><span>03</span><div><h2>Especificações técnicas</h2><p>{selectedCategory ? `Campos do modelo: ${selectedCategory.name}.` : 'Selecione uma categoria para carregar os campos.'} Digite só o valor; a unidade é adicionada automaticamente.</p></div></div><div className="admin-spec-inputs">{selectedCategory?.fields.map(field => <label key={field.id}>{field.label}{field.required && <span className="required"> *</span>}{field.card && <small className="field-card-note">No cartão</small>}<div className="input-unit"><input value={draft.values[field.id] || ''} onChange={event => update({ values: { ...draft.values, [field.id]: event.target.value } })} required={draft.visible && field.required} inputMode={field.type === 'number' ? 'decimal' : 'text'} maxLength="250" placeholder={field.type === 'number' ? 'Ex.: 2,5' : `Informe ${field.label.toLowerCase()}`} />{field.unit && <span>{field.unit}</span>}</div></label>)}</div>{!selectedCategory?.fields.length && <p className="admin-hint">Esta categoria não tem campos definidos. Edite a categoria ou adicione especificações abaixo.</p>}<div className="admin-subheading"><h3>Especificações adicionais</h3><p>Características exclusivas deste item. Campos vazios da categoria não aparecem no site.</p></div>{draft.customSpecs.map((field, index) => <div className="admin-extra-spec" key={index}><label>Nome<input required maxLength="60" value={field.label} onChange={event => updateExtra(index, { label: event.target.value })} placeholder="Ex.: Proteção UV" /></label><label>Valor<input required maxLength="250" value={field.value} onChange={event => updateExtra(index, { value: event.target.value })} placeholder="Ex.: 50+" /></label><label>Unidade<input maxLength="20" value={field.unit} onChange={event => updateExtra(index, { unit: event.target.value })} placeholder="Opcional" /></label><label className="admin-check"><input type="checkbox" checked={field.card} onChange={event => updateExtra(index, { card: event.target.checked })} />No cartão</label><button className="admin-remove" type="button" aria-label={`Remover especificação ${index + 1}`} onClick={() => update({ customSpecs: draft.customSpecs.filter((_, i) => i !== index) })}>×</button></div>)}<button className="admin-secondary" type="button" disabled={draft.customSpecs.length >= 20} onClick={() => update({ customSpecs: [...draft.customSpecs, { label: '', value: '', unit: '', card: false }] })}>+ Adicionar especificação</button></section>
          </> : <section className="admin-panel"><div className="admin-panel-heading"><span>02</span><div><h2>Modelo de especificações</h2><p>Defina campos reutilizáveis para todos os produtos desta categoria.</p></div></div><label>Começar com um modelo<select value={draft.template} onChange={event => changeTemplate(event.target.value)}>{templates.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><p className="admin-hint">Escolha até três campos para o cartão. Os demais ficam na ficha de detalhes. Obrigatórios são exigidos ao exibir um produto no site.</p><div className="admin-category-fields">{draft.fields.map((field, index) => <div className="admin-category-field" key={field.id}><div className="admin-field-position"><button type="button" disabled={index === 0} aria-label={`Subir campo ${index + 1}`} onClick={() => update({ fields: move(draft.fields, index, -1) })}>↑</button><span>{String(index + 1).padStart(2, '0')}</span><button type="button" disabled={index === draft.fields.length - 1} aria-label={`Descer campo ${index + 1}`} onClick={() => update({ fields: move(draft.fields, index, 1) })}>↓</button></div><label>Campo<input required value={field.label} maxLength="60" onChange={event => updateField(index, { label: event.target.value })} placeholder="Ex.: Peso" /></label><label>Tipo<select value={field.type} onChange={event => updateField(index, { type: event.target.value })}><option value="text">Texto</option><option value="number">Número</option></select></label><label>Unidade<input value={field.unit} maxLength="20" onChange={event => updateField(index, { unit: event.target.value })} placeholder="kg, cm, L…" /></label><div className="admin-field-options"><label className="admin-check"><input type="checkbox" checked={field.card} onChange={event => updateField(index, { card: event.target.checked })} />No cartão</label><label className="admin-check"><input type="checkbox" checked={field.required} onChange={event => updateField(index, { required: event.target.checked })} />Obrigatório</label></div><button type="button" className="admin-remove" aria-label={`Excluir campo ${field.label || index + 1}`} onClick={() => { if (window.confirm('Remover este campo do modelo? Ele deixará de aparecer nos itens da categoria.')) update({ fields: draft.fields.filter((_, i) => i !== index) }); }}>×</button></div>)}</div><button className="admin-secondary" type="button" disabled={draft.fields.length >= 24} onClick={() => update({ fields: [...draft.fields, { id: uid(), label: '', type: 'text', unit: '', card: false, required: false }] })}>+ Adicionar campo</button></section>}
        </div><aside className="admin-editor-aside"><section className="admin-panel"><h2>Exibição no site</h2><label className="admin-switch"><input type="checkbox" checked={editor === 'product' ? draft.visible : draft.active} onChange={event => update(editor === 'product' ? { visible: event.target.checked } : { active: event.target.checked })} /><span>{editor === 'product' ? 'Exibir no site' : 'Categoria ativa'}</span></label><p className="admin-hint">{editor === 'product' ? 'Desative para salvar como rascunho. Apenas itens com foto e descrição podem ser exibidos.' : 'Desativar oculta todos os itens desta categoria, sem excluí-los.'}</p>{editor === 'product' && selectedCategory && !selectedCategory.active && <p className="admin-error">Esta categoria está oculta. O item não aparecerá na loja enquanto ela estiver desativada.</p>}</section>{editor === 'product' ? <section className="admin-preview"><p className="admin-preview-label">PRÉVIA DO CARTÃO</p><article className="product"><div className="product-photo"><img src={draft.images[0] || '/placeholder.svg'} alt="Prévia do item" width="800" height="650" /></div><div className="product-content"><p className="product-category">{selectedCategory?.name || 'Categoria'}</p><h3>{draft.name || 'Nome do produto'}</h3>{previewPrice && <p className="product-price">{previewPrice}</p>}<p>{draft.description || 'A descrição do produto aparecerá aqui.'}</p>{previews.length > 0 && <dl className="product-specs" style={{ gridTemplateColumns: `repeat(${previews.length}, minmax(0,1fr))` }}>{previews.map((field, i) => <div key={i}><dt>{field.label}</dt><dd>{field.value}{field.unit ? ` ${field.unit}` : ''}</dd></div>)}</dl>}<span className="detail-button">Ver detalhes <span aria-hidden="true">↗</span></span></div></article><p className="admin-hint">Até três destaques. A ficha de detalhes mostra todas as especificações preenchidas.</p></section> : <section className="admin-panel"><h2>Como funciona</h2><ul className="admin-help-list"><li>Texto aceita valores como “.22 LR”, “P, M, G” e “Poliéster”.</li><li>Número aceita decimais como “5,5”. A unidade é adicionada ao valor.</li><li>“No cartão” destaca o campo na faixa tracejada.</li><li>Alterações no modelo afetam todos os itens da categoria. Revise os dados ao trocar tipos e unidades.</li></ul></section>}</aside></div><div className="admin-savebar"><p>{busy ? 'Processando…' : dirty ? 'Você tem alterações não salvas.' : 'Dados do catálogo Maia'}</p><div><button className="admin-secondary" type="button" onClick={exitEditor}>Cancelar</button><button className="admin-primary" type="submit">{busy ? 'Salvando…' : editor === 'product' ? 'Salvar produto' : 'Salvar categoria'}</button></div></div></fieldset></form>}
      </main>
    </div>
  </div>;
}
