
const data = [0, 86, 1, 26, 1, 27, 46, 179, 19, 46, 27, 1, 0, 27, 36, 5, 128, 19, 5, 36, 27, 0, 46, 5, 128, 21, 5, 46, 0, 51, 128, 23, 51, 0, 51, 128, 23, 51, 26, 51, 128, 23, 51, 50, 51, 128, 23, 179, 3, 128, 23, 51, 50, 51, 128, 23, 51, 26, 51, 128, 23, 51, 0, 46, 5, 128, 21, 5, 46, 0, 27, 36, 5, 128, 19, 5, 36, 27, 0, 1, 27, 46, 179, 19, 46, 27, 1, 0];
// console.log("glyph 0 done, written 79 of 138 bytes");
const w = data[3];

data.shift();
data.shift();
data.shift();
data.shift();

let val = 0;
let rle = 0;
let line = [];
while (data.length) {
    if (rle === 0) {
        val = data.shift();
        if (val & 0b10000000) {
            val &= 0b111111;
            rle = data.shift() - 1;
        }
    } else {
        rle--;
    }
    line.push(val);
    if (line.length === w) {
        console.log(line.map(i => String.fromCharCode(32 + i)).join(' '));
        line = [];
    }
}