export const templates = [
  { id: 'cutelaria', name: 'Facas e canivetes', fields: [
    ['blade', 'Lâmina', 'number', 'cm', true], ['steel', 'Aço', 'text', '', true], ['handle', 'Cabo', 'text', '', true], ['weight', 'Peso', 'number', 'g'], ['total', 'Comprimento total', 'number', 'cm'], ['sheath', 'Bainha', 'text', '']
  ] },
  { id: 'armamentos', name: 'Armamentos · ficha informativa', fields: [
    ['caliber', 'Calibre', 'text', '', true], ['capacity', 'Capacidade', 'number', 'tiros', true], ['barrel', 'Cano', 'number', 'pol', true], ['weight', 'Peso', 'number', 'kg'], ['manufacturer', 'Fabricante', 'text', ''], ['model', 'Modelo', 'text', ''], ['length', 'Comprimento', 'number', 'cm']
  ] },
  { id: 'pressao', name: 'Equipamentos de pressão · ficha informativa', fields: [
    ['caliber', 'Calibre', 'text', '', true], ['velocity', 'Velocidade', 'number', 'm/s', true], ['weight', 'Peso', 'number', 'kg', true], ['manufacturer', 'Fabricante', 'text', ''], ['model', 'Modelo', 'text', '']
  ] },
  { id: 'barracas', name: 'Barracas', fields: [
    ['capacity', 'Capacidade', 'number', 'pessoas', true], ['weight', 'Peso', 'number', 'kg', true], ['waterproof', 'Coluna d’água', 'number', 'mm', true], ['dimensions', 'Dimensões montada', 'text', 'cm'], ['material', 'Material', 'text', ''], ['packed', 'Dimensões embalada', 'text', 'cm'], ['color', 'Cor', 'text', '']
  ] },
  { id: 'mochilas', name: 'Mochilas', fields: [
    ['volume', 'Volume', 'number', 'L', true], ['material', 'Material', 'text', '', true], ['weight', 'Peso', 'number', 'g', true], ['dimensions', 'Dimensões', 'text', 'cm'], ['waterproof', 'Resistência à água', 'text', ''], ['color', 'Cor', 'text', '']
  ] },
  { id: 'camisetas', name: 'Camisetas e vestuário', fields: [
    ['fabric', 'Tecido', 'text', '', true], ['sizes', 'Tamanhos', 'text', '', true], ['color', 'Cor', 'text', '', true], ['composition', 'Composição', 'text', ''], ['fit', 'Modelagem', 'text', ''], ['care', 'Cuidados', 'text', '']
  ] },
  { id: 'livre', name: 'Categoria personalizada', fields: [] }
].map(template => ({ ...template, fields: template.fields.map(([id, label, type, unit, card = false]) => ({ id, label, type, unit, card, required: false })) }));

export const blankProduct = () => ({ name: '', description: '', categoryId: '', images: [], values: {}, customSpecs: [], price: '', visible: false });
