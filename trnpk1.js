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
7 - 2INT
8
9 - BACKLIGHT
10 - MOTOR
11
12
13
14
15
16
17
18
19
20
21 - 2SDA
22
23
24 - TX
25 - 2SCL
26 - RX
27
28 - 2RESET
29
30 - SDA
31 - SCL
*/

const pinMonitor = () => {
    const regs = [0, 1, 3, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 23, 27, 29];

    let pr = {};

    let int = setInterval(() => {
        regs.forEach(r => {
            const val = digitalRead(r);
            if (val != pr[r]) {
                console.log(r, val);
                pr[r] = val;
            }
        });
    }, 100);
};

// pinMonitor();
digitalWrite(28, 0);
digitalWrite(28, 1);

// scanI2C(21, 25);
const i = I2C1;
i.setup({ sda: 21, scl: 25 });
i.writeTo(0x20, [247, 181, 73, 137, 95, 223, 71, 183, 91, 230, 237, 90,
    125, 91, 29, 188]);
console.log(i.readFrom(0x20, 16));


setWatch(() => {
    console.log('2INT');
}, 7, { edge: 'both', debounce: 50, repeat: true });

setWatch(() => {
    console.log('MOSI');
}, 4, { edge: 'both', debounce: 50, repeat: true });

setWatch(() => {
    console.log('MOSI');
}, 5, { edge: 'both', debounce: 50, repeat: true });

const spi = new SPI({ mosi: 4, miso: 5, sck: 6, cs: 2, mode: 3 });
spi.write(1);
