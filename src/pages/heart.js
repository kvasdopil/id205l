// hear sensor test screen

const render = () => {
  console.log('Heart', Watch.heart.read(0x00, 16).map(i => Number(i).toString(16)));
  console.log('Heart', Watch.heart.read(0xA0, 16).map(i => Number(i).toString(16)));
}
let interval;

const start = () => {
  if (!interval) {
    Watch.heart.enable();
    LED1.write(1);
    interval = setInterval(render, 5000);
    // Watch.heart.write(0x02, 0x33);
    // Watch.heart.write(0x09, 0x2); // sleep off
  }
}

const stop = () => {
  if (interval) {
    LED1.write(0);
    Watch.heart.disable();
    clearInterval(interval);
    interval = 0;
  }
}

const touch = () => {
}

module.exports = {
  start: start,
  stop: stop,
  touch: touch,
  nosleep: true,
}