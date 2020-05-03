const kerntable = `A G -18
A T -64
A V -88
A W -40
A Y -35
C O -15
D A -48
K A 24
K O -29
L T -25
L V -109
O W -24
R Y -36
T A -64
T O -40
V A -88
V a -32
V c -68
V e -68
V o -68
W A -40
W c -54
W e -54
W o -54
Y A -29
Y c -114
Y e -114
Y o -114
c V -68
c W -54
c Y -114
c o -11
e V -68
e W -54
e Y -114
e w -25
o V -68
o W -54
o Y -114
o v -21
o w -21
o y -16
r o -16
v a -38
v d -19
v e -34
v o -21
v , -117
v . -117
w e -25
w o -21
w , -93
w . -93
y e -23
y o -22
y , -117
y . -117
/ \\ -127
/ \\ 74
\\ \\ -127
n d -50
e r 50
e l 50
v e -50
e v -50
t o -50
r a -50
r e -50
V a -127
L e -100
a r 50
s t -60
t a -80
t e -100
u r 50
r s -50
n s -60
b y -50
4 5 -60`.trim()
  .split('\n')
  .map(line => line.trim().split(' '))
  .reduce((res, [a, b, val]) => {
    const ca = a.charCodeAt(0) - 32;
    const cb = b.charCodeAt(0) - 32;
    if (!res[ca]) res[ca] = {};
    res[ca][cb] = Math.round(parseInt(val) / 80);
    return res;
  }, {});

function get_offset(buf, index) {
  index = Math.floor(index);
  let pt = 0;
  let len = 0;
  while (true) {
    len = (buf[pt++] << 8) + buf[pt++];
    if (index <= 0) {
      break;
    }
    pt += len;
    index--;
  }
  return [pt, len];
}

function calc_width(buf, indexes) {
  let result = 0;
  let prevIndex = -1;
  for (ind of indexes) {
    if (ind !== ind) continue;
    let kern = 0;
    if (kerntable[prevIndex]) {
      kern = kerntable[prevIndex][ind] || 0;
    }
    const [pt] = get_offset(buf, ind);
    const w = buf[pt + 1];
    result += kern + w;
  }
  return Math.max(0, result);
}

function blit(ctx, X, Y, buf, index, tint) {
  if (index != index) {
    return;
  }
  let [pt, len] = get_offset(buf, index);
  const type = buf[pt++];
  const w = buf[pt++];
  if (type !== 1) {
    console.error('Buf type != 1', type);
    return;
  }

  let x = 0;
  let y = 0;
  let br = 0;
  let rle = 0;
  len = pt + len - 1;
  while (pt < len) {
    if (rle == 0) {
      br = buf[pt++];
      if (br & 0b10000000) {
        br &= 0b111111;
        rle = buf[pt++] - 1;
      }
    } else {
      rle--;
    }
    const bb = (br << 2) + ((br >> 4) & 0b11);
    const nbb = 0xff - bb;
    const [or, og, ob] = ctx.getImageData(X + x, Y + y, 1, 1).data;
    const r = ((or * nbb) + (bb * tint[0])) >> 8;
    const g = ((og * nbb) + (bb * tint[1])) >> 8;
    const b = ((ob * nbb) + (bb * tint[2])) >> 8;
    ctx.fillStyle = `RGB(${r},${g},${b})`
    ctx.fillRect(X + x, Y + y, 1, 1);

    x++;
    if (x === w) {
      x = 0;
      y++;
    }
  }

  return w;
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
        if (p.w > 0 && p.h > 0) {
          ctx.fillStyle = `RGB(${p.c[0]},${p.c[1]},${p.c[2]})`;
          ctx.fillRect(p.x, p.y, p.w, p.h);
        }
        return;
      }

      const indexes = typeof p.index === 'number' ? [p.index] : p.index;
      let x = p.x;
      if (p.w == 1) { // centered
        x -= Math.round(calc_width(p.buf, indexes) / 2);
      }
      if (p.w == 2) { // right
        x -= calc_width(p.buf, indexes);
      }
      let prevIndex = -1;
      for (ind of indexes) {
        let kern = 0;
        if (kerntable[prevIndex]) {
          kern = Math.round(kerntable[prevIndex][ind] / 80) || 0;
        }
        x += kern;
        x += blit(ctx, x, p.y, p.buf, ind, p.c);
        prevIndex = ind;
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
  getFree() { return 12345; }
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