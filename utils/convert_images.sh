#/bin/sh
for ICON in ./img/*.png 
do
  NAME=`basename -s .png $ICON`
  echo $NAME.i
  node ./utils/png2i.js --bw $ICON > ./img/${NAME}.i
done

for FONT in ./img/*/*.fnt 
do
  NAME=`basename -s .fnt $FONT`
  echo $NAME.f
  node ./utils/fnt2f.js $FONT > ./img/${NAME}.f
done