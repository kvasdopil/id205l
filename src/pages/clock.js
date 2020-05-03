// main screen, renders current time
const fb = require('fb');
const st = require('Storage');
const Watch = require('./src/ID205L');
const SETTINGS = require('./src/globals');

const big_font = st.readArrayBuffer('big_numbers.i');
const font = st.readArrayBuffer('font1.i');
const batt = st.readArrayBuffer('battery.i');
const icons = st.readArrayBuffer('icons.i');

const str = text => text.split('').map(char => char.charCodeAt(0) - 32).filter(i => i >= 0);

const dows = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

const suffix = (day) => {
  if (day % 10 === 1) {
    return 'st';
  }
  if (day % 10 === 2) {
    return 'nd';
  }

  return 'th';
}

const start = () => {
  const ui = [
    // timer icon
    fb.add({
      x: 5,
      y: 0,
      buf: icons,
      index: [],
      c: fb.color(0xFF, 0x61, 0x00),
    }),
    // timer text
    fb.add({
      x: 24,
      y: 8,
      buf: font,
      index: [],
      c: 0xffff,
    })
  ]

  const time = fb.add({
    x: 120,
    y: 80,
    w: 1, // centered
    buf: big_font,
    index: [],
    c: 0xffff,
  });
  const date = fb.add({
    x: 120,
    y: 140,
    w: 1, // centered
    buf: font,
    index: [],
    c: 0xffff,
  });

  const chargeInd = fb.add({
    x: 240 - 8 - 26 - 10,
    y: 8,
    c: 0,
    buf: batt,
    index: 1,
  })
  const batteryBg = fb.add({
    x: 240 - 8 - 26,
    y: 8,
    c: 0xffff,
    buf: batt,
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

  const update = () => {
    const fill2 = a => a < 10 ? `0${a}` : a;

    const now = new Date();
    if (SETTINGS.NEXT_TIMER) {
      fb.set(ui[0], { index: 10 });
      const diff = Math.max(0, (SETTINGS.NEXT_TIMER - new Date().getTime()) / 1000);
      const ss = Math.floor(diff % 60);
      const mm = Math.floor((diff / 60) % 60);
      const hh = Math.floor(diff / 3600);

      if (hh >= 1) {
        fb.set(ui[1], { index: str(`${hh}:${fill2(mm)}`) });
      } else {
        fb.set(ui[1], { index: str(`${mm}:${fill2(ss)}`) });
      }
    } else {
      fb.set(ui[0], { index: [] });
      fb.set(ui[1], { index: [] });
    }
    const h = now.getHours();
    const m = now.getMinutes();
    const d = now.getDate();
    const dow = now.getDay();
    fb.set(time, {
      index: [
        Math.floor(h / 10),
        Math.floor(h % 10),
        10,
        Math.floor(m / 10),
        Math.floor(m % 10),
      ]
    });
    fb.set(date, {
      index: str(`${dows[dow]}, ${d}${suffix(d)}`)
    });

    renderBattery();
  };

  update();
  const int = setInterval(update, 1000);

  return {
    onStop: () => {
      ui.forEach(u => fb.remove(u));
      clearInterval(int);
      fb.remove(time);
      fb.remove(date);
      fb.remove(battery);
      fb.remove(batteryBg);
      fb.remove(chargeInd);
    }
  }
};

module.exports = start;