const canvas = document.getElementById('canvas');
const width = canvas.width;
const height = canvas.height;
const mask = document.getElementById('mask');
const maskText = document.getElementById('mask-span');
const birdImage = new Image();
const bottomPillarImage = new Image();
const topPillarImage = new Image();
const spriteImage = new Image();
const ctx = canvas.getContext('2d');

const moveSpeed = 1;
const pillarNum = 3;
const holeHeight = height * 0.25;
const birdSize = { width: width * 0.06, height: height * 0.04 };
let paused;
let birdPosition;
let birdVelocity;
let birdAcceleration;
let pillars;
let score;
let nextPillarIndex;
let requestId;
let birdComplete;
let bottomPillarComplete;
let topPillarComplete;
let spriteComplete;


birdImage.src = './assets/bird.png';
bottomPillarImage.src = './assets/bottomPillar.png';
topPillarImage.src = './assets/topPillar.png';
spriteImage.src = './assets/sprite.png';
birdImage.onload = () => birdComplete = true;
bottomPillarImage.onload = () => bottomPillarComplete = true;
topPillarImage.onload = () => topPillarComplete = true;
spriteImage.onload = () => {
  init();
  draw();
  drawMainMenu();
};


window.addEventListener('keydown', event => {
  if (event.code === 'Space' && paused) {
    window.cancelAnimationFrame(requestId);
    mask.style.visibility = 'hidden';
    start();
  } else if (event.code === 'Space' ) {
    birdVelocity.y = -5;
  } else if(event.code === 'Escape' && !paused) {
    pause();
  } 
});
window.addEventListener('click', handleClick);

function randomHeight() {
  return (height - holeHeight) * Math.random();
};

const init = () => {
  paused = true;
  score = 0;
  birdPosition = { x: width * 0.2, y: height * 0.3 };
  birdVelocity = { x: 0, y: 0 };
  birdAcceleration = { x: 0, y: 0.2 };
  pillars = Array(pillarNum).fill(0).map((pillar, index) => {
    pillar = {};
    pillar.x = width + width * index / pillarNum;
    pillar.width = width * 0.08;
    pillar = refreshPillarHeight(pillar);
    return pillar;
  });
  nextPillarIndex = 0;
};

const refreshPillarHeight = (pillar) => {
  const topHeight = randomHeight();
  return {
    ...pillar,
    topHeight: topHeight,
    bottomHeight: height - topHeight - holeHeight
  };
};

const testCollision = () => {
  pillars.forEach(pillar => {
    if (birdPosition.x + birdSize.width > pillar.x &&
      birdPosition.y < pillar.topHeight &&
      birdPosition.x < pillar.x + pillar.width &&
      birdPosition.y + birdSize.height > 0 ||
      birdPosition.x + birdSize.width > pillar.x &&
      birdPosition.y < height &&
      birdPosition.x < pillar.x + pillar.width &&
      birdPosition.y + birdSize.height > height - pillar.bottomHeight ||
      birdPosition.y > height) {
      printResult();
      init();
      draw();
      return;
    }
  });
};
const printResult = () => {
  window.cancelAnimationFrame(requestId);
  maskText.textContent = `Your final score is ${score}, Press space to restart`;
  mask.style.visibility = 'visible';
  paused = true;
};
const pause = () => {
  window.cancelAnimationFrame(requestId);
  maskText.textContent = `Press space to start`;
  mask.style.visibility = 'visible';
  paused = true;
};
const start = () => {
  paused = false;
  refresh();
};
const update = () => {
  updateBird();
  updatePillars();
  updateScore();
};
const updateScore = () => {
  const nextPillar = pillars[nextPillarIndex];
  if (birdPosition.x > nextPillar.x + nextPillar.width) {
    score++;
    nextPillarIndex = (nextPillarIndex + 1) % pillars.length;
  }
};
const updateBird = () => {
  birdPosition.y += birdVelocity.y;

  if (birdPosition.y < 0) {
    birdPosition.y = 0;
    birdVelocity.y = 0;
  }
  birdVelocity.y += birdAcceleration.y;
};
const updatePillars = () => {
  pillars.forEach(pillar => {
    if (pillar.x - moveSpeed > -pillar.width) {
      pillar.x = pillar.x - moveSpeed;
    } else {
      pillar.x = width;
      pillar = refreshPillarHeight(pillar);
    }
  });
}
const draw = () => {
  ctx.clearRect(0, 0, width, height);
  
  if (birdComplete) {
    const deg = Math.atan(birdVelocity.y / moveSpeed );
    ctx.translate(birdPosition.x + birdSize.width / 2,birdPosition.y + birdSize.height / 2);
    ctx.rotate(deg);
    ctx.translate(-birdSize.width / 2, - birdSize.height / 2);
    ctx.drawImage(birdImage,0,0, birdSize.width, birdSize.height);
    ctx.setTransform();
  }

  ctx.fillStyle = "#00FF00";
  pillars.forEach(pillar => {
    if (topPillarComplete) {
      ctx.drawImage(topPillarImage,pillar.x, 0, pillar.width, pillar.topHeight);
    }
    if (bottomPillarComplete) {
      ctx.drawImage(bottomPillarImage,pillar.x, height - pillar.bottomHeight, pillar.width, pillar.bottomHeight);
    }
  });

  ctx.fillStyle = "#FF0000";
  ctx.font = "25px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`Your score: ${score}`, width / 2, height * 0.1);
};
function handleClick() {
  birdVelocity.y = -5;
};
const refresh = () => {
  update();
  draw();
  testCollision();
  if (!paused) {
    requestId = requestAnimationFrame(refresh);
  } else {
    window.cancelAnimationFrame(requestId);
  }
};
const drawMainMenu = () => {
  const titleWidth = width * 0.4;
  const titleHeight = titleWidth / 179 * 48;
  const titleX = width / 2 - titleWidth / 2;
  const titleY = height * 0.3 - titleHeight / 2;
  const btnWidth = width * 0.2;
  const btnHeight = btnWidth / 104 * 58;
  const btnStartX = width / 3 - btnWidth / 2;
  const btnRankX = width * 2/ 3 - btnWidth / 2;
  const btnY = height * 2/ 3 - btnHeight / 2;
  ctx.drawImage(spriteImage,702,182,179,48,
    titleX,titleY,titleWidth,titleHeight);
  ctx.drawImage(spriteImage,708,236,104,58,
    btnStartX,btnY,btnWidth,btnHeight );
  ctx.drawImage(spriteImage,828,236,104,58,
    btnRankX,btnY,btnWidth,btnHeight );
};
