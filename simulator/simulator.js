/// ====== fb ======

function renderRect(p) {
  if (p.w > 0 && p.h > 0) {
    ctx.fillStyle = `RGB(${p.c[0]},${p.c[1]},${p.c[2]})`;
    ctx.fillRect(p.x, p.y, p.w, p.h);
  }
}

function findGlyph(buf, id) {
  let pt = 0;
  while (pt < buf.length) {
    const a = buf[pt++];
    const b = buf[pt++];
    const len = (a << 8) + b;
    const type = buf[pt];
    const index = buf[pt + 1];
    if (type !== 11) {
      return null;
    }
    if (id === index) {
      return pt;
    }
    pt += len;
  }
  return null;
}

function calcGlyphWidth(buf, index, prevIndex) {
  let pt = findGlyph(buf, index);
  const type = buf[pt]; // type
  if (type !== 11) {
    console.log('wrong type', type);
    return 0;
  }
  let xadv = buf[pt + 6];
  const numKerns = buf[pt + 7];
  pt += 8;
  for (let k = 0; k < numKerns; k++) {
    const prev = buf[pt++];
    const off = buf[pt++];
    if (prev === prevIndex) {
      xadv += off;
    }
  }
  return xadv;
}

function blendPixel(x, y, tint, alpha) {
  const br = (alpha << 2) + ((alpha >> 4) & 0b11); // brightness
  const nbr = 0xff - br; // inverse brightness
  const [or, og, ob] = ctx.getImageData(x, y, 1, 1).data; // original color
  const r = ((or * nbr) + (br * tint[0])) >> 8;
  const g = ((og * nbr) + (br * tint[1])) >> 8;
  const b = ((ob * nbr) + (br * tint[2])) >> 8;
  ctx.fillStyle = `RGB(${r},${g},${b})`
  ctx.fillRect(x, y, 1, 1);
}

function renderGlyph(p, index, prevIndex, X, Y) {
  if (p) {
    console.log(p);
  }
  let pt = findGlyph(p.buf, index);
  const type = p.buf[pt++]; // type
  if (type !== 11) {
    console.log('wrong type', type);
    return 0;
  }
  pt++; // id
  const w = p.buf[pt++]; // width 
  const h = p.buf[pt++]; // height
  let xoff = p.buf[pt++]; // x offset
  const yoff = p.buf[pt++]; // y offset
  const xadv = p.buf[pt++]; // x advance
  const numKerns = p.buf[pt++]; // number of kernings
  for (let k = 0; k < numKerns; k++) {
    const prev = p.buf[pt++];
    const off = p.buf[pt++];
    if (prev === prevIndex) {
      //      console.log(String.fromCharCode(prev), String.fromCharCode(index), off);
      xoff += off;
    }
  }
  let brightness = 0;
  let rle = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (rle == 0) {
        brightness = p.buf[pt++];
        if (brightness & 0b10000000) {
          brightness &= 0b111111;
          rle = p.buf[pt++] - 1;
        }
      } else {
        rle--;
      }
      blendPixel(X + xoff + x, Y + y + yoff, p.c, brightness);
    }
  }
  return xadv;
}

function renderFont(p) {
  let indexes = (typeof p.index === 'number') ? [p.index] : p.index;
  indexes = (typeof indexes === 'string') ? indexes.split('').map(i => i.charCodeAt(0)) : indexes;
  let xpos = p.x;
  const ypos = p.y;

  if (p.w !== 0) {
    let w = calcFontWidth(p.buf, indexes);
    if (p.w === 1) {
      xpos -= Math.floor(w / 2);
    }
    if (p.w === 2) {
      xpos -= w;
    }
  }

  let prevIndex = 0;
  for (ind of indexes) {
    xpos += renderGlyph(p, ind, prevIndex, xpos, ypos);
    prevIndex = ind;
  }
}

function calcFontWidth(buf, indexes) {
  let result = 0;
  let prevIndex = 0;
  for (ind of indexes) {
    result += calcGlyphWidth(buf, ind, prevIndex);
    prevIndex = ind;
  }
  return result;
}

let fbPrimitives = [];
let ctx;
let fbChanged = false;
let fbId = 0;
const fb = {
  init() {
    ctx = document.getElementById('offscreen').getContext('2d');
  },
  add(cfg) {
    fbChanged = true;
    const o = { ...cfg, id: fbId++ };
    fbPrimitives.push(o);
    if (typeof o.c === 'number') {
      if (o.c === 0) {
        o.c = [0, 0, 0];
      }
      if (o.c === 0xffff) {
        o.c = [0xff, 0xff, 0xff];
      }
    }
    return fbId - 1;
  },
  set(id, cfg) {
    const index = fbPrimitives.findIndex(o => o.id === id);
    if (index < 0) {
      console.error('cannot find index', id);
    }
    fbChanged = true;
    const o = { ...fbPrimitives[index], ...cfg };
    fbPrimitives[index] = o;
    if (typeof o.c === 'number') {
      if (o.c === 0) {
        o.c = [0, 0, 0];
      }
      if (o.c === 0xffff) {
        o.c = [0xff, 0xff, 0xff];
      }
    }
  },
  remove(i) {
    fbChanged = true;
    fbPrimitives = fbPrimitives.filter(({ id }) => id != i);
  },
  render() {
    if (!fbChanged) {
      return;
    }
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 240, 240);
    fbPrimitives.forEach(p => {
      if (!p.buf) {
        return renderRect(p);
      }

      if (p.buf[2] == 11) {
        return renderFont(p);
      }
    });
    fbChanged = false;
  },
  color: (r, g, b) => [r, g, b],
}

const spim = {
  setup(cfg) { console.log('initializing spim with config', cfg) },
  send(buf, dc) { console.log('spim send async', buf, dc) },
  sendSync(buf, dc) { console.log('spim send', buf, dc) },
}

const storageData = {};
const Storage = {
  readArrayBuffer: (file) => storageData[file],
  erase(file) { storageData[file] = [] },
  write(file, data, offset, total) {
    if (!storageData[file]) {
      storageData = Array.from(Array(total))
    }
    const f = storageData[file];
    data.forEach((d, i) => f[i + offset] = d);
  },
  getFree() { return 40960 - Object.values(storageData).reduce((a, b) => a + b.length, 0); }
}

const modules = {
  spim,
  fb,
  Storage,
};

window.E = {
  reboot() { document.history.go(0) },
  enableWatchdog() { console.log('Watchdog enabled') },
}

window.i2cs = {};
window.I2C = function () {
  this.reply = [];
  this.setup = (conf) => {
    window.i2cs[conf.sda.id] = this;
    console.log('setup software i2c', conf)
  }
  this.writeTo = (data) => { /* console.log('writing to i2c', data) */ }
  this.readFrom = (length) => { /* console.log('reading from i2c', length); */ return this.reply; }
}

const watches = {};
window.setWatch = (cb, pin, params) => {
  console.log(`set watch on D${pin.id}`, params);
  watches[pin.id + params.edge] = { cb, params };
}

window.digitalPulse = (pin, period) => {
  console.log(`digital pulse on ${pin.id}`, period);
}

window.analogRead = (pin) => {
  return 0.9;
}

// initialize pins
for (let i = 0; i < 48; i++) {
  window[`D${i}`] = {
    id: i,
    mode(mode) { console.log(`pin ${i} mode changed to`, mode) },
    write(value) { console.log(`pin ${i} value ${value}`) },
    read() { return 0 }
  };
}

window.process = {
  memory: () => ({
    total: 6000,
    usage: 1000,
  })
}

// ====== device-specific config ======

setTimeout(() => {
  const touch = window.i2cs[43];
  const touchWatch = watches['44falling'];

  document.querySelector('#offscreen').onclick = (e) => {
    touch.reply = [128, 0, e.offsetX, 0, e.offsetY, 0, 0, 0, 0, 0, 0, 0];
    touchWatch.cb();
  }

  const btn1CLick = () => {
    watches['16rising'].cb(); // button press
    watches['16falling'].cb(); // button press
  }
  const swipe = (dir) => {
    touch.reply = [128, 0, 120, 120, 0, 0, 0, 0, 0, 0, dir * 2];
    touchWatch.cb();
  }

  document.querySelector("#btn1").onclick = btn1CLick;
  document.querySelector('#swipeup').onclick = () => swipe(4);
  document.querySelector('#swipeleft').onclick = () => swipe(5);
  document.querySelector('#swipedown').onclick = () => swipe(6);
  document.querySelector('#swiperight').onclick = () => swipe(7);

  document.body.onkeypress = ({ key }) => {
    if (key === 'q') {
      btn1CLick();
    }
    if (key === 'w') {
      swipe(4);
    }
    if (key === 'a') {
      swipe(5);
    }
    if (key === 's') {
      swipe(6);
    }
    if (key === 'd') {
      swipe(7)
    }
  }
}, 1000);

window.BTN1 = D16;
window.LED1 = D22;

// ====================================

const fileCache = {
  ...modules,
}
window.require = (file) => {
  if (fileCache[file + '.js']) {
    file += '.js';
  }
  if (fileCache[file + '/index.js']) {
    file += '/index.js';
  }
  if (fileCache[file]) {
    if (!modules[file]) {
      window.module = { export: null };
      fileCache[file]();
      modules[file] = window.module.exports;
    }
    return modules[file];
  }
  console.error(`module ${file} not found`)
}