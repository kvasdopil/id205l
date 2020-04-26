// Espruino driver for ST7789 lcd screen 
// this module uses custom spim module that may not be available on your platform

const SPIM = require('spim');

const init = (cfg) => new Promise(resolve => {
  SPIM.setup({
    mosi: cfg.mosi,
    sck: cfg.sck,
    dcx: cfg.dcx,
    ss: cfg.ss,
    speed: '32m',
  });

  digitalPulse(cfg.rst, 0, 10);

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
    SPIM.sendSync([0x11, 0], 1); //Exit Sleep
    setTimeout(() => {
      ST7789_INIT_CODE.forEach(cmd => SPIM.sendSync(cmd, 1));
      resolve();
    }, 20);
  }, 120);
});

module.exports = init;