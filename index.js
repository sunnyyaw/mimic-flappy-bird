const canvas = document.getElementById('canvas');
const width = canvas.width;
const height = canvas.height;
const mask = document.getElementById('mask');
const birdImage = new Image();
const bottomPillarImage = new Image();
const topPillarImage = new Image();
const spriteImage = new Image();
const ctx = canvas.getContext('2d');

const moveSpeed = 1;
const pillarNum = 3;
const holeHeight = height * 0.25;
const birdSize = { width: width * 0.06, height: height * 0.04 };

const AT_MENU = 0;
const AT_READY = 1;
const AT_PLAYING = 2;
const AT_PAUSE = 3;
const AT_RESULT = 4;

//结算画面布局
const overWidth = width * 0.4;
const overHeight = overWidth / 192 * 42;
const overX = width / 2 - overWidth / 2;
const overY = height * 0.3 - overHeight / 2;
const menuBtnWidth = width * 0.2;
const menuBtnHeight = menuBtnWidth / 80 * 28;
const menuBtnX = width / 2 - menuBtnWidth / 2;
const okBtnY = height * 3 / 5 - menuBtnHeight / 2;
const shareBtnY = okBtnY + menuBtnHeight + 10;
const menuBtnY = okBtnY + 2 * (menuBtnHeight + 10);

//首页布局
const titleWidth = width * 0.4;
const titleHeight = titleWidth / 179 * 48;
const titleX = width / 2 - titleWidth / 2;
const titleY = height * 0.3 - titleHeight / 2;
const btnWidth = width * 0.2;
const btnHeight = btnWidth / 104 * 58;
const btnStartX = width / 3 - btnWidth / 2;
const btnRankX = width * 2/ 3 - btnWidth / 2;
const btnY = height * 2/ 3 - btnHeight / 2;

let state;
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
  drawFrame();
  drawMainMenu();
};


window.addEventListener('keydown', event => {
  if (event.code === 'Space' && state === AT_MENU) {
    drawReady();
  } else if (event.code === 'Space' && (state === AT_READY || state === AT_PAUSE)) {
    start();
  } else if (event.code === 'Space' && state === AT_PLAYING) {
    birdVelocity.y = -5;
  } else if(event.code === 'Escape' && state === AT_PLAYING) {
    pause();
  } 
});
canvas.addEventListener('click', handleClick);

function randomHeight() {
  return (height - holeHeight) * Math.random();
};
function drawReady() {
  drawFrame();
  const readyWidth = width * 0.4;
  const readyHeight = readyWidth / 184 * 50;
  const readyX = width / 2 - readyWidth / 2;
  const readyY = height * 0.3 - readyHeight / 2;
  const captionWidth = width * 0.3;
  const captionHeight = captionWidth / 114 * 98;
  const captionX = width / 2 - captionWidth / 2;
  const captionY = height * 0.5 - captionHeight / 2;
  ctx.drawImage(spriteImage,584,182,114,98,
    captionX,captionY,captionWidth,captionHeight);
  ctx.drawImage(spriteImage,590,118,184,50,
    readyX,readyY,readyWidth,readyHeight);
  state = AT_READY;
};
const init = () => {
  state = AT_MENU;
  score = 0;
  birdPosition = { x: width * 0.2, y: height * 0.3 };
  birdVelocity = { x: 0, y: 0 };
  birdAcceleration = { x: 0, y: 0.2 };
  pillars = Array(pillarNum).fill(0).map((pillar, index) => {
    pillar = {};
    pillar.x = width + width * index / pillarNum;
    pillar.width = width * 0.08;
    refreshPillarHeight(pillar);
    return pillar;
  });
  nextPillarIndex = 0;
};

