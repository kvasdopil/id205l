const Watch = require("./src/ID205L");

const MainPage = require('./src/pages/main');
const SettingsPage = require('./src/pages/settings');
const AccelPage = require('./src/pages/accel');

const SETTINGS = {
  BL_LEVEL: 1,
}

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

const pages = [
  MainPage,
  SettingsPage,
  AccelPage,
]

const page = null;
function setPage(p) {
  if (!pages[p]) {
    return;
  }
  if (pages[page]) {
    pages[page].stop()
  };
  page = p;
  GG.clear();
  render();
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
  GG.clear();
  render();
  Watch.setBacklight(SETTINGS.BL_LEVEL);
  setPage(0); // will start defailt page
};

const IDLE_TIMEOUT = 30000;
let idleTimer = 0;

const updateDevices = () => {
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

Watch.setBacklight(SETTINGS.BL_LEVEL);

// Watch.heart.enable();
// console.log('Heart', Watch.heart.read(0, 16).map(i => Number(i).toString(16)));

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

const render = () => {
  renderBatt(GG);
}

Watch.lcd.init()
  .then(g => {
    GG = g;
    g.clear();
    render();
    setPage(0);
  });

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
  render();
  Watch.vibrate([50, 50, 50]);
}, Watch.pins.CHARGING, { edge: 'both', debounce: 10, repeat: true });

setInterval(() => {
  render();
}, 60000);
