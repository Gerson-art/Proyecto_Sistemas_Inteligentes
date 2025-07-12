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

const actions = [[-1, 0], [0, 1], [1, 0], [0, -1]];

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

    // Dibujar el laberinto
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            ctx.fillStyle = maze[y][x] === 1 ? "#000" : maze[y][x] === 2 ? "#0f0" : "#fff";
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            ctx.strokeStyle = "#ccc";
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);

            // Dibujar flechas de política para celdas no bloqueadas
            if (maze[y][x] !== 1 && maze[y][x] !== 2) {
                const stateKey = `${y},${x}`;
                const qValues = Q[stateKey] || [0, 0, 0, 0];
                const maxQ = Math.max(...qValues);

                if (maxQ > 0) {
                    const bestActions = qValues.map((val, idx) => val === maxQ ? idx : -1).filter(i => i !== -1);
                    bestActions.forEach(actionIdx => {
                        drawActionArrow(x, y, actionIdx, qValues[actionIdx]);
                    });
                }
            }
        }
    }
    // Dibujar agente
    let color;
    if (episodeCount < 10) color = "#f00";
    else if (episodeCount < 30) color = "#fa0";
    else color = "#0f0";

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(agentPos[1] * cellSize + cellSize / 2, agentPos[0] * cellSize + cellSize / 2, cellSize / 3, 0, 2 * Math.PI);
    ctx.fill();
}
function drawActionArrow(x, y, actionIdx, value) {
    const centerX = x * cellSize + cellSize / 2;
    const centerY = y * cellSize + cellSize / 2;
    const arrowSize = cellSize / 4;
    const opacity = Math.min(1, value / 20); // Normalizar opacidad

    ctx.save();
    ctx.translate(centerX, centerY);

    // Rotar según la acción
    switch (actionIdx) {
        case 0: ctx.rotate(-Math.PI / 2); break; // Arriba
        case 1: break;                         // Derecha
        case 2: ctx.rotate(Math.PI / 2); break;  // Abajo
        case 3: ctx.rotate(Math.PI); break;    // Izquierda
    }

    ctx.fillStyle = `rgba(52, 152, 219, ${opacity})`;

    // Dibujar flecha
    ctx.beginPath();
    ctx.moveTo(arrowSize, 0);
    ctx.lineTo(-arrowSize, -arrowSize / 2);
    ctx.lineTo(-arrowSize, arrowSize / 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
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
function visualizePolicy() {
    const policyDisplay = document.getElementById("policy-display");
    policyDisplay.innerHTML = "";

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (maze[y][x] === 1) continue; // Saltar paredes

            const cell = document.createElement("div");
            cell.className = "policy-cell";
            cell.innerHTML = `<div>Estado (${y},${x})</div>`;

            const actionsDiv = document.createElement("div");
            actionsDiv.className = "policy-actions";

            const stateKey = `${y},${x}`;
            const qValues = Q[stateKey] || [0, 0, 0, 0];
            const maxQ = Math.max(...qValues);

            // Íconos para cada acción (arriba, derecha, abajo, izquierda)
            const actionIcons = ["↑", "→", "↓", "←"];

            qValues.forEach((value, idx) => {
                const action = document.createElement("div");
                action.className = `policy-action ${value === maxQ && maxQ !== 0 ? "best" : ""}`;
                action.textContent = actionIcons[idx];
                action.title = `Valor Q: ${value.toFixed(2)}`;
                action.style.backgroundColor = value === maxQ && maxQ !== 0 ?
                    "#2ecc71" : "#3498db";
                actionsDiv.appendChild(action);
            });

            cell.appendChild(actionsDiv);
            policyDisplay.appendChild(cell);
        }
    }
}

// Función para actualizar parámetros en tiempo real
function updateParameters() {
    epsilon = parseFloat(document.getElementById("epsilon").value);
    alpha = parseFloat(document.getElementById("alpha").value);
    gamma = parseFloat(document.getElementById("gamma").value);

    // Actualizar valores mostrados
    document.getElementById("epsilon-value").textContent = epsilon;
    document.getElementById("alpha-value").textContent = alpha;
    document.getElementById("gamma-value").textContent = gamma;
}
document.getElementById("train-btn").addEventListener("click", () => {
  updateParameters();
  if (!isTraining) {
    initializeQ();
    agentPos = [0, 0];
    episodeCount = 0;
    stepCount = 0;
    isTraining = true;
    interval = setInterval(() => {
      for (let i = 0; i < 5; i++) trainStep();
      drawMaze(); // Redibujar para ver flechas de política
    }, 100);
    document.getElementById("train-btn").textContent = "Detener";
  } else {
    clearInterval(interval);
    isTraining = false;
    document.getElementById("train-btn").textContent = "Entrenar Agente";
  }
});

document.getElementById("epsilon").addEventListener("input", updateParameters);
document.getElementById("alpha").addEventListener("input", updateParameters);
document.getElementById("gamma").addEventListener("input", updateParameters);
document.getElementById("show-policy-btn").addEventListener("click", visualizePolicy);
document.getElementById("reset-btn").addEventListener("click", reset);

initializeQ();
drawMaze();
updateFeedback();
updateParameters();
