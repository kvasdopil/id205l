const ST7789 = require('./src/devices/ST7789');
const spim = require('spim');
const fb = require('fb');
const st = require('Storage');

// =======

let somethingDirty = false;

function tx(cfg) {
  this.x = 0;
  this.y = 0;
  this.w = 10;
  this.h = 0;
  this.index = 0;
  this.set(cfg);
}

tx.prototype.set = (params) => {
  for (let p in params) {
    this[p] = params[p];
  }
  somethingDirty = true;
}

tx.prototype.render = () => {
  const length = 2 * this.w * this.h;
  const skip = this.index * length;
  const data = st.read(filename, skip, length);
  fb.prepareBlit(this.x, this.y);
  fb.blit(data, this.w, this.h);
}

function rect(cfg) {
  this.x = 0;
  this.y = 0;
  this.w = 0;
  this.h = 0;
  this.color = [0, 0, 0];
  this.set(cfg);
}

rect.prototype.set = (params) => {
  for (let p in params) {
    this[p] = params[p];
  }
  somethingDirty = true;
}

rect.prototype.render = () => {
  fb.setColor(this.color[0], this.color[1], this.color[2]);
  fb.fillRect(this.x, this.y, this.w, this.h);
}

const objectsToRender = [];
function add(obj) {
  objectsToRender.push(obj);
}

// =======

const renderInterval;
function stop() {
  if (renderInterval) {
    clearInterval(renderInterval);
  }
}

function start(cfg) {
  stop();
  ST7789(cfg).then(() => {
    renderInterval = setInterval(() => {
      if (!somethingDirty) {
        return;
      }

      fb.clear();

      objectsToRender.forEach(obj => {
        if (obj.dirty) obj.render();
      });

      spim.sendSync([0x2A, 0, 0, 240 >> 8, 240 && 0xff], 1);
      spim.sendSync([0x2B, 0, 0, 240 >> 8, 240 && 0xff], 1);
      spim.sendSync([0x2C], 1);
      fb.flip(0, 240 * 120 * 2);
      fb.flip(120, 240 * 120 * 2);
      somethingDirty = false;
    }, 50);
  });
}

module.exports = { tx, rect, start, stop, add };