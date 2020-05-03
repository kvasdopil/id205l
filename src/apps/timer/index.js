const st = require('Storage');
const fb = require('fb');
const navigator = require('./src/components/navigator');

const navi = navigator([
  require('./src/components/app-icon')({
    title: 'Timer',
    icon: st.readArrayBuffer('icon-timer.i'),
    iconColor: fb.color(0xff, 0x6a, 0x00)
  }),
  require('./src/apps/timer/setup'),
  require('./src/apps/timer/active'),
]);

module.exports = navi;