# ID205L smart watch custom firmware WIP 

## Photos: 
- Fccid: https://fccid.io/2AHFT228/Internal-Photos/Internal-Photo-4438078
- Opened device: https://photos.google.com/share/AF1QipMEgaVUau3sA0FcNTVeyZKY0TScTzwYiXO7fe6Rh2gIK8x5G0z2D5svC86-koTstQ?key=MGM4Y1JZT2xTaGxvSmY0MWdkMnpBYVZNd3lES3JR
- PCB photos: https://photos.google.com/share/AF1QipO3eowMmGWax-Yk8IF-ml1vgUQFByVLIt-XGVHYddveYpcckNRNJQFuctqWAHlYUA?key=MEE2aWFhakNvVFg1VUpoTENOeEF6RU82OEZBY0ln
- Chip markings: https://photos.google.com/share/AF1QipNFV63yPYG3SIgiTFkugtkMYC76d3eq6xieDRYmCEP69MpZUu-oj6QuwDR9ZJyVDg?key=bS1uQldlSGN4Wmh2alh4bENydW9YTGV1aTg3djFB

## How to open:
i'm pretty sure the easiest way to open it would be using a hot gun and suction cup to remove the glass. What i did is:
1) removed the button (just pull it out firmly)
2) used a hairdryer to soften the glue inside and removed the grey cover around the screen
3) used a hairdryer to soften the glue behind the screen and caaaaaaaarefully pulled it up

## How to build firmware
Prebuilt .hex files: (see the repo). Beware, DFU is not working!

- Checkout espruino sources
- ./scripts/provision.py NRF52340DK
- copy build/IS205L.py to espruino/boards

Change this:
```
DEFINES += DNRF52 -DNRF52840_XXAA
```
to this:
```
DEFINES += -DNRF52840_XXAA
```
in `NRF52.make`

To build bootloader:
```
make clean && \
    DFU_UPDATE_BUILD=1 \
    BOARD=ID205L \
    RELEASE=1 \
    DEFINES="-DUARTE1_EASYDMA_MAXCNT_SIZE=16 -I./targetlibs/nrf5x_15/components/libraries/bootloader/ -I/targetlibs/nrf5x_15/components/libraries/bootloader/dfu"  \
    BOOTLOADER=1 \
    make
```
To build device code
```
make clean && \
    DFU_UPDATE_BUILD=1 \
    BOARD=ID205L \
    RELEASE=1 \
    DEFINES="-DUARTE1_EASYDMA_MAXCNT_SIZE=16 -DNRF52"  \
    make
```

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
- 0 - 
- 1 
- 2 - related to LCD?
- 3
- 4
- 5 - SCL device 0x1f?, related to LCD?
- 6 - 
- 7 - HEART_SENSOR? SDA device 0x44
- 8 - HEART_SENSOR? SCL device 0x44
- 9  - 
- 10 - 
- 11 - 
- 12 - MEMORY_WP
- 13 - 
- 14 = heart senssor backlight aka LED1
- 15 - related to LCD? related to HEART?
- 16 = side button aka BTN1
- 17 - HEART_SENSOR_ENABLE
- 18 - (DEVICE RESET), related LCD?, related to HEART?
- 19 - MEMORY_SO, related to HEART?
- 20 = MOTOR
- 21 = MEMORY_CS
- 22 = BACKLIGHT
- 23 - 
- 24 - 
- 25 - CHARGING, related to HEART?
- 26 - 
- 27 - SDA device 0x1f?
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

### Touch sensor
IT7259, photos: https://photos.app.goo.gl/u1DJjaMRU4kKJ2W87

### Accelerometer
Unknown, markings are B271 VS35

## Ask questions
https://gitter.im/nRF51822-Arduino-Mbed-smart-watch/Lobby