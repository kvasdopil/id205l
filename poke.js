// trying to figure what is wrong with REGB

const REGA = 0x50000000;
const REGB = 0x50000300;
const MODE = 0x700;
const IN = 0x510;
Pin(30).mode('input_pullup');
Pin(31).mode('input_pulldown');

const getMode = i => peek32((i < 32 ? REGA : REGB) + MODE + (i % 32) * 4);
const getVal = i => (peek32((i < 32 ? REGA : REGB) + IN) >> (i % 32)) & 1;
const setMode = (i, mode) => poke32((i < 32 ? REGA : REGB) + MODE + (i % 32) * 4, mode);


const MODE_PULLUP = 12;
const MODE_PULLDOWN = 4;

for (let i = 31; i < 47; i++) {
  setMode(i, 0);
}

console.log("Pin, getMode, read(), mode#, value in reg");
for (let i = 0; i < 47; i++) {
  const mode = getMode(i);
  const val = getVal(i);
  console.log(
    i,
    Pin(i).getMode(),
    0 + Pin(i).read(),
    mode,
    val
  );
}

const oldv = {};
setInterval(() => {
  for (let i = 0; i < 47; i++) {
    const val = getVal(i);
    if (oldv[i] !== val) {
      console.log(i, val);
      oldv[i] = val;
    }
  }
}, 100);

// pullup
// 40 = 0
// input
// 41 = 1
