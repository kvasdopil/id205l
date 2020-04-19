## ID205L devices

### Photos

- Fccid: https://fccid.io/2AHFT228/Internal-Photos/Internal-Photo-4438078
- Opened device: https://photos.google.com/share/AF1QipMEgaVUau3sA0FcNTVeyZKY0TScTzwYiXO7fe6Rh2gIK8x5G0z2D5svC86-koTstQ?key=MGM4Y1JZT2xTaGxvSmY0MWdkMnpBYVZNd3lES3JR
- PCB photos: https://photos.google.com/share/AF1QipO3eowMmGWax-Yk8IF-ml1vgUQFByVLIt-XGVHYddveYpcckNRNJQFuctqWAHlYUA?key=MEE2aWFhakNvVFg1VUpoTENOeEF6RU82OEZBY0ln
- Chip labels: https://photos.google.com/share/AF1QipNFV63yPYG3SIgiTFkugtkMYC76d3eq6xieDRYmCEP69MpZUu-oj6QuwDR9ZJyVDg?key=bS1uQldlSGN4Wmh2alh4bENydW9YTGV1aTg3djFB

### Chip: NRF52840

Pinout
- 0 - XL1
- 1 - XL1
- 2 - LCD_SCK
- 3 - NO_CHIP
- 4 - ACCELEROMETER_ENABLE
- 5 - ACCELEROMETER SCL device 0x1f
- 6 - ACCELEROMETER_STOP
- 7 = HEART_SENSOR SDA device 0x44
- 8 = HEART_SENSOR SCL device 0x44
- 9  - MEMORY_SI
- 10 - 
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

when D24 -> 0, MEM_SO -> 1

### Display
Controlled by ST7789V.

- LCD_SCK - D2
- LCD_SI - D29
- LCD_DC - D31
- LCD_RESET - D46
- LCD_CS - D47

Backlight has 4 brightness levels set by changing values on `D22` and `D30` pins.

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

Pins:
- 42 - TOUCH_SCL
- 43 - TOUCH_SDA
- 44 - TOUCH_INT
- 45 - TOUCH_ENABLE

D45 should be 1 for touch sensor to work
D24 should be 0

### Accelerometer
Unknown, labelled as "B271 VS35". 

Enabled by `D4.write(1)`, I2C on `SDA=27`, `SCL=5`, `deviceId=0x1f`
Pulling D6 down stops accelerometer (but device is still repsonding).
Dulling D4 down powers down accelerometer

DeviceId is similar to https://www.nxp.com/docs/en/data-sheet/FXOS8700CQ.pdf, but `WHO_AM_I` register value is wrong.

X,Y,Z accelerometer values can be obtained by reading registers `0x02-0x07`.

### Battery level and charging status

Battery charge level is analog value on D28
Pin D39 is low when device is charging.

- TODO: add battery percentage calculation

## No chip

Pins D11, D41 are leading to chip that is missing on the PCB
