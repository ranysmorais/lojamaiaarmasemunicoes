export function allowsPrice(category) {
  return category?.template.length > 0;
}

export function priceToInput(cents) {
  if (cents == null) return '';
  return (cents / 100).toFixed(2).replace('.', ',');
}

export function priceToCurrency(cents) {
  if (cents == null) return '';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}
