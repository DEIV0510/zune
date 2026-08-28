const fs = require('fs');
const path = require('path');

const CATALOG_PATH = path.join(__dirname, '..', 'assets', 'catalog.json');
const data = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));

const GROUPS = {
  cuadros: 'Cuadros personalizados',
  'futbol-colombia': 'Fútbol Colombia',
  'futbol-internacional': 'Fútbol Internacional',
  'deporte-idolos': 'Ídolos del deporte',
  anime: 'Anime',
  caricaturas: 'Personajes y caricaturas',
  'cine-gaming': 'Cine, series y gaming',
  'musica-urbana': 'Música urbana',
  'musica-pop': 'Música y radio',
  'marcas-deportivas': 'Marcas deportivas',
  'autos-motos': 'Autos y motos',
  'marcas-varias': 'Marcas y varios',
  'arte-abstracto': 'Arte y abstracto',
  'cute-tierno': 'Cute y tierno',
  animales: 'Animales y naturaleza',
  fiesta: 'Fiesta y variados',
};

const NAME_MAP = {
  // deporte-idolos (top-level, no context)
  'CR7': 'deporte-idolos', 'Messi': 'deporte-idolos', 'NBA': 'deporte-idolos',
  // caricaturas
  'Aladin': 'caricaturas', 'Barbie': 'caricaturas', 'Bob': 'caricaturas', 'Chicas super poderosas': 'caricaturas',
  'Ed, edd y eddy': 'caricaturas', 'Garfield': 'caricaturas', 'Hello KittyKuromi': 'caricaturas',
  'Lilo y Stitch': 'caricaturas', 'Lonney Toons': 'caricaturas', 'Mickey Mouse': 'caricaturas',
  'Pantera Rosa': 'caricaturas', 'Rey Leon': 'caricaturas', 'Simpsons': 'caricaturas', 'Snoopy': 'caricaturas',
  'Tom y Jerry': 'caricaturas',
  // cine-gaming
  'Marvel': 'cine-gaming', 'Harry Potter': 'cine-gaming', 'Star wars': 'cine-gaming', 'Pokemon': 'cine-gaming',
  'Mario Bross': 'cine-gaming', 'Game': 'cine-gaming', 'KAWS': 'cine-gaming', 'Ripndip': 'cine-gaming',
  'Rick y Morty': 'cine-gaming', 'Mac Pato': 'cine-gaming', 'Intensamente': 'cine-gaming',
  'Peaky Blinders': 'cine-gaming', 'Scarface': 'cine-gaming',
  // musica-urbana
  'Bad Bunny': 'musica-urbana', 'Balvin': 'musica-urbana', 'Blessd': 'musica-urbana', 'Cantantes Regueton': 'musica-urbana',
  'Ferxxo': 'musica-urbana', 'Karol G': 'musica-urbana', 'RAP': 'musica-urbana', 'Ryan Castro': 'musica-urbana',
  'Young Miko': 'musica-urbana',
  // musica-pop
  'Cantantes Popular': 'musica-pop', 'RBD': 'musica-pop', 'Spotify': 'musica-pop',
  // marcas-deportivas
  'Adidas': 'marcas-deportivas', 'Nike': 'marcas-deportivas', 'Polo Club': 'marcas-deportivas',
  // autos-motos
  'Audi': 'autos-motos', 'Cars': 'autos-motos', 'Stickers Carros y Motos': 'autos-motos', 'Drift': 'autos-motos',
  // marcas-varias
  'Coca Cola': 'marcas-varias', 'DHL': 'marcas-varias', 'Drew': 'marcas-varias', 'Malboro': 'marcas-varias',
  'Marcas': 'marcas-varias', 'Monopoly': 'marcas-varias', 'NASA': 'marcas-varias', 'Starbucks': 'marcas-varias',
  'Supreme': 'marcas-varias', 'Tio Rico': 'marcas-varias',
  // arte-abstracto
  'Abstracto': 'arte-abstracto', 'Acid': 'arte-abstracto', 'Arte': 'arte-abstracto', 'Astros': 'arte-abstracto',
  'Cloud': 'arte-abstracto', 'Craneos': 'arte-abstracto', 'Espacio': 'arte-abstracto', 'Estrellitas': 'arte-abstracto',
  'Garabato': 'arte-abstracto', 'MAR': 'arte-abstracto', 'Museo': 'arte-abstracto', 'Ojos': 'arte-abstracto',
  'Ondas': 'arte-abstracto', 'Pass Modificable': 'arte-abstracto', 'Piano': 'arte-abstracto', 'Rare': 'arte-abstracto',
  'Topografia': 'arte-abstracto',
  // cute-tierno
  'Besos': 'cute-tierno', 'Corazones': 'cute-tierno', 'Cute': 'cute-tierno', 'Poison': 'cute-tierno',
  // animales
  'Agropecuario': 'animales', 'Animal Print': 'animales', 'Caballos': 'animales', 'Cerditos': 'animales',
  'Floral': 'animales', 'Gatos': 'animales', 'Margaritas': 'animales', 'Mascotas': 'animales',
  'Ositos': 'animales', 'Patitos': 'animales', 'Perros Criollos': 'animales', 'Zebra': 'animales',
  // fiesta
  '4_20': 'fiesta', 'Alcohol': 'fiesta', 'Alcolirycoz': 'fiesta', 'Aliens': 'fiesta', 'Antisocial': 'fiesta',
  'Aventuras en pañales': 'fiesta', 'Casino': 'fiesta', 'Cerveza corona': 'fiesta', 'Dolar': 'fiesta',
  'Fcks News': 'fiesta', 'Halloween': 'fiesta', 'Happy face Transluced': 'fiesta', 'Migajera': 'fiesta',
  'NO': 'fiesta', 'Parental': 'fiesta', 'Pride': 'fiesta', 'Snake': 'fiesta',
};

function refineGroup(p) {
  if (p.type === 'cuadro') return 'cuadros';
  if (p.context === 'Anime') return 'anime';
  if (p.context && p.context.indexOf('Liga Colombiana') !== -1) return 'futbol-colombia';
  if (p.context && (
    p.context.indexOf('La Liga España') !== -1 ||
    p.context.indexOf('Premier Legue Inglaterra') !== -1 ||
    p.context.indexOf('Liga 1 Francesa') !== -1 ||
    p.context.indexOf('Calcio Italia') !== -1 ||
    p.context.indexOf('Selecciones') !== -1
  )) return 'futbol-internacional';
  if (p.context === 'Cars') return 'autos-motos';
  if (NAME_MAP[p.name]) return NAME_MAP[p.name];
  console.warn('UNMAPPED:', p.name, '| context:', p.context, '| old group:', p.group);
  return p.group; // fallback: keep old broad group
}

data.products = data.products.map(p => {
  const group = refineGroup(p);
  return { ...p, group, groupLabel: GROUPS[group] || p.groupLabel };
});

const counts = {};
data.products.forEach(p => { counts[p.group] = (counts[p.group] || 0) + 1; });
data.groups = Object.keys(GROUPS).filter(g => counts[g]).map(g => ({ id: g, label: GROUPS[g], count: counts[g] }));

fs.writeFileSync(CATALOG_PATH, JSON.stringify(data, null, 0));
console.log('Total products:', data.products.length);
console.log('Groups:', data.groups.map(g => g.label + '(' + g.count + ')').join(', '));
console.log('Sum check:', data.groups.reduce((s, g) => s + g.count, 0));
