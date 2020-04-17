const Watch = require("https://github.com/kvasdopil/id205l/blob/master/src/ID205L.js");
const fontDylex7x13 = require("https://www.espruino.com/modules/FontDylex7x13.js");
const fontNumbers = require("https://www.espruino.com/modules/FontCopasetic40x58Numeric.js");

fontDylex7x13.add(Graphics);
fontNumbers.add(Graphics);

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

  g.setFont("Dylex7x13");
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
  const level = Watch.getBattery();
  const lvl = Math.round(16.0 * level);
  g.fillRect(217, 10, 217 + lvl, 17);

  g.setFont('Dylex7x13');
  if (Watch.isCharging()) {
    g.setColor(0, 1, 0);
  } else {
    g.setColor(0, 0, 0);
  }

  g.drawString("+", 202, 7);
};

let GG;

// ====

const ACCEL_THRESHOLD = 100;
let prevAccel = { x: 0, y: 0, z: 0 };
const resetAccel = () => {
  prevAccel = Watch.accelerometer.read();
};
const checkAccelerometer = () => {
  const data = Watch.accelerometer.read();

  let axii = 0;
  if (Math.abs(prevAccel.x - data.x) > ACCEL_THRESHOLD) { axii++; }
  if (Math.abs(prevAccel.y - data.y) > ACCEL_THRESHOLD) { axii++; }
  if (Math.abs(prevAccel.z - data.z) > ACCEL_THRESHOLD) { axii++; }
  if (axii > 1) {
    prevAccel = data;
    return true;
  }
  return false;
};

// ====

let on = true;
const sleep = () => {
  if (!on) {
    return;
  }
  on = false;
  Watch.setBacklight(0);
  resetAccel();
};

const wake = () => {
  idleTimer = 0;
  if (on) {
    return;
  }
  on = true;
  Watch.setBacklight(3);
};

const IDLE_TIMEOUT = 10000;
let idleTimer = 0;

const updateDevices = () => {
  renderTime(GG);
  if (on) {
    idleTimer += 1000;
    if (idleTimer >= IDLE_TIMEOUT) {
      sleep();
    }
    return;
  }
  if (checkAccelerometer()) {
    wake();
  }
};

// initialization

Watch.vibrate([50, 50, 50]);
digitalPulse(Watch.pins.HEART_BACKLIGHT, 1, 100);

Watch.setBacklight(2);

Watch.heart.enable();
console.log('Heart', Watch.heart.read(0, 16).map(i => Number(i).toString(16)));

Watch.accelerometer.enable();

Watch.touch.enable();

Watch.touch.onTouch = (event) => {
  wake();
  if (event.type === 9) {
    GG.setColor(1, 0, 0);
    GG.fillRect(event.x - 5, event.y - 5, event.x + 5, event.y + 5);
  }
};

setTimeout(() => {
  Watch.lcd.init()
    .then(g => {
      GG = g;
      g.clear();
      renderTime(g);
      renderBatt(g);
    });

  setInterval(updateDevices, 1000);
}, 1000);


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
}, Watch.pins.CHARGING, { edge: 'both', debounce: 10, repeat: true });

setInterval(() => {
  renderBatt(GG);
}, 60000);