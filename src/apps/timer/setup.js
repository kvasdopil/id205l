const fb = require('fb');
const st = require('Storage');

const big = st.readArrayBuffer('big_numbers.i');
const icons = st.readArrayBuffer('icons.i');
const font = st.readArrayBuffer('font1.i');

const str = text => text.split('').map(char => char.charCodeAt(0) - 32).filter(i => i >= 0);

const start = (navigate) => {
  if (SETTINGS.NEXT_TIMER) {
    setTimeout(() => navigate(2), 1);
    return { onStop: () => { } };
  }

  const COLOR_BR = fb.color(0xFF, 0x61, 0x00);

  const hh = 0;
  const mm = 15;

  const ui = [
    fb.add({ x: 30, y: 70, c: COLOR_BR, buf: big, index: [0, 0] }),
    fb.add({ x: 132, y: 70, c: COLOR_BR, buf: big, index: [1, 5] }),
    fb.add({ x: 50, y: 30, c: 0xffff, buf: icons, index: 8 }),
    fb.add({ x: 147, y: 30, c: 0xffff, buf: icons, index: 8 }),
    fb.add({ x: 50, y: 155, c: 0xffff, buf: icons, index: 9 }),
    fb.add({ x: 147, y: 155, c: 0xffff, buf: icons, index: 9 }),
    fb.add({ x: 45, y: 132, c: 0xffff, buf: font, index: str('hours') }),
    fb.add({ x: 145, y: 132, c: 0xffff, buf: font, index: str('mins') }),
    fb.add({ x: 185, y: 212, c: 0xffff, buf: font, index: str('start') }),
  ];

  const onTap = (e) => {
    const mod = e.y > 100 ? -1 : 1;
    if (e.y > 200) {
      Watch.vibrate([50, 50, 50]);
      SETTINGS.NEXT_TIMER = new Date() + (1000 * 60 * (mm + 60 * hh));
      navigate(2); // go to active page
      return;
    }
    if (e.x < 100) {
      hh += mod;
      if (hh > 99) { hh = 99; return; }
      if (hh < 0) { hh = 0; return; }
    } else {
      if (mod > 0) {
        if (mm == 59) {
          if (hh == 99) return;
          mm = 0; hh++;
        } else {
          mm++;
        }
      } else {
        if (mm <= 1 && hh == 0) return;
        if (mm == 0) {
          mm = 59;
          hh--;
        } else {
          mm--;
        }
      }
    }
    Watch.vibrate(30);
    fb.set(ui[0], { index: [hh / 10, hh % 10] });
    fb.set(ui[1], { index: [mm / 10, mm % 10] });
  };
  const onLongTap = (e) => {
    if (e.y > 200) return;
    if (e.y > 100) {
      if (mm == 0) return;
      if (hh === 0 && mm == 1) return;
      mm -= (mm % 10 === 0) ? 10 : mm % 10;
      if (hh === 0 && mm == 0) { mm = 1 };
    } else {
      if (mm == 59) return;
      mm += (mm % 10 === 0) ? 10 : (10 - mm % 10);
      if (mm > 59) { mm = 59 };
    }
    Watch.vibrate(30);
    fb.set(ui[0], { index: [hh / 10, hh % 10] });
    fb.set(ui[1], { index: [mm / 10, mm % 10] });
  }
  return {
    onLongTap: onLongTap,
    onTap: onTap,
    onStop: () => {
      ui.forEach(u => fb.remove(u));
    },
  };
}

module.exports = start;