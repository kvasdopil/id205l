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
- 17 = HEART_ENABLE
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
- 42 - TOUCH_SCL
- 43 - TOUCH_SDA
- 44 - TOUCH_INT
- 45 - TOUCH_ENABLE
- 46 - LCD_RESET
- 47 - LCD_CS
*/

const IT7259 = require("https://github.com/kvasdopil/id205l/blob/master/src/devices/IT7259.js"); // touch screen
const ST7789 = require("https://github.com/kvasdopil/id205l/blob/master/src/devices/ST7789.js"); // display
const HX3600 = require("https://github.com/kvasdopil/id205l/blob/master/src/devices/HX3600.js"); // heart sensor
const B271 = require("https://github.com/kvasdopil/id205l/blob/master/src/devices/B271.js"); // accelerometer

const pins = {
  ACCELEROMETER_ENABLE: D4,
  ACCELEROMETER_SCL: D5,
  ACCELEROMETER_SDA: D27,

  BUTTON: D16,

  HEART_SDA: D7,
  HEART_SCL: D8,
  HEART_BACKLIGHT: D14,
  HEART_ENABLE: D17,

  MOTOR: D20,

  BACKLIGHT: D22,
  BACKLIGHT2: D30,

  BATTERY_LEVEL: D28,
  CHARGING: D39,

  TOUCH_RESET: D24, // also a reset for lcd
  TOUCH_SCL: D42,
  TOUCH_SDA: D43,
  TOUCH_INT: D44,
  TOUCH_ENABLE: D45,

  LCD_SCK: D2,
  LCD_RESET: D46,
  LCD_CS: D47,
  LCD_SI: D29,
  LCD_DC: D31,

  MEMORY_CS: D21,
  MEMORY_WP: D12,
  MEMORY_SO: D19,
  MEMORY_HOLD: D33,
  MEMORY_CLK: D38,
  // MEMORY_SI: D9?,
};

const vibrate = ms => digitalPulse(pins.MOTOR, 1, ms);

// values 0..3, 0 is off
const setBacklight = level => {
  pins.BACKLIGHT2.write(level >> 1 & 1);
  pins.BACKLIGHT.write(level & 1);
};

pins.CHARGING.mode('input_pullup');
pins.BATTERY_LEVEL.mode('analog');

const getBattery = () => 5 * (analogRead(pins.BATTERY_LEVEL) - 0.68);
const isCharging = () => !pins.CHARGING.read();

const heart = HX3600({
  scl: pins.HEART_SCL,
  sda: pins.HEART_SDA,
  enable: pins.HEART_ENABLE
});

const accelerometer = B271({
  scl: pins.ACCELEROMETER_SCL,
  sda: pins.ACCELEROMETER_SDA,
  enable: pins.ACCELEROMETER_ENABLE
});

const touch = IT7259({
  sda: pins.TOUCH_SDA,
  scl: pins.TOUCH_SCL,
  enable: pins.TOUCH_ENABLE,
  reset: pins.TOUCH_RESET,
  int: pins.TOUCH_INT,
});

const lcd = {
  init: () => new Promise(resolve => {
    pins.TOUCH_RESET.write(0); // causes screen flicker if non-zero
    SPI1.setup({ mosi: pins.LCD_SI, sck: pins.LCD_SCK, baud: 10000000 });
    const g = ST7789(SPI1, pins.LCD_DC, pins.LCD_CS, pins.LCD_RESET, () => resolve(g));
  }),
}

module.exports = {
  pins: pins,
  heart: heart,
  accelerometer: accelerometer,
  touch: touch,
  lcd: lcd,
  vibrate: vibrate,
  setBacklight: setBacklight,
  getBattery: getBattery,
  isCharging: isCharging,
}