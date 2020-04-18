const path = require('path');
const PNG = require('png-js');

if (process.argv.length < 3) {
    console.error('Usage: png2raw <filename.png>');
    process.exit(1);
}

const png = process.argv[2];
const filename = path.basename(png, '.png') + '.i';

if (filename.length > 7) {
    console.error(`Filename ${filename} cannot be more than 7 symbols`);
    process.exit(1);
}

PNG.decode(png, (p) => {
    console.log('let s=require("Storage");');
    console.log(`s.erase("${filename}");`);
    const result = [];
    for (let pt = 0; pt < p.length; pt += 4) {
        // writing 5-6-5 data
        const r = p[pt] >> 3;
        const g = p[pt + 1] >> 2;
        const b = p[pt + 2] >> 3;

        const j = (r << 3) + (g >> 3);
        const q = ((g << 5) + b) & 0xff;

        result.push(j);
        result.push(q);
    }

    const size = result.length;
    const step = 1024;
    let offset = 0;
    while (result.length) {
        const i = result.slice(0, step);
        console.log(`s.write("${filename}", [${i.join(',')}], ${offset}, ${size});`);
        console.log(`console.log("${offset} of ${size}");`);
        result.splice(0, step);
        offset += step;
    }
    console.log('echo("Upload done");')
});


