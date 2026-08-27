const sharp = require('sharp');
const path = require('path');

const SRC = 'C:/Users/Lenovo/Desktop/ZUNE/Logo-Zune (2).png';
const OUT = path.join(__dirname, '..', 'assets', 'img', 'logo');
const LEFT_W = Math.round(2724 * 0.565);

async function main() {
  await sharp(SRC)
    .extract({ left: Math.round(2724 * 0.565), top: 0, width: Math.round(2724 * 0.435), height: 1130 })
    .trim({ threshold: 10 })
    .toFile(path.join(OUT, 'logo-icon.png'));

  await sharp(SRC)
    .extract({ left: 0, top: 40, width: LEFT_W, height: 420 })
    .trim({ threshold: 10 })
    .toFile(path.join(OUT, 'logo-purple.png'));

  await sharp(SRC)
    .extract({ left: 0, top: 580, width: LEFT_W, height: 420 })
    .trim({ threshold: 10 })
    .toFile(path.join(OUT, 'logo-black.png'));

  await sharp(SRC)
    .extract({ left: 0, top: 1080, width: LEFT_W, height: 528 })
    .trim({ threshold: 10 })
    .toFile(path.join(OUT, 'logo-whiteonpurple.png'));

  console.log('done');
}
main().catch(e => { console.error(e); process.exit(1); });
