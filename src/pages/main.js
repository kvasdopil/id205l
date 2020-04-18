const BitBlt = require('./src/bitblt');

const BigFont = BitBlt('nmbrs.i', 24, 38);

// main screen, renders current time

let updateInterval;

const renderTime = (g) => {
  const date = new Date();
  const h = date.getHours();
  const m = date.getMinutes();

  const x = 60;
  const y = 100;

  BigFont.draw(x, y, Math.floor(h / 10));
  BigFont.draw(x + 25, y, h % 10);
  BigFont.draw(x + 50, y, 10);

  BigFont.draw(x + 65, y, Math.floor(m / 10));
  BigFont.draw(x + 65 + 25, y, m % 10);
};

const render = () => {
  renderTime(GG);
};

const start = () => {
  render();
  if (!updateInterval) {
    updateInterval = setInterval(render, 1000);
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