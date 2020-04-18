const start = () => {
  render();
};

const render = () => {
  GG.setColor(0.2, 0.2, 0.2);
  pos = 40 + (200 - 40) / 4 * (4 - SETTINGS.BL_LEVEL);
  GG.fillRect(80, 40, 160, pos);
  GG.setColor(0.6, 0.6, 0.6);
  GG.fillRect(80, pos, 160, 200);
}

const touch = () => {
  console.log('touch');
  SETTINGS.BL_LEVEL += 1;
  if (SETTINGS.BL_LEVEL == 4) {
    SETTINGS.BL_LEVEL = 1;
  }
  Watch.setBacklight(SETTINGS.BL_LEVEL);
  render();
}

module.exports = {
  start: start,
  stop: () => { },
  touch: touch,
};