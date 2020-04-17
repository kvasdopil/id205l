const Watch = require("./src/ID205L.js");
const BitBlt = require('./src/bitblt');

const BigFont = BitBlt('nmbrs.i', 24, 38);

const renderTime = (g) => {
  const date = new Date();
  const h = date.getHours();
  const m = date.getMinutes();

  const x = 60;
  const y = 100;

  BigFont.draw(x, y, Math.floor(h / 10));
  BigFont.draw(x + 25, y, h % 10);
  BigFont.draw(x + 50, y, 10);

  BigFont.draw(x + 65, y, Math.floor(m / 10));
  BigFont.draw(x + 65 + 25, y, m % 10);
};

const renderBatt = (g) => {
  g.setColor(1, 1, 1);
  g.fillRect(215, 8, 235, 19);
  g.fillRect(235, 10, 237, 17);

  g.setColor(0, 0, 0);
  g.fillRect(216, 9, 234, 18);

  g.setColor(0, 1, 0);
  const level = Watch.getBattery();
  const lvl = Math.round(16.0 * level);
  g.fillRect(217, 10, 217 + lvl, 17);

  if (Watch.isCharging()) {
    g.setColor(0, 1, 0);
  } else {
    g.setColor(0, 0, 0);
  }

  g.fillRect(203, 13, 210, 14);
  g.fillRect(206, 10, 207, 17);
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
  render();
  Watch.setBacklight(1);
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

Watch.setBacklight(1);

Watch.heart.enable();
console.log('Heart', Watch.heart.read(0, 16).map(i => Number(i).toString(16)));

Watch.accelerometer.enable();

let n = 0;

Watch.touch.enable();
Watch.touch.onTouch = (event) => {
  wake();
  if (event.type !== 9) {
    return;
  }

  BigFont.draw(event.x, event.y, n % 10);
  n++;
};

const render = () => {
  renderTime(GG);
  renderBatt(GG);
}

setTimeout(() => {
  Watch.lcd.init()
    .then(g => {
      GG = g;
      g.clear();
      render()
    });

  setInterval(updateDevices, 1000);
}, 1000);


setWatch(() => {
  if (!on) {
    GG.clear();
    wake();
  } else {
    sleep();
  }
}, BTN1, { edge: 'rising', debounce: 10, repeat: true });

setWatch(() => {
  wake();
  render();
  Watch.vibrate([50, 50, 50]);
}, Watch.pins.CHARGING, { edge: 'both', debounce: 10, repeat: true });

setInterval(() => {
  renderBatt(GG);
}, 60000);
