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

let dx = 2;
let dy = 2;
let x = 0;
let y = 0;
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
    fb.fill(x - 20, y - 20, 40, 40);

    fb.prepareBlit(0, 0);
    fb.blit(zero, 24, 38);

    spim.sendSync([0x2A, 0, 0, 240 >> 8, 240 && 0xff], 1);
    spim.sendSync([0x2B, 0, 0, 240 >> 8, 240 && 0xff], 1);
    spim.sendSync([0x2C], 1);
    fb.flip(0, 240 * 120 * 2);
    fb.flip(120, 240 * 120 * 2);

    x += dx;
    y += dy;
    if (x >= 140) {
      dx = dx * -1;
    }
    if (x <= 0) {
      dx = dx * -1;
    }
    if (y >= 240) {
      dy = dy * -1;
    }
    if (y <= 0) {
      dy = dy * -1;
    }
  }, 50);
});