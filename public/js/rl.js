// maze_qlearning.js - Versión mejorada con retroalimentación visual y contadores

const canvas = document.getElementById("maze-canvas");
const ctx = canvas.getContext("2d");
const cellSize = 100;

const maze = [
  [0, 0, 1, 2],
  [1, 0, 1, 0],
  [0, 0, 0, 0]
];

const rows = maze.length;
const cols = maze[0].length;

const actions = [ [-1,0], [0,1], [1,0], [0,-1] ];

let Q = {};
let epsilon = 0.4;      // más exploración
let alpha = 0.6;        // tasa de aprendizaje más rápida
let gamma = 0.9;
let agentPos = [0, 0];
let isTraining = false;
let interval = null;

let episodeCount = 0;
let stepCount = 0;

function initializeQ() {
  Q = {};
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (maze[y][x] !== 1) {
        Q[`${y},${x}`] = [0, 0, 0, 0];
      }
    }
  }
}

function drawMaze() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      ctx.fillStyle = maze[y][x] === 1 ? "#000" : maze[y][x] === 2 ? "#0f0" : "#fff";
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      ctx.strokeStyle = "#ccc";
      ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }

  // Color del agente según progreso
  let color;
  if (episodeCount < 10) color = "#f00";
  else if (episodeCount < 30) color = "#fa0";
  else color = "#0f0";

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(agentPos[1]*cellSize + cellSize/2, agentPos[0]*cellSize + cellSize/2, cellSize/3, 0, 2 * Math.PI);
  ctx.fill();
}

function chooseAction(state) {
  const key = `${state[0]},${state[1]}`;
  if (Math.random() < epsilon) {
    return Math.floor(Math.random() * 4);
  } else {
    const q = Q[key];
    const max = Math.max(...q);
    const options = q.map((val, idx) => val === max ? idx : -1).filter(i => i !== -1);
    return options[Math.floor(Math.random() * options.length)];
  }
}

function getReward(y, x) {
  if (maze[y][x] === 2) return 20;
  if (maze[y][x] === 1) return -10;
  return -1;
}

function isValid(y, x) {
  return y >= 0 && y < rows && x >= 0 && x < cols && maze[y][x] !== 1;
}

function updateFeedback() {
  const ep = document.getElementById("episode-counter");
  const st = document.getElementById("step-counter");
  const msg = document.getElementById("log");
  if (ep) ep.textContent = episodeCount;
  if (st) st.textContent = stepCount;
  if (msg) msg.textContent = `Aprendiendo... Episodio ${episodeCount}`;
}

function trainStep() {
  let state = [...agentPos];
  const stateKey = `${state[0]},${state[1]}`;
  const action = chooseAction(state);
  const [dy, dx] = actions[action];
  const newY = state[0] + dy;
  const newX = state[1] + dx;

  if (!isValid(newY, newX)) return;

  const nextStateKey = `${newY},${newX}`;
  const reward = getReward(newY, newX);

  const maxQ = Math.max(...Q[nextStateKey]);
  Q[stateKey][action] += alpha * (reward + gamma * maxQ - Q[stateKey][action]);

  agentPos = [newY, newX];
  stepCount++;
  drawMaze();
  updateFeedback();

  if (maze[newY][newX] === 2) {
    episodeCount++;
    stepCount = 0;
    agentPos = [0, 0];
    drawMaze();
    updateFeedback();
  }
}

function reset() {
  clearInterval(interval);
  isTraining = false;
  document.getElementById("train-btn").textContent = "Entrenar Agente";
  agentPos = [0, 0];
  episodeCount = 0;
  stepCount = 0;
  drawMaze();
  updateFeedback();
}

document.getElementById("train-btn").addEventListener("click", () => {
  epsilon = parseFloat(document.getElementById("epsilon").value);
  if (!isTraining) {
    initializeQ();
    agentPos = [0, 0];
    episodeCount = 0;
    stepCount = 0;
    isTraining = true;
    interval = setInterval(() => {
      for (let i = 0; i < 5; i++) trainStep();
    }, 100);
    document.getElementById("train-btn").textContent = "Detener";
  } else {
    clearInterval(interval);
    isTraining = false;
    document.getElementById("train-btn").textContent = "Entrenar Agente";
  }
});

document.getElementById("reset-btn").addEventListener("click", reset);

initializeQ();
drawMaze();
updateFeedback();
