// main screen, renders current time
const fb = require('fb');
const st = require('Storage');

const font = st.readArrayBuffer('nmbrs.i');

const start = () => {
  const numbers = [
    fb.add({
      x: 60,
      y: 100,
      buf: font,
      index: 0,
    }),
    fb.add({
      x: 60 + 25,
      y: 100,
      buf: font,
      index: 1,
    }),
    fb.add({
      x: 60 + 50,
      y: 100,
      buf: font,
      index: 10,
    }),
    fb.add({
      x: 60 + 65,
      y: 100,
      buf: font,
      index: 3,
    }),
    fb.add({
      x: 60 + 65 + 25,
      y: 100,
      buf: font,
      index: 4,
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