const canvas = document.getElementById('canvas');
const width = canvas.width;
const height = canvas.height;
const mask = document.getElementById('mask');
const spriteImage = new Image();
const ctx = canvas.getContext('2d');

const moveSpeed = 1;
const pillarNum = 3;
const holeHeight = height * 0.25;
const groundHeight = height * 0.2;
const birdSize = { width: width * 0.06, height: height * 0.04 };

const AT_MENU = 0;
const AT_READY = 1;
const AT_PLAYING = 2;
const AT_PAUSE = 3;
const AT_RESULT = 4;
const AT_RANK = 5;

const WING_UP = 0;
const WING_DOWN = 1;
const WING_FLAT = 2;

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
let wingState;
let birdPosition;
let birdVelocity;
let birdAcceleration;
let pillars;
let score;
let groundX;
let nextPillarIndex;
let requestId;
let spriteComplete;


spriteImage.src = './assets/sprite.png';
spriteImage.onload = () => {
  initStats();
  drawFrame();
  drawMainMenu();
};


window.addEventListener('keydown', event => {
  if (event.code === 'Space' && state === AT_MENU) {
    drawReady();
  } else if (event.code === 'Space' && (state === AT_READY || state === AT_PAUSE)) {
    birdVelocity.y = -5;
    changeWingState();
    start();
  } else if (event.code === 'Space' && state === AT_PLAYING) {
    birdVelocity.y = -5;
    changeWingState();
  } else if(event.code === 'Escape' && state === AT_PLAYING) {
    pause();
  } 
});
canvas.addEventListener('click', handleClick);

