# ID205L smart watch custom firmware WIP 

## Photos: 
![photo](http://official-file.honbow.com/2019-12-12-12-01-4601%20(2).png "Device")

[Internal photos here](./DEVICES.md)

## How to open:
i'm pretty sure the easiest way to open it would be using a hot gun and suction cup to remove the glass. What i did is:
1) removed the button (just pull it out firmly)
2) used a hairdryer to soften the glue inside and removed the grey cover around the screen
3) used a hairdryer to soften the glue behind the screen and caaaaaaaarefully pulled it up

## How to build firmware
Prebuilt .hex file are located in ./hex/ folder of this repo. 

This project uses custom Espruino fork with SPIM and framebuffer modules.

- Checkout espruino sources from here: `git@github.com:kvasdopil/Espruino.git`
- Make sure you have `dos2unix` utility installed
- Run `./scripts/provision.py NRF52340DK` (this will ask for a filename to patch, just press enter twice)
- copy `build/IS205L.py` to `espruino/boards/`

```
curl https://developer.nordicsemi.com/nRF5_SDK/nRF5_SDK_v15.x.x/nRF5_SDK_15.0.0_a53641a.zip -o nRF5_SDK_15.0.0_a53641a.zip
unzip -o nRF5_SDK_15.0.0_a53641a.zip
mv nRF5_SDK_15.0.0_a53641a/external/nano-pb ./targetlibs/nrf5x_15/external/
rm -rf nRF5_SDK_15.0.0_a53641a.zip nRF5_SDK_15.0.0_a53641a

make clean && BOARD=ID205L RELEASE=1 make
```

This will build a .hex file with firmware. Now if we flash this the device will stuck in DFU (aka over-the-air update) mode because of invalid DFU settings. To apply correct DFU settings run this (replace `2v05.436` version with yours):

```
nrfutil settings generate --family NRF52840 --application espruino_2v05.436_id205l.app_hex --app-boot-validation VALIDATE_GENERATED_CRC --application-version 0xff --bootloader-version 0xff --bl-settings-version 2 dfu_settings.hex

python scripts/hexmerge.py --overlap=replace ./targetlibs/nrf5x_15/components/softdevice/s140/hex/s140_nrf52_6.0.0_softdevice.hex bootloader_espruino_2v05.436_id205l.hex espruino_2v05.436_id205l.app_hex dfu_settings.hex -o espruino_2v05.436_id205l.hex
```

Alternatively you can generate DFU package using
```
make clean && BOARD=ID205L RELEASE=1 DFU_UPDATE_BUILD=1 make
```
And update it via BLE.

## How to flash

Connect to J-Link to device to following pads:
- VCC - VCC
- G - GND
- DIO - DIO  
- C - CLK

## Using peripherals

[Pinout here](./DEVICES.md)

Generally all you want is to import one file to handle all watch peripherals:
```
const Watch = require("https://github.com/kvasdopil/id205l/blob/master/src/ID205L.js")
```

### Button

```
Watch.pins.BUTTON.read();

// this also works
BTN1.read();
```

- TODO: add interrupt-driven events

### Charge level

```
console.log(Watch.isCharging()); // returns true if device is charging
console.log(Watch.getBattery()); // returns battery level from 0.0 to 1.0
```

- TODO: add interrupt-driven events

### Display
```
Watch.setBacklight(3); // accepts values 0..3, 0 is off

Watch.lcd.enable();
Watch.lcd.init().then(g => {
  g.setColor(1,0,0);
  g.drawString("Hello", 10, 20);
});
```

- TODO: add buffering and flip()
- TODO: use SPIM interface

### Accelerometer
```
Watch.accelerometer.enable();
console.log(Watch.accelerometer.read()); // returns an object with {x, y, z} values
```

- TODO: add interrupt-driven events

### Heart sensor
```
Watch.pins.HEART_BACKLIGHT.write(1); 
// this also works
LED1.write(1);

Watch.heart.enable();
console.log(Watch.heart.read(0, 16)); // performs raw i2c read from heart sensor
```

- TODO: add actual data processing
- TODO: add interrupt-driven events

### Touch sensor
```
Watch.touch.enable();
// interrupt-driven event
Watch.touch.onTouch = (event) => {
  console.log(event.type, event.x, event.y);
};

// this also works
Watch.touch.read(); // returns an object with {type, x, y} values
```

- TODO: add gestures support

### External flash memory

- TODO: make it work

## Ask questions
https://gitter.im/nRF51822-Arduino-Mbed-smart-watch/Lobby
