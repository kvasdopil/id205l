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

const barWidth = 20;
const speed = 10;
const gravity = 1;
const boost = 6;
const deadZone = 230;
let nextPos = 0;
let nextH = 0;
let nextW = 60;
let h = 120;
let vv = 0;
let dead = false;

function resetGame() {
  nextPos = 0;
  nextH = 0;
  nextW = 60;
  h = 120;
  vv = 0;
  dead = false;
}

const onPress = () => {
  if (dead) {
    resetGame();
  } else {
    vv = - boost;
  }
}

setWatch(onPress, BTN1, { edge: 'rising', repeat: true });

function render() {
  if (nextPos <= 240) {
    fb.setColor(255, 0, 0);
    fb.fill(nextPos, 0, barWidth, nextH);
    fb.fill(nextPos, nextH + nextW, barWidth, 240 - nextH - nextW);
  }

  fb.setColor(0, 255, 0);
  fb.fill(50, h, 10, 10);

  if (!dead) {
    if (h >= deadZone) {
      h = deadZone;
      dead = true;
    }

    if (nextPos >= (50) && (nextPos <= 50 + barWidth)) {
      if (h < nextH) {
        dead = true;
      }
      if (h + 10 >= nextH + nextW) {
        dead = true;
      }
    }

    if (nextPos < -40) {
      nextPos = 240 * (1 + Math.random());
      nextH = Math.random() * 100 + 60;
      nextW = Math.random() * 20 + 40;
    } else {
      nextPos -= speed;
    }

    h += vv;
    vv += gravity;
  }
}

ST7789({
  dcx: LCD_DC,
  ss: LCD_CS,
  rst: LCD_RESET,
  sck: LCD_SCK,
  mosi: LCD_SI
}).then(() => {
  setInterval(() => {
    fb.clear();

    render();

    spim.sendSync([0x2A, 0, 0, 240 >> 8, 240 && 0xff], 1);
    spim.sendSync([0x2B, 0, 0, 240 >> 8, 240 && 0xff], 1);
    spim.sendSync([0x2C], 1);
    fb.flip(0, 240 * 120 * 2);
    fb.flip(120, 240 * 120 * 2);
  }, 50);
});

// New code to define services
NRF.setServices({
  "3e440001-f5bb-357d-719d-179272e4d4d9": {
    "3e440002-f5bb-357d-719d-179272e4d4d9": {
      value: [0],
      maxLen: 1,
      writable: true,
      onWrite: onPress,
    }
  }
});

