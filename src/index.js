const Watch = require("./src/ID205L");
const SETTINGS = require('./src/globals');

E.enableWatchdog(100);

const pages = [
  require('./src/pages/settings'),
  require('./src/pages/clock'),
  require('./src/apps/timer'),
  require('./src/apps/level'),
  require('./src/pages/info'),
];

Watch.lcd.init();

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

let pId = 0;
let page = null;

function setPage(p) {
  if (p !== null && !pages[p]) {
    return;
  }

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
  setPage(1); // will start defailt page
};

const IDLE_TIMEOUT = 10000;
let idleTimer = 0;

const updateDevices = () => {
  if (page && page.sleep !== false) {
    idleTimer += 1000;
    if (idleTimer >= IDLE_TIMEOUT) {
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

const longTapTimer = 0;
const longTapEvent = 0;
const onLongTap = () => {
  if (page && page.onLongTap) {
    page.onLongTap(longTapEvent);
  }
}

Watch.touch.onTouch = (event) => {
  wake();

  if (!page) {
    return;
  }

  if (event.type === 0) {
    if (longTapTimer) {
      clearInterval(longTapTimer);
    }
    return;
  }

  if (event.type === 9) {
    if (longTapTimer) {
      clearInterval(longTapTimer);
    }
    longTapEvent = event;
    longTapTimer = setInterval(onLongTap, 500);
    return;
  }

  if (event.type === 128) { // tap or swipe
    if (longTapTimer) {
      clearInterval(longTapTimer);
      longTapTimer = 0;
    }
    if (event.dir == -3) {
      if (page && page.onTap) {
        page.onTap(event);
      }
    }
    if (page && page.isApp) {
      if (page.onSwipe) {
        page.onSwipe(event);
      }
      return;
    }
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
    return;
  }

  // if (event.type === 9) { // move
  //   if (page && page.onMove) {
  //     page.onMove(event);
  //   }
  // }
};

setInterval(updateDevices, 1000);

let resetT = 0;
setWatch(() => {
  resetT = setTimeout(() => {
    E.reboot();
  }, 3000);

  if (!page) {
    wake();
  } else {
    if (page.isApp) {
      setPage(1);
    } else {
      sleep();
    }
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
  Watch.vibrate([50, 50, 50]);
}, Watch.pins.CHARGING, { edge: 'both', debounce: 10, repeat: true });

setPage(1);