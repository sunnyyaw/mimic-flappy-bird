const canvas = document.getElementById('canvas');
const width = canvas.width;
const height = canvas.height;
const mask = document.getElementById('mask');
const maskText = document.getElementById('mask-span');
const birdImage = new Image();
const ctx = canvas.getContext('2d');

const moveSpeed = 1;
const pillarNum = 3;
const holeHeight = height * 0.25;
const birdSize = { width: width * 0.05, height: height * 0.05 };
let paused;
let birdPosition;
let birdVelocity;
let birdAcceleration;
let pillars;
let score;
let nextPillarIndex;
let requestId;

function randomHeight() {
  return (height - holeHeight) * Math.random();
};
window.addEventListener('keydown', event => {
  if (event.code !== 'Space') {
    return;
  }
  if (paused) {
    window.cancelAnimationFrame(requestId);
    mask.style.visibility = 'hidden';
    start();
  } else {
    pause();
  }
});
window.addEventListener('click', handleClick);

const init = () => {
  paused = true;
  score = 0;
  birdImage.src = './assets/bird.jpg';
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
  
  ctx.drawImage(birdImage,birdPosition.x, birdPosition.y, birdSize.width, birdSize.height);

  ctx.fillStyle = "#00FF00";
  pillars.forEach(pillar => {
    ctx.fillRect(pillar.x, 0, pillar.width, pillar.topHeight);
    ctx.fillRect(pillar.x, height - pillar.bottomHeight, pillar.width, pillar.bottomHeight);
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
init();
draw();