const refreshPillarHeight = (pillar) => {
  const topHeight = randomHeight();
  pillar.topHeight = topHeight;
  pillar.bottomHeight = height - topHeight - holeHeight;
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
      drawResult();
      return;
    }
  });
};
const drawResult = () => {
  window.cancelAnimationFrame(requestId);
  ctx.drawImage(spriteImage,790,118,192,42,
    overX,overY,overWidth,overHeight);
  ctx.drawImage(spriteImage,924,52,80,28,
    menuBtnX,menuBtnY,menuBtnWidth,menuBtnHeight);
  ctx.drawImage(spriteImage,584,284,80,28,
    menuBtnX,shareBtnY,menuBtnWidth,menuBtnHeight);
  ctx.drawImage(spriteImage,924,84,80,28,
    menuBtnX,okBtnY,menuBtnWidth,menuBtnHeight);
  ctx.fillStyle = '#FF0000';
  ctx.textAlign = 'center';
  ctx.font = '20px Arial';
  ctx.fillText(`Your final score is ${score}`,
  width / 2 ,height / 2);
  state = AT_RESULT;
};
const pause = () => {
  window.cancelAnimationFrame(requestId);
  ctx.fillStyle = '#FF0000';
  ctx.textAlign = 'center';
  ctx.font = '18px Arial';
  ctx.fillText(`Press space to start`,
  width / 2 ,height / 2);
  mask.style.visibility = 'visible';
  state = AT_PAUSE;
};
const start = () => {
  window.cancelAnimationFrame(requestId);
  mask.style.visibility = 'hidden';
  state = AT_PLAYING;
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
      refreshPillarHeight(pillar);
    }
  });
}
const drawFrame = () => {
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

};
function drawScore() {
  const digitWidth = 24;
  const digitHeight = 36;
  const digitArr = score.toString().split('');
  const textWidth = digitWidth * digitArr.length;
  const textX = width / 2 - textWidth / 2;
  const textY = height / 6;
  const positionMap = {
    '0': {x: 992,y: 120, width: 24, height: 36},
    '1': {x: 272,y: 910, width: 16, height: 36},
    '2': {x: 584,y: 320, width: 24, height: 36},
    '3': {x: 612,y: 320, width: 24, height: 36},
    '4': {x: 640,y: 320, width: 24, height: 36},
    '5': {x: 668,y: 320, width: 24, height: 36},
    '6': {x: 584,y: 368, width: 24, height: 36},
    '7': {x: 612,y: 368, width: 24, height: 36},
    '8': {x: 640,y: 368, width: 24, height: 36},
    '9': {x: 668,y: 368, width: 24, height: 36},
  };
  digitArr.forEach((digit,index) => {
    const digitImagePosition = positionMap[digit];
    const digitX = textX + index * digitWidth;
    const digitY = textY;
    ctx.drawImage(spriteImage,digitImagePosition.x,digitImagePosition.y,
      digitImagePosition.width,digitImagePosition.height,
      digitX,digitY,digitWidth,digitHeight);
  });
};
function handleClick(event) {
  if (state === AT_PLAYING) {
    birdVelocity.y = -5;
  } else if (state === AT_READY) {
    birdVelocity.y = -5;
    start();
  } else if (state === AT_RESULT 
    && event.offsetX < menuBtnX + menuBtnWidth && event.offsetX > menuBtnX
    && event.offsetY < menuBtnY + menuBtnHeight && event.offsetY > menuBtnY) {
    init();
    drawFrame();
    drawMainMenu();
  } else if (state === AT_MENU 
    && event.offsetX < btnStartX + btnWidth && event.offsetX > btnStartX
    && event.offsetY < btnY + btnHeight && event.offsetY > btnY) {
    drawReady();
  } else if (state === AT_RESULT 
    && event.offsetX < menuBtnX + menuBtnWidth && event.offsetX > menuBtnX
    && event.offsetY < okBtnY + menuBtnHeight && event.offsetY > okBtnY) {
    init();
    drawReady();
  }
};
const refresh = () => {
  update();
  drawFrame();
  drawScore();
  testCollision();
  if (state === AT_PLAYING) {
    requestId = requestAnimationFrame(refresh);
  } else {
    window.cancelAnimationFrame(requestId);
  }
};
const drawMainMenu = () => {
  ctx.drawImage(spriteImage,702,182,179,48,
    titleX,titleY,titleWidth,titleHeight);
  ctx.drawImage(spriteImage,708,236,104,58,
    btnStartX,btnY,btnWidth,btnHeight );
  ctx.drawImage(spriteImage,828,236,104,58,
    btnRankX,btnY,btnWidth,btnHeight );
};
