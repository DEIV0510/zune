const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const CATALOGO_SRC = 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo';
const CUADROS_SRC = 'C:/Users/Lenovo/Desktop/ZUNE/Cuadros Personalizados';
const ROOT = path.join(__dirname, '..');
const OUT_IMG = path.join(ROOT, 'assets', 'img', 'catalog');
const EXCLUDE_TOP = new Set(['xxx']); // adult-content folder, excluded from the public catalog

const IMG_EXT = /\.(jpe?g|png|webp)$/i;

function slug(s) {
  return s.toString().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ---------- Meta-group mapping ----------
const GROUPS = {
  cuadros: 'Cuadros personalizados',
  deportes: 'Deportes',
  personajes: 'Personajes y entretenimiento',
  musica: 'Música y cultura urbana',
  marcas: 'Marcas y vehículos',
  arte: 'Arte y abstracto',
  animales: 'Animales y naturaleza',
  fiesta: 'Fiesta y variados',
  otros: 'Otros diseños',
};

const TOP_GROUP_MAP = {
  'Marvel':'personajes','Mickey Mouse':'personajes','Lilo y Stitch':'personajes','Barbie':'personajes',
  'Harry Potter':'personajes','Star wars':'personajes','Simpsons':'personajes','Rick y Morty':'personajes',
  'Tom y Jerry':'personajes','Lonney Toons':'personajes','Ed, edd y eddy':'personajes','Garfield':'personajes',
  'Pantera Rosa':'personajes','Chicas super poderosas':'personajes','Rey Leon':'personajes','Aladin':'personajes',
  'Snoopy':'personajes','Intensamente':'personajes','Hello KittyKuromi':'personajes','Bob':'personajes',
  'KAWS':'personajes','Ripndip':'personajes','Pokemon':'personajes','Mario Bross':'personajes','Game':'personajes',
  'Mac Pato':'personajes',
  'Bad Bunny':'musica','Karol G':'musica','Ferxxo':'musica','Blessd':'musica','Ryan Castro':'musica',
  'Young Miko':'musica','Balvin':'musica','RBD':'musica','RAP':'musica','Cantantes Popular':'musica',
  'Cantantes Regueton':'musica','Spotify':'musica','Scarface':'musica','Peaky Blinders':'musica',
  'Nike':'marcas','Adidas':'marcas','Coca Cola':'marcas','Starbucks':'marcas','Supreme':'marcas',
  'Polo Club':'marcas','DHL':'marcas','Malboro':'marcas','Tio Rico':'marcas','Marcas':'marcas',
  'NASA':'marcas','Monopoly':'marcas','Drift':'marcas','Audi':'marcas','Cars':'marcas','Drew':'marcas',
  'Messi':'deportes','CR7':'deportes','NBA':'deportes',
  'Abstracto':'arte','Acid':'arte','Arte':'arte','Cloud':'arte','Craneos':'arte','Espacio':'arte',
  'Estrellitas':'arte','Garabato':'arte','MAR':'arte','Museo':'arte','Ojos':'arte','Ondas':'arte',
  'Rare':'arte','Topografia':'arte','Cute':'arte','Corazones':'arte','Besos':'arte','Poison':'arte',
  'Piano':'arte','Astros':'arte','Pass Modificable':'arte',
  'Agropecuario':'animales','Animal Print':'animales','Caballos':'animales','Cerditos':'animales',
  'Gatos':'animales','Mascotas':'animales','Ositos':'animales','Patitos':'animales','Perros Criollos':'animales',
  'Zebra':'animales','Floral':'animales','Margaritas':'animales',
  'Alcohol':'fiesta','Alcolirycoz':'fiesta','Casino':'fiesta','Cerveza corona':'fiesta','Dolar':'fiesta',
  'Halloween':'fiesta','NO':'fiesta','Snake':'fiesta','4_20':'fiesta','Aventuras en pañales':'fiesta',
  'Happy face Transluced':'fiesta','Parental':'fiesta','Fcks News':'fiesta','Antisocial':'fiesta',
  'Aliens':'fiesta','Migajera':'fiesta','Pride':'fiesta',
};

function groupFor(relDir) {
  const top = relDir.split(path.sep)[0];
  if (top === 'Deportivos') return 'deportes';
  if (top === 'Anime') return 'personajes';
  return TOP_GROUP_MAP[top] || 'otros';
}

const DESC_TEMPLATES = {
  deportes: n => `Lleva tu pasión por ${n} en una funda personalizada.`,
  personajes: n => `Diseño ${n} disponible para personalizar tu funda.`,
  musica: n => `Estampado ${n} para una funda a tu estilo.`,
  marcas: n => `Diseño ${n} disponible para tu funda personalizada.`,
  arte: n => `Diseño ${n} para una funda única y personal.`,
  animales: n => `Estampado ${n} para tu funda personalizada.`,
  fiesta: n => `Diseño ${n} disponible para tu funda personalizada.`,
  otros: n => `Diseño ${n} disponible para tu funda personalizada.`,
};

function cleanName(seg) {
  return seg.replace(/\s+/g, ' ').trim();
}

// ---------- Walk Catálogo, group files by containing folder ----------
function walk(dir, base, map) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    if (e.isDirectory()) {
      if (base === '' && EXCLUDE_TOP.has(e.name)) continue;
      walk(path.join(dir, e.name), base ? path.join(base, e.name) : e.name, map);
    } else if (IMG_EXT.test(e.name)) {
      files.push(e.name);
    }
  }
  if (files.length) {
    files.sort();
    map.set(base, files.map(f => path.join(dir, f)));
  }
}

const folderMap = new Map();
walk(CATALOGO_SRC, '', folderMap);

const fundaProducts = [];
for (const [relDir, files] of folderMap.entries()) {
  const segs = relDir.split(path.sep);
  const name = cleanName(segs[segs.length - 1]);
  const group = groupFor(relDir);
  const id = 'funda-' + slug(relDir);
  fundaProducts.push({
    id,
    type: 'funda',
    name,
    context: segs.length > 1 ? segs.slice(0, -1).join(' · ') : '',
    group,
    groupLabel: GROUPS[group],
    description: DESC_TEMPLATES[group](name),
    waMessage: `Hola Zune, estoy interesado en cotizar el producto: Funda ${name}.`,
    srcImages: files,
  });
}

// ---------- Cuadros (already known structure) ----------
const CUADRO_DEFS = [
  { id: 'cuadro-nacional-1989', name: 'Atlético Nacional 1989', dir: 'Futbol/Atletico Nacional/1989', desc: 'Cuadro acrílico con la camiseta histórica campeona de Copa Libertadores 1989.' },
  { id: 'cuadro-nacional-2016', name: 'Atlético Nacional 2016', dir: 'Futbol/Atletico Nacional/2016', desc: 'Cuadro acrílico con la camiseta campeona de Copa Libertadores 2016.' },
  { id: 'cuadro-messi', name: 'Lionel Messi', dir: 'Futbol/Messi', desc: 'Cuadro conmemorativo personalizado de Lionel Messi con Argentina.' },
  { id: 'cuadro-cr7', name: 'Cristiano Ronaldo', dir: 'Futbol/CR7', desc: 'Cuadro personalizado con la camiseta de Cristiano Ronaldo.' },
  { id: 'cuadro-neymar', name: 'Neymar Jr.', dir: 'Futbol/Neymar', desc: 'Cuadro conmemorativo personalizado de Neymar Jr. con Brasil.' },
  { id: 'cuadro-maradona', name: 'Diego Maradona', dir: 'Futbol/Maradona', desc: 'Cuadro conmemorativo personalizado de Diego Maradona con Argentina.' },
  { id: 'cuadro-james', name: 'James Rodríguez', dir: 'Futbol/James', desc: 'Cuadro conmemorativo personalizado de James Rodríguez con Colombia.' },
];

const cuadroProducts = CUADRO_DEFS.map(def => {
  const dir = path.join(CUADROS_SRC, def.dir);
  const files = fs.readdirSync(dir).filter(f => IMG_EXT.test(f)).sort().map(f => path.join(dir, f));
  return {
    id: def.id,
    type: 'cuadro',
    name: def.name,
    context: '',
    group: 'cuadros',
    groupLabel: GROUPS.cuadros,
    description: def.desc,
    waMessage: `Hola Zune, estoy interesado en cotizar el producto: Cuadro ${def.name}.`,
    srcImages: files,
  };
});

const allProducts = [...cuadroProducts, ...fundaProducts];
console.log('Total products:', allProducts.length, '| cuadros:', cuadroProducts.length, '| fundas:', fundaProducts.length);
const totalImgs = allProducts.reduce((s, p) => s + p.srcImages.length, 0);
console.log('Total source images to process:', totalImgs);

// ---------- Image processing ----------
fs.mkdirSync(OUT_IMG, { recursive: true });

async function processProduct(p, idx) {
  const dir = path.join(OUT_IMG, p.id);
  fs.mkdirSync(dir, { recursive: true });
  const images = [];
  for (let i = 0; i < p.srcImages.length; i++) {
    const src = p.srcImages[i];
    const outName = `${i + 1}.webp`;
    const outPath = path.join(dir, outName);
    try {
      await sharp(src).rotate().resize({ width: 860, withoutEnlargement: true }).webp({ quality: 76 }).toFile(outPath);
      images.push(`assets/img/catalog/${p.id}/${outName}`);
    } catch (e) {
      console.error('FAILED', src, e.message);
    }
  }
  let thumb = images[0] || '';
  if (images[0]) {
    const thumbPath = path.join(dir, 'thumb.webp');
    try {
      await sharp(p.srcImages[0]).rotate().resize({ width: 420, withoutEnlargement: true }).webp({ quality: 72 }).toFile(thumbPath);
      thumb = `assets/img/catalog/${p.id}/thumb.webp`;
    } catch (e) { /* keep first full image as thumb fallback */ }
  }
  return { id: p.id, type: p.type, name: p.name, context: p.context, group: p.group, groupLabel: p.groupLabel, description: p.description, waMessage: p.waMessage, thumb, images };
}

async function main() {
  const out = [];
  for (let i = 0; i < allProducts.length; i++) {
    const p = allProducts[i];
    const res = await processProduct(p, i);
    out.push(res);
    if ((i + 1) % 10 === 0 || i === allProducts.length - 1) console.log(`processed ${i + 1}/${allProducts.length}`);
  }

  const groupCounts = {};
  out.forEach(p => { groupCounts[p.group] = (groupCounts[p.group] || 0) + 1; });
  const groupList = Object.keys(GROUPS).filter(g => groupCounts[g]).map(g => ({ id: g, label: GROUPS[g], count: groupCounts[g] }));

  fs.writeFileSync(path.join(ROOT, 'assets', 'catalog.json'), JSON.stringify({ groups: groupList, products: out }, null, 0));
  console.log('DONE. Wrote catalog.json with', out.length, 'products.');
  console.log('Groups:', groupList);
}

main().catch(e => { console.error(e); process.exit(1); });
