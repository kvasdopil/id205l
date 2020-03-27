let i = 0;

/* 
0 - I2C1 SCL 0
1 
2 - I2C1 SDA 
3
4
5
6 - 1
7 - down
8 - down
9  - up
10 - up
11 - 1
12
13 - 1
14 - HEART_BACKLIGHT
15 - LED?
16 - BUTTON
17
18 - DEVICE RESET, LED?
19
20 - MOTOR
21 ?
22 - BACKLIGHT
23 - 1 ?
24 - 1 ?
25 - CHARGING
26 - up
27 - 1 SCL?
28 - 1 down SDA?
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

const MOTOR = 20;
const HEART_BACKLIGHT = 14;
const BUTTON = 16;
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

bl(0);
let j = 0;

setWatch(() => {
  console.log('btn');
  digitalPulse(HEART_BACKLIGHT, 1, 1000);
  bl(j);
  j++;
  if (j === 4) { j = 0; }

}, BUTTON, { edge: 'falling', debounce: 50, repeat: true });

const pinMonitor = () => {
  const regs = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
    15, 17, 18, 19, 21, 23, 24,
    26, 27, 28, 29, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46
  ];

  let pr = {};

  let int = setInterval(() => {
    regs.forEach(r => {
      // Pin(r).mode('input_pullup');
      const val = digitalRead(r);
      if (val != pr[r]) {
        console.log(r, val);
        pr[r] = val;
      }
    });
  }, 100);
};

// pinMonitor();
/*
const regs = [
    0,1,2,3,4,5,6,7,8,9,10,11,12,13,
    15,17,18,19,21,22,23,24,
    25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46
  ];
setInterval(() => {
  if (regs.length == 0) {return; };
  const reg = regs.shift();
  console.log(reg);
  Pin(reg).mode('input_pulldown');
}, 1000);*/

// Pin(BACKLIGHT).mode('output_pulldown');

//setInterval(()=>{
//  digitalPulse(BACKLIGHT, 1, 500);
//}, 1000);

const scan2 = (sda, scl) => {
  // console.log(sda, scl);
  I2C1.setup({ sda: sda, scl: scl });
  for (let reg = 8; reg < 127; reg++) {
    try {
      I2C1.writeTo(reg, 0);
      console.log('found i2c on scl', scl, 'sda', sda, 'reg', reg);
    } catch (e) {
    }
  }
  // console.log('nothing on scl', scl, 'sda', sda);
  digitalWrite(scl, 0);
  digitalWrite(sda, 0);
};

/*
const regs = [
    0,1,2,3,4,5,6,7,
    8,9,10,11,12,13,
    15,17,18,19,21,23,24,26,27,29
];

let a = 0;
let b = 0;
setInterval(() => {
  if (a>=regs.length) {b++; a=0; console.log('.')};
  if (b>=regs.length) {console.log('done');return};

  if (a!=b && a != undefined && b != undefined) {
    scan2(regs[a],regs[b]);
    scan2(regs[b], regs[a]);
  }
  a++;
}, 500);*/

// scan2(8,7);

// const i2c = new I2C();
// i2c.setup({sda: 1, scl:2});
// i2c.writeTo(9, 0);