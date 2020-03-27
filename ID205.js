let i = 0;

/* 
0
1
2 - LCD up
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
15 - 1
16 - BUTTON
17
18 - DEVICE RESET
19
20 - MOTOR
21
22 - 1
23 - 1
24 - 1
25 - 1
26 - up
27 - 1
28 - 1 down
29
30
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

const vibrate = ms => digitalPulse(20, 1, ms);

vibrate([50, 50, 50]);
digitalPulse(HEART_BACKLIGHT, 1, 1000);
Pin(BUTTON).mode('input_pullup');
Pin(BACKLIGHT).write(0);

setWatch(() => {
    console.log('btn');
    digitalPulse(HEART_BACKLIGHT, 1, 1000);
    digitalPulse(BACKLIGHT, 0, 500);
}, BUTTON, { edge: 'falling', debounce: 50, repeat: true });

/* const pinMonitor = () => {
  const regs = [
    0,1,2,3,4,5,6,7,8,9,10,11,12,13,
    15,17,18,19,21,22,23,24,
    25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46
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

pinMonitor();*/
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

setInterval(() => {
    digitalPulse(BACKLIGHT, 1, 500);
}, 1000);

