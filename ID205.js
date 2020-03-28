let i = 0;

/* 
0 - I2C1 SCL 0
1 
2 - some I2C sda reg 0x9
3
4
5 - SCL reg 31
6 - 
7 - SDA reg 0x44
8 - SCL
9  - 
10 - 
11 - 
12
13 - 
14 - HEART_BACKLIGHT
15 - LCD?
16 - BUTTON
17
18 - DEVICE RESET, LED?
19
20 - MOTOR
21 
22 - BACKLIGHT
23 - 
24 - 
25 - CHARGING
26 - 
27 - SDA reg 31 or 15
28 - 
29 - 
30 - BACKLIGHT2
31
32
33
34
35
36
37
38
39
40
*/


// I2C device SCL 5, SDA 27 addr 15
// reply 0: 33 0 0 128 240 127 0 128 0 0

// found i2c on scl 8 sda 7 reg 68
// found i2c on scl 6 sda 2 reg 9


// I2C device SCL 8 SDA 7 REG 0x44
// reply 0: [34, 1, 17, 143, 16, 32, 80, 7, 0, 2, 94, 143, 1, 255, 255, 15]

const MOTOR = 20;
const HEART_BACKLIGHT = 14;
const BUTTON = 16;
const ACCELEROMETER_ENABLE = 17;
const BACKLIGHT = 22;
const BACKLIGHT2 = 30;
const CHARGING = 25;

const vibrate = ms => digitalPulse(20, 1, ms);

const bl = level => {
  Pin(BACKLIGHT2).write(level >> 1 & 1);
  Pin(BACKLIGHT).write(level & 1);
};

vibrate([50, 50, 50]);
digitalPulse(HEART_BACKLIGHT, 1, 1000);
Pin(BUTTON).mode('input_pullup');

bl(2);
let j = 0;

setWatch(() => {
  console.log('btn');
  digitalPulse(HEART_BACKLIGHT, 1, 1000);
  bl(j);
  j++;

  digitalPulse(ACCELEROMETER_ENABLE, 1, 2000);
  if (j === 4) { j = 0; }

}, BUTTON, { edge: 'falling', debounce: 50, repeat: true });

const pinMonitor = () => {
  const regs = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
    15,
    18, 19,
    21, 23, 24,
    26, 27, 28, 29, 31, 32, 33, 34, 35,
    36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46
  ];

  let pr = {};

  let int = setInterval(() => {
    regs.forEach(r => {
      Pin(r).mode('input');
      const val = digitalRead(r);
      if (val != pr[r]) {
        console.log(r, val);
        pr[r] = val;
      }
    });
  }, 100);
};

pinMonitor();

const scan2 = (sda, scl) => {
  I2C1.setup({ sda: sda, scl: scl });
  for (let reg = 8; reg < 127; reg++) {
    try {
      I2C1.writeTo(reg, 0);
      console.log('found i2c on scl', scl, 'sda', sda, 'reg', Number(reg).toString(16));
      // console.log(I2C1.readFrom(reg, 1).forEach(i => console.log('j' + i)));
    } catch (e) {
    }
  }
  Pin(scl).mode('input');
  Pin(sda).mode('input');
};


const pinScan = () => {
  const regs = [
    0, 1, 2, 3, 4, 5, 6, 7,
    8, 9, 10, 11, 12, 13,
    15, 17, 18, 19, 21, 23, 24, 26, 27, 29, 31, 32, 33, 34, 35, 36, 37, 38, 39
  ];
  let a = 0;
  let b = 0;
  setInterval(() => {
    if (a >= b) { console.log('.', b); b++; a = 0; };
    if (b >= regs.length) { console.log('done'); return };

    if (a != b && a != undefined && b != undefined) {
      scan2(regs[a], regs[b]);
      scan2(regs[b], regs[a]);
    }
    a++;
  }, 500);
}

const pinScan2 = (sda) => {
  const regs = [
    0, 1, 3, 4, 5, 6, 7,
    8, 9, 10, 11, 12, 13,
    15, 17, 18, 19, 21, 23, 24, 26, 27, 29, 31, 32, 33, 34, 35, 36, 37, 38, 39
  ];
  const i = setInterval(() => {
    if (regs.length === 0) { console.log('done'); clearInterval(i); return; }
    const b = regs.shift();
    scan2(sda, b);
  }, 500);
}

// Pin(ACCELEROMETER_ENABLE).write(0);
// scan2(7,8);
