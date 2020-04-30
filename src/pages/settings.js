// settings screen, renders brightness level
const fb = require('fb');

const btn1value = 0;
const btn2value = 0;

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

  const bgDnd = fb.add({
    x: 129,
    y: 12,
    w: 96,
    h: 96,
    c: BG,
  });

  const bgCall = fb.add({
    x: 129,
    y: 132,
    w: 96,
    h: 96,
    c: BG,
  })

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
    } else {
      btn2value = !btn2value;
      Watch.vibrate(30);
      fb.set(bgCall, { c: btn2value ? FG : BG });
    }
  }

  updateLight();

  return {
    onStop: () => {
      fb.remove(bgLight);
      fb.remove(fgLight);
      fb.remove(bgCall);
      fb.remove(bgDnd);
    },
    onTap: onTap,
  }
};

module.exports = start;