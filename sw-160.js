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

// buzz([50, 50, 50]);

let bbb = false;
setWatch(() => {
  console.log('btn!');
  backlight(bbb);
  bbb = !bbb;
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
  const regs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 17, 18, 19, 20, 21, 23, 24, 26, 27, 28, 29, 30, 31];

  let pr = {};

  let int = setInterval(() => {
    regs.forEach(r => {
      const val = digitalRead(r);
      if (val != pr[r]) {
        // buzz(20);
        console.log(r, val);
        pr[r] = val;
      }
    });
  }, 100);
};

pinMonitor();

/*
0
1
2
3 TX
4 RX
5
6 CS
7 SO
8 SI
9
10
11 TP_EINT
12 LED-CS
13
14 BUTTON1
15
16 BACKLIGHT
17
18 SCL1
19 SDA1
20
21
22
23 CHARGING
24
25 VIBRO
26 - LED-SDA?
27 - SI, LED-RESET?
28
29
30
31
*/

/*
LED1 - GND
LED2 - BL+
LED3 - BL-
LED4 - VCC
LED5 - GND
LED6 - GND
LED7 - D/C
LED8 - CS
LED9 - SCL
LED10 - SDA
LED11 - RESET
LED12 - GND
*/

// let reg = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
/*
let int = setInterval(() => {
  if(reg.length) {
    const r = reg.shift();
    scan(r, r+1);
  }
}, 1000);
*/

// scan2(2, 3);
// scan2(9, 10);

