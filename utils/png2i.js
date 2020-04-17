if (process.argv.length < 4) {
    console.error('Usage: png2raw <filename.png> <name>');
    process.exit(1);
}

const png = process.argv[2];
const filename = process.argv[3];

if (filename.length > 7) {
    console.error('Filename cannot be more than 7 symbols');
    process.exit(1);
}

var PNG = require('png-js');
PNG.decode(png, (p) => {
    console.log('let s=require("Storage");');
    console.log(`s.erase("${filename}");`);
    const result = [];
    for (let pt = 0; pt < p.length; pt += 4) {
        // writing 5-6-5 data
        const r = p[pt] & 0b11111;
        const g = p[pt + 1] & 0b111111;
        const b = p[pt + 2] & 0b11111;
        const j = (r << 3) + (g >> 3);
        const q = (g & 0b111 << 5) + b;
        // console.log(r, g, b, j, q);
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


