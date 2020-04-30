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
    y: 160,
    buf: font,
    index: [],
    c: 0xffff,
  });

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
  };

  update();
  const int = setInterval(update, 1000);

  return {
    onStop: () => {
      clearInterval(int);
      fb.remove(time);
      fb.remove(date);
    }
  }
};

module.exports = start;