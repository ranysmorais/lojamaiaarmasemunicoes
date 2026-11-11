import 'server-only';
import { products as seedProducts } from './products';
import { templates } from './spec-templates';
import { allowsPrice } from './pricing';

function createDemoStore() {
  const seeds = [['Canivetes', 'cutelaria'], ['Facas', 'cutelaria'], ['Pressão', 'pressao'], ['Armas de fogo', 'armamentos'], ['Barracas', 'barracas'], ['Mochilas', 'mochilas'], ['Camisetas', 'camisetas']];
  const categories = seeds.map(([name, template]) => ({
    id: `demo-${template}-${name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name, description: '', template, fields: structuredClone(templates.find(item => item.id === template).fields), active: true
  }));
  const aliases = { 'Lâmina': 'blade', 'Aço': 'steel', 'Cabo': 'handle', 'Calibre': 'caliber', 'Cap.': 'capacity', 'Cano': 'barrel', 'Peso': 'weight', 'Vel.': 'velocity' };
  const products = seedProducts.map(item => {
    const category = categories.find(entry => entry.name === item.category);
    const values = {};
    for (const [label, value] of item.specs) {
      const field = category.fields.find(entry => entry.id === aliases[label]);
      values[field.id] = field.unit && value.endsWith(` ${field.unit}`) ? value.slice(0, -(field.unit.length + 1)) : value;
    }
    return { id: item.id, name: item.name, description: item.description, categoryId: category.id, images: [...item.images], values, customSpecs: [], price: '', visible: item.visible, updatedAt: new Date().toISOString() };
  });
  return { categories, products };
}

export function demoStore() {
  globalThis.__maiaDemoStore ??= createDemoStore();
  return globalThis.__maiaDemoStore;
}

export function listCategories() { return structuredClone(demoStore().categories); }
export function listProducts() { return structuredClone(demoStore().products); }

export function publicProducts() {
  const categories = listCategories();
  return listProducts().flatMap(product => {
    const category = categories.find(item => item.id === product.categoryId);
    if (!product.visible || !category?.active) return [];
    const rows = [...category.fields.map(field => ({ ...field, value: product.values[field.id] || '' })), ...product.customSpecs].filter(field => String(field.value).trim());
    const format = field => [field.label, `${field.value}${field.unit ? ` ${field.unit}` : ''}`];
    return [{ ...product, category: category.name, priceCents: allowsPrice(category) && product.price ? Math.round(Number(product.price.replace(',', '.')) * 100) : null, contactEligible: category.template.length > 0, specs: rows.map(format), cardSpecs: rows.filter(field => field.card).slice(0, 3).map(format) }];
  });
}
