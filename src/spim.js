const LCD_SCK = D2;
const LCD_SI = D29;
const LCD_DC = D31;
const LCD_RESET = D46;
const LCD_CS = D47;

const TOUCH_RESET = D24;

LCD_SI.mode('af_output');
LCD_SCK.mode('af_output');
LCD_DC.mode('af_output');
LCD_CS.mode('af_output');

TOUCH_RESET.write(0);
digitalPulse(LCD_RESET, 0, 10);

const spim = SPI1; // require('spim');
spim.setup({
  mosi: LCD_SI,
  sck: LCD_SCK,
  // dc: LCD_DC,
  // cs: LCD_CS,
});

const dc = LCD_DC;
const ce = LCD_CS;

const send = (data) => {
  dc.reset();
  spim.send(data[0]);
  dc.set();
  spim.send(data[1]);
};

ce.reset();
send([0x11, 0]);
send([0x29, 0]);
send([0, 0]);
ce.set();