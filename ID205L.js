/*
=== Pin Layout ===
- 0 - XL1
- 1 - XL1
- 2 - LCD_SCK
- 3 - NO_CHIP
- 4 - ACCELEROMETER_ENABLE
- 5 - ACCELEROMETER SCL device 0x1f
- 6 - ACCELEROMETER_STOP
- 7 = HEART_SENSOR SDA device 0x44
- 8 = HEART_SENSOR SCL device 0x44
- 9  - GND?
- 10 - GND?
- 11 - NO_CHIP? 
- 12 - MEMORY_WP
- 13 - 
- 14 = heart sensor backlight aka LED1
- 15 - 
- 16 = BTN1
- 17 = HEART_SENSOR_ENABLE
- 18 - 
- 19 - MEMORY_CS
- 20 = MOTOR
- 21 = MEMORY_SO
- 22 = BACKLIGHT
- 23 - 
- 24 - TOUCH_RESET
- 25 - 
- 26 - ACCELEROMETER_INT1? (pulled down)
- 27 - ACCELEROMETER SDA device 0x1f
- 28 - BATTERY_LEVEL
- 29 - LCD_SI
- 30 - BACKLIGHT2
- 31 - LCD_DC
- 32 -
- 33 - MEMORY_HOLD
- 34 -
- 35 -
- 36 - TX
- 37 - RX
- 38 - MEMORY_CLK
- 39 - CHARGING
- 40 - (pulled down) - connected to HEART_SENSOR
- 41 - NO_CHIP?
- 42 - TOUCH unknown
- 43 - TOUCH unknown
- 44 - TOUCH unknown
- 45 - TOUCH unknown
- 46 - LCD_RESET
- 47 - LCD_CS
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

const LCD_SCK = 2;
const ACCELEROMETER_ENABLE = 4;
const ACCELEROMETER_SCL = 5;
const HEART_SDA = 7
const HEART_SCL = 8
const HEART_BACKLIGHT = 14;
const BUTTON = 16;
const HEART_SENSOR_ENABLE = 17;
const MOTOR = 20;
const BACKLIGHT = 22;
const TOUCH_RESET = 24;
const ACCELEROMETER_SDA = 27;
const BATTERY_LEVEL = 28;
const LCD_SI = 29;
const BACKLIGHT2 = 30;
const LCD_DC = 31;
const CHARGING = 39;
const LCD_RESET = 46;
const LCD_CS = 47;

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

Pin(CHARGING).mode('input_pullup');
Pin(BATTERY_LEVEL).mode('analog');

const getBattery = () => 5 * (analogRead(BATTERY_LEVEL) - 0.68);
const isCharging = () => !digitalRead(CHARGING);

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
    };
  }
};

/// ====

heartSensor.enable();
console.log('Heart', heartSensor.read(0, 16).map(i => Number(i).toString(16)));

accelerometer.enable();
// console.log('Accelerometer', accelerometer.read());

// ==== Graphics example ===

const connectGraphics = require("https://raw.githubusercontent.com/kvasdopil/id205l/master/ST7789.js");

const initGraphics = () => new Promise(resolve => {
  digitalWrite(TOUCH_RESET, 0); // causes screen flicker if non-zero
  // backlight(2);

  SPI1.setup({ mosi: Pin(LCD_SI), sck: Pin(LCD_SCK), baud: 10000000 });
  const g = connectGraphics(SPI1, Pin(LCD_DC), Pin(LCD_CS), Pin(LCD_RESET), () => resolve(g));
});

let prevTime = 0;
const renderTime = (g) => {
  const date = new Date();
  const h = date.getHours();
  const m = date.getMinutes();

  const newTime = h * 100 + m;
  if (prevTime === newTime) {
    return;
  }
  prevTime = newTime;

  const line = (h < 10 ? `0${h}` : `${h}`) + ":" + (m < 10 ? `0${m}` : `${m}`);

  g.setColor(0, 0, 0);
  g.fillRect(6, 6, 120, 6 + 12);

  g.setFontVector(12);
  g.setColor(1, 1, 1);
  g.drawString(line, 6, 6);
};

const renderBatt = (g) => {
  g.setColor(1, 1, 1);
  g.drawRect(215, 8, 235, 19);
  g.drawRect(235, 10, 237, 17);

  g.setColor(0, 0, 0);
  g.fillRect(217, 10, 217 + 16, 17);

  g.setColor(0, 1, 0);
  const level = getBattery();
  const lvl = Math.round(16.0 * level);
  // console.log('Battery', level);
  g.fillRect(217, 10, 217 + lvl, 17);

  g.setFont();
  if (isCharging()) {
    g.setColor(0, 1, 0);
  } else {
    g.setColor(0, 0, 0);
  }

  g.drawString("+", 202, 7);
};

let GG;

setTimeout(() => {
  initGraphics()
    .then(g => {
      GG = g;
      g.clear();
      renderTime(g);
      renderBatt(g);
    });
}, 1000);

let on = true;

const sleep = () => {
  if (!on) {
    return;
  }
  // console.log('sleep');
  on = false;
  backlight(0);
};

const wake = () => {
  idleTimer = 0;
  if (on) {
    return;
  }
  // console.log('wakeup');
  on = true;
  backlight(3);
  digitalPulse(HEART_BACKLIGHT, 1, 1000);
  vibrate(50);
};

const ACCEL_THRESHOLD = 100;

const prevAccel = [0, 0, 0];
const checkAccelerometer = () => {
  const data = accelerometer.read();

  let axii = 0;
  if (Math.abs(prevAccel[0] - data.x) > ACCEL_THRESHOLD) { axii++; }
  if (Math.abs(prevAccel[1] - data.y) > ACCEL_THRESHOLD) { axii++; }
  if (Math.abs(prevAccel[2] - data.z) > ACCEL_THRESHOLD) { axii++; }
  if (axii > 1) {
    wake();
    prevAccel[0] = data.x;
    prevAccel[1] = data.y;
    prevAccel[2] = data.z;
  }
};

const IDLE_TIMEOUT = 10000;
let idleTimer = 0;

setInterval(() => {
  renderTime(GG);
  if (on) {
    idleTimer += 1000;
    if (idleTimer >= IDLE_TIMEOUT) {
      console.log('idle timer');
      sleep();
    }
  } else {
    checkAccelerometer();
  }
}, 1000);

setInterval(() => {
  renderBatt(GG);
}, 10000);

setWatch(() => {
  if (!on) {
    wake();
  } else {
    sleep();
  }
}, BTN1, { edge: 'rising', debounce: 10, repeat: true });


setWatch(() => {
  renderBatt(GG);
  wake();
}, CHARGING, { edge: 'both', debounce: 10, repeat: true });
