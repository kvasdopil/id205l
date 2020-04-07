/*
=== Pin Layout ===
0 - XL1
1 - XL1
2 - 
3 -
4 - ACCELEROMETER_ENABLE
5 - ACCELEROMETER SCL reg 0x1f
6 - 
7 - HEART_SENSOR SDA reg 0x44
8 - HEART_SENSOR SCL reg 0x44
9  - ?? MEMORY_SI
10 - 
11 - 
12 - MEMORY_WP
13 - 
14 - HEART_BACKLIGHT
15 - ??? HEART
16 - BTN1
17 - HEART_ENABLE
18 - ??? HEART
19 - MEMORY_CS
20 - MOTOR
21 - MEMORY_SO
22 - BACKLIGHT
23 - 
24 - 
25 - 
26 - 
27 - ACCELEROMETER SDA reg 0x1f
28 - BATTERY_CHARGE
29 - 
30 - BACKLIGHT2
31 -
32 -
33 - MEMORY_HOLD
34 -
35 -
36 - TX
37 - RX
38 - MEMORY_CLK
39 - CHARGING
40 - ?
41 - ?
42 - 
43 -
44 -
45 -
46 -
47 -
*/

const MEMORY_CLK = 38;
const MEMORY_CS = 19;
const MEMORY_SO = 21;
const MEMORY_HOLD = 33;
const MEMORY_SI = 9;

const pins = [
  2, 3, 6, 9, 10, 11, 13, 15, 18, 19,
  21, 23, 24, 26, 29, 31, 32, 33, 34,
  35, 38, 40, 41, 42, 43, 44, 45, 46,
  47, 25];
const spi = new SPI();

pins.forEach(p => digitalWrite(p, 1));

const testSPI = (cfg) => {
  digitalWrite(cfg.hold, 1);
  spi.setup({ sck: cfg.clk, miso: cfg.so, mosi: cfg.si, mode: 0 });
  return spi.send([0x05, 0, 0, 0], cfg.cs);
};

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
