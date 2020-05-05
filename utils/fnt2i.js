const path = require('path');
const PNG = require('png-js');
const fs = require('fs');

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
      console.log(fields);
      const type = fields.shift();
      return fields.reduce((prev, field) => {
        const [key, value] = field.split('=');
        prev[key] = /^[0-9-]+$/.test(value) ? parseInt(value, 10) : value;
        return prev;
      }, { type });
    });

  console.log(data.filter(i => i.type === 'char').filter(i => i.width > i.xadvance));
};

main(process.argv);