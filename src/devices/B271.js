// Espruino driver for an unknown accelerometer labelled "B271 VS35".

const I2C_DEVICEID = 0x1f;
const I2C_REG = 0x02;

const u8u8tos16 = (byteA, byteB) => {
  const sign = byteA & (1 << 7);
  var x = ((byteA & 0xff) << 8) | (byteB & 0xff);
  if (sign) {
    return 0xffff0000 | x; // fill in most significant bits with 1's
  }
  return x;
};

/*
 cfg.sda - i2c sda pin
 cfg.scl - i2c scl pin
 cfg.enable - i2c reset pin, high to enable device
*/
function init(cfg) {
  const i2c = new I2C();
  i2c.setup({ sda: cfg.sda, scl: cfg.scl });

  const result = {
    enable: () => cfg.enable.write(1),
    disable: () => cfg.enable.write(0),
    read: () => {
      i2c.writeTo(I2C_DEVICEID, I2C_REG);
      const data = i2c.readFrom(I2C_DEVICEID, 6);
      return {
        x: u8u8tos16(data[1], data[0]) >> 6,
        y: u8u8tos16(data[3], data[2]) >> 6,
        z: u8u8tos16(data[5], data[4]) >> 6
      };
    }
  };

  return result;
}

module.exports = init;