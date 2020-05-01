#/bin/sh
for ICON in ./img/*.png 
do
  NAME=`basename -s .png $ICON`
  echo $NAME.i
  node ./utils/png2i.js --bw $ICON > ./img/${NAME}.i
done