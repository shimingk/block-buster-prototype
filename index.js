// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  doc,
} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { html, render } from "lit-html";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDQaG0yTcGBBC0HpUSgicwDaCQdWYkULRM",
  authDomain: "block-buster-db-v0.firebaseapp.com",
  projectId: "block-buster-db-v0",
  storageBucket: "block-buster-db-v0.appspot.com",
  messagingSenderId: "424458867106",
  appId: "1:424458867106:web:d7f3aa2687f06e380ca2fb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

let scores = [];
const scoreRef = collection(db, "leaderboard");

async function sendName(username) {
  console.log("username is: " + username);
  // CHECK: username if BLANK -> ANONYMOUS
  if (username === "") {
    username = "anonymous";
  }
  console.log("Sending " + username + "'s score!");
  // Add some data to the messages collection
  try {
    const docRef = await addDoc(collection(db, "leaderboard"), {
      time: Date.now(),
      score: currScore,
      user: username
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

async function getAllScores() {
  scores = [];

  const querySnapshot = await getDocs(
    query(scoreRef, orderBy("score", "desc"))
  );
  querySnapshot.forEach((doc) => {
    let scoreData = doc.data();
    scores.push(scoreData);
  });

  console.log(scores);

  // textAlign(CENTER);
  // textSize(35);
  // for (let i = 0; i < 5; i++) {

  // }
  render(view(), document.body);
}

// getAllScores();

function handleInput(e) {
  if (e.key == "Enter") {
    sendName(e.target.value);
    e.target.value = "";
    let inputForm = document.getElementById("input-container");
    inputForm.remove();
    render(view(), document.body);
  }
}

function inputScore() {
  return html `<div id="input-container">
      <h2>Hit [Enter] after entering your name</h2>
      <input type="text" @keydown=${handleInput} placeholder="NAME"/>
    </div>`;
}

function view() {
  return html`<h1>Leaderboard</h1>
    
    <div id="score-container">
      ${scores.map((msg) => html`<div class="score">${msg.score} : ${msg.user}</div>`)}
    </div>`;
}

onSnapshot(
  collection(db, "leaderboard"),
  (snapshot) => {
    console.log("snap", snapshot);
    getAllScores();
  },
  (error) => {
    console.error(error);
  }
);

// render(view(), document.body);

// GameDev Implementation
let userPaddle;
let evilPaddle;
let ball;
let x;
// Window dimensions.
const windowWidth = 1000;
const windowHeight = 500;

// Rows and columns.
const rows = 2;
const cols = 5;

// Booleans for alive or not and evil paddle direction.
let alive = true;
let changeDir = false;

// Dimensions for bricks
const blockWidth =  Math.round(windowWidth / cols - 5);
const blockHeight = Math.round((windowHeight * 1/10 ) / rows - 10);

// store block sprite group and current game score
let blocks;
let currScore = 0;

// Set up the canvas.
window.setup = () => {
  // new Canvas();
  createCanvas(windowWidth, windowHeight);
  world.gravity = -25;
  // create user paddle sprite
  userPaddle = createSprite(width / 2, height, 250, 50);
  userPaddle.shapeColor = color('turquoise');
  // create evil paddle sprite
  evilPaddle = createSprite(width / 2, height / 2, 150, 50);
  evilPaddle.shapeColor = color('red');
  // create ball sprite
  ball = new Sprite();
  ball.diameter = 25;
  ball.shapeColor = color('yellow');
  // create block sprites
  blocks = new Group();
  generateBlocks();
  x = 15;
}

// Generate blocks.
window.generateBlocks = () => {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let block = createSprite(
        j * (blockWidth + 2),
        i * (blockHeight + 2),
        blockWidth,
        blockHeight
      );
      blocks.add(block);
    }
  }
}

// Draw blocks.
// window.drawBlocks = () => {
//   blocks.forEach(block => {
//     fill('springgreen');
//     rect(block.x, block.y + 50, block.width, block.height);
//     noStroke();
//   });
// }

window.checkBall = () => {
  if (ball.velocity.x === 0 && ball.velocity.y === 0) {
    ball.velocity.x = 5;
    ball.velocity.y = 5;
  }
  // ball collision with top of the screen
  if (ball.y - ball.diameter / 2 <= 0) {
    ball.velocity.y = -ball.velocity.y;
  }
  // ball collision with the bottom
  if (ball.y + ball.diameter / 2 >= windowHeight) {
    alive = false;
    ball.visible = false;
    console.log("end");
  }
  // ball collision with left and right sides of the screen
  if (ball.x - ball.diameter / 2 <= 0  || ball.x + ball.diameter / 2 >= windowWidth) {
    ball.velocity.x = -ball.velocity.x;
  }

  // ball collision with blocks
  blocks.forEach((block, index) => {
    if(ball.y - ball.diameter / 2 <= block.y + 50 + block.h && ball.x > block.x && ball.x <= block.x + block.w) {
      ball.velocity.y = -ball.velocity.y;
      block.remove(index, 1);
      currScore++;
      if(blocks.length === 0) alive = false;
    }
  });

  // ball collision with user paddle
  if (ball.collides(userPaddle)) {
    ball.velocity.x = -ball.velocity.x;
    ball.velocity.y = -5;
  }
  // ball collision with evil paddle
  if (ball.collides(evilPaddle)) {
    ball.velocity.x = -ball.velocity.x;
    ball.velocity.y = -5;
  }
}

// Display score at the top of the screen.
window.displayScore = () => {
  fill("beige");
  textAlign(CENTER);
  textSize(25)
  text(`Score: ${currScore}`, windowWidth / 2, 50);
}

// Display message (either "GAME OVER" or "You Win!")
window.endScreen = (message) => {
  if (message === "You Win!") {
    fill('springgreen');
    message += "  🤩";
  } else {
    fill('magenta');
  }
  textAlign(CENTER);
  textSize(35);
  text(message, windowWidth / 2, windowHeight / 2); // 300, 170
  text('Play again: [Space]', windowWidth / 2, windowHeight / 2 + 55); // 300, 225
  text(`Score: ${currScore}`, windowWidth / 2, windowHeight / 2 - 55); // 300, 280
  text('Save Score: [Tab]', windowWidth / 2, windowHeight / 2 + 110);
}

// restart game
window.keyPressed = () => {

  // restart game 
  if(keyCode === 32 && !alive) {
    alive = true;
    // paddle.x = windowWidth / 2 - 50,
    // ball.x = paddle.x - 25,
    // ball.y = paddle.y - 50,
    // ball.speedX = 5;
    // ball.speedY = 5;
    ball.visible = true;
    evilPaddle.visible = true;
    ball.x = width / 2;
    ball.y = height / 2;
    blocks.removeAll(); // clean block group   
    currScore = 0;
    generateBlocks();
  }

  if (keyCode === 9) {
    if ((!alive && blocks.length != 0) || blocks.length === 0) {
      render(inputScore(), document.body);
    }
  }
}

// Animate and draw everything to the screen.
window.draw = () => {
  background("black");
  ball.visible = true;
  // controls user paddle's movement
  userPaddle.velocity.x = (mouseX - userPaddle.position.x) * 0.25;
  userPaddle.velocity.y = 0;
  // If the player broke all the blocks, they win.
  if (blocks.length === 0) {
    ball.visible = false;
    evilPaddle.visible = false;
    endScreen("You Win!");
  }
  // If the player died and there are still bricks to break, they lost.
  if (!alive && blocks.length != 0) { 
    ball.visible = false;
    evilPaddle.visible = false;
    endScreen("GAME OVER 😜");
  }
  // If the player is still alive, draw everything to the screen.
  if(alive) {
    // drawBlocks();
    displayScore();
    checkBall();
    // moveEvilPaddle();
    evilPaddle.collider = 'kinematic';
    if (evilPaddle.velocity.x === 0) {
      evilPaddle.velocity.x = 5;
    } else {
      if (evilPaddle.x === 0) {
        evilPaddle.velocity.x = -evilPaddle.velocity.x;
      }
      if (evilPaddle.x === windowWidth) {
        evilPaddle.velocity.x = -evilPaddle.velocity.x;
      }
    }
    blocks.collider = 'kinematic';
    userPaddle.collider = 'kinematic';
    drawSprites();
  }
}