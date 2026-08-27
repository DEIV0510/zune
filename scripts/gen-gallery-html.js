const fs = require('fs');
const path = require('path');

function slug(s) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const CATS = ['Abstracto','Floral','Cute','Animal Print','Craneos','Espacio','Ondas','Corazones','Estrellitas','Arte','Topografia','Museo','Gatos','Perros Criollos','Mascotas','Halloween','Casino','Piano','Poison','Zebra','Garabato','Cloud','Ojos','Rare','Marvel','NBA','Bad Bunny','Karol G','Nike','Adidas','Coca Cola','Harry Potter','Star Wars','Simpsons','Anime','Pokemon','Barbie','CR7','Messi','Mickey Mouse'];

const featured = new Set([1, 6, 13, 20, 25, 30, 35]); // indices (1-based) that span 2x2 for visual rhythm

const items = CATS.map((cat, i) => {
  const idx = i + 1;
  const base = `${String(idx).padStart(2, '0')}-${slug(cat)}`;
  const big = featured.has(idx) ? ' gal-big' : '';
  return `        <button class="gal-item${big}" data-full="/assets/img/gallery/${base}-full.webp" data-caption="Diseño para funda — ${cat}" aria-label="Ver diseño ${cat} en grande">
          <img src="/assets/img/gallery/${base}.webp" alt="Diseño de personalización para funda de celular estilo ${cat}" loading="lazy" decoding="async" width="560" height="560">
          <span class="gal-tag">${cat}</span>
        </button>`;
}).join('\n');

fs.writeFileSync(path.join(__dirname, 'gallery-snippet.html'), items);
console.log('written', items.length, 'chars');
