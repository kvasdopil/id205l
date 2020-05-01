const fb = require('fb');
const st = require('Storage');
const icons = st.readArrayBuffer('icons.i');

const btn = (props) => {
  const rects = [
    fb.add({
      x: props.x,
      y: props.y,
      w: 96,
      h: 96,
      c: props.c,
    }),
    fb.add({ x: props.x, y: props.y - 6, c: 0, buf: icons, index: 4 }),
    fb.add({ x: props.x + 71, y: props.y - 6, c: 0, buf: icons, index: 5 }),
    fb.add({ x: props.x, y: props.y - 6 + 72, c: 0, buf: icons, index: 6 }),
    fb.add({ x: props.x + 71, y: props.y - 6 + 72, c: 0, buf: icons, index: 7 }),
  ];

  return {
    remove: () => {
      rects.forEach(p => fb.remove(p));
    },
    set: (opts) => fb.set(rects[0], opts)
  }
}

module.exports = btn;