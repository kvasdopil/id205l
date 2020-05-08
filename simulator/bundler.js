const cp = require('child_process');
const fs = require('fs');

const images = cp.execSync("find ./img").toString().trim().split('\n').filter(name => /.[if]$/.test(name));

console.log(`window.initImages = () => {`);
console.log('const s = require("Storage")');
for (image of images) {
    const content = fs.readFileSync(image).toString();
    console.log(content);
}
console.log(`}`);

const files = cp.execSync("find ./src").toString().trim().split('\n').filter(name => /.js$/.test(name));

for (file of files) {
    const content = fs.readFileSync(file).toString();
    console.log(`fileCache['${file}'] = () => {`);
    console.log(content);
    console.log(`}`);
}