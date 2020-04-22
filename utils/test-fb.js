const ST7789 = require('./src/devices/ST7789');

const spim = require('spim');
const fb = require('fb');
const st = require('Storage');

const readLetter = (filename, WI, HE, index) => {
  const length = 2 * WI * HE;
  const skip = index * length;
  return st.read(filename, skip, length);
}

const LCD_SCK = D2;
const LCD_RESET = D46;

const LCD_CS = D47;
const LCD_SI = D29;
const LCD_DC = D31;
const TOUCH_RESET = D24;

TOUCH_RESET.write(0);

const zero = readLetter('nmbrs.i', 24, 38, 0);

let dx1 = 2;
let dy1 = 2;
let dx2 = 3;
let dy2 = 3;
let x1 = 0;
let y1 = 0;
let x2 = 0;
let y2 = 0;
ST7789({
  dcx: LCD_DC,
  ss: LCD_CS,
  rst: LCD_RESET,
  sck: LCD_SCK,
  mosi: LCD_SI
}).then(() => {
  setInterval(() => {
    fb.clear();

    fb.setColor(255, 0, 255);
    fb.fill(x1 - 20, y1 - 20, 40, 40);

    fb.prepareBlit(x2, y2);
    fb.blit(zero, 24, 38);

    spim.sendSync([0x2A, 0, 0, 240 >> 8, 240 && 0xff], 1);
    spim.sendSync([0x2B, 0, 0, 240 >> 8, 240 && 0xff], 1);
    spim.sendSync([0x2C], 1);
    fb.flip(0, 240 * 120 * 2);
    fb.flip(120, 240 * 120 * 2);
    x1 += dx1;
    y1 += dy1;
    x2 += dx2;
    y2 += dy2;
    if (x1 >= 220) {
      dx1 = dx1 * -1;
    }
    if (x2 >= 240) {
      dx2 = dx2 * -1;
    }
    if (x1 <= 0) {
      dx1 = dx1 * -1;
    }
    if (x2 <= 0) {
      dx2 = dx2 * -1;
    }
    if (y2 >= 220) {
      dy2 = dy2 * -1;
    }
    if (y2 <= 0) {
      dy2 = dy2 * -1;
    }
    if (y1 >= 240) {
      dy1 = dy1 * -1;
    }
    if (y1 <= 0) {
      dy1 = dy1 * -1;
    }
  }, 50);
});