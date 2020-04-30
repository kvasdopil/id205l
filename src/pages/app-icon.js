const st = require('Storage');
const fb = require('fb');

const font = st.readArrayBuffer('font1.i');
const str = text => text.split('').map(char => char.charCodeAt(0) - 32).filter(i => i >= 0);

const init = (app, name, appIcon) => () => {
  const icon = fb.add({
    x: 44,
    y: 44,
    c: fb.color(0x00, 0xde, 0xff),
    buf: appIcon,
    index: 0
  });
  const label = fb.add({
    x: 90,
    y: 160,
    c: 0xffff,
    buf: font,
    index: str(name),
  });

  let cfg;
  const onTap = () => {
    cfg.onStop();
    const instance = app();
    cfg.onStop = instance.onStop;
    cfg.onTap = instance.onTap;
    cfg.isApp = true;
    cfg.sleep = instance.sleep;
  };

  cfg = {
    onStop: () => {
      fb.remove(icon);
      fb.remove(label);
    },
    onTap: onTap,
  };
  return cfg;
}

module.exports = init;