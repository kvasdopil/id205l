// main screen, renders current time
const fb = require('fb');
const st = require('Storage');

let updateInterval;

const font = st.readArrayBuffer('nmbrs.i');
const numbers = [];

// const renderTime = (g) => {
//   // const date = new Date();
//   // const h = date.getHours();
//   // const m = date.getMinutes();

//   // const x = 60;
//   // const y = 100;

//   // BigFont.draw(x, y, Math.floor(h / 10));
//   // BigFont.draw(x + 25, y, h % 10);
//   // BigFont.draw(x + 50, y, 10);

//   // BigFont.draw(x + 65, y, Math.floor(m / 10));
//   // BigFont.draw(x + 65 + 25, y, m % 10);
// };

const update = () => {
  if (!numbers) {
    return;
  }

  const date = new Date();
  const h = date.getHours();
  const m = date.getMinutes();
  fb.updateRect(numbers[0], { index: Math.floor(h / 10) });
  fb.updateRect(numbers[1], { index: Math.floor(h % 10) });

  fb.updateRect(numbers[2], { index: Math.floor(m / 10) });
  fb.updateRect(numbers[3], { index: Math.floor(m % 10) });
};

const start = () => {
  numbers = [
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

  update();

  if (!updateInterval) {
    updateInterval = setInterval(update, 1000);
  }
};

const stop = () => {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
};

module.exports = {
  start: start,
  stop: stop,
  touch: () => { },
};