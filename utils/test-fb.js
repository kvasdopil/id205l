const ST7789 = require('./src/devices/ST7789');
const W = 240;
const H = 136;

const gr = Graphics.createArrayBuffer(W, H, 16);

const spim = require('spim');

const LCD_SCK = D2;
const LCD_RESET = D46;

const LCD_CS = D47;
const LCD_SI = D29;
const LCD_DC = D31;
const TOUCH_RESET = D24;

TOUCH_RESET.write(0);

const flip = (x1, y1, WI, HE, buffer) => {
  const x2 = x1 + WI - 1;
  const y2 = y1 + HE - 1;
  spim.sendSync([0x2A, x1 >> 8, x1, x2 >> 8, x2], 1);
  spim.sendSync([0x2B, y1 >> 8, y1, y2 >> 8, y2], 1);
  spim.sendSync([0x2C], 1);
  spim.send(buffer, 0);
}

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
    gr.clear();
    gr.setFont("4x6", 4);
    gr.drawString('hello', x, y);
    x += dx;
    y += dy;
    if (x >= W) {
      dx = dx * -1;
    }
    if (x <= 0) {
      dx = dx * -1;
    }
    if (y >= H) {
      dy = dy * -1;
    }
    if (y <= 0) {
      dy = dy * -1;
    }
    flip(0, 0, W, H, gr.buffer);
  }, 50);
});