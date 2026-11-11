import 'server-only';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { products as seedProducts } from './products';
import { templates } from './spec-templates';
import { allowsPrice, priceToInput } from './pricing';

function openDatabase() {
  if (globalThis.__maiaDatabase) return globalThis.__maiaDatabase;
  const directory = path.join(process.cwd(), 'data');
  mkdirSync(directory, { recursive: true });
  const db = new DatabaseSync(path.join(directory, 'maia.sqlite'));
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, name TEXT NOT NULL COLLATE NOCASE UNIQUE, description TEXT NOT NULL DEFAULT '', template TEXT NOT NULL, fields TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1);
    CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL, category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT, images TEXT NOT NULL, spec_values TEXT NOT NULL, custom_specs TEXT NOT NULL, visible INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);`);
  if (!db.prepare('PRAGMA table_info(products)').all().some(column => column.name === 'price_cents')) {
    db.exec('ALTER TABLE products ADD COLUMN price_cents INTEGER');
  }
  if (!db.prepare("SELECT value FROM metadata WHERE key='seeded'").get()) {
    db.exec('BEGIN IMMEDIATE');
    try {
      const seeds = [['Canivetes', 'cutelaria'], ['Facas', 'cutelaria'], ['Pressão', 'pressao'], ['Armas de fogo', 'armamentos'], ['Barracas', 'barracas'], ['Mochilas', 'mochilas'], ['Camisetas', 'camisetas']];
      const categoryIds = new Map();
      for (const [name, template] of seeds) {
        const id = randomUUID(); categoryIds.set(name, id);
        db.prepare('INSERT INTO categories (id,name,template,fields) VALUES (?,?,?,?)').run(id, name, template, JSON.stringify(templates.find(item => item.id === template).fields));
      }
      const aliases = { 'Lâmina': 'blade', 'Aço': 'steel', 'Cabo': 'handle', 'Calibre': 'caliber', 'Cap.': 'capacity', 'Cano': 'barrel', 'Peso': 'weight', 'Vel.': 'velocity' };
      for (const item of seedProducts) {
        const template = templates.find(t => t.id === seeds.find(([name]) => name === item.category)[1]);
        const values = {};
        for (const [label, value] of item.specs) {
          const field = template.fields.find(f => f.id === aliases[label]);
          values[field.id] = field.unit ? value.replace(new RegExp(`\\s*${field.unit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`), '') : value;
        }
        db.prepare('INSERT INTO products (id,name,description,category_id,images,spec_values,custom_specs,visible,updated_at) VALUES (?,?,?,?,?,?,?,?,?)').run(item.id, item.name, item.description, categoryIds.get(item.category), JSON.stringify(item.images), JSON.stringify(values), '[]', item.visible ? 1 : 0, new Date().toISOString());
      }
      db.prepare('INSERT INTO metadata VALUES (?,?)').run('seeded', '1'); db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); db.close(); throw error; }
  }
  globalThis.__maiaDatabase = db;
  return db;
}

export function database() { return openDatabase(); }
export function listCategories() {
  return database().prepare('SELECT * FROM categories ORDER BY rowid').all().map(row => ({ ...row, active: !!row.active, fields: JSON.parse(row.fields) }));
}
export function listProducts() {
  return database().prepare('SELECT * FROM products ORDER BY rowid').all().map(row => ({ id: row.id, name: row.name, description: row.description, categoryId: row.category_id, images: JSON.parse(row.images), values: JSON.parse(row.spec_values), customSpecs: JSON.parse(row.custom_specs), price: priceToInput(row.price_cents), visible: !!row.visible, updatedAt: row.updated_at }));
}
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
