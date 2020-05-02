const st = require('Storage');
const fb = require('fb');
const navigator = require('./src/components/navigator');

const navi = navigator([
  require('./src/components/app-icon')({
    title: 'Level',
    icon: st.readArrayBuffer('icon-level.i'),
    iconX: 0,
    iconColor: fb.color(0x00, 0xde, 0xff),
  }),
  require('./src/apps/level/level'),
]);

module.exports = navi;