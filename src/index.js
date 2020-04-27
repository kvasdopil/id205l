const Watch = require("./src/ID205L");
const fb = require('fb');
const st = require('Storage');

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

const chargeInd = fb.add({
  x: 240 - 8 - 26 - 10,
  y: 8,
  c: 0,
  buf: st.readArrayBuffer('batt.i'),
  index: 1,
})
fb.add({
  x: 240 - 8 - 26,
  y: 8,
  c: 0xffff,
  buf: st.readArrayBuffer('batt.i'),
  index: 0,
});
const battery = fb.add({
  x: 240 - 8 - 26 + 2,
  y: 10,
  w: 21,
  h: 9,
  c: fb.color(0, 255, 0),
});

const renderBattery = () => {
  fb.set(battery, { w: 4 + 16 * Watch.getBattery() });
  fb.set(chargeInd, { c: Watch.isCharging() ? 0xffff : 0 })
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
  Watch.lcd.sleep();
  resetAccel();
  setPage(null);
};

const wake = () => {
  idleTimer = 0;
  if (page) {
    return;
  }
  Watch.lcd.wake();
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
renderBattery();

setPage(0);