// settings screen, renders brightness level
const st = require('Storage');
const fb = require('fb');
const SETTINGS = require('./src/globals');
const Watch = require('./src/ID205L');

const icons = st.readArrayBuffer('icons.i');

let btn1value = 0;
let btn2value = 0;

const FG = fb.color(0xd8, 0xd8, 0xd8);
const BG = fb.color(0x53, 0x53, 0x53);

const start = () => {
  const bgLight = fb.add({
    x: 12,
    y: 12,
    w: 96,
    h: 240 - 12 - 12,
    c: FG,
  });
  const fgLight = fb.add({
    x: 12,
    y: 12,
    w: 96,
    c: BG,
  });
  const lightIcon = fb.add({
    x: 60,
    y: 163,
    c: 0,
    w: 1,
    buf: icons,
    index: 0,
  });

  const bgDnd = fb.add({
    x: 129,
    y: 12,
    w: 96,
    h: 96,
    c: BG,
  });
  const dndIcon = fb.add({
    x: 177,
    y: 46,
    w: 1,
    c: btn1value ? 0 : 0xffff,
    buf: icons,
    index: 1,
  });

  const bgCall = fb.add({
    x: 129,
    y: 132,
    w: 96,
    h: 96,
    c: BG,
  });
  const callIcon = fb.add({
    x: 177,
    y: 164,
    w: 1,
    c: btn2value ? 0 : 0xffff,
    buf: icons,
    index: 2,
  });

  const rects = [
    fb.add({ x: 129, y: 126, c: 0, buf: icons, index: 4 }),
    fb.add({ x: 129 + 71, y: 126, c: 0, buf: icons, index: 5 }),
    fb.add({ x: 129, y: 126 + 72, c: 0, buf: icons, index: 6 }),
    fb.add({ x: 129 + 71, y: 126 + 72, c: 0, buf: icons, index: 7 }),

    fb.add({ x: 129, y: 6, c: 0, buf: icons, index: 4 }),
    fb.add({ x: 129 + 71, y: 6, c: 0, buf: icons, index: 5 }),
    fb.add({ x: 129, y: 6 + 72, c: 0, buf: icons, index: 6 }),
    fb.add({ x: 129 + 71, y: 6 + 72, c: 0, buf: icons, index: 7 }),

    fb.add({ x: 12, y: 6, c: 0, buf: icons, index: 4 }),
    fb.add({ x: 12 + 71, y: 6, c: 0, buf: icons, index: 5 }),

    fb.add({ x: 12, y: 126 + 72, c: 0, buf: icons, index: 6 }),
    fb.add({ x: 12 + 71, y: 126 + 72, c: 0, buf: icons, index: 7 }),
  ];

  const updateLight = () => {
    const value = 3 - SETTINGS.BL_LEVEL;
    fb.set(fgLight, { h: 80 * value });
  };

  const onTap = (e) => {
    if (e.x < 120) { // backlight
      const value = 3 - Math.floor(e.y / 80);
      if (value === SETTINGS.BL_LEVEL) {
        return;
      }
      Watch.vibrate(30);
      SETTINGS.BL_LEVEL = value;
      Watch.setBacklight(SETTINGS.BL_LEVEL);

      updateLight()
      return;
    }

    if (e.y < 120) {
      btn1value = !btn1value;
      Watch.vibrate(30);
      fb.set(bgDnd, { c: btn1value ? FG : BG });
      fb.set(dndIcon, { c: btn1value ? 0 : 0xffff });
    } else {
      btn2value = !btn2value;
      Watch.vibrate(30);
      fb.set(bgCall, { c: btn2value ? FG : BG });
      fb.set(callIcon, { c: btn2value ? 0 : 0xffff });
    }
  }

  updateLight();

  return {
    onStop: () => {
      fb.remove(bgLight);
      fb.remove(fgLight);
      fb.remove(bgCall);
      fb.remove(bgDnd);
      fb.remove(dndIcon);
      fb.remove(callIcon);
      fb.remove(lightIcon);
      rects.forEach(rect => fb.remove(rect));
    },
    onTap: onTap,
  }
};

module.exports = start;