const grr = require('./utils/grr');

// init graphics
D46.write(0); // TOUCH_RESET
grr.start({
  dcx: D31,
  ss: D47,
  rst: D24,
  sck: D2,
  mosi: D29
});

// main screen, renders current time

let updateInterval;
const numbers = [
  grr.tx({
    file: 'nmbrs.i',
    w: 24,
    h: 38,
    x: x,
    y: y,
  }),
  grr.tx({
    file: 'nmbrs.i',
    w: 24,
    h: 38,
    x: x + 25,
    y: y,
  }),
  grr.tx({
    file: 'nmbrs.i',
    w: 24,
    h: 38,
    x: x + 50,
    y: y,
    index: 10,
  }),
  grr.tx({
    file: 'nmbrs.i',
    w: 24,
    h: 38,
    x: x + 70,
    y: y,
  }),
  grr.tx({
    file: 'nmbrs.i',
    w: 24,
    h: 38,
    x: x + 95,
    y: y,
  })
];

const update = () => {
  const date = new Date();
  const h = date.getHours();
  const m = date.getMinutes();

  numbers[0].set({ index: Math.floor(h / 10) });
  numbers[1].set({ index: Math.floor(h % 10) });
  numbers[3].set({ index: Math.floor(m / 10) });
  numbers[4].set({ index: Math.floor(m % 10) });
};

// const start = () => {
const x = 60;
const y = 100;
numbers.forEach(tx => grr.add(tx));
update();

if (!updateInterval) {
  updateInterval = setInterval(update, 1000);
}
// };

// const stop = () => {
//   if (updateInterval) {
//     clearInterval(updateInterval);
//     updateInterval = null;
//   }

//   numbers.forEach(n => n.delete());
// };

// module.exports = {
//   start: start,
//   stop: stop,
//   touch: () => { },
// };