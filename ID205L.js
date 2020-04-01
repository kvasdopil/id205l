/*
=== Pin Layout ===
0 - XL1
1 - XL1
2 - 
3 -
4 - ACCELEROMETER_ENABLE
5 - ACCELEROMETER SCL reg 0x1f
6 - 
7 - HEART_SENSOR SDA reg 0x44
8 - HEART_SENSOR SCL reg 0x44
9  - 
10 - 
11 - 
12 - MEMORY_WP
13 - 
14 - HEART_BACKLIGHT
15 - ??? HEART
16 - BTN1
17 - HEART_ENABLE
18 - ??? HEART
19 - MEMORY_CS
20 - MOTOR
21 - MEMORY_SO
22 - BACKLIGHT
23 - 
24 - 
25 - 
26 - 
27 - ACCELEROMETER SDA reg 0x1f
28 - BATTERY_LEVEL
29 - 
30 - BACKLIGHT2 
31 -
32 -
33 - MEMORY_HOLD
34 -
35 -
36 - TX
37 - RX
38 - MEMORY_CLK
39 - CHARGING
40 - ?
41 - ?
42 - 
43 -
44 -
45 -
46 -
47 -
*/

// Poke on pin -> changed values:
// 13->11
// 18->13
// 22->18,30,15
// 23->30
// 24->31
// 28->27,23
// 29->23,22

// back sensor related pins are
// 15, 16(btn), 17, 18, 19, 25
// display - 30,31,2

// display related pins are
// 2, 15, 18, 30, 31,

// pullup
// 40 = 0
// input
// 41 = 1

const ACCELEROMETER_ENABLE = 4;
const ACCELEROMETER_SCL = 5;
const HEART_SDA = 7
const HEART_SCL = 8
const HEART_BACKLIGHT = 14;
const BUTTON = 16;
const HEART_SENSOR_ENABLE = 17;
const MOTOR = 20;
const BACKLIGHT = 22;
const BACKLIGHT2 = 30;
const ACCELEROMETER_SDA = 27;
const BATTERY_LEVEL = 28;
const CHARGING = 39;

const MEMORY_CS = 21;
const MEMORY_WP = 12;
const MEMORY_SO = 19;
const MEMORY_HOLD = 33;
const MEMORY_CLK = 38;
// const MEMORY_SI = ??;

const vibrate = ms => digitalPulse(MOTOR, 1, ms);

const backlight = level => {
  Pin(BACKLIGHT2).write(level >> 1 & 1);
  Pin(BACKLIGHT).write(level & 1);
};

vibrate([50, 50, 50]);
digitalPulse(HEART_BACKLIGHT, 1, 100);

backlight(2);

Pin(CHARGING).mode('input_pulldown');

// === heart rate sensor functions ===

const HEART_SENSOR_DEVICEID = 0x44;
const heartI2C = new I2C();
heartI2C.setup({ sda: HEART_SDA, scl: HEART_SCL });
const heartSensor = {
  enable: () => digitalWrite(HEART_SENSOR_ENABLE, 1),
  disable: () => digitalWrite(HEART_SENSOR_ENABLE, 0),
  read: (reg, length) => {
    heartI2C.writeTo(HEART_SENSOR_DEVICEID, reg);
    return heartI2C.readFrom(HEART_SENSOR_DEVICEID, length);
  }
};

/* HX3600 registers 
addr   value  desc
0x00 - 0x22 - device ID
0x01 - 0x01 - reserved
0x02 - 0x11 - functions enabled (should be 0x33)
0x03 - 0x00 - reserved (should be 0x8f)
0x04 - 0x10 - LED1 phase config
0x05 - 0x20 - LED2 phase config
0x06 - 0x50 - INT1 config
0x07 - 0x07 - INT1 config
0x08 - 0x00 - INT1 config
0x09 - 0x02 - sleep enabled

0x14 - 0x00 - ps offset
0x15 - 0x00 - hrs offset
0x16 - 0x40 - ps interval

0xA0 - 0x00 - hrs data out
0xA1 - 0x00 - hrs data out
0xA2 - 0x00 - hrs data out

0xA3 - 0x00 - als data out
0xA4 - 0x00 - als data out
0xA5 - 0x00 - als data out

0xA6 - 0x00 - ps1 data out
0xA7 - 0x00 - ps1 data out
0xA8 - 0x00 - ps1 data out

0xA9 - 0x00 - als2 data out
0xAA - 0x00 - als2 data out
0xAB - 0x00 - als2 data out

0xC0 - 0x86 - led driver config
*/

// === accelerometer ===

const u8u8tos16 = (byteA, byteB) => {
  const sign = byteA & (1 << 7);
  var x = ((byteA & 0xff) << 8) | (byteB & 0xff);
  if (sign) {
    return 0xffff0000 | x; // fill in most significant bits with 1's
  }
  return x;
};

const accI2C = new I2C();
accI2C.setup({ sda: ACCELEROMETER_SDA, scl: ACCELEROMETER_SCL });
const accelerometer = {
  enable: () => digitalWrite(ACCELEROMETER_ENABLE, 1),
  disable: () => digitalRead(ACCELEROMETER_ENABLE, 0),
  read: () => {
    accI2C.writeTo(0x1f, 0x02);
    const data = accI2C.readFrom(0x1f, 6);
    return {
      x: u8u8tos16(data[1], data[0]) >> 6,
      y: u8u8tos16(data[3], data[2]) >> 6,
      z: u8u8tos16(data[5], data[4]) >> 6
    }
  }
}

// === demo of the button ===

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

/// ====

heartSensor.enable();
console.log('Heart', heartSensor.read(0, 16).map(i => Number(i).toString(16)));

accelerometer.enable();
console.log('Accelerometer', accelerometer.read());

