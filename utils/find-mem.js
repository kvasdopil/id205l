/*
=== Pin Layout ===
- 0 - XL1
- 1 - XL1
- 2 - LCD_SCK
- 3 - NO_CHIP
- 4 - ACCELEROMETER_ENABLE
- 5 - ACCELEROMETER SCL device 0x1f
- 6 - ACCELEROMETER_STOP
- 7 = HEART_SENSOR SDA device 0x44
- 8 = HEART_SENSOR SCL device 0x44
- 9  - GND?
- 10 - GND?
- 11 - NO_CHIP? 
- 12 - MEMORY_WP
- 13 - 
- 14 = heart sensor backlight aka LED1
- 15 - 
- 16 = BTN1
- 17 = HEART_SENSOR_ENABLE
- 18 - 
- 19 - MEMORY_CS
- 20 = MOTOR
- 21 = MEMORY_SO
- 22 = BACKLIGHT
- 23 - 
- 24 - TOUCH_RESET
- 25 - 
- 26 - ACCELEROMETER_INT1? (pulled down)
- 27 - ACCELEROMETER SDA device 0x1f
- 28 - BATTERY_LEVEL
- 29 - LCD_SI
- 30 - BACKLIGHT2
- 31 - LCD_DC
- 32 -
- 33 - MEMORY_HOLD
- 34 -
- 35 -
- 36 - TX
- 37 - RX
- 38 - MEMORY_CLK
- 39 - CHARGING
- 40 - (pulled down) - connected to HEART_SENSOR
- 41 - NO_CHIP?
- 42 - TOUCH_SCL
- 43 - TOUCH_SDA
- 44 - TOUCH_INT
- 45 - TOUCH_ENABLE
- 46 - LCD_RESET
- 47 - LCD_CS
*/

const MEMORY_CLK = 38;
const MEMORY_CS = 19;
const MEMORY_SO = 21;
const MEMORY_HOLD = 33;
const MEMORY_SI = 9;

const pins = [
  3, 9, 10, 11, 13, 15, 18, 23, 25, 26, 32, 34, 35, 40, 41
];
const ppp = [
  3, 9, 10, 11, 13, 15, 18, 23, 25, 26, 32, 34, 35, 40, 41, 24
];
const spi = new SPI();

const testSPI = (cfg) => {
  // digitalWrite(cfg.hold, 0);
  spi.setup({ sck: cfg.clk, miso: cfg.so, mosi: cfg.si, mode: 0 });
  return spi.send([0x9f, 0, 0, 0], cfg.cs);
};

D9.mode('input_pullup');
D10.mode('input_pullup');

console.log(D9.read(), D10.read());

console.log(Number(peek32(0x1000120C)).toString(2));
poke32(0x1000120C, 0);

setInterval(() => {
  if (pins.length === 0) {
    return;
  }
  ppp.forEach(pin => Pin(pin).mode('input_pullup'));
  let p = pins.shift();
  console.log(p, testSPI({ clk: MEMORY_CLK, so: MEMORY_SO, si: p, hold: MEMORY_HOLD, cs: MEMORY_CS }));
}, 100);
/*
const perms = (base) => {
  const result = [-1, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  return () => {
    let reg = 0;
    while (true) {
      if (result[reg] < base) {
        result[reg]++;
        return result;
      } else {
        result[reg] = 0;
        reg++;
      }
    }
  }
};

let ct = 0;
const total = pins.length * pins.length * pins.length * pins.length;
const start = new Date().getTime();

const values = perms(pins.length - 1);
const run = () => {
  const current = values();
  const si = current[0];
  const so = current[1];
  const cs = current[2];
  const clk = current[3];
  const hold = 18;
  const last = current[4];

  ct++;

  if (last != 0) {
    console.log('done');
    clearInterval(int);
    return;
  }

  if (si === 0 && so === 0) {
    const diff = (new Date().getTime() - start) / ct * total;
    const eta = new Date(start + diff);
    console.log(
      (100 * (ct / total)).toFixed(2),
      'percent done, eta=',
      eta,
      'si=' + pins[si],
      'so=' + pins[so],
      'cs=' + pins[cs],
      'clk=' + pins[clk],
      'hold=' + pins[hold]
    );
  }

  if (
    si == so ||
    cs == si || cs == so ||
    clk == si || clk == so || clk == cs ||
    hold === si || hold == so || hold == cs || hold == clk
  ) {
    setTimeout(run, 0);
    return;
  }

  const res = testSPI({ sck: pins[clk], si: pins[si], so: pins[so], hold: pins[hold], cs: Pin(pins[cs]) });
  if (res[0] != res[1]) {
    console.log(
      'si=' + pins[si],
      'so=' + pins[so],
      'cs=' + pins[cs],
      'clk=' + pins[clk],
      'hold=' + pins[hold],
      res.join()
    );
  }
  setTimeout(run, 0);
};
run();

// si=15 so=2 cs=3 clk=24 hold=33 240,0,0,0
// si=15 so=2 cs=3 clk=28 hold=33 255,0,0,0

// si=2 so=2 cs=23 clk=43 hold=33
*/


