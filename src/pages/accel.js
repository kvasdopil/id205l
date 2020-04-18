// accelerometer test screen, renders current X/Y accelerometer readings

let X = 120;
let Y = 120;

let mode = 0;

const render = () => {
  const data = Watch.accelerometer.read();

  // clear old value
  GG.setColor(0, 0, 0);
  GG.fillRect(X - 10, Y - 10, X + 10, Y + 10);

  // draw new value
  GG.setColor(mode === 0, mode === 1, mode === 2);
  let x;
  let y;
  if (mode === 0) {
    x = data.x;
    y = data.y;
  }
  if (mode === 1) {
    x = data.z;
    y = data.y;
  }
  if (mode === 2) {
    x = data.x;
    y = data.z;
  }
  Y = (x / 3) + 120;
  X = (y / 3) + 120;
  GG.fillRect(X - 10, Y - 10, X + 10, Y + 10);
}
let interval;

const start = () => {
  if (!interval) {
    interval = setInterval(render, 100);
  }
}

const stop = () => {
  if (interval) {
    clearInterval(interval);
    interval = 0;
  }
}

const touch = () => {
  mode = (mode + 1) % 3;
}

module.exports = {
  start: start,
  stop: stop,
  touch: touch,
  nosleep: true,
}