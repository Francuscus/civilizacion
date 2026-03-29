const state = {
  year: 711,
  era: "Al-Andalus",
  population: 120,
  food: 90,
  silver: 45,
  timber: 40,
  knowledge: 8,
  army: 35,
  navy: 0,
  stability: 60,
  atlanticProgress: 0,
  americasUnlocked: false,
  colonies: 0,
  score: 0,
};

const statsEl = document.getElementById("stats");
const logEl = document.getElementById("log");
const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function pushLog(message) {
  const li = document.createElement("li");
  li.textContent = `${state.year}: ${message}`;
  logEl.prepend(li);
  while (logEl.children.length > 24) {
    logEl.removeChild(logEl.lastChild);
  }
}

function setEra() {
  if (state.year < 1492) state.era = "Reconquista";
  else if (state.year < 1700) state.era = "Age of Exploration";
  else if (state.year < 1825) state.era = "Colonial Strains";
  else state.era = "Modern Republics";
}

function updateScore() {
  state.score =
    state.population +
    state.food +
    state.silver * 2 +
    state.timber +
    state.knowledge * 4 +
    state.army * 2 +
    state.colonies * 120;
}

function nextTurn(years = 5) {
  state.year += years;
  setEra();
  state.food = clamp(state.food - rand(4, 8) + Math.floor(state.population / 30), 0, 999);
  state.population = clamp(state.population + rand(-2, 5), 10, 999);
  state.stability = clamp(state.stability + rand(-3, 2), 0, 100);
  if (state.food === 0) {
    state.population = clamp(state.population - 8, 10, 999);
    state.stability = clamp(state.stability - 10, 0, 100);
    pushLog("Famine struck the peninsula. Population and stability fell.");
  }
  updateScore();
  render();
}

function gatherGoods() {
  state.food += rand(10, 20);
  state.silver += rand(5, 11);
  state.timber += rand(8, 16);
  state.knowledge += rand(1, 3);
  pushLog("Harvests, mines, and workshops increase your goods.");
  nextTurn();
}

function buildInfrastructure() {
  if (state.silver < 18 || state.timber < 14) {
    pushLog("Not enough silver and timber for infrastructure.");
    return;
  }
  state.silver -= 18;
  state.timber -= 14;
  state.population += rand(6, 12);
  state.food += rand(8, 14);
  state.knowledge += 3;
  state.stability = clamp(state.stability + 6, 0, 100);
  pushLog("Roads, ports, and irrigation improve civic life.");
  nextTurn();
}

function trainArmy() {
  if (state.food < 12 || state.silver < 10) {
    pushLog("Training failed: not enough supplies.");
    return;
  }
  state.food -= 12;
  state.silver -= 10;
  state.army += rand(6, 12);
  state.navy += rand(1, 4);
  state.stability = clamp(state.stability - 2, 0, 100);
  pushLog("Veteran tercios and ships strengthen your military.");
  nextTurn();
}

function battleRival() {
  const rival = rand(28, 95);
  const power = state.army + Math.floor(state.knowledge / 2) + rand(-6, 10);
  if (power >= rival) {
    state.silver += rand(14, 28);
    state.food += rand(10, 20);
    state.stability = clamp(state.stability + 4, 0, 100);
    pushLog("Victory! You defeated a rival kingdom and seized supplies.");
  } else {
    state.army = clamp(state.army - rand(8, 15), 0, 999);
    state.stability = clamp(state.stability - 10, 0, 100);
    pushLog("Defeat in battle. Recover your army before trying again.");
  }
  nextTurn();
}

function exploreAtlantic() {
  if (state.navy < 8 || state.food < 15 || state.knowledge < 12) {
    pushLog("Exploration stalled. Build navy, provisions, and navigation knowledge.");
    return;
  }
  state.food -= 15;
  state.atlanticProgress = clamp(state.atlanticProgress + rand(16, 28), 0, 100);
  state.knowledge += rand(2, 4);
  pushLog("Atlantic expeditions map trade winds and ocean currents.");
  if (state.atlanticProgress >= 100 && !state.americasUnlocked) {
    state.americasUnlocked = true;
    pushLog("1492 moment achieved: routes to the Americas are unlocked.");
  }
  nextTurn(3);
}

function unlockAmericas() {
  if (!state.americasUnlocked) {
    pushLog("The route is not open yet. Keep exploring Atlantic routes.");
    return;
  }
  if (state.army < 45 || state.navy < 18 || state.food < 35) {
    pushLog("Need stronger armies, fleets, and supplies to launch transatlantic campaigns.");
    return;
  }
  state.food -= 35;
  state.army -= 10;
  state.navy -= 5;

  const success = rand(1, 100) <= clamp(45 + state.knowledge - (state.colonies * 8), 20, 80);
  if (success) {
    state.colonies += 1;
    state.silver += rand(30, 65);
    state.food += rand(20, 35);
    state.population += rand(10, 24);
    pushLog("New viceroyalty established in the Americas. Trade expands your wealth.");
  } else {
    state.stability = clamp(state.stability - 12, 0, 100);
    pushLog("Campaign failed amid resistance and distance. Stability dropped.");
  }
  nextTurn(4);
}

function reset() {
  Object.assign(state, {
    year: 711,
    era: "Al-Andalus",
    population: 120,
    food: 90,
    silver: 45,
    timber: 40,
    knowledge: 8,
    army: 35,
    navy: 0,
    stability: 60,
    atlanticProgress: 0,
    americasUnlocked: false,
    colonies: 0,
    score: 0,
  });
  logEl.innerHTML = "";
  pushLog("A new campaign begins in Iberia.");
  render();
}

function drawMap() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#5f8fc0";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Iberia
  ctx.fillStyle = "#cda45f";
  ctx.beginPath();
  ctx.moveTo(95, 170);
  ctx.lineTo(220, 130);
  ctx.lineTo(280, 180);
  ctx.lineTo(260, 250);
  ctx.lineTo(150, 270);
  ctx.lineTo(90, 230);
  ctx.closePath();
  ctx.fill();

  // North Africa hint
  ctx.fillStyle = "#b78c4e";
  ctx.fillRect(70, 300, 260, 110);

  // Americas
  ctx.fillStyle = state.americasUnlocked ? "#68a874" : "#3f6d9d";
  ctx.beginPath();
  ctx.moveTo(640, 110);
  ctx.lineTo(790, 90);
  ctx.lineTo(850, 200);
  ctx.lineTo(790, 340);
  ctx.lineTo(700, 390);
  ctx.lineTo(635, 310);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#dce9ff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(260, 210);
  const routeX = 280 + state.atlanticProgress * 3.4;
  const routeY = 210 + Math.sin(state.atlanticProgress / 10) * 24;
  ctx.quadraticCurveTo(450, 120, routeX, routeY);
  ctx.stroke();

  // Army strength bar
  ctx.fillStyle = "rgba(0,0,0,0.38)";
  ctx.fillRect(25, 26, 220, 22);
  ctx.fillStyle = "#ff6d6d";
  ctx.fillRect(25, 26, clamp(state.army * 2, 0, 220), 22);

  ctx.fillStyle = "#f2f6ff";
  ctx.font = "18px sans-serif";
  ctx.fillText(`Era: ${state.era}`, 24, 518);
  ctx.fillText(`Atlantic Routes: ${state.atlanticProgress}%`, 610, 40);

  if (state.americasUnlocked) {
    ctx.fillText(`Americas unlocked — colonies: ${state.colonies}`, 530, 70);
  }
}

function renderStats() {
  const entries = [
    ["Year", state.year],
    ["Era", state.era],
    ["Population", state.population],
    ["Food", state.food],
    ["Silver", state.silver],
    ["Timber", state.timber],
    ["Knowledge", state.knowledge],
    ["Army", state.army],
    ["Navy", state.navy],
    ["Stability", `${state.stability}%`],
    ["Colonies", state.colonies],
    ["Score", state.score],
  ];

  statsEl.innerHTML = entries
    .map(
      ([key, val]) => `<div class="stat"><small>${key}</small><strong>${val}</strong></div>`,
    )
    .join("");

  document.getElementById("colonizeBtn").disabled = !state.americasUnlocked;
}

function render() {
  updateScore();
  renderStats();
  drawMap();
}

document.getElementById("gatherBtn").addEventListener("click", gatherGoods);
document.getElementById("buildBtn").addEventListener("click", buildInfrastructure);
document.getElementById("trainBtn").addEventListener("click", trainArmy);
document.getElementById("battleBtn").addEventListener("click", battleRival);
document.getElementById("exploreBtn").addEventListener("click", exploreAtlantic);
document.getElementById("colonizeBtn").addEventListener("click", unlockAmericas);
document.getElementById("resetBtn").addEventListener("click", reset);

reset();
