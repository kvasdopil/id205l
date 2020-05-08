#!/bin/sh
echo "var s = require('Storage'); s.eraseAll();" > ./build/images.js
cat ./img/*.i >> ./build/images.js
cat ./img/*.f >> ./build/images.js
yarn cli ./build/images.js
rm -f ./build/images.js