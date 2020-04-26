// main screen, renders current time
const fb = require('fb');
const st = require('Storage');

const font = st.readArrayBuffer('nmbrs.i');

const wi = 44;
const xx = 18;
const yy = 100;

const start = () => {
  const numbers = [
    fb.add({
      x: xx + wi * 0,
      y: yy,
      buf: font,
      index: 0,
      c: 0xffff,
    }),
    fb.add({
      x: xx + wi * 1,
      y: yy,
      buf: font,
      index: 0,
      c: 0xffff,
    }),
    fb.add({
      x: xx + wi * 2,
      y: yy,
      buf: font,
      index: 10,
      c: 0xffff,
    }),
    fb.add({
      x: xx + wi * 2.7,
      y: yy,
      buf: font,
      index: 0,
      c: 0xffff,
    }),
    fb.add({
      x: xx + wi * 3.7,
      y: yy,
      buf: font,
      index: 0,
      c: 0xffff,
    })
  ];

  const update = () => {
    const date = new Date();
    const h = date.getHours();
    const m = date.getMinutes();
    fb.set(numbers[0], { index: Math.floor(h / 10) });
    fb.set(numbers[1], { index: Math.floor(h % 10) });

    fb.set(numbers[3], { index: Math.floor(m / 10) });
    fb.set(numbers[4], { index: Math.floor(m % 10) });
  };

  update();
  const int = setInterval(update, 1000);

  return {
    onStop: () => {
      clearInterval(int);
      numbers.forEach(n => fb.remove(n));
    }
  }
};

module.exports = start;