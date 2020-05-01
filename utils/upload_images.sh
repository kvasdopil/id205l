#!/bin/sh
echo "var s = require('Storage'); s.eraseAll();" > .images.js
cat ./img/*.i >> .images.js
yarn cli .images.js
rm -f .images.js