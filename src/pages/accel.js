// accelerometer test screen, renders current X/Y accelerometer readings
const fb = require('fb');
const st = require('Storage');
const font = st.readArrayBuffer('icons.i');

const start = () => {
  let mode = 0;
  const pt = fb.add({
    x: 0,
    y: 0,
    w: 20,
    h: 20,
    buf: font,
    c: fb.color(255, 0, 0),
    index: 3,
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
        x: X - 10,
        y: Y - 10,
      }
    );
  }, 100);

  const onTap = () => {
    mode = (mode + 1) % 3;
    fb.set(
      pt,
      {
        c: fb.color(
          mode === 0 ? 255 : 0,
          mode === 1 ? 255 : 0,
          mode === 2 ? 255 : 0
        )
      }
    );
  };

  return {
    onStop: () => {
      clearInterval(int);
      fb.remove(pt);
    },
    onTap: onTap,
    sleep: false,
  }
}

module.exports = start;