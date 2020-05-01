const st = require('Storage');
const fb = require('fb');

const font = st.readArrayBuffer('font1.i');
const str = text => text.split('').map(char => char.charCodeAt(0) - 32).filter(i => i >= 0);

module.exports = (props) => {
  return (navigate) => {
    const ui = [
      fb.add({
        x: 44 + props.iconX,
        y: 44,
        c: props.iconColor,
        buf: props.icon,
        index: 0
      }),
      fb.add({
        x: 90,
        y: 160,
        c: 0xffff,
        buf: font,
        index: str(props.title),
      })
    ];

    return {
      onStop: () => ui.forEach(u => fb.remove(u)),
      onTap: () => navigate(1),
    };
  }
}