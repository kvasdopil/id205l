# ID205L smart watch custom firmware WIP 

## Photos: 
![photo](http://official-file.honbow.com/2019-12-12-12-01-4601%20(2).png "Device")

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
Prebuilt .hex file are located in ./hex/ folder of this repo. 

- Checkout espruino sources
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

## What we do know
### Chip: NRF52840

Pinout
- 0 - XL1
- 1 - XL1
- 2 - related to LCD?
- 3
- 4 - ACCELEROMETER_ENABLE
- 5 - ACCELEROMETER SCL device 0x1f
- 6 
- 7 = HEART_SENSOR SDA device 0x44
- 8 = HEART_SENSOR SCL device 0x44
- 9  - GND?
- 10 - GND?
- 11 - 
- 12 - MEMORY_WP
- 13 - 
- 14 = heart sensor backlight aka LED1
- 15 - 
- 16 = BTN1
- 17 = HEART_SENSOR_ENABLE
- 18 - (DEVICE RESET)
- 19 - MEMORY_CS
- 20 = MOTOR
- 21 = MEMORY_SO
- 22 = BACKLIGHT
- 23 - 
- 24 - 
- 25 - 
- 26 - GND?
- 27 - ACCELEROMETER SDA device 0x1f
- 28 - BATTERY_LEVEL
- 29 - 
- 30 - BACKLIGHT2
- 31 - ?
- 32 -
- 33 - MEMORY_HOLD
- 34 -
- 35 -
- 36 - TX
- 37 - RX
- 38 - MEMORY_CLK
- 39 - CHARGING
- 40 - GND?
- 41 - ?
- 42 - VCC?
- 43 - VCC?
- 44 - VCC?
- 45 -
- 46 -
- 47 -

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
- HOLD - D33
- SCLK - D38
- SI - D9?

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
Unknown, labelled as "B271 VS35". 

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

### Battery level and charging status

Battery charge level is analog value on D28
Pin D39 is low when device is charging.

- TODO: add battery percentage calculation

## Ask questions
https://gitter.im/nRF51822-Arduino-Mbed-smart-watch/Lobby