function randomHeight() {
  return (height - holeHeight - groundHeight) * Math.random();
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
const initStats = () => {
  state = AT_MENU;
  wingState = WING_FLAT;
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
  groundX = 0;
};

const refreshPillarHeight = (pillar) => {
  const topHeight = randomHeight();
  pillar.topHeight = topHeight;
  pillar.bottomHeight = height - topHeight - holeHeight - groundHeight;
};

const testCollision = () => {
  for (let pillar of pillars)
  {
    if (birdPosition.x + birdSize.width > pillar.x &&
      birdPosition.y < pillar.topHeight &&
      birdPosition.x < pillar.x + pillar.width &&
      birdPosition.y + birdSize.height > 0 ||
      birdPosition.x + birdSize.width > pillar.x &&
      birdPosition.y < height - groundHeight&&
      birdPosition.x < pillar.x + pillar.width &&
      birdPosition.y + birdSize.height > height - groundHeight - pillar.bottomHeight ||
      birdPosition.y > height - groundHeight || 
      birdPosition.y < -birdSize.height) {
      drawResult();
      break;
    }
  }
};
const drawResult = () => {
  storeRecord();
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
const storeRecord = () => {
  const arr = JSON.parse(localStorage.getItem('records'));
  if (!arr) {
    localStorage.setItem('records',JSON.stringify([score]));
  } else if (arr.length < 10){
    localStorage.setItem('records',JSON.stringify([...arr,score].sort((a,b) => b - a)));
  } else if (score > arr[9]){
    arr[9] = score;
    localStorage.setItem('records',JSON.stringify(arr.sort((a,b) => b - a)));
  }
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
  updateGround();
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
  birdVelocity.y += birdAcceleration.y;
};
const updateGround = () => {
  if (groundX - moveSpeed > -width) {
    groundX -= moveSpeed;
  } else {
    groundX = 0;
  }
};
const updatePillars = () => {
  pillars.forEach(pillar => {
    if (pillar.x - moveSpeed > -pillar.width) {
      pillar.x -= moveSpeed;
    } else {
      pillar.x = width;
      refreshPillarHeight(pillar);
    }
  });
}
const drawFrame = () => {
  clearScreen();
  drawBackground();
  drawBird();
  drawPillar();
  drawGround();
};
const drawBird = () => {
  //画鸟
  const deg = Math.atan(birdVelocity.y / moveSpeed );
  ctx.translate(birdPosition.x + birdSize.width / 2,birdPosition.y + birdSize.height / 2);
  ctx.rotate(deg);
  ctx.translate(-birdSize.width / 2, - birdSize.height / 2);
  switch(wingState)
  {
    case WING_FLAT:
      ctx.drawImage(spriteImage,62,982,34,24,
        0,0, birdSize.width, birdSize.height);
      break;
    case WING_UP:
      ctx.drawImage(spriteImage,6,982,34,24,
        0,0, birdSize.width, birdSize.height);
      break;
    case WING_DOWN:
      ctx.drawImage(spriteImage,118,982,34,24,
        0,0, birdSize.width, birdSize.height);
      break;
  }
  ctx.setTransform();
};
const drawPillar = () => {
  //画柱子
  pillars.forEach(pillar => {
    const pillarHeight = pillar.width / 52 * 320;
    ctx.drawImage(spriteImage,112,646,52,320,
    pillar.x, -pillarHeight + pillar.topHeight, pillar.width, pillarHeight);
    ctx.drawImage(spriteImage,168,646,52,320,
      pillar.x, - 2 * pillarHeight + pillar.topHeight + 1, pillar.width, pillarHeight);
    
    ctx.drawImage(spriteImage,168,646,52,320,
      pillar.x, height - groundHeight - pillar.bottomHeight, pillar.width, pillarHeight);
    ctx.drawImage(spriteImage,112,646,52,320,
      pillar.x, height - groundHeight - pillar.bottomHeight + pillarHeight - 1, pillar.width, pillarHeight);
  });
};
const drawGround = () => {
  //画地板
  ctx.drawImage(spriteImage,584,0,336,112,
    groundX,height - groundHeight,width + 1,groundHeight);
  ctx.drawImage(spriteImage,584,0,336,112,
    groundX + width,height - groundHeight,width + 1,groundHeight);
};
const drawBackground = () => {
  //画背景
  ctx.drawImage(spriteImage,0,0,288,512,
    0,0,width,height);
};
const clearScreen = () => {
  ctx.clearRect(0, 0, width, height);
};
function drawScore(scoreParam = score,textY = height / 6,digitHeight = 36,drawIndex = null) {
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
  const numMap = [
    {x: 276,y: 646, width: 12, height: 14},
    {x: 276,y: 664, width: 12, height: 14},
    {x: 276,y: 698, width: 12, height: 14},
    {x: 276,y: 716, width: 12, height: 14},
    {x: 276,y: 750, width: 12, height: 14},
    {x: 276,y: 768, width: 12, height: 14},
    {x: 276,y: 802, width: 12, height: 14},
    {x: 276,y: 820, width: 12, height: 14},
    {x: 276,y: 854, width: 12, height: 14},
    {x: 276,y: 872, width: 12, height: 14},
  ];
  const digitArr = scoreParam.toString().split('');
  const textWidth = digitArr.reduce((acc,el) => acc + positionMap[el].width,0);
  const textX = width / 2 - textWidth / 2;
  let digitX = textX;
  if (numMap[drawIndex]) {
    const numWidth = 12;
    const numHeight = 14;
    ctx.drawImage(spriteImage,numMap[drawIndex].x,numMap[drawIndex].y
      ,numMap[drawIndex].width,numMap[drawIndex].height,
      width / 6, textY + (digitHeight - numHeight) / 2,numWidth,numHeight);
  }
  digitArr.forEach(digit => {
    const digitImagePosition = positionMap[digit];
    const digitY = textY;
    ctx.drawImage(spriteImage,digitImagePosition.x,digitImagePosition.y,
      digitImagePosition.width,digitImagePosition.height,
      digitX,digitY,positionMap[digit].width,digitHeight);
    digitX += positionMap[digit].width;
  });
};
const drawRank = () => {
  const digitHeight = 30;
  const gap = 5;
  const records = JSON.parse(localStorage.getItem('records'));
  clearScreen();
  drawBackground();
  drawGround();
  ctx.drawImage(spriteImage,924,52,80,28,
    menuBtnX,menuBtnY,menuBtnWidth,menuBtnHeight);
  records.forEach((record,index) => {
    drawScore(record,height / 8 + index * (digitHeight + gap),digitHeight,drawIndex = index);
  });
  state = AT_RANK;
}
const changeWingState = (() => {
  let timer = null;
  return () => {
    clearTimeout(timer);
    wingState = WING_DOWN;
    timer = setTimeout(() => {
      wingState = WING_UP;
      timer = setTimeout(() => {      
        wingState = WING_FLAT;
      },200);
    },200);
  };
})();
function handleClick(event) {
  if (state === AT_PLAYING) {
    birdVelocity.y = -5;
    changeWingState();
  } else if (state === AT_READY) {
    birdVelocity.y = -5;
    changeWingState();
    start();
  } else if (state === AT_RESULT 
    && event.offsetX < menuBtnX + menuBtnWidth && event.offsetX > menuBtnX
    && event.offsetY < menuBtnY + menuBtnHeight && event.offsetY > menuBtnY) {
    initStats();
    drawFrame();
    drawMainMenu();
  } else if (state === AT_MENU 
    && event.offsetX < btnStartX + btnWidth && event.offsetX > btnStartX
    && event.offsetY < btnY + btnHeight && event.offsetY > btnY) {
    drawReady();
  } else if (state === AT_MENU 
    && event.offsetX < btnRankX + btnWidth && event.offsetX > btnRankX
    && event.offsetY < btnY + btnHeight && event.offsetY > btnY) {
    drawRank();
  } else if (state === AT_RESULT 
    && event.offsetX < menuBtnX + menuBtnWidth && event.offsetX > menuBtnX
    && event.offsetY < okBtnY + menuBtnHeight && event.offsetY > okBtnY) {
    initStats();
    drawReady();
  } else if (state === AT_RANK
    && event.offsetX < menuBtnX + menuBtnWidth && event.offsetX > menuBtnX
    && event.offsetY < menuBtnY + menuBtnHeight && event.offsetY > menuBtnY) {
    drawFrame();
    drawMainMenu();
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
  state = AT_MENU;
};
