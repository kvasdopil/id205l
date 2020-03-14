/*let i = 0;
let int = setInterval(() => {
  console.log(i);
  digitalWrite(i, 1);
  setTimeout(() => {
    digitalWrite(i, 0);
  }, 500);
  i++;
  if (i == 32) {
    clearInterval(int);
  }
}, 1000);*/

const BACKLIGHT = D16;
const VIBRO = D25;
const B1 = D14;

const backlight = (on) => digitalWrite(BACKLIGHT, on);
const buzz = (duration) => digitalPulse(VIBRO, 1, duration);

backlight(1);
setTimeout(() => backlight(0), 1000);

buzz([50, 50, 50]);

setWatch(() => {
  console.log('btn!');
  buzz(50);
}, B1, { edge: 'falling', debounce: 50, repeat: true });


let i = 0;
let ii = new I2C();

const scan = (sda, scl) => {
  console.log(sda, scl);
  ii.setup({ sda: sda, scl: scl });
  for (let reg = 8; reg < 127; reg++) {
    try {
      ii.writeTo(reg, 0);
      console.log('found i2c on scl', scl, 'sda', sda, 'reg', reg);
      // console.log(ii.readFrom(reg, 1));
      return;
    } catch (e) {
    }
  }
  console.log('nothing on scl', scl, 'sda', sda);
  digitalWrite(scl, 0);
  digitalWrite(sda, 0);
};

const scan2 = (sda, scl) => {
  console.log(sda, scl);
  I2C1.setup({ sda: sda, scl: scl });
  for (let reg = 8; reg < 127; reg++) {
    try {
      I2C1.writeTo(reg, 0);
      console.log('found i2c on scl', scl, 'sda', sda, 'reg', reg);
      // console.log(I2C1.readFrom(reg, 1));
      return;
    } catch (e) {
    }
  }
  console.log('nothing on scl', scl, 'sda', sda);
  digitalWrite(scl, 0);
  digitalWrite(sda, 0);
};


const pinMonitor = () => {
  const regs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 17, 18, 19, 20, 21, 23, 24, 25, 26, 27, 28, 29, 30, 31];

  let pr = {};

  let int = setInterval(() => {
    regs.forEach(r => {
      const val = digitalRead(r);
      if (val != pr[r]) {
        console.log(r, val);
        pr[r] = val;
      }
    });
  }, 100);
};

/*
setInterval(() => {
  for(let i = 0; i<32; i++) {
    // Pin(i).mode('input_pulldown');
    console.log(i, digitalRead(i));
  }
}, 1000);
*/

/*
0 0 
1 0 - ?
2 1 - OK
3 0 - OK
4 1
5 0
6 0
7 1 (pd1) - in
8 1 - ?
9 0 (pu0) - ou
10 0 (pu0) - ou
11 0
12 1 - ?
13 0 (pu0) - ou
14 1 (pd1) - in - BUTTON1
15 1
16 0 (pu0) - ou - BACKLIGHT
17 0
18 1 (pd1) - in
19 1 (pd1) - in
20 0
21 1
22 1 (pd1) - in (reset)
23 0 - ?
24 0 (pu0) - ou
25 0 - VIBRO
26 0
27 1
28 0
29 1
30 1
31 1
*/

let reg = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
/*
let int = setInterval(() => {
  if(reg.length) {
    const r = reg.shift();
    scan(r, r+1);
  }
}, 1000);
*/

scan2(2, 3);
scan2(9, 10);

