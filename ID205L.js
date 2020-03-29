/*
=== Pin Layout ===
0 - XL1
1 - XL1
2 - some I2C sda reg 0x9
3 -
4 -
5 - SCL reg 0x1f
6 - 
7 - HEART_SENSOR SDA reg 0x44
8 - HEART_SENSOR SCL reg 0x44
9  - 
10 - 
11 - 
12 - MEMORY_WP
13 - 
14 - HEART_BACKLIGHT
15 - LCD?
16 - BTN1
17 - HEART_ENABLE
18 - (DEVICE RESET), LED?
19 - MEMORY_SO
20 - MOTOR
21 - MEMORY_CS
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

Pins 32-47 are always off and does not seem to be working (does espruino support them?)
*/

// I2C device SCL 5, SDA 27 addr 15
// reply 0: 33 0 0 128 240 127 0 128 0 0

// Poke on pin -> changed values:
// 13->11
// 18->13
// 22->18,30,15
// 23->30
// 24->31
// 28->27,23
// 29->23,22

// MEMORY CHIP related are
// CS - D21?
// SO - D19?
// WP - D12
// HOLD -
// SCLK -
// SI - 

// back sensor related pins are
// 15, 16(btn), 17, 18, 19, 25
// display - 30,31,2

// display related pins are
// 2, 15, 18, 30, 31,

const HEART_SDA = 7
const HEART_SCL = 8
const HEART_BACKLIGHT = 14;
const BUTTON = 16;
const HEART_SENSOR_ENABLE = 17;
const MOTOR = 20;
const BACKLIGHT = 22;
const BACKLIGHT2 = 30;
const CHARGING = 25;

const MEMORY_CS = 21;
const MEMORY_WP = 12;
const MEMORY_SO = 19;

const vibrate = ms => digitalPulse(20, 1, ms);

const backlight = level => {
  Pin(BACKLIGHT2).write(level >> 1 & 1);
  Pin(BACKLIGHT).write(level & 1);
};

vibrate([50, 50, 50]);
digitalPulse(HEART_BACKLIGHT, 1, 100);

backlight(2);

digitalWrite(HEART_SENSOR_ENABLE, 1);
const heartSensor = new I2C();
heartSensor.setup({ sda: HEART_SDA, scl: HEART_SCL });

// =======
// Demo of the button 
setWatch(() => {
  digitalPulse(HEART_BACKLIGHT, 1, 100);
  vibrate(100);
}, BTN1, { edge: 'rising', debounce: 50, repeat: true });

// ==== utility functions used to figure out pin assignments ====

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
    2, 3, 4, 5, 6, 9,
    10, 11, 12, 13, 15, 18, 19,
    21, 23, 24, 25, 26, 27, 28, 29,
    31, 32, 33, 34, 35, 36, 37, 38, 39,
    40, 41, 42, 43, 44, 45, 46, 47
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

const tryDisplay = () => {
  var spi = new SPI();
  setWatch(() => {
    const freePins = [
      24, 23, 28, 21, 12, 19, 18, 2, 1, 3
    ];
    const pick = () => {
      while (1) {
        var n = Math.floor(Math.random() * freePins.length);
        const res = freePins[n];
        if (res != -1) {
          freePins[n] = -1;
          return res;
        }
      }
    }
    const cs = pick();
    const en = pick();
    const irq = pick();
    const mosi = pick();
    const sck = pick();
    spi.setup({ mosi: Pin(mosi), sck: Pin(sck) });
    var g = require("ST7789").connect(spi, Pin(cs), Pin(en), Pin(irq), () => {
      console.log('conn', cs, en, irq, mosi, sck);
      //g.clear();
      g.setRotation(1);
      g.drawString("Hello", 0, 0);
      //g.setFontVector(20);
      //g.setColor(0,0.5,1);
      //g.drawString("Espruino",0,10);
    });
  }, BTN1, { edge: 'rising', debounce: 50, repeat: true });
};
