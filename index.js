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
} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { html, render } from "lit-html";

// let score = 0;

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
      score: "10",
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
  render(view(), document.body);
}

getAllScores();

function handleInput(e) {
  if (e.key == "Enter") {
    sendName(e.target.value);
    e.target.value = "";
  }
}
  
function view() {
  return html`<h1>Leaderboard</h1>
    <input type="text" @keydown=${handleInput} />
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

render(view(), document.body);