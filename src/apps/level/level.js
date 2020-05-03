// accelerometer test screen, renders current X/Y accelerometer readings
const fb = require('fb');
const st = require('Storage');
const icons = st.readArrayBuffer('icons.i');
const Watch = require('./src/ID205L');

const start = () => {
  let mode = 0;
  let activeColor = fb.color(0xff, 0, 0);
  const inactiveColor = fb.color(0x66, 0x66, 0x66);
  const xaxis = fb.add({
    x: 12,
    y: 120,
    c: inactiveColor,
    w: 240 - 24,
    h: 1,
  });
  const yaxis = fb.add({
    x: 120,
    y: 12,
    c: inactiveColor,
    w: 1,
    h: 240 - 24,
  });

  const pt = fb.add({
    x: 0,
    y: 0,
    buf: icons,
    w: 1,
    index: 3,
    c: activeColor,
  });

  const int = setInterval(() => {
    const data = Watch.accelerometer.read();

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

    const Y = (x / 3) + 120;
    const X = (y / 3) + 120;
    fb.set(
      pt,
      {
        x: X,
        y: Y - 17,
      }
    );

    fb.set(xaxis, { c: Math.abs(x) < 15 ? activeColor : inactiveColor });
    fb.set(yaxis, { c: Math.abs(y) < 15 ? activeColor : inactiveColor });
  }, 100);

  const onTap = () => {
    mode = (mode + 1) % 3;
    activeColor = fb.color(
      mode === 0 ? 255 : 0,
      mode === 1 ? 255 : 0,
      mode === 2 ? 255 : 0
    )
    fb.set(pt, { c: activeColor });
  };

  return {
    onStop: () => {
      clearInterval(int);
      fb.remove(pt);
      fb.remove(xaxis);
      fb.remove(yaxis);
    },
    onTap: onTap,
    sleep: false,
  }
}

module.exports = start;