const spim = require('spim');
const st = require('Storage');

const BitBlt = (filename, WI, HE) => {
  return {
    draw: (x1, y1, index) => {
      const x2 = x1 + WI - 1;
      const y2 = y1 + HE - 1;
      const count = (x2 - x1 + 1) * (y2 - y1 + 1);
      const skip = index * 2 * HE * WI;

      const numbers = st.read(filename, skip, count * 2);

      spim.sendSync([0x2A, x1 >> 8, x1, x2 >> 8, x2], 1);
      spim.sendSync([0x2B, y1 >> 8, y1, y2 >> 8, y2], 1);

      const cachedFill = new Uint8Array(1 + count * 2);
      cachedFill.set([0x2C], 0);
      cachedFill.set(numbers, 1);

      spim.sendSync(cachedFill, 1);
    }
  }
}

module.exports = BitBlt;