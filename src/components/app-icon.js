const st = require('Storage');
const fb = require('fb');

const font = st.readArrayBuffer('metropolis-medium.18.f');

module.exports = (props) => {
  return (navigate) => {
    const ui = [
      fb.add({
        x: 120,
        y: 44,
        w: 1,
        c: props.iconColor,
        buf: props.icon,
        index: 0
      }),
      fb.add({
        x: 120,
        y: 180,
        w: 1,
        c: 0xffff,
        buf: font,
        index: props.title,
      })
    ];

    return {
      onStop: () => ui.forEach(u => fb.remove(u)),
      onTap: () => navigate(1),
    };
  }
}