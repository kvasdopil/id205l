const Watch = require("./src/ID205L");
const fb = require('fb');

E.enableWatchdog(100);

Watch.lcd.init();

const pages = [
  require('./src/pages/main'),
  require('./src/pages/settings'),
  require('./src/pages/accel'),
  // require('./src/pages/heart'),
];

const SETTINGS = {
  BL_LEVEL: 1,
}

const battery = fb.add({
  x: 215,
  y: 8,
  w: 20,
  h: 11,
  c: fb.color(0, 255, 0),
});

const renderBattery = () => {
  fb.set(battery, { w: 4 + 16 * Watch.getBattery() });
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
const checkAccel = () => {
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

const pId = 0;
const page = null;

function setPage(p) {
  if (page && page.onStop) {
    page.onStop();
  };
  page = null;
  if (pages[p]) {
    pId = p;
    page = pages[p]();
  }
}

const sleep = () => {
  if (!page) {
    return;
  }
  Watch.setBacklight(0);
  resetAccel();
  setPage(null);
};

const wake = () => {
  idleTimer = 0;
  if (page) {
    return;
  }
  Watch.setBacklight(SETTINGS.BL_LEVEL);
  setPage(0); // will start defailt page
};

const IDLE_TIMEOUT = 10000;
let idleTimer = 0;

const updateDevices = () => {
  if (page) {
    idleTimer += 1000;
    if (page.sleep !== false && idleTimer >= IDLE_TIMEOUT) {
      sleep();
    }
    return;
  }

  if (checkAccel()) {
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
  wake();

  if (!page) {
    return;
  }

  if (event.type === 128) {
    if (event.dir == 2) {
      setPage(pId - 1);
    }
    if (event.dir == 4) {
      setPage(pId + 1);
    }
    if (event.dir == 1) {
      console.log('up');
    }
    if (event.dir == 3) {
      console.log('down');
    }
    if (event.dir == -3) {
      if (page && page.onTap) {
        page.onTap(event);
      }
    }
  }
  // if (event.type !== 9) {
  //   return;
  // }
};

setInterval(updateDevices, 1000);

const resetT = 0;
setWatch(() => {
  resetT = setTimeout(() => {
    E.reboot();
  }, 3000);

  if (!page) {
    wake();
  } else {
    sleep();
  }
}, BTN1, { edge: 'rising', debounce: 10, repeat: true });

setWatch(() => {
  if (resetT) {
    clearTimeout(resetT);
    resetT = null;
  }
}, BTN1, { edge: 'falling', debounce: 10, repeat: true });

setWatch(() => {
  wake();
  renderBattery();
  Watch.vibrate([50, 50, 50]);
}, Watch.pins.CHARGING, { edge: 'both', debounce: 10, repeat: true });

setInterval(() => {
  renderBattery();
}, 60000);

setPage(0);