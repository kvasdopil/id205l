const ST7789 = require('./src/devices/ST7789');

const spim = require('spim');
const fb = require('fb');
const st = require('Storage');

E.enableWatchdog(10);

const LCD_SCK = D2;
const LCD_RESET = D46;

const LCD_CS = D47;
const LCD_SI = D29;
const LCD_DC = D31;
const TOUCH_RESET = D24;

TOUCH_RESET.write(0);

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
let score = 0;

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

fb.init();

const bird = fb.createRect({
  x: 50,
  w: 10,
  h: 10,
  c: fb.color(0, 255, 0),
});
const wallUp = fb.createRect({
  y: 0,
  w: barWidth,
  c: fb.color(255, 0, 0),
})
const wallDn = fb.createRect({
  w: barWidth,
  c: fb.color(255, 0, 0),
});
const number = fb.createRect({
  x: 10,
  y: 10,
  w: 24,
  h: 38,
  buf: st.readArrayBuffer('nmbrs.i'),
  index: 0,
})

function update() {
  if (!dead) {
    h += vv;
    vv += gravity;

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
      score++;
      nextPos = 240 * (1 + Math.random());
      nextH = Math.random() * 100 + 60;
      nextW = Math.random() * 20 + 40;
      fb.updateRect(wallUp, { h: nextH });
      fb.updateRect(wallDn, { y: nextH + nextW, h: 240 - nextH - nextW });
      fb.updateRect(number, { index: score % 10 });
    } else {
      nextPos -= speed;
    }

    fb.updateRect(wallUp, { x: nextPos });
    fb.updateRect(wallDn, { x: nextPos });
    fb.updateRect(bird, { y: h });
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
    update();
    spim.sendSync([0x2A, 0, 0, 240 >> 8, 240 && 0xff], 1);
    spim.sendSync([0x2B, 0, 0, 240 >> 8, 240 && 0xff], 1);

    fb.render();
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