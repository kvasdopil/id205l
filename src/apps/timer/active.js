const fb = require('fb');
const st = require('Storage');
const SETTINGS = require('./src/globals');

const big = st.readArrayBuffer('metropolis-medium.72.f');
const font = st.readArrayBuffer('metropolis-medium.18.f');

module.exports = (navigate) => {
  const COLOR_BR = fb.color(0xFF, 0x61, 0x00);
  const fill2 = a => a < 10 ? `0${a}` : `${a}`;

  const ui = [
    fb.add({ x: 120, y: 70, w: 1, c: COLOR_BR, buf: big, index: [] }),
    fb.add({ x: 120, y: 180, w: 1, c: 0xffff, buf: font, index: 'stop' }),
  ];

  const render = () => {
    const diff = (SETTINGS.NEXT_TIMER - new Date().getTime()) / 1000;
    if (diff <= 0) {
      console.log('diff < 0');
      SETTINGS.NEXT_TIMER = null;
      navigate(1);
      return;
    };

    const ss = Math.floor(diff % 60);
    const mm = Math.floor((diff / 60) % 60);
    const hh = Math.floor(diff / 3600);

    if (hh >= 1) {
      if (hh >= 0) {
        fb.set(ui[0], { index: `${hh}:${fill2(mm)}:${fill2(ss)}` });
      }
      return;
    }
    fb.set(ui[0], { index: `${mm}:${fill2(ss)}` });
  }
  const int = setInterval(render, 1000);
  render();

  return {
    onStop: () => {
      clearInterval(int);
      ui.forEach(u => fb.remove(u));
    },
    sleep: false,
  };
}