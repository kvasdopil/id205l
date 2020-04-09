const LCD_SCK = D2;
const LCD_SI = D29;
const LCD_DC = D31;
const LCD_RESET = D46;
const LCD_CS = D47;

const TOUCH_RESET = D24;

const spim = require('spim');
spim.setup({
    mosi: LCD_SI,
    sck: LCD_SCK,
    dc: LCD_DC,
    cs: LCD_CS,
});

TOUCH_RESET.write(0);
digitalPulse(LCD_RESET, 0, 10);

const LCD_WIDTH = 240;
const LCD_HEIGHT = 240;
const COLSTART = 0;
const ROWSTART = 0;

const ST7789_INIT_CODE = [
    // CMD, D0,D1,D2...
    [0x11, 0],     //SLPOUT (11h):
    // This is an unrotated screen
    [0x36, 0],     // MADCTL
    // These 2 rotate the screen by 180 degrees
    //0x36,0xC0],     // MADCTL
    //0x37,[0,80]],   // VSCSAD (37h): Vertical Scroll Start Address of RAM

    [0x3A, 0x55],  // COLMOD - interface pixel format - 16bpp
    [0xB2, 0xC, 0xC, 0, 0x33, 0x33], // PORCTRL (B2h): Porch Setting
    [0xB7, 0],     // GCTRL (B7h): Gate Control
    [0xBB, 0x3E],  // VCOMS (BBh): VCOM Setting 
    [0xC2, 1],     // VDVVRHEN (C2h): VDV and VRH Command Enable
    [0xC3, 0x19],  // VRHS (C3h): VRH Set 
    [0xC4, 0x20],  // VDVS (C4h): VDV Set
    [0xC5, 0xF],   // VCMOFSET (C5h): VCOM Offset Set .
    [0xD0, 0xA4, 0xA1],   // PWCTRL1 (D0h): Power Control 1 
    [0xe0, 0x70, 0x15, 0x20, 0x15, 0x10, 0x09, 0x48, 0x33, 0x53, 0x0B, 0x19, 0x15, 0x2a, 0x2f],   // PVGAMCTRL (E0h): Positive Voltage Gamma Control
    [0xe1, 0x70, 0x15, 0x20, 0x15, 0x10, 0x09, 0x48, 0x33, 0x53, 0x0B, 0x19, 0x15, 0x2a, 0x2f],   // NVGAMCTRL (E1h): Negative Voltage Gamma Contro
    [0x29, 0], // DISPON (29h): Display On 
    [0x21, 0], // INVON (21h): Display Inversion On
    // End
    [0, 0]// 255/*DATA_LEN = 255 => END*/
];

setTimeout(() => {
    spim.send([0x11, 0], 1); //Exit Sleep
}, 120);

setInterval(() => {
    if (ST7789_INIT_CODE.length === 0) return;
    const cmd = ST7789_INIT_CODE.shift();
    console.log(cmd);
    spim.send(cmd, 1);
}, 200);

/*
const connect = (spi, dc, ce, rst, callback) => {
  var g = Graphics.createCallback(LCD_WIDTH, LCD_HEIGHT, 16, {
    setPixel: (x, y, c) => {
      ce.reset();
      spi.write(0x2A, dc);
      spi.write((COLSTART + x) >> 8, COLSTART + x, (COLSTART + x) >> 8, COLSTART + x);
      spi.write(0x2B, dc);
      spi.write((ROWSTART + y) >> 8, ROWSTART + y, (ROWSTART + y) >> 8, (ROWSTART + y));
      spi.write(0x2C, dc);
      spi.write(c >> 8, c);
      ce.set();
    },
    fillRect: (x1, y1, x2, y2, c) => {
      ce.reset();
      spi.write(0x2A, dc);
      spi.write((COLSTART + x1) >> 8, COLSTART + x1, (COLSTART + x2) >> 8, COLSTART + x2);
      spi.write(0x2B, dc);
      spi.write((ROWSTART + y1) >> 8, ROWSTART + y1, (ROWSTART + y2) >> 8, (ROWSTART + y2));
      spi.write(0x2C, dc);
      spi.write({ data: String.fromCharCode(c >> 8, c), count: (x2 - x1 + 1) * (y2 - y1 + 1) });
      ce.set();
    }
  });
  init(spi, dc, ce, rst, callback);
  return g;
};*/
