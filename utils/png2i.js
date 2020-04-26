const path = require('path');
const PNG = require('png-js');

async function main(argv) {
  argv.shift();
  argv.shift();

  let bw = false;
  let w = 0;
  let h = 0;
  let input = argv.shift();
  if (input === '--bw') {
    input = argv.shift();
    bw = true;
  }
  if (input === '-w') {
    w = parseInt(argv.shift(), 10);
    input = argv.shift();
  }
  if (input === '-h') {
    h = parseInt(argv.shift(), 10);
    input = argv.shift();
  }
  if (input === undefined) {
    console.error('Usage: png2raw [--bw] <filename.png>');
    process.exit(1);
  }
  const output = path.basename(input, '.png') + '.i';
  const data = await new Promise(resolve => PNG.decode(input, resolve));
  const result = [];
  for (let i = 0; i < data.length; i += 4) {
    // writing 5-6-5 data
    const r = data[i] >> 3;
    const g = data[i + 1] >> 2;
    const b = data[i + 2] >> 3;

    if (bw) {
      result.push(g);
    } else {
      const j = (r << 3) + (g >> 3);
      const q = ((g << 5) + b);

      result.push(j & 0xff);
      result.push(q & 0xff);
    }
  }

  // dump(result, w);

  result.unshift(w);
  result.unshift(h);
  result.unshift(bw ? 8 : 16);
  result.unshift(0);
  print(result, output);
  // console.log(result.length, result.join(','));
  // const zipped = zip(result);
  // print(zipped, output + '.z');
  // console.log(zipped.length, zipped.join(','));
}

main(process.argv);

function zip(data) {
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
      // console.log('sequence', val, 'x', length);
      result.push(val + 0b10000000);
      result.push(length);
    } else {
      result.push(val);
    }
    // if (i > 2) {
    //   result.push(val + 0b10000000);
    //   result.push(i);
    //   while (i) { data.shift(); i--; };
    // }
    // else {
    //   result.push(i);
    // }
  }
  return result;
}

function print(content, filename) {
  const data = content.map(i => i);
  console.log('let s=require("Storage");');
  console.log(`s.erase("${filename}");`);
  const size = data.length;
  const step = 1024;
  let offset = 0;
  while (data.length) {
    const chunk = data.slice(0, step);
    console.log(`s.write("${filename}", [${chunk.join(',')}], ${offset}, ${size});`);
    console.log(`console.log("${offset + chunk.length} of ${size}");`);
    data.splice(0, step);
    offset += step;
  }
  console.log(`echo("Upload ${filename} done");`)
}

function i2s(r) {
  return String(r).padStart(4, ' ');
}

function dump(pixels, w) {
  const data = pixels.map(i => i);
  const rows = [];
  while (data.length) {
    rows.push(data.splice(0, w - 1));
  };

  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];

    const zipped = [];
    zipped.push(i2s(`=${row[0]}`));

    for (let i = 1; i < row.length; i++) {
      const diffL = row[i] - row[i - 1];
      const diffU = y > 0 ? row[i] - rows[y - 1][i] : 0xff;
      if (diffU === 0) {
        zipped.push('   ^');
        continue;
      }
      if (diffL === 0) {
        zipped.push('   <');
        continue;
      }
      zipped.push(i2s(Math.min(Math.abs(diffU), Math.abs(diffL))));
    }

    console.log(zipped.join(''));
  }
}