#!/bin/sh
echo "var s = require('Storage'); s.eraseAll();" > .images.js
cat ./img/*.i >> ./temp/images.js
yarn cli /temp/images.js
rm -f /temp/images.js