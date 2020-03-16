const scanI2C = (sda, scl) => {
    console.log(sda, scl);
    I2C1.setup({ sda: sda, scl: scl });
    for (let reg = 8; reg < 127; reg++) {
        try {
            I2C1.writeTo(reg, 1);
            console.log('found i2c on scl', scl, 'sda', sda, 'reg', reg);
            // console.log(ii.readFrom(reg, 1));
            // return;
        } catch (e) {
        }
    }
    console.log('nothing on scl', scl, 'sda', sda);
    digitalWrite(scl, 0);
    digitalWrite(sda, 0);
};

/*
0
1
2 - CS
3
4 - MOSI 
5 - MISO
6 - SCK
7 - INT UNKNOWN1
8
9 - BACKLIGHT
10 - MOTOR
11
12
13 - ???TFT
14 - ???TFT
15 - ???TFT
16
17 - ???TFT
18 - ???TFT
19 - ???TFT
20 - ???TFT
21 - SDA UNKNOWN1 (device 0x20)
22 - ???TFT
23 - ???TFT
24 - TX
25 - SCL UNKNOWN1
26 - RX
27
28 - RESET UNKNOWN1
29
30 - SDA ACCELEROMETER (device addr 25)
31 - SCL ACCELEROMETER
*/

/* const pinMonitor = () => {
    const regs = [0, 1, 3, 8, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 23, 27, 29];

    let pr = {};

    let int = setInterval(() => {
        regs.forEach(r => {
            // Pin(r).mode('input_pullup');
            const val = digitalRead(r);
            if (val != pr[r]) {
                console.log(r, val);
                pr[r] = val;
            }
        });
    }, 100);
};

pinMonitor();
*/

scanI2C(13, 14);
// scanI2C(13,15);
scanI2C(13, 17);
scanI2C(13, 18);
scanI2C(13, 19);
scanI2C(13, 20);
scanI2C(13, 22);
scanI2C(13, 23);

// Unknown I2C device with address 0x20
/*
digitalWrite(28, 0);
digitalWrite(28, 1);
const i = I2C1;
i.setup({ sda: 21, scl: 25 });
i.writeTo(0x20, [247, 181, 73, 137, 95, 223, 71, 183, 91, 230, 237, 90,
    125, 91, 29, 188]);
console.log(i.readFrom(0x20, 16));
*/
