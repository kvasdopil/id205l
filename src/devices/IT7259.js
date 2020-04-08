// Espruino driver for IT7259 touch sensor

const I2C_DEVICEID = 0x46;
const I2C_REG = 225;

/*
 * sda: sda I2C pin
 * scl: scl I2C pin
 * int: interrupt pin
 * reset: reset pin, chip is off when low
 * enable: negated reset pin, chip is on when high
 */
function init(cfg) {
  const i2c = new I2C();
  i2c.setup({ sda: cfg.sda, scl: cfg.scl });

  const result = {
    enable: () => {
      cfg.enable.write(1);
      cfg.reset && cfg.reset.write(0); // ID205L uses separate reset pin for screen and touch controller
    },
    disable: () => cfg.enable.write(0),
    onTouch: event => console.log(event),
    read: () => {
      i2c.writeTo(I2C_DEVICEID, I2C_REG);
      const res = i2c.readFrom(I2C_DEVICEID, 16);
      return { x: res[2], y: res[4], type: res[0] };
    }
  }

  if (cfg.int) {
    setWatch(
      () => result.onTouch(result.read()),
      cfg.int,
      { edge: 'falling', debounce: 10, repeat: true }
    );
  }

  return result;
}

module.exports = init;