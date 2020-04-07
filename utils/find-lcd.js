/**
0 - XL1
1 - XL1
2 -
3 - NO_CHIP
4 - ACCELEROMETER_ENABLE
5 - ACCELEROMETER SCL device 0x1f
6 - ACCELEROMETER_STOP
7 = HEART_SENSOR SDA device 0x44
8 = HEART_SENSOR SCL device 0x44
9 - GND?
10 - GND?
11 - NO_CHIP?
12 - MEMORY_WP
13 -
14 = heart sensor backlight aka LED1
15 - LED?
16 = BTN1
17 = HEART_SENSOR_ENABLE
18 - LED?
19 - MEMORY_CS, LED?
20 = MOTOR
21 = MEMORY_SO
22 = BACKLIGHT
23 -
24 - TOUCH_RESET
25 - LED?
26 - ACCELEROMETER_INT1? (pulled down)
27 - ACCELEROMETER SDA device 0x1f
28 - BATTERY_LEVEL
29 -
30 - BACKLIGHT2
31 - ?
32 -
33 - MEMORY_HOLD
34 -
35 -
36 - TX
37 - RX
38 - MEMORY_CLK
39 - CHARGING
40 - (pulled down) - connected to HEART_SENSOR
41 - NO_CHIP?
42 - TOUCH unknown
43 - TOUCH unknown
44 - TOUCH unknown
45 - TOUCH unknown
46 -
47 - TOUCH unknown
*/

const spi = new SPI();
const display = require("ST7789");

const test = (si, sck, dc, ce) => new Promise(resolve => {
    spi.setup({ mosi: si, sck: sck, mode: 3 });
    const g = display.connect(spi, dc, ce, null, () => {
        g.clear();
        //g.setRotation(1);
        g.drawString("A", 0, 0);
        resolve();
    });
});

// D2, D13, D23, D29, D31, D32, D34, D35, D46
// D15, D18, D31, D25, 

const a = D29;
const b = D28;
const c = D2; // D19;
const d = D31;

const variants = [
    [a, b, c, d],
    [a, b, d, c],
    [a, c, b, d],
    [a, c, d, b],
    [a, d, b, c],
    [a, d, c, b],

    [b, a, c, d],
    [b, a, d, c],
    [b, c, a, d],
    [b, c, d, a],
    [b, d, c, a],
    [b, d, a, c],

    [c, a, b, d],
    [c, a, d, b],
    [c, b, a, d],
    [c, b, d, a],
    [c, d, a, b],
    [c, d, b, a],

    [d, a, b, c],
    [d, a, c, b],
    [d, b, a, c],
    [d, b, c, a],
    [d, c, a, b],
    [d, c, b, a],
];

const run = () => {
    if (variants.length == 0) { console.log('done'); return; }
    const i = variants.pop();
    console.log(i);
    test(i[0], i[1], i[2], i[3]).then(() => setTimeout(run, 500));
};
run();
