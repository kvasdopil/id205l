// main screen, renders current time
const fb = require('fb');
const st = require('Storage');

const big_font = st.readArrayBuffer('big_numbers.i');
const font = st.readArrayBuffer('font1.i');

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
  const time = fb.add({
    x: 32,
    y: 80,
    buf: big_font,
    index: [],
    c: 0xffff,
  });
  const date = fb.add({
    x: 44,
    y: 140,
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
    const now = new Date();
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