const I2C_ADDRESS = 0x46;
const I2C_REG = 225;

function initIT7259(cfg) {
  const i2c = new I2C();
  i2c.setup({ sda: cfg.sda, scl: cfg.scl });

  const result = {
    enable: () => {
      cfg.enable.write(1);
      cfg.reset && cfg.reset.write(0);
    },
    disable: () => cfg.enable.write(0),
    onTouch: (event) => console.log(event),
  }

  setWatch(() => {
    i2c.writeTo(TOUCH_ADDRESS, TOUCH_REG);
    const res = i2c.readFrom(TOUCH_ADDRESS, 16);
    result.onTouch({ x: res[2], y: res[4], type: res[0] });
  }, cfg.int, { edge: 'falling', debounce: 10, repeat: true });

  return result;
}

module.export = init;