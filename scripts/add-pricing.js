const fs = require('fs');
const path = require('path');

const CATALOG_PATH = path.join(__dirname, '..', 'assets', 'catalog.json');
const data = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));

// ---------- Cuadros: shared pricing matrix (COP) ----------
const CUADRO_PRICING = {
  sizes: [
    { id: 'M', label: 'M · 30x40cm' },
    { id: 'L', label: 'L · 50x70cm' },
    { id: 'XL', label: 'XL · 59x89cm' },
  ],
  materials: [
    {
      id: 'mdf',
      label: 'MDF 9mm',
      finish: 'Acabado mate',
      options: [
        { id: 'sin-marco', label: 'Sin marco', prices: { M: 60000, L: 130000, XL: 195000 } },
        { id: 'marco-negro', label: 'Marco negro', prices: { M: 90000, L: 260000, XL: 400000 } },
        { id: 'marco-blanco', label: 'Marco blanco', prices: { M: 100000, L: 290000, XL: 440000 } },
      ],
    },
    {
      id: 'acrilico',
      label: 'Acrílico 3mm',
      finish: 'Acabado brillante',
      options: [
        { id: 'colgador', label: 'Colgador acrílico (no visible)', prices: { M: 100000, L: 280000, XL: 450000 } },
        { id: 'dilatadores', label: 'Bujes / dilatadores metálicos', prices: { M: 100000, L: 280000, XL: 450000 } },
      ],
    },
  ],
};

const FUNDA_PRICE = 30000;

const PHONE_MODELS = [
  '11', '11 Pro', '11 Pro Max',
  '12 Mini', '12', '12 Pro', '12 Pro Max',
  '13 Mini', '13', '13 Pro', '13 Pro Max',
  '14', '14 Plus', '14 Pro', '14 Pro Max',
  '15', '15 Plus', '15 Pro', '15 Pro Max',
  '16', '16 Plus', '16 Pro', '16 Pro Max',
  '17', '17 Pro', '17 Pro Max',
].map(m => 'iPhone ' + m);

data.products = data.products.map(p => {
  if (p.type === 'cuadro') {
    return { ...p, pricing: CUADRO_PRICING, priceFrom: 60000 };
  }
  return { ...p, price: FUNDA_PRICE, phoneModels: PHONE_MODELS };
});

fs.writeFileSync(CATALOG_PATH, JSON.stringify(data, null, 0));
console.log('Pricing added to', data.products.length, 'products.');
console.log('Cuadros:', data.products.filter(p => p.type === 'cuadro').length, '| Fundas:', data.products.filter(p => p.type === 'funda').length);
