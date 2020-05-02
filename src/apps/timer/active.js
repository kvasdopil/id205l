const fb = require('fb');
const st = require('Storage');
const SETTINGS = require('./src/globals');

const big = st.readArrayBuffer('big_numbers.i');
const font = st.readArrayBuffer('font1.i');

const str = text => text.split('').map(char => char.charCodeAt(0) - 32).filter(i => i >= 0);

module.exports = (navigate) => {
  const COLOR_BR = fb.color(0xFF, 0x61, 0x00);

  const ui = [
    fb.add({ x: 30, y: 70, c: COLOR_BR, buf: big, index: [] }),
    fb.add({ x: 80, y: 212, c: 0xffff, buf: font, index: str('stop') }),
  ];

  const render = () => {
    const diff = (SETTINGS.NEXT_TIMER - new Date().getTime()) / 1000;
    if (diff <= 0) {
      console.log('diff < 0');
      SETTINGS.NEXT_TIMER = null;
      navigate(1);
      return;
    };

    const ss = diff % 60;
    const mm = (diff / 60) % 60;
    const hh = (diff / 3600);

    if (hh >= 1) {
      if (hh >= 10) {
        fb.set(ui[0], { index: [hh / 10, hh, 11, 10, mm / 10, mm % 10, 10, ss / 10, ss % 10] });
      } else {
        fb.set(ui[0], { index: [hh, 11, mm / 10, mm % 10, 10, ss / 10, ss % 10] });
      }
      return;
    }
    fb.set(ui[0], { index: [mm / 10, mm % 10, 10, ss / 10, ss % 10] });
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