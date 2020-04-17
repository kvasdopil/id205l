const spim = require('spim');
const st = require('Storage');

const BitBlt = (filename, WI, HE) => {
  return {
    draw: (x1, y1, index) => {
      const length = 2 * WI * HE;
      const skip = index * length;

      const numbers = st.read(filename, skip, length);

      const x2 = x1 + WI - 1;
      const y2 = y1 + HE - 1;
      spim.sendSync([0x2A, x1 >> 8, x1, x2 >> 8, x2], 1);
      spim.sendSync([0x2B, y1 >> 8, y1, y2 >> 8, y2], 1);

      const cachedFill = new Uint8Array(1 + length);
      cachedFill.set([0x2C], 0);
      cachedFill.set(numbers, 1);

      spim.sendSync(cachedFill, 1);
    }
  }
}

module.exports = BitBlt;