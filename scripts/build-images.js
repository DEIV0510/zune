const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const IMG = path.join(ROOT, 'assets', 'img');

function slug(s) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const CUADROS = [
  { file: 'C:/Users/Lenovo/Desktop/ZUNE/Cuadros Personalizados/Futbol/Atletico Nacional/1989/Cuadro Nacional Acrilico Mockup 1989 A.jpg', slug: 'nacional-1989', alt: 'Cuadro personalizado acrílico camiseta histórica Atlético Nacional 1989' },
  { file: 'C:/Users/Lenovo/Desktop/ZUNE/Cuadros Personalizados/Futbol/Atletico Nacional/2016/Cuadro Nacional Acrilico Mockup 2016.jpg', slug: 'nacional-2016', alt: 'Cuadro personalizado acrílico camiseta Atlético Nacional campeón Copa Libertadores 2016' },
  { file: 'C:/Users/Lenovo/Desktop/ZUNE/Cuadros Personalizados/Futbol/Messi/Cuadro Messi PORTAA.jpg', slug: 'messi', alt: 'Cuadro personalizado conmemorativo de Lionel Messi con Argentina' },
  { file: 'C:/Users/Lenovo/Desktop/ZUNE/Cuadros Personalizados/Futbol/CR7/Cuadro CR7 camiseta.jpg', slug: 'cr7', alt: 'Cuadro personalizado camiseta de Cristiano Ronaldo Portugal' },
  { file: 'C:/Users/Lenovo/Desktop/ZUNE/Cuadros Personalizados/Futbol/Neymar/Mockup Neymar Last.jpg', slug: 'neymar', alt: 'Cuadro personalizado conmemorativo de Neymar Jr con Brasil' },
  { file: 'C:/Users/Lenovo/Desktop/ZUNE/Cuadros Personalizados/Futbol/Maradona/Mockup Maradona.jpg', slug: 'maradona', alt: 'Cuadro personalizado conmemorativo de Diego Maradona con Argentina' },
  { file: 'C:/Users/Lenovo/Desktop/ZUNE/Cuadros Personalizados/Futbol/James/Mockup James Last.jpg', slug: 'james', alt: 'Cuadro personalizado conmemorativo de James Rodríguez con Colombia' },
];

const FUNDAS = [
  ['Abstracto', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Abstracto/Pastel 2.jpg'],
  ['Floral', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Floral/Girasoles.jpg'],
  ['Cute', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Cute/05.jpg'],
  ['Animal Print', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Animal Print/Zebra copia.jpg'],
  ['Craneos', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Craneos/Craneo 2.jpg'],
  ['Espacio', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Espacio/Space.jpg'],
  ['Ondas', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Ondas/Ondas.jpg'],
  ['Corazones', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Corazones/Corazones 02.jpg'],
  ['Estrellitas', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Estrellitas/stars.jpg'],
  ['Arte', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Arte/David.jpg'],
  ['Topografia', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Topografia/Topografia W.jpg'],
  ['Museo', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Museo/08 copia.jpg'],
  ['Gatos', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Gatos/Cats.jpg'],
  ['Perros Criollos', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Perros Criollos/PC 01.jpg'],
  ['Mascotas', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Mascotas/Perritos.jpg'],
  ['Halloween', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Halloween/Halloween 1.jpg'],
  ['Casino', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Casino/Casino2.jpg'],
  ['Piano', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Piano/Piano.jpg'],
  ['Poison', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Poison/Poison.jpg'],
  ['Zebra', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Zebra/Zebra copia.jpg'],
  ['Garabato', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Garabato/Garabatos.jpg'],
  ['Cloud', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Cloud/verde rosa azul.jpg'],
  ['Ojos', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Ojos/Ojos.jpg'],
  ['Rare', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Rare/Rare stickers.jpg'],
  ['Marvel', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Marvel/SpiderMan 01.jpg'],
  ['NBA', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/NBA/Lakers NBA.jpg'],
  ['Bad Bunny', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Bad Bunny/Bad Bunny 2025.jpg'],
  ['Karol G', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Karol G/Karol G 1.jpg'],
  ['Nike', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Nike/Nike White.jpg'],
  ['Adidas', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Adidas/Adidas copia.jpg'],
  ['Coca Cola', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Coca Cola/Coca-cola original.jpg'],
  ['Harry Potter', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Harry Potter/Harry Potter 2.jpg'],
  ['Star Wars', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Star wars/003.jpg'],
  ['Simpsons', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Simpsons/Collage.jpg'],
  ['Anime', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Anime/Dragon Ball/GOKU.jpg'],
  ['Pokemon', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Pokemon/Charizard.jpg'],
  ['Barbie', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Barbie/Barbie.jpg'],
  ['CR7', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/CR7/CR7 (1).jpg'],
  ['Messi', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Messi/Messi.jpg'],
  ['Mickey Mouse', 'C:/Users/Lenovo/Desktop/ZUNE/Catálogo/Mickey Mouse/Mickey 1.jpg'],
].map(([cat, file]) => ({ cat, file, slug: slug(cat) }));

async function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

async function processCuadro(item) {
  const outDir = path.join(IMG, 'cuadros');
  await sharp(item.file).rotate().resize({ width: 1400, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(outDir, `${item.slug}-lg.webp`));
  await sharp(item.file).rotate().resize({ width: 760, withoutEnlargement: true }).webp({ quality: 78 }).toFile(path.join(outDir, `${item.slug}.webp`));
  await sharp(item.file).rotate().resize({ width: 60, withoutEnlargement: true }).blur(3).webp({ quality: 40 }).toFile(path.join(outDir, `${item.slug}-lqip.webp`));
}

async function processFunda(item, i) {
  const outDir = path.join(IMG, 'gallery');
  const base = `${String(i + 1).padStart(2, '0')}-${item.slug}`;
  await sharp(item.file).rotate().resize({ width: 560, withoutEnlargement: true }).webp({ quality: 75 }).toFile(path.join(outDir, `${base}.webp`));
  await sharp(item.file).rotate().resize({ width: 1100, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(outDir, `${base}-full.webp`));
}

async function processLogo() {
  const outDir = path.join(IMG, 'logo');
  await sharp(path.join(outDir, 'logo-icon.png')).resize(512, 512).png({ quality: 90 }).toFile(path.join(outDir, 'icon-512.png'));
  await sharp(path.join(outDir, 'logo-icon.png')).resize(192, 192).png({ quality: 90 }).toFile(path.join(outDir, 'icon-192.png'));
  await sharp(path.join(outDir, 'logo-icon.png')).resize(32, 32).png({ quality: 90 }).toFile(path.join(outDir, 'favicon-32.png'));
  await sharp(path.join(outDir, 'logo-icon.png')).resize(180, 180).png({ quality: 90 }).toFile(path.join(outDir, 'apple-touch-icon.png'));
  for (const f of ['logo-icon', 'logo-black', 'logo-purple', 'logo-whiteonpurple']) {
    await sharp(path.join(outDir, `${f}.png`)).resize({ width: 600, withoutEnlargement: true }).webp({ quality: 90 }).toFile(path.join(outDir, `${f}.webp`));
  }
}

async function main() {
  ensureDir(path.join(IMG, 'cuadros'));
  ensureDir(path.join(IMG, 'gallery'));
  ensureDir(path.join(IMG, 'logo'));

  await processLogo();
  console.log('logo done');

  for (const c of CUADROS) { await processCuadro(c); console.log('cuadro', c.slug); }

  for (let i = 0; i < FUNDAS.length; i++) { await processFunda(FUNDAS[i], i); console.log('funda', FUNDAS[i].slug); }

  fs.writeFileSync(path.join(ROOT, 'assets', 'cuadros-manifest.json'), JSON.stringify(CUADROS, null, 2));
  fs.writeFileSync(path.join(ROOT, 'assets', 'fundas-manifest.json'), JSON.stringify(FUNDAS.map((f, i) => ({ ...f, base: `${String(i + 1).padStart(2, '0')}-${f.slug}` })), null, 2));

  console.log('ALL DONE');
}

main().catch(e => { console.error(e); process.exit(1); });
