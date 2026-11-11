import 'server-only';
import { randomUUID } from 'node:crypto';
import { demoStore, listCategories, listProducts } from './database';
import { allowsPrice } from './pricing';

export class ValidationError extends Error {}
function text(value, label, max = 100, required = false) {
  if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) throw new ValidationError(`Confira o campo ${label} (máximo ${max} caracteres).`);
  return value.trim();
}
const flag = value => value === true;
function fields(input) {
  if (!Array.isArray(input) || input.length > 24) throw new ValidationError('Use até 24 campos por categoria.');
  const result = input.map(field => {
    const id = text(field.id, 'identificador do campo', 80, true);
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) throw new ValidationError('Identificador de campo inválido.');
    if (!['text', 'number'].includes(field.type)) throw new ValidationError('Tipo de campo inválido.');
    return { id, label: text(field.label, 'nome do campo', 60, true), type: field.type, unit: text(field.unit || '', 'unidade', 20), required: flag(field.required), card: flag(field.card) };
  });
  if (new Set(result.map(field => field.id)).size !== result.length || new Set(result.map(field => field.label.toLowerCase())).size !== result.length) throw new ValidationError('Cada campo precisa ter nome e identificador únicos.');
  if (result.filter(field => field.card).length > 3) throw new ValidationError('Escolha até três campos para destacar nos cartões.');
  return result;
}
function numberValue(value, label) {
  if (value && (!/^\d+(?:[.,]\d+)?$/.test(value) || !Number.isFinite(Number(value.replace(',', '.'))))) throw new ValidationError(`${label}: informe um número positivo, sem a unidade. Use a unidade indicada ao lado do campo.`);
}
export function saveCategory(input) {
  const id = input.id ? text(input.id, 'categoria', 80, true) : randomUUID();
  const existing = listCategories().find(item => item.id === id);
  if (input.id && !existing) throw new ValidationError('Categoria não encontrada.');
  const category = { id, name: text(input.name, 'nome da categoria', 70, true), description: text(input.description || '', 'descrição', 500), template: text(input.template || 'livre', 'modelo', 40), fields: fields(input.fields), active: flag(input.active) };
  if (listCategories().some(item => item.id !== id && item.name.toLocaleLowerCase('pt-BR') === category.name.toLocaleLowerCase('pt-BR'))) throw new ValidationError('Já existe uma categoria com esse nome.');
  for (const product of listProducts().filter(item => item.categoryId === id && item.visible)) {
    for (const field of category.fields) {
      const value = product.values[field.id] || '';
      if (field.required && !value) throw new ValidationError(`“${product.name}” está marcado para exibição e não tem “${field.label}”. Preencha o campo no item ou salve-o como rascunho antes de torná-lo obrigatório.`);
      if (field.type === 'number') numberValue(value, `${product.name} / ${field.label}`);
    }
  }
  const store = demoStore();
  const index = store.categories.findIndex(item => item.id === id);
  if (index < 0) store.categories.push(category);
  else store.categories[index] = category;
  if (!allowsPrice(category)) for (const item of store.products) if (item.categoryId === id) item.price = '';
  return category;
}
export function saveProduct(input) {
  const id = input.id ? text(input.id, 'produto', 80, true) : randomUUID();
  const current = listProducts().find(item => item.id === id);
  if (input.id && !current) throw new ValidationError('Item não encontrado.');
  const category = listCategories().find(item => item.id === input.categoryId);
  if (!category) throw new ValidationError('Selecione uma categoria válida.');
  const visible = flag(input.visible);
  const product = { id, name: text(input.name, 'nome do item', 100, true), description: text(input.description || '', 'descrição', 2500, visible), categoryId: category.id, visible };
  product.price = '';
  if (allowsPrice(category)) {
    product.price = text(input.price || '', 'preço', 12);
    if (product.price) {
      if (!/^\d{1,7}(?:[.,]\d{1,2})?$/.test(product.price)) throw new ValidationError('Informe o preço em reais, como 129,90.');
      const [reais, centavos = ''] = product.price.replace('.', ',').split(',');
      const priceCents = Number(reais) * 100 + Number(centavos.padEnd(2, '0'));
      if (priceCents <= 0) throw new ValidationError('O preço deve ser maior que zero.');
      product.price = `${reais},${centavos.padEnd(2, '0')}`;
    }
  }
  if (!Array.isArray(input.images) || input.images.length > 12) throw new ValidationError('Use até 12 fotos por item.');
  product.images = [...new Set(input.images.map(image => {
    if (typeof image !== 'string' || !/^\/(?:img|uploads)\/[a-zA-Z0-9_./-]+$/.test(image) || image.includes('..')) throw new ValidationError('Imagem inválida. Envie uma foto pelo painel.');
    return image;
  }))];
  if (visible && !product.images.length) throw new ValidationError('Adicione pelo menos uma foto para exibir este item.');
  product.values = {};
  for (const field of category.fields) {
    const value = text(input.values?.[field.id] ?? '', field.label, 250, visible && field.required);
    if (field.type === 'number') numberValue(value, field.label);
    product.values[field.id] = value;
  }
  if (!Array.isArray(input.customSpecs) || input.customSpecs.length > 20) throw new ValidationError('Use até 20 especificações adicionais.');
  product.customSpecs = input.customSpecs.map(field => ({ label: text(field.label, 'nome da especificação adicional', 60, true), value: text(field.value, 'valor da especificação adicional', 250, true), unit: text(field.unit || '', 'unidade', 20), card: flag(field.card) }));
  const labels = [...category.fields.map(field => field.label), ...product.customSpecs.map(field => field.label)].map(label => label.toLocaleLowerCase('pt-BR'));
  if (new Set(labels).size !== labels.length) throw new ValidationError('Não repita o nome de uma especificação.');
  const highlights = category.fields.filter(field => field.card && product.values[field.id]).length + product.customSpecs.filter(field => field.card).length;
  if (highlights > 3) throw new ValidationError('O cartão comporta até três destaques. Desmarque os campos adicionais ou ajuste a categoria.');
  product.updatedAt = new Date().toISOString();
  const store = demoStore();
  const index = store.products.findIndex(item => item.id === id);
  if (index < 0) store.products.push(product);
  else store.products[index] = product;
  return product;
}
export function removeItem(type, id) {
  text(id, 'identificador', 80, true);
  if (type === 'category') {
    if (listProducts().some(item => item.categoryId === id)) throw new ValidationError('Esta categoria possui itens. Mova ou exclua os itens antes de excluir a categoria.');
    demoStore().categories = demoStore().categories.filter(item => item.id !== id);
  } else if (type === 'product') demoStore().products = demoStore().products.filter(item => item.id !== id);
  else throw new ValidationError('Tipo de registro inválido.');
}
