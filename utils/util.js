const pinMonitor = (mode) => {
  const regs = [
    2, 3, 4, 5, 6, 9,
    10, 11, 12, 13, 15, 18, 19,
    21, 23, 24, 25, 26, 27, 28, 29,
    31, 32, 33, 34, 35, 36, 37, 38, 39,
    40, 41, 42, 43, 44, 45, 46, 47
  ];

  let pr = {};
  regs.forEach(r => {
    Pin(r).mode(mode);
  });

  setInterval(() => {
    regs.forEach(r => {
      const val = digitalRead(r);
      if (val != pr[r]) {
        console.log(r, val);
        pr[r] = val;
      }
    });
  }, 100);
};

const scanI2C = (sda, scl) => {
  I2C1.setup({ sda: sda, scl: scl });
  for (let reg = 8; reg < 127; reg++) {
    try {
      I2C1.writeTo(reg, 0);
      I2C1.readFrom(reg, 1).forEach(val => {
        console.log('found i2c on scl', scl, 'sda', sda, 'reg', Number(reg).toString(16), 'reg0', val);
      });
    } catch (e) {
    }
  }
  Pin(scl).mode('input');
  Pin(sda).mode('input');
};

const pinScan = () => {
  const regs = [
    2, 3, 4, 5, 6, 9,
    10, 11, 12, 13, 15, 18, 19,
    21, 23, 24, 25, 26, 27, 28, 29,
    31, 32, 33, 34, 35, 36, 37, 38, 39,
    40, 41, 42, 43, 44, 45, 46, 47
  ];
  let a = 0;
  let b = 0;
  const int = setInterval(() => {
    if (a >= b) { console.log('.', b); b++; a = 0; };
    if (b >= regs.length) { console.log('done'); clearInterval(int); return };

    if (a != b && a != undefined && b != undefined) {
      scanI2C(regs[a], regs[b]);
      scanI2C(regs[b], regs[a]);
    }
    a++;
  }, 500);
}

const pinScan2 = (sda) => {
  const regs = [
    2, 3, 4, 5, 6, 9,
    10, 11, 12, 13, 15, 18, 19,
    21, 23, 24, 25, 26, 27, 28, 29,
    31, 32, 33, 34, 35, 36, 37, 38, 39,
    40, 41, 42, 43, 44, 45, 46, 47
  ];
  const i = setInterval(() => {
    if (regs.length === 0) { console.log('done'); clearInterval(i); return; }
    const b = regs.shift();
    scanI2C(sda, b);
  }, 500);
}
