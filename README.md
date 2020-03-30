# ID205L smart watch custom firmware WIP 

## Photos: 
- Fccid: https://fccid.io/2AHFT228/Internal-Photos/Internal-Photo-4438078
- Opened device: https://photos.google.com/share/AF1QipMEgaVUau3sA0FcNTVeyZKY0TScTzwYiXO7fe6Rh2gIK8x5G0z2D5svC86-koTstQ?key=MGM4Y1JZT2xTaGxvSmY0MWdkMnpBYVZNd3lES3JR
- PCB photos: https://photos.google.com/share/AF1QipO3eowMmGWax-Yk8IF-ml1vgUQFByVLIt-XGVHYddveYpcckNRNJQFuctqWAHlYUA?key=MEE2aWFhakNvVFg1VUpoTENOeEF6RU82OEZBY0ln
- Chip labels: https://photos.google.com/share/AF1QipNFV63yPYG3SIgiTFkugtkMYC76d3eq6xieDRYmCEP69MpZUu-oj6QuwDR9ZJyVDg?key=bS1uQldlSGN4Wmh2alh4bENydW9YTGV1aTg3djFB

## How to open:
i'm pretty sure the easiest way to open it would be using a hot gun and suction cup to remove the glass. What i did is:
1) removed the button (just pull it out firmly)
2) used a hairdryer to soften the glue inside and removed the grey cover around the screen
3) used a hairdryer to soften the glue behind the screen and caaaaaaaarefully pulled it up

## How to build firmware
Prebuilt .hex files: (see the repo). Beware, DFU is not working!

- Checkout espruino sources
- Run `./scripts/provision.py NRF52340DK` (this will ask for a filename to patch, just press enter twice)
- copy `build/IS205L.py` to `espruino/boards/`

Change this line:
```
DEFINES += DNRF52 -DNRF52840_XXAA
```
to this:
```
DEFINES += -DNRF52840_XXAA
```
in `NRF52.make`

### Building device fw
```
make clean && \
    DFU_UPDATE_BUILD=1 \
    BOARD=ID205L \
    RELEASE=1 \
    DEFINES="-DNRF52"  \
    make
```

### Building bootloader
```
curl https://developer.nordicsemi.com/nRF5_SDK/nRF5_SDK_v15.x.x/nRF5_SDK_15.0.0_a53641a.zip -o nRF5_SDK_15.0.0_a53641a.zip
unzip -o nRF5_SDK_15.0.0_a53641a.zip
mv nRF5_SDK_15.0.0_a53641a/external/nano-pb ./targetlibs/nrf5x_15/external/
rm -rf nRF5_SDK_15.0.0_a53641a.zip nRF5_SDK_15.0.0_a53641a

make clean && \
    DFU_UPDATE_BUILD=1 \
    BOARD=ID205L \
    RELEASE=1 \
    BOOTLOADER=1 \
    make
```

- FIXME: currently bootloader is entering DFU mode after startup (because BTN1 is not negated?) A bootloader for PUCKJS seems to be working, but DFU function is now working in it.

## How to flash

Connect to J-Link to device to following pads:
- VCC - VCC
- G - GND
- DIO - DIO  
- C - CLK

Use softdevice 140 v6.0.0

## What we do know
### Chip: NRF52840

Pinout
- 0 - XL1
- 1 - XL1
- 2 - related to LCD?
- 3
- 4 - ACCELEROMETER_ENABLE
- 5 - ACCELEROMETER SCL device 0x1f
- 6 - 
- 7 = HEART_SENSOR SDA device 0x44
- 8 = HEART_SENSOR SCL device 0x44
- 9  - 
- 10 - 
- 11 - 
- 12 - MEMORY_WP
- 13 - 
- 14 = heart senssor backlight aka LED1
- 15 - related to LCD? related to HEART?
- 16 = BTN1
- 17 = HEART_SENSOR_ENABLE
- 18 - (DEVICE RESET), related LCD?, related to HEART?
- 19 - MEMORY_SO, related to HEART?
- 20 = MOTOR
- 21 = MEMORY_CS
- 22 = BACKLIGHT
- 23 - 
- 24 - 
- 25 - CHARGING, related to HEART?
- 26 - 
- 27 - ACCELEROMETER SDA device 0x1f
- 28 - 
- 29 - 
- 30 - BACKLIGHT2
- 31 - related to LCD?
- 32
- 33
- 34
- 35
- 36
- 37
- 38
- 39
- 40

Pins 32+ does not seem to be connected to anything, maybe theres a problem with firmware?

These pins are connected to wires going to heart sensor and button
- 15, 16(btn), 17, 18, 19, 25

This pins are connected to display and touch sensor
- 2, 15, 18, 30, 31

### Display
Supposedly controlled by ST7789. 

Backlight has 4 brightness levels set by changing values on `D22` and `D30` pins.

Pinout of SPI is unknown. Flash memory chip is likely to be on same SPI interface.

### Flash memory chip
XT25F64B

Pinout:
- CS - D21?
- SO - D19?
- WP - D12
- HOLD -
- SCLK -
- SI - 

### Heart rate sensor
HX3600, enabled by `D17.write(1)`, I2C on `SDA=7` `SCL=8` `deviceId=0x44`

Datasheet: http://www.synercontech.com/Public/uploads/file/2019_10/20191020152311_81180.pdf

More detailed datasheet for similar device: http://www.tianyihexin.com/pic/file/20180323/20180323105824952495.pdf

Usage: 
```
  heartSensor.enable();
  console.log(heartSensor.read(0, 16)); // read registers 0x00-0x10
```

- TODO: add actual data processing
- TODO: add interrupt support

### Touch sensor
IT7259, photos: https://photos.app.goo.gl/u1DJjaMRU4kKJ2W87 is there a datasheet somewhere?

There's a driver and datasheet for similar device here: https://github.com/amazfitbip/documentation/tree/master/documents/IT7259

### Accelerometer
Unknown, markings are B271 VS35. 

Enabled by `D4.write(1)`, I2C on `SDA=27`, `SCL=5`, `deviceId=0x1f`

DeviceId is similar to https://www.nxp.com/docs/en/data-sheet/FXOS8700CQ.pdf, but `WHO_AM_I` register value is wrong.

X,Y,Z accelerometer values can be obtained by reading registers `0x02-0x07`.

Usage: 
```
  accelerometer.enable();
  setInterval(() => {
    console.log(accelerometer.read());
  }, 100);
```

- TODO: add interrupt support

## Ask questions
https://gitter.im/nRF51822-Arduino-Mbed-smart-watch/Lobby