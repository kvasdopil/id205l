const Watch = require('./src/ID205L');
const fb = require('fb');
const st = require('Storage');
const ST7789 = require('./src/devices/ST7789');

const bignumbers = st.readArrayBuffer('big_numbers.i');
const font1 = st.readArrayBuffer('font1.i');

E.enableWatchdog(100);

fb.init();

const str = text => text.split('').map(char => char.charCodeAt(0) - 32).filter(i => i >= 0);

fb.add({
  x: 10,
  y: 10,
  c: fb.color(0, 128, 255),
  buf: font1,
  index: str('Hello! Today is Friday, 25th.'),
});
fb.add({
  x: 10,
  y: 50,
  c: fb.color(255, 0, 0),
  buf: font1,
  index: str('I LOVE HOMYAKI!!!!'),
});
fb.add({
  x: 10,
  y: 100,
  c: 0xffff,
  buf: bignumbers,
  index: 2,
});
// fb.add({
//   x: 200,
//   y: 200,
//   c: 0xffff,
//   buf: numbers,
//   index: 2,
// });

Watch.pins.TOUCH_RESET.write(0); // causes screen flicker if non-zero
ST7789({
  dcx: Watch.pins.LCD_DC,
  ss: Watch.pins.LCD_CS,
  rst: Watch.pins.LCD_RESET,
  sck: Watch.pins.LCD_SCK,
  mosi: Watch.pins.LCD_SI
}).then(() => {
  console.log('init');
  fb.render();
});