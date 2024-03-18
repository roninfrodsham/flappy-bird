// canvas
const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 640;

// bird
const BIRD_WIDTH = 34; // 408/288 1.416666666666667 (17/12)
const BIRD_HEIGHT = 24;
const INITIAL_BIRD_X = CANVAS_WIDTH / 8;
const INITIAL_BIRD_Y = CANVAS_HEIGHT / 2;
const bird = {
  x: INITIAL_BIRD_X,
  y: INITIAL_BIRD_Y,
  width: BIRD_WIDTH,
  height: BIRD_HEIGHT,
};

// pipes
const PIPE_WIDTH = 64; // 384/3072 0.125 (1/8)
const PIPE_HEIGHT = 512;
const INITIAL_PIPE_X = CANVAS_WIDTH;
const INITIAL_PIPE_Y = 0;
let pipeArray = [];
let lastPipeTime = 0;

// physics
const PIPE_VELOCITY_X = -2; // pipes moving left
let birdVelocityY = 0; // bird jump speed
const GRAVITY = 0.2; // bird falling speed

// game
let isGameOver = false;
let score = 0;

// initalise canvas
const gameCanvas = document.getElementById("gameCanvas");
const ctx = gameCanvas.getContext("2d");
gameCanvas.width = CANVAS_WIDTH;
gameCanvas.height = CANVAS_HEIGHT;

// images
const topPipeImg = new Image();
topPipeImg.src = "./toppipe.png";
const bottomPipeImg = new Image();
bottomPipeImg.src = "./bottompipe.png";

const birdImage = new Image();
birdImage.src = "./flappybird.png";
birdImage.onload = () => {
  ctx.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);
};

const gameLoop = () => {
  requestAnimationFrame(gameLoop);

  if (isGameOver) return;

  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  birdVelocityY += GRAVITY;
  bird.y = Math.max(bird.y + birdVelocityY, 0); // apply gravity to current bird y position and limit bird to top of canvas
  ctx.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);

  if (bird.y > CANVAS_HEIGHT) {
    isGameOver = true;
  }

  // for loop ensures each iteration is complete before moving to the next
  for (let i = 0; i < pipeArray.length; i++) {
    let pipe = pipeArray[i];
    pipe.x += PIPE_VELOCITY_X;
    ctx.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

    if (!pipe.passed && bird.x > pipe.x + pipe.width) {
      score = score + 0.5; // add 0.5 because there are 2 pipes so we get 1 for each set of pipes
      pipe.passed = true;
    }

    if (checkCollision(bird, pipe)) {
      isGameOver = true;
    }
  }

  while (pipeArray.length && pipeArray[0].x < -PIPE_WIDTH) {
    pipeArray.shift(); // remove pipes that are off screen
  }

  const x = CANVAS_WIDTH / 2;
  ctx.fillStyle = "black";
  ctx.font = "20px 'Press Start 2P'";
  ctx.textAlign = "center";
  ctx.fillText(score, x, 45);

  if (isGameOver) {
    ctx.textBaseline = "middle";
    ctx.fillText("GAME OVER", x, CANVAS_HEIGHT / 2);
  }
};

placePipes = (timestamp) => {
  requestAnimationFrame(placePipes);

  if (isGameOver) return;

  if (!lastPipeTime || timestamp - lastPipeTime >= 1500) {
    lastPipeTime = timestamp;

    // so randomPipeY will be between -1/4 to -3/4 of the PIPE_HEIGHT
    // giving the illusion of a random pipe Y position
    const randomPipeY = INITIAL_PIPE_Y - PIPE_HEIGHT / 4 - Math.random() * (PIPE_HEIGHT / 2);
    const openingSpace = CANVAS_HEIGHT / 4;

    const topPipe = {
      img: topPipeImg,
      x: INITIAL_PIPE_X,
      y: randomPipeY,
      width: PIPE_WIDTH,
      height: PIPE_HEIGHT,
      passed: false,
    };

    const bottomPipe = {
      img: bottomPipeImg,
      x: INITIAL_PIPE_X,
      y: randomPipeY + PIPE_HEIGHT + openingSpace,
      width: PIPE_WIDTH,
      height: PIPE_HEIGHT,
      passed: false,
    };

    pipeArray.push(topPipe, bottomPipe);
  }
};

const moveBird = (event) => {
  if (
    event.code === "Space" ||
    event.code === "ArrowUp" ||
    event.code === "KeyX" ||
    event instanceof MouseEvent ||
    event instanceof TouchEvent
  ) {
    birdVelocityY = -6;

    if (isGameOver) {
      resetGame();
    }
  }
};

const checkCollision = (a, b) => {
  // collision detection explained - https://www.jeffreythompson.org/collision-detection/rect-rect.php
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
};

const resetGame = () => {
  bird.y = INITIAL_BIRD_Y;
  pipeArray = [];
  score = 0;
  isGameOver = false;
};

requestAnimationFrame(gameLoop);
requestAnimationFrame(placePipes);
document.addEventListener("keydown", moveBird);
document.addEventListener("mousedown", moveBird);
