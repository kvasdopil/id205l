
// Espruino driver for HX3600 heart sensor

/* HX3600 registers 
addr   value  desc
0x00 - 0x22 - device ID
0x01 - 0x01 - reserved
0x02 - 0x11 - functions enabled (should be 0x33)
0x03 - 0x00 - reserved (should be 0x8f)
0x04 - 0x10 - LED1 phase config
0x05 - 0x20 - LED2 phase config
0x06 - 0x50 - INT1 config
0x07 - 0x07 - INT1 config
0x08 - 0x00 - INT1 config
0x09 - 0x02 - sleep enabled
 
0x14 - 0x00 - ps offset
0x15 - 0x00 - hrs offset
0x16 - 0x40 - ps interval
 
0xA0 - 0x00 - hrs data out
0xA1 - 0x00 - hrs data out
0xA2 - 0x00 - hrs data out
 
0xA3 - 0x00 - als data out
0xA4 - 0x00 - als data out
0xA5 - 0x00 - als data out
 
0xA6 - 0x00 - ps1 data out
0xA7 - 0x00 - ps1 data out
0xA8 - 0x00 - ps1 data out
 
0xA9 - 0x00 - als2 data out
0xAA - 0x00 - als2 data out
0xAB - 0x00 - als2 data out
 
0xC0 - 0x86 - led driver config
*/

const I2C_DEVICEID = 0x44;

/*
Params:
- sda - i2c sda
- scl - i2c scl
- enable - enable pin, chip is on when high
*/
function init(cfg) {
  const result = {
    enable: () => cfg.enable.write(1),
    disable: () => cfg.enable.write(0),
    read: (reg, length) => {
      const i2c = new I2C();
      i2c.setup({ sda: cfg.sda, scl: cfg.scl });

      i2c.writeTo(I2C_DEVICEID, reg);
      return i2c.readFrom(I2C_DEVICEID, length);
    },
  };

  return result;
}

module.exports = init;