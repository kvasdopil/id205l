const st = require('Storage');
const fb = require('fb');

const font = st.readArrayBuffer('metropolis-medium.18.f');

const BG = fb.color(0x35, 0x35, 0x35);
const GREEN = fb.color(0x58, 0xdc, 0x63);

const maxStorage = 40960;

const init = () => {
  const ui = [
    fb.add({
      x: 12,
      y: 12,
      buf: font,
      c: 0xffff,
      index: "Free storage:",
    }),
    fb.add({
      x: 12,
      y: 32,
      buf: font,
      c: 0xffff,
      index: `${st.getFree()} bytes`,
    }),
    fb.add({
      x: 12,
      y: 62,
      c: BG,
      h: 12,
      w: 216,
    }),
    fb.add({
      x: 12,
      y: 62,
      c: GREEN,
      h: 12,
      w: 216 * (1 - (st.getFree() / maxStorage)),
    }),
    fb.add({
      x: 12,
      y: 86,
      buf: font,
      c: 0xffff,
      index: "Vars:",
    }),
    fb.add({
      x: 12,
      y: 86 + 24,
      buf: font,
      c: 0xffff,
      index: `${process.memory().usage} / ${process.memory().total}`,
    }),
    fb.add({
      x: 12,
      y: 86 + 24 + 12 + 12,
      c: BG,
      h: 12,
      w: 216,
    }),
    fb.add({
      x: 12,
      y: 86 + 24 + 12 + 12,
      c: GREEN,
      h: 12,
      w: 216 * (process.memory().usage / process.memory().total),
    })
  ];

  return {
    onStop: () => {
      ui.forEach(ctrl => fb.remove(ctrl));
    },
    sleep: false,
  }
}

module.exports = init;