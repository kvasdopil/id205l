const grr = require('./utils/grr');

// init graphics
D46.write(0); // TOUCH_RESET
grr.start({
  dcx: D31,
  ss: D47,
  rst: D24,
  sck: D2,
  mosi: D29
});

// =====

const wallWidth = 20;
const speed = 10;
const gravity = 1;
const boost = 6;
const deadZone = 230;
const wallX = animated();
const birdH = animated(120);
let nextH = 0;
let nextW = 60;
let vv = animated(0);
let dead = false;

function resetGame() {
  wallX.set(0);
  birdH.set(120);
  nextH = 0;
  nextW = 60;
  vv.set(0);
  dead = false;
}

birdY.animate({ delta: vv });
vv.animate({ delta: 1 });
wallX.animate({ delta: -1 });

const bird = rect({
  color: [255, 0, 0],
  w: 10,
  h: 10,
  x: 50,
  y: birdY,
});
const wallUp = rect({
  color: [255, 0, 0],
  w: 50,
  y: 0,
  x: wallX,
});
const wallDown = rect({
  color: [255, 0, 0],
  w: 50,
  x: wallX,
});

const onPress = () => {
  if (dead) {
    resetGame();
  } else {
    vv.set(-boost);
  }
}

birdY.whenGte(deadZone, () => {
  birdY.set(deadZone);
  dead = true;
});

wallX.whenLte(-40, () => {
  wallX.set(240 * (1 + Math.random())); // next wall position

  const nextH = Math.random() * 100 + 60;
  const nextW = Math.random() * 20 + 40;

  const holeUp = nextH;
  const holeDn = nextH + nextW;
  wallUp.set({
    h: holeUp,
  });
  wallDown.set({
    y: holeDn,
    h: 240 - holeDn,
  });
});

birdY.whenHit(() => {
  dead = true;
})

setWatch(onPress, BTN1, { edge: 'rising', repeat: true });

// New code to define services
NRF.setServices({
  "3e440001-f5bb-357d-719d-179272e4d4d9": {
    "3e440002-f5bb-357d-719d-179272e4d4d9": {
      value: [0],
      maxLen: 1,
      writable: true,
      onWrite: onPress,
    }
  }
});

