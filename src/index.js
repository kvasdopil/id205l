const Watch = require("./src/ID205L");
const fb = require('fb');

E.enableWatchdog(100);

Watch.lcd.init();

const pages = [
  require('./src/pages/main'),
  require('./src/pages/settings'),
  require('./src/pages/accel'),
  require('./src/pages/heart'),
];

const SETTINGS = {
  BL_LEVEL: 1,
}

const battery = fb.createRect({
  x: 215,
  y: 8,
  w: 20,
  h: 11,
  c: fb.color(0, 255, 0),
});

const renderBattery = () => {
  fb.updateRect(battery, { w: 4 + Watch.getBattery() });
  // g.setColor(1, 1, 1);
  // g.fillRect(215, 8, 235, 19);
  // g.fillRect(235, 10, 237, 17);

  // g.setColor(0, 0, 0);
  // g.fillRect(216, 9, 234, 18);

  // g.setColor(0, 1, 0);
  // const level = Watch.getBattery();
  // const lvl = Math.round(16.0 * level);
  // g.fillRect(217, 10, 217 + lvl, 17);

  // if (Watch.isCharging()) {
  //   g.setColor(0, 1, 0);
  // } else {
  //   g.setColor(0, 0, 0);
  // }

  // g.fillRect(203, 13, 210, 14);
  // g.fillRect(206, 10, 207, 17);
};

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

const page = null;
function setPage(p) {
  if (!pages[p]) {
    return;
  }
  if (pages[page]) {
    pages[page].stop()
  };
  page = p;
  pages[page].start();
}

// ====

let on = true;
const sleep = () => {
  if (!on) {
    return;
  }
  on = false;
  Watch.setBacklight(0);
  resetAccel();
  pages[page].stop();
  page = null;
};

const wake = () => {
  idleTimer = 0;
  if (on) {
    return;
  }
  on = true;
  Watch.setBacklight(SETTINGS.BL_LEVEL);
  setPage(0); // will start defailt page
};

const IDLE_TIMEOUT = 10000;
let idleTimer = 0;

const updateDevices = () => {
  if (on) {
    idleTimer += 1000;
    if (pages[page].nosleep) {
      return; // active page prevents device to go to sleep mode
    }
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

Watch.setBacklight(SETTINGS.BL_LEVEL);

Watch.accelerometer.enable();

Watch.touch.enable();

Watch.touch.onTouch = (event) => {
  if (!on) {
    wake();
    return;
  }
  wake();
  if (event.type === 128) {
    if (event.dir == 2) {
      setPage(page - 1);
    }
    if (event.dir == 4) {
      setPage(page + 1);
    }
    if (event.dir == 1) {
      console.log('up');
    }
    if (event.dir == 3) {
      console.log('down');
    }
    if (event.dir == -3) {
      if (pages[page]) {
        pages[page].touch(event);
      }
    }
  }
  // if (event.type !== 9) {
  //   return;
  // }
};

setInterval(updateDevices, 1000);

setWatch(() => {
  if (!on) {
    wake();
  } else {
    sleep();
  }
}, BTN1, { edge: 'rising', debounce: 10, repeat: true });

setWatch(() => {
  wake();
  renderBattery();
  Watch.vibrate([50, 50, 50]);
}, Watch.pins.CHARGING, { edge: 'both', debounce: 10, repeat: true });

setInterval(() => {
  renderBattery();
}, 60000);

setPage(0);