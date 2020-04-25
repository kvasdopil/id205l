// Espruino library for ID205L smart watch

const IT7259 = require("./src/devices/IT7259.js"); // touch screen
const ST7789 = require("./src/devices/ST7789.js"); // display
const HX3600 = require("./src/devices/HX3600.js"); // heart sensor
const B271 = require("./src/devices/B271.js"); // accelerometer

const fb = require('fb'); // framebuffer
const spim = require('spim'); // SPIM interface

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
  MEMORY_SI: D9,
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
  init: () => {
    fb.init();

    pins.TOUCH_RESET.write(0); // causes screen flicker if non-zero
    ST7789({
      dcx: pins.LCD_DC,
      ss: pins.LCD_CS,
      rst: pins.LCD_RESET,
      sck: pins.LCD_SCK,
      mosi: pins.LCD_SI
    }).then(() => setInterval(fb.render, 50))
  },
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