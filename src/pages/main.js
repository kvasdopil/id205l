// main screen, renders current time
const fb = require('fb');
const st = require('Storage');

const font = st.readArrayBuffer('nmbrs.i');

const start = () => {
  const numbers = [
    fb.createRect({
      x: 60,
      y: 100,
      w: 24,
      h: 38,
      buf: font,
      index: 0,
    }),
    fb.createRect({
      x: 60 + 25,
      y: 100,
      w: 24,
      h: 38,
      buf: font,
      index: 1,
    }),
    // fb.createRect({
    //   x: 60 + 50,
    //   y: 100,
    //   w: 24,
    //   h: 38,
    //   buf: font,
    //   index: 9,
    // }),
    fb.createRect({
      x: 60 + 65,
      y: 100,
      w: 24,
      h: 38,
      buf: font,
      index: 3,
    }),
    fb.createRect({
      x: 60 + 65 + 25,
      y: 100,
      w: 24,
      h: 38,
      buf: font,
      index: 4,
    })
  ];

  const int = setInterval(() => {
    const date = new Date();
    const h = date.getHours();
    const m = date.getMinutes();
    fb.updateRect(numbers[0], { index: Math.floor(h / 10) });
    fb.updateRect(numbers[1], { index: Math.floor(h % 10) });

    fb.updateRect(numbers[2], { index: Math.floor(m / 10) });
    fb.updateRect(numbers[3], { index: Math.floor(m % 10) });
  }, 1000);

  return {
    onStop: () => {
      clearInterval(int);
      // numbers.forEach(n => fb.delete(n));
    }
  }
};

module.exports = start;