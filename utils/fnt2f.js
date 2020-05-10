const path = require('path');
const PNG = require('png-js');
const fs = require('fs');

const asPixels = (data, w, h) => {
  const result = [];
  for (let y = 0; y < h; y++) {
    const line = new Uint32Array(w);
    for (let x = 0; x < w; x++) {
      line[x] = data.readUInt32BE((y * w + x) * 4);
    }
    result.push(line);
  }
  return result;
}

function print(glyphs, filename) {
  const totalLength = glyphs.reduce((a, b) => a + b.length, 0);
  console.log(`s.erase("${filename}");`);
  let offset = 0;
  glyphs.forEach((chunk, i) => {
    console.log(`s.write("${filename}", [${chunk.join(',')}], ${offset}, ${totalLength});`);
    console.log(`console.log("${filename} glyph ${i} done, written ${offset + chunk.length} of ${totalLength} bytes");`);
    offset += chunk.length;
  });
  console.log(`console.log("Upload ${filename} done", s.getFree(), "memory left");`);
}

function rle(content) {
  const data = content.map(i => i);
  result = [];
  while (data.length) {
    const val = data.shift();
    let length = 0;
    if (data[0] === val) {
      // start rle
      length = 1;
      while (data[0] === val && length < 256 && data.length) {
        length++;
        data.shift();
      }
      result.push(val + 0b10000000);
      result.push(length);
    } else {
      result.push(val);
    }
  }
  return result;
}

async function main(argv) {
  argv.shift();
  argv.shift();

  if (argv.length < 1) {
    console.error('Usage: node fnt2i.js <font-file.fnt>');
    process.exit(0);
  }
  const fntFile = argv.shift();

  const data = fs.readFileSync(fntFile)
    .toString()
    .trim()
    .split('\n')
    .map(line => line
      .trim()
      .split(/[\t ]+/)
    )
    .map(fields => {
      const type = fields.shift();
      return fields.reduce((prev, field) => {
        const [key, value] = field.split('=');
        prev[key] = /^[0-9-]+$/.test(value) ? parseInt(value, 10) : value;
        return prev;
      }, { type });
    });

  const pngFileName = path.dirname(fntFile) + '/' + data.find(line => line.type === 'page').file.replace(/"/g, '');

  const png = PNG.load(pngFileName);
  const rawImgData = await new Promise(resolve => png.decode(resolve));
  const pixels = asPixels(rawImgData, png.width, png.height); // as 2-dimensional 32-bit RGBA data

  // convert glyphs
  const glyphs = [];
  data.filter(({ type }) => type === 'char').forEach(char => {
    const result = [];
    result.push(11); // 11-fnt data
    result.push(char.id);
    result.push(char.width);
    result.push(char.height);
    result.push(char.xoffset);
    result.push(char.yoffset);
    result.push(char.xadvance);

    // add kernings
    const kernings = data.filter(({ type, second }) => type === 'kerning' && second === char.id);
    result.push(kernings.length);
    kernings.forEach(kern => {
      result.push(kern.first);
      result.push(kern.amount);
    });

    // add pixel data
    const pixelData = [];
    for (let y = 0; y < char.height; y++) {
      for (let x = 0; x < char.width; x++) {
        const rgba = pixels[char.y + y][char.x + x];
        pixelData.push((rgba >> 10) & 0b111111); // only use blue channel
      }
    }

    // compress pixel data
    rle(pixelData).forEach(p => result.push(p));

    const length = result.length;
    result.unshift(length & 0xff);
    result.unshift(length >> 8);

    glyphs.push(result);
  });

  print(glyphs, path.basename(fntFile, '.fnt') + '.f');
};

main(process.argv);