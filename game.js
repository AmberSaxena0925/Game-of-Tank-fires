(() => {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const radar = document.getElementById("minimap");
  const radarCtx = radar.getContext("2d");
  const overlay = document.getElementById("overlay");
  const titleEl = document.getElementById("title");
  const messageEl = document.getElementById("message");
  const startButton = document.getElementById("startButton");
  const exitMatchButton = document.getElementById("exitMatchButton");
  const tutorialButton = document.getElementById("tutorialButton");
  const tutorialHud = document.getElementById("tutorialHud");
  const tutorialTitle = document.getElementById("tutorialTitle");
  const tutorialInstruction = document.getElementById("tutorialInstruction");
  const tutorialProgress = document.getElementById("tutorialProgress");
  const tutorialProgressBar = document.getElementById("tutorialProgressBar");
  const tutorialExitButton = document.getElementById("tutorialExitButton");
  const timerEl = document.getElementById("timer");
  const alliesEl = document.getElementById("allies");
  const weaponNameEl = document.getElementById("weaponName");
  const weaponInfoEl = document.getElementById("weaponInfo");
  const weaponSlotEl = document.getElementById("weaponSlot");
  const reloadBarEl = document.getElementById("reloadBar");
  const reloadCaptionEl = document.getElementById("reloadCaption");
  const blueCountEl = document.getElementById("blueCount");
  const redCountEl = document.getElementById("redCount");
  const scoreLeftLabel = document.getElementById("scoreLeftLabel");
  const scoreRightLabel = document.getElementById("scoreRightLabel");
  const scoreDivider = document.getElementById("scoreDivider");
  const difficultySelect = document.getElementById("difficulty");
  const modeSelect = document.getElementById("mode");
  const shakeToggle = document.getElementById("shakeToggle");
  const soundToggle = document.getElementById("soundToggle");
  const fullscreenToggle = document.getElementById("fullscreenToggle");
  const fullscreenExit = document.getElementById("fullscreenExit");
  const playerNameInput = document.getElementById("playerName");
  const matchModeSelect = document.getElementById("matchMode");
  const mapSelect = document.getElementById("mapSelect");
  const teamFormatSelect = document.getElementById("teamFormat");
  const teamFormatField = document.getElementById("teamFormatField");
  const playerLimitSelect = document.getElementById("playerLimit");
  const playerLimitField = document.getElementById("playerLimitField");
  const publicMatchButton = document.getElementById("publicMatchButton");
  const createRoomButton = document.getElementById("createRoomButton");
  const joinRoomButton = document.getElementById("joinRoomButton");
  const matchDurationSelect = document.getElementById("matchDuration");
  const roomCodeInput = document.getElementById("roomCode");
  const onlineStatus = document.getElementById("onlineStatus");
  const roomLobby = document.getElementById("roomLobby");
  const roomHeading = document.getElementById("roomHeading");
  const roomPlayers = document.getElementById("roomPlayers");
  const roomMatchInfo = document.getElementById("roomMatchInfo");
  const roomStartButton = document.getElementById("roomStartButton");
  const leaveRoomButton = document.getElementById("leaveRoomButton");
  const copyRoomButton = document.getElementById("copyRoomButton");

  const WORLD = { width: 1800, height: 1200 };
  const TANK_RADIUS = 20;
  const TILE = 50;
  const TAU = Math.PI * 2;
  const weapons = [
    { id: 0, name: "STANDARD MISSILE", speed: 570, damage: 28, radius: 0, reload: 0.72, capacity: 5, range: 790, color: "#ffd074", turn: 0 },
    { id: 1, name: "HOMING MISSILE", speed: 410, damage: 23, radius: 18, reload: 1.18, capacity: 3, range: 900, color: "#ff75c9", turn: 2.5 },
    { id: 2, name: "HEAVY EXPLOSIVE", speed: 330, damage: 48, radius: 108, reload: 1.65, capacity: 2, range: 680, color: "#ff704c", turn: 0 },
  ];
  const difficultyScale = { easy: 0.78, medium: 1, hard: 1.22 };
  const keys = new Set();
  const steelYardObstacles = [
    { x: 0, y: 0, w: WORLD.width, h: 24, type: "wall" },
    { x: 0, y: WORLD.height - 24, w: WORLD.width, h: 24, type: "wall" },
    { x: 0, y: 0, w: 24, h: WORLD.height, type: "wall" },
    { x: WORLD.width - 24, y: 0, w: 24, h: WORLD.height, type: "wall" },
    { x: 335, y: 165, w: 42, h: 250, type: "wall" },
    { x: 335, y: 165, w: 220, h: 42, type: "wall" },
    { x: 325, y: 770, w: 42, h: 255, type: "wall" },
    { x: 325, y: 983, w: 245, h: 42, type: "wall" },
    { x: 725, y: 110, w: 42, h: 245, type: "wall" },
    { x: 725, y: 110, w: 245, h: 42, type: "wall" },
    { x: 735, y: 850, w: 42, h: 245, type: "wall" },
    { x: 735, y: 1053, w: 270, h: 42, type: "wall" },
    { x: 1080, y: 170, w: 42, h: 285, type: "wall" },
    { x: 1080, y: 170, w: 260, h: 42, type: "wall" },
    { x: 1100, y: 765, w: 42, h: 270, type: "wall" },
    { x: 1100, y: 993, w: 250, h: 42, type: "wall" },
    { x: 1485, y: 225, w: 42, h: 300, type: "wall" },
    { x: 1485, y: 225, w: 185, h: 42, type: "wall" },
    { x: 1470, y: 730, w: 42, h: 285, type: "wall" },
    { x: 1470, y: 973, w: 220, h: 42, type: "wall" },
    { x: 460, y: 470, w: 70, h: 70, type: "crate", hp: 65, maxHp: 65 },
    { x: 610, y: 630, w: 70, h: 70, type: "crate", hp: 65, maxHp: 65 },
    { x: 875, y: 490, w: 70, h: 70, type: "crate", hp: 65, maxHp: 65 },
    { x: 935, y: 695, w: 70, h: 70, type: "crate", hp: 65, maxHp: 65 },
    { x: 1270, y: 510, w: 70, h: 70, type: "crate", hp: 65, maxHp: 65 },
    { x: 1250, y: 675, w: 70, h: 70, type: "crate", hp: 65, maxHp: 65 },
    { x: 850, y: 275, w: 110, h: 34, type: "barrier" },
    { x: 850, y: 890, w: 110, h: 34, type: "barrier" },
    { x: 520, y: 870, w: 110, h: 34, type: "barrier" },
    { x: 1320, y: 330, w: 110, h: 34, type: "barrier" },
  ];
  const mapDefinitions = {
    "steel-yard": {
      name: "STEEL YARD",
      ground: "#202a20",
      detail: "industrial",
      createObstacles: () => steelYardObstacles.map((obstacle) => ({ ...obstacle })),
    },
    forest: {
      name: "GREENWOOD FOREST",
      ground: "#a9824e",
      detail: "forest",
      createObstacles: () => [
        ...steelYardObstacles.slice(0, 4).map((obstacle) => ({ ...obstacle })),
        { x: 420, y: 210, w: 100, h: 75, type: "stone" },
        { x: 630, y: 390, w: 78, h: 88, type: "stone" },
        { x: 875, y: 180, w: 115, h: 74, type: "stone" },
        { x: 1075, y: 365, w: 92, h: 94, type: "stone" },
        { x: 1320, y: 205, w: 100, h: 72, type: "stone" },
        { x: 430, y: 865, w: 112, h: 78, type: "stone" },
        { x: 700, y: 740, w: 90, h: 105, type: "stone" },
        { x: 1040, y: 825, w: 120, h: 72, type: "stone" },
        { x: 1335, y: 880, w: 92, h: 98, type: "stone" },
        { x: 250, y: 385, w: 185, h: 145, type: "grass", color: "#16803a" },
        { x: 535, y: 545, w: 185, h: 112, type: "grass", color: "#24a344" },
        { x: 780, y: 300, w: 190, h: 105, type: "grass", color: "#1d9140" },
        { x: 900, y: 580, w: 205, h: 132, type: "grass", color: "#16883b" },
        { x: 1190, y: 405, w: 190, h: 120, type: "grass", color: "#2aa340" },
        { x: 1170, y: 700, w: 180, h: 130, type: "grass", color: "#16803a" },
        { x: 370, y: 650, w: 115, h: 88, type: "crate", hp: 65, maxHp: 65 },
        { x: 1470, y: 550, w: 115, h: 88, type: "crate", hp: 65, maxHp: 65 },
      ],
    },
  };
  const obstacles = [];

  let tanks = [];
  let rockets = [];
  let effects = [];
  let dust = [];
  let gameRunning = false;
  let gameOver = false;
  let matchTime = 0;
  let matchDuration = 300;
  let matchMode = "elimination";
  let teamScores = { blue: 0, red: 0 };
  let selectedMapId = "steel-yard";
  let selectedWeapon = 0;
  let playerTank = null;
  let camera = { x: 0, y: 0 };
  let renderScale = 1;
  let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
  let shake = 0;
  let shakeEnabled = true;
  let lastFrame = 0;
  let uiTimer = 0;
  const explored = new Uint8Array((WORLD.width / TILE) * (WORLD.height / TILE));
  const visibleTiles = new Uint8Array((WORLD.width / TILE) * (WORLD.height / TILE));
  let visionTimer = 0;
  let multiplayer = null;
  let networkSocket = null;
  let networkReady = null;
  let roomLobbyState = null;
  let networkSyncTimer = 0;
  let receivedShotCounter = 0;
  let soundEnabled = localStorage.getItem("ironclad-sound-enabled") !== "false";
  let audioContext = null;
  let noiseBuffer = null;
  let tutorial = null;
  let tutorialSettings = null;
  const tutorialSteps = [
    { title: "Drive your tank", instruction: "Use W, A, S, D to drive at least 120 meters through the arena." },
    { title: "Practice drifting", instruction: "Build some speed, then hold Space or Shift while steering to drift." },
    { title: "Aim and fire", instruction: "Move your mouse to aim, then click to launch a standard missile." },
    { title: "Select homing", instruction: "Press 2 to equip the homing missile." },
    { title: "Launch homing missile", instruction: "Aim at a nearby target and click to fire the homing missile." },
    { title: "Select heavy rocket", instruction: "Press 3 to equip the heavy explosive rocket." },
    { title: "Fire the heavy rocket", instruction: "Click to fire the heavy rocket and finish your training." },
  ];
  const gridWidth = WORLD.width / TILE;
  obstacles.push(...mapDefinitions[selectedMapId].createObstacles());

  function activateAudio() {
    if (!soundEnabled || audioContext) return;
    if (typeof window.AudioContext !== "function") {
      soundEnabled = false;
      localStorage.setItem("ironclad-sound-enabled", "false");
      updateSoundToggle();
      setOnlineStatus("This browser does not support sound effects.", true);
      return;
    }
    try {
      audioContext = new window.AudioContext();
      if (audioContext.state === "suspended") {
        audioContext.resume().catch((error) => {
          soundEnabled = false;
          localStorage.setItem("ironclad-sound-enabled", "false");
          updateSoundToggle();
          setOnlineStatus(`Sound could not start: ${error.message}`, true);
        });
      }
    } catch (error) {
      soundEnabled = false;
      localStorage.setItem("ironclad-sound-enabled", "false");
      updateSoundToggle();
      setOnlineStatus(`Sound could not start: ${error.message}`, true);
    }
  }

  function playSound(type, weaponId = 0) {
    if (!soundEnabled || !audioContext || audioContext.state !== "running") return;
    const now = audioContext.currentTime;
    const output = audioContext.createGain();
    output.connect(audioContext.destination);
    if (type === "explosion") {
      if (!noiseBuffer) {
        noiseBuffer = audioContext.createBuffer(1, Math.floor(audioContext.sampleRate * 0.24), audioContext.sampleRate);
        const samples = noiseBuffer.getChannelData(0);
        for (let i = 0; i < samples.length; i += 1) samples[i] = (Math.random() * 2 - 1) * (1 - i / samples.length);
      }
      const noise = audioContext.createBufferSource();
      const filter = audioContext.createBiquadFilter();
      noise.buffer = noiseBuffer;
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(850 + Math.random() * 350, now);
      filter.frequency.exponentialRampToValueAtTime(110, now + 0.22);
      output.gain.setValueAtTime(0.0001, now);
      output.gain.exponentialRampToValueAtTime(0.18, now + 0.018);
      output.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
      noise.connect(filter);
      filter.connect(output);
      noise.start(now);
      noise.stop(now + 0.25);
      return;
    }
    const oscillator = audioContext.createOscillator();
    const volume = weaponId === 2 ? 0.12 : weaponId === 1 ? 0.065 : 0.08;
    const startFrequency = weaponId === 2 ? 125 : weaponId === 1 ? 760 : 420;
    oscillator.type = weaponId === 1 ? "sawtooth" : "triangle";
    oscillator.frequency.setValueAtTime(startFrequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(weaponId === 2 ? 46 : 115, now + 0.16);
    output.gain.setValueAtTime(volume, now);
    output.gain.exponentialRampToValueAtTime(0.0001, now + (weaponId === 2 ? 0.24 : 0.17));
    oscillator.connect(output);
    oscillator.start(now);
    oscillator.stop(now + 0.25);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function updateSoundToggle() {
    soundToggle.textContent = `SOUND: ${soundEnabled ? "ON" : "OFF"}`;
    soundToggle.setAttribute("aria-pressed", soundEnabled.toString());
  }

  function updateRespawns(dt) {
    if (matchMode !== "team-deathmatch") return;
    tanks.forEach((tank) => {
      if (tank.alive || tank.remote || tank.respawnTimer <= 0) return;
      tank.respawnTimer = Math.max(0, tank.respawnTimer - dt);
      if (tank.respawnTimer > 0) return;
      tank.x = tank.spawnX;
      tank.y = tank.spawnY;
      tank.angle = tank.spawnAngle;
      tank.turret = tank.spawnAngle;
      tank.vx = 0;
      tank.vy = 0;
      tank.speed = 0;
      tank.hp = tank.maxHp;
      tank.alive = true;
      tank.invulnerable = 1.5;
      tank.ammo = weapons.map((weapon) => weapon.capacity);
      tank.fireCooldowns = [0, 0, 0];
      tank.reloadTimers = [0, 0, 0];
      tank.reloadDurations = [0, 0, 0];
      tank.lastDamagedBy = null;
    });
  }

  function normalizeAngle(angle) {
    while (angle > Math.PI) angle -= TAU;
    while (angle < -Math.PI) angle += TAU;
    return angle;
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function segmentHitsRect(x1, y1, x2, y2, rect) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    let tMin = 0;
    let tMax = 1;
    const p = [-dx, dx, -dy, dy];
    const q = [x1 - rect.x, rect.x + rect.w - x1, y1 - rect.y, rect.y + rect.h - y1];
    for (let i = 0; i < 4; i += 1) {
      if (Math.abs(p[i]) < 0.00001) {
        if (q[i] < 0) return false;
      } else {
        const t = q[i] / p[i];
        if (p[i] < 0) tMin = Math.max(tMin, t);
        else tMax = Math.min(tMax, t);
        if (tMin > tMax) return false;
      }
    }
    return tMax > 0.012 && tMin < 0.988;
  }

  function lineBlocked(x1, y1, x2, y2) {
    return obstacles.some((rect) => {
      if (rect.type === "grass" && x1 >= rect.x && x1 <= rect.x + rect.w &&
          y1 >= rect.y && y1 <= rect.y + rect.h) return false;
      return segmentHitsRect(x1, y1, x2, y2, rect);
    });
  }

  function canSee(source, target, range) {
    return source && source.alive && target && target.alive && distance(source, target) <= range &&
      !lineBlocked(source.x, source.y, target.x, target.y);
  }

  function visibleFromTeam(tank, team) {
    return tanks.some((spotter) => spotter.alive && spotter.team === team &&
      canSee(spotter, tank, spotter === playerTank ? 590 : 470));
  }

  function getVisibleEnemies(team) {
    return tanks.filter((tank) => tank.team !== team && visibleFromTeam(tank, team));
  }

  function tankColor(tank) {
    if (matchMode !== "survival") {
      return tank.team === "blue"
        ? { body: "#4aaedc", dark: "#1c526c", light: "#a2e2f4", bar: "#75cfed", map: "#51c3f5" }
        : { body: "#e35f4d", dark: "#742e28", light: "#ffb19f", bar: "#fa7961", map: "#fa6956" };
    }
    const colors = ["#50b8ed", "#e87555", "#d8b65b", "#ab83df", "#64c995", "#de77ab",
      "#7ed0c3", "#eb9550", "#8e9fef", "#bdd36b", "#dc746c", "#61b8a8"];
    const index = Number(tank.team.replace("solo-", "")) || 0;
    const body = colors[index % colors.length];
    return { body, dark: "#253129", light: "#e0e8db", bar: body, map: body };
  }

  function tankVisibleToPlayer(tank) {
    if (!playerTank) return false;
    return matchMode === "survival"
      ? canSee(playerTank, tank, 590)
      : tank.team === playerTank.team || visibleFromTeam(tank, playerTank.team);
  }

  function circleRectCollision(x, y, radius, rect) {
    const closestX = clamp(x, rect.x, rect.x + rect.w);
    const closestY = clamp(y, rect.y, rect.y + rect.h);
    const dx = x - closestX;
    const dy = y - closestY;
    return dx * dx + dy * dy < radius * radius;
  }

  function tankCanOccupy(tank, x, y) {
    if (x < TANK_RADIUS + 24 || y < TANK_RADIUS + 24 ||
        x > WORLD.width - TANK_RADIUS - 24 || y > WORLD.height - TANK_RADIUS - 24) return false;
    if (obstacles.some((rect) => rect.type !== "grass" &&
        circleRectCollision(x, y, TANK_RADIUS, rect))) return false;
    return !tanks.some((other) => other !== tank && other.alive &&
      Math.hypot(other.x - x, other.y - y) < TANK_RADIUS * 1.75);
  }

  function avoidObstacleAngle(tank, desiredAngle) {
    const offsets = [0, -0.48, 0.48, -0.95, 0.95, -1.45, 1.45];
    let bestAngle = desiredAngle;
    let bestScore = Infinity;
    for (const offset of offsets) {
      const angle = desiredAngle + offset;
      const nearX = tank.x + Math.cos(angle) * 55;
      const nearY = tank.y + Math.sin(angle) * 55;
      const farX = tank.x + Math.cos(angle) * 112;
      const farY = tank.y + Math.sin(angle) * 112;
      const blocked = !tankCanOccupy(tank, nearX, nearY);
      const score = Math.abs(offset) * 36 + (blocked ? 900 : 0) +
        (!tankCanOccupy(tank, farX, farY) ? 150 : 0);
      if (score < bestScore) {
        bestScore = score;
        bestAngle = angle;
      }
    }
    return bestAngle;
  }

  function makeTank(id, team, name, x, y, angle, weaponId, isPlayer) {
    return {
      id, team, name, x, y, angle, turret: angle, weaponId, isPlayer, alive: true,
      spawnX: x, spawnY: y, spawnAngle: angle, respawnTimer: 0,
      remote: false, networkId: null, targetState: null,
      hp: 100, maxHp: 100, vx: 0, vy: 0, speed: 0,
      fireCooldowns: [0, 0, 0], reloadTimers: [0, 0, 0], reloadDurations: [0, 0, 0],
      ammo: weapons.map((weapon) => weapon.capacity), invulnerable: 0, aiThink: Math.random(),
      strafe: Math.random() < 0.5 ? -1 : 1, targetX: x, targetY: y, retreat: false,
      damagedSmoke: 0,
    };
  }

  function setOnlineStatus(text, isError = false) {
    onlineStatus.textContent = text;
    onlineStatus.classList.toggle("error", isError);
  }

  function multiplayerSocketUrl() {
    const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";
    const port = isLocal ? "8080" : location.port;
    const scheme = location.protocol === "https:" ? "wss:" : "ws:";
    return `${scheme}//${location.hostname || "localhost"}${port ? `:${port}` : ""}`;
  }

  function connectOnline() {
    if (networkSocket && networkSocket.readyState === WebSocket.OPEN) return Promise.resolve(networkSocket);
    if (networkReady) return networkReady;
    setOnlineStatus("Connecting to the match server…");
    networkReady = new Promise((resolve, reject) => {
      try {
        networkSocket = new WebSocket(multiplayerSocketUrl());
      } catch (error) {
        networkReady = null;
        reject(error);
        return;
      }
      const timeout = window.setTimeout(() => {
        networkReady = null;
        networkSocket?.close();
        reject(new Error("Could not reach the match server. Start it with npm start."));
      }, 5000);
      networkSocket.addEventListener("open", () => {
        window.clearTimeout(timeout);
        setOnlineStatus("Connected to the online match server.");
        resolve(networkSocket);
      }, { once: true });
      networkSocket.addEventListener("error", () => {
        window.clearTimeout(timeout);
        networkReady = null;
        reject(new Error("Could not reach the match server. Start it with npm start."));
      });
      networkSocket.addEventListener("close", () => {
        window.clearTimeout(timeout);
        networkReady = null;
        networkSocket = null;
        if (multiplayer) setOnlineStatus("Connection to the match server was lost.", true);
      });
      networkSocket.addEventListener("message", (event) => {
        let message;
        try {
          message = JSON.parse(event.data);
        } catch {
          setOnlineStatus("Received invalid data from the match server.", true);
          return;
        }
        handleNetworkMessage(message);
      });
    });
    return networkReady;
  }

  function sendOnline(message) {
    if (!networkSocket || networkSocket.readyState !== WebSocket.OPEN) return false;
    networkSocket.send(JSON.stringify(message));
    return true;
  }

  function currentPlayerName() {
    const name = playerNameInput.value.trim().slice(0, 18) || "Player";
    playerNameInput.value = name;
    localStorage.setItem("ironclad-player-name", name);
    return name;
  }

  function selectedMatchDuration() {
    const duration = Number(matchDurationSelect.value);
    return Number.isInteger(duration) && [0, 300, 600, 900].includes(duration) ? duration : 300;
  }

  function matchDurationLabel(seconds) {
    if (!seconds) return "No time limit";
    return `${seconds / 60} minutes`;
  }

  function updateMatchModeFields() {
    const survival = matchModeSelect.value === "survival";
    teamFormatField.hidden = survival;
    playerLimitField.hidden = !survival;
    messageEl.textContent = survival
      ? "Survival is free-for-all: eliminate everyone else and be the last tank standing. Choose a room limit from 2 to 12 players."
      : matchModeSelect.value === "team-deathmatch"
        ? "Fight for your team, rack up eliminations, and respawn to return to battle. Highest team score wins when time runs out."
        : "Lead your squad, break enemy lines, and destroy all three hostile tanks. Walls stop rockets and block vision.";
  }

  function updateModePresentation() {
    const survival = matchMode === "survival";
    const deathmatch = matchMode === "team-deathmatch";
    scoreLeftLabel.textContent = survival ? "ALIVE" : "BLUE";
    scoreRightLabel.textContent = survival ? "MAX" : "RED";
    scoreDivider.textContent = survival ? "/" : "VS";
    document.querySelector(".squad-card .section-title > span").textContent =
      survival ? "SURVIVORS" : deathmatch ? "TEAMMATES" : "YOUR SQUAD";
    document.querySelector(".combat-foot > span").textContent = `ARENA: ${mapDefinitions[selectedMapId].name}`;
    if (matchMode === "team-deathmatch") {
      blueCountEl.textContent = teamScores.blue.toString();
      redCountEl.textContent = teamScores.red.toString();
    }
  }

  function renderRoomLobby(room) {
    roomLobbyState = room;
    lastLobbyPlayerId = room.playerId;
    roomLobby.hidden = false;
    selectedMapId = room.mapId;
    mapSelect.value = room.mapId;
    matchModeSelect.value = room.mode;
    updateMatchModeFields();
    updateModePresentation();
    matchDurationSelect.value = String(room.matchDuration);
    if (room.mode === "survival") playerLimitSelect.value = String(room.maxPlayers);
    else teamFormatSelect.value = room.format;
    matchModeSelect.disabled = true;
    mapSelect.disabled = true;
    teamFormatSelect.disabled = true;
    playerLimitSelect.disabled = true;
    matchDurationSelect.disabled = true;
    roomHeading.textContent = room.mode === "survival"
      ? `${room.public ? "PUBLIC SURVIVAL" : "PRIVATE SURVIVAL"} · ${room.code}`
      : room.mode === "team-deathmatch"
        ? `${room.public ? "PUBLIC TEAM DEATHMATCH" : "PRIVATE TEAM DEATHMATCH"} · ${room.code}`
        : room.public ? `PUBLIC MATCH · ${room.format}` : `PRIVATE ROOM · ${room.code}`;
    roomCodeInput.value = room.public ? "" : room.code;
    roomPlayers.replaceChildren();
    const roster = [...room.roster].sort((a, b) => a.team.localeCompare(b.team) || a.slot - b.slot);
    roster.forEach((player) => {
      const row = document.createElement("div");
      row.className = "room-player";
      const label = document.createElement("span");
      label.textContent = room.mode === "survival"
        ? `TANK ${player.slot + 1} · ${player.name}`
        : `${player.team.toUpperCase()} · ${player.name}`;
      const count = document.createElement("small");
      count.textContent = room.mode === "survival" ? "SURVIVOR" : `TANK ${player.slot + 1}`;
      row.append(label, count);
      roomPlayers.append(row);
    });
    const roomCapacity = room.mode === "survival" ? room.maxPlayers : room.maxBlue + room.maxRed;
    const openSeats = roomCapacity - roster.length;
    roomMatchInfo.textContent = room.phase === "started"
      ? `Match starting · ${matchDurationLabel(room.matchDuration)}`
      : `${roster.length}/${roomCapacity} players · ${openSeats} open seats · ${mapDefinitions[room.mapId].name} · ${matchDurationLabel(room.matchDuration)}`;
    roomStartButton.hidden = !room.host || room.public;
    roomStartButton.disabled = room.startRequested || (room.mode === "survival" && roster.length < 2);
    roomStartButton.textContent = "Start match";
    setOnlineStatus(room.public
      ? `Searching for ${room.mode === "survival" ? "Survival" : room.format} players. Fill the seats to start.`
      : `Private room ${room.code} · share the code with your friends.`);
  }

  function handleNetworkMessage(message) {
    if (message.type === "connected") return;
    if (message.type === "error") {
      setOnlineStatus(message.message, true);
      return;
    }
    if (message.type === "lobby") {
      renderRoomLobby(message);
      return;
    }
    if (message.type === "matchStart") {
      const lobby = roomLobbyState;
      roomLobbyState = null;
      roomLobby.hidden = true;
      matchModeSelect.value = message.mode;
      updateMatchModeFields();
      multiplayer = {
        connected: true,
        roomId: message.roomId,
        code: message.code,
        format: message.format,
        maxBlue: message.maxBlue,
        maxRed: message.maxRed,
        maxPlayers: message.maxPlayers,
        mode: message.mode,
        mapId: message.mapId,
        matchDuration: message.matchDuration,
        players: message.players,
        hostId: message.hostId,
        localPlayerId: lobby?.playerId || lastLobbyPlayerId,
        isHost: message.hostId === (lobby?.playerId || lastLobbyPlayerId),
      };
      const localEntry = message.players.find((player) => player.id === multiplayer.localPlayerId);
      multiplayer.localPlayerId = localEntry?.id || multiplayer.localPlayerId;
      multiplayer.seat = localEntry ? { team: localEntry.team, slot: localEntry.slot } : null;
      setOnlineStatus(`Match live · ${message.mode === "survival" ? "Survival" : message.mode === "team-deathmatch" ? "Team Deathmatch" : message.format} · room ${message.code}`);
      resetMatch({ multiplayer });
      return;
    }
    if (message.type === "tankState" && multiplayer) {
      const tank = tanks.find((candidate) => candidate.networkId === message.playerId);
      if (!tank || tank === playerTank) return;
      tank.targetState = { ...message.state, name: message.name };
      return;
    }
    if (message.type === "botState" && multiplayer) {
      const tank = tanks.find((candidate) => candidate.id === message.tankId);
      if (tank?.remote) tank.targetState = message.state;
      return;
    }
    if (message.type === "hostChanged" && multiplayer) {
      multiplayer.hostId = message.hostId;
      multiplayer.isHost = message.hostId === multiplayer.localPlayerId;
      tanks.filter((tank) => !tank.isPlayer && !tank.networkId).forEach((tank) => {
        tank.remote = !multiplayer.isHost;
      });
      return;
    }
    if (message.type === "fireRocket" && multiplayer) {
      spawnRemoteRocket(message);
      return;
    }
    if (message.type === "playerLeft" && multiplayer) {
      const tank = tanks.find((candidate) => candidate.networkId === message.playerId);
      if (tank) {
        tank.alive = false;
        tank.hp = 0;
        createExplosion(tank.x, tank.y, 50, tankColor(tank).body, 5);
      }
    }
  }

  let lastLobbyPlayerId = null;

  function lobbyAction(type, extra = {}) {
    const payload = {
      type,
      name: currentPlayerName(),
      mode: matchModeSelect.value,
      format: teamFormatSelect.value,
      maxPlayers: Number(playerLimitSelect.value),
      mapId: mapSelect.value,
      matchDuration: selectedMatchDuration(),
      ...extra,
    };
    connectOnline().then(() => {
      lastLobbyPlayerId = null;
      if (!sendOnline(payload)) throw new Error("Match server disconnected. Try again.");
    }).catch((error) => setOnlineStatus(error.message, true));
  }

  function resetMatch(options = {}) {
    multiplayer = options.multiplayer || null;
    matchMode = multiplayer ? multiplayer.mode : matchModeSelect.value;
    teamScores = { blue: 0, red: 0 };
    selectedMapId = multiplayer ? multiplayer.mapId : mapSelect.value;
    obstacles.splice(0, obstacles.length, ...mapDefinitions[selectedMapId].createObstacles());
    updateModePresentation();
    const blueSpawns = [
      { x: 170, y: 535, angle: 0, weapon: 0 },
      { x: 112, y: 440, angle: 0, weapon: 0 },
      { x: 112, y: 630, angle: 0, weapon: 2 },
    ];
    const redSpawns = [
      { x: 1620, y: 535, angle: Math.PI, weapon: 1 },
      { x: 1680, y: 440, angle: Math.PI, weapon: 0 },
      { x: 1680, y: 630, angle: Math.PI, weapon: 2 },
    ];
    const matchPlayers = multiplayer ? multiplayer.players : [];
    matchDuration = multiplayer ? multiplayer.matchDuration : selectedMatchDuration();
    const survivalSpawns = [
      [125, 110], [500, 110], [900, 90], [1300, 110], [1675, 110], [125, 600],
      [1675, 600], [125, 1090], [500, 1090], [900, 1110], [1300, 1090], [1675, 1090],
    ];
    if (matchMode === "survival") {
      const playerCount = multiplayer ? matchPlayers.length : Number(playerLimitSelect.value);
      const participants = multiplayer
        ? [...matchPlayers].sort((a, b) => a.slot - b.slot)
        : Array.from({ length: playerCount }, (_, slot) => ({ slot, name: slot === 0 ? currentPlayerName() : `BOT ${slot + 1}` }));
      tanks = participants.map((participant, index) => {
        const slot = participant.slot;
        const spawn = survivalSpawns[slot];
        const local = multiplayer
          ? participant.id === multiplayer.localPlayerId
          : slot === 0;
        const tank = makeTank(
          slot,
          `solo-${slot}`,
          participant.name,
          spawn[0],
          spawn[1],
          Math.atan2(600 - spawn[1], 900 - spawn[0]),
          slot % weapons.length,
          local,
        );
        if (multiplayer) {
          tank.networkId = participant.id;
          tank.remote = !local;
        }
        return tank;
      });
      if (multiplayer) multiplayer.maxPlayers = multiplayer.maxPlayers || 12;
    } else {
    const blueMax = multiplayer ? multiplayer.maxBlue : 3;
    const redMax = multiplayer ? multiplayer.maxRed : 3;
    tanks = [];
    for (const team of ["blue", "red"]) {
      const max = team === "blue" ? blueMax : redMax;
      const spawnPoints = team === "blue" ? blueSpawns : redSpawns;
      for (let slot = 0; slot < max; slot += 1) {
        const id = team === "blue" ? slot : slot + 3;
        const participant = matchPlayers.find((entry) => entry.team === team && entry.slot === slot);
        const local = multiplayer
          ? Boolean(participant && participant.id === multiplayer.localPlayerId)
          : team === "blue" && slot === 0;
        const botName = team === "blue" ? ["STRIKER", "WINGMAN", "BREACHER"][slot] : ["RAIDER", "LANCER", "BULWARK"][slot];
        const name = participant ? participant.name : `${team.toUpperCase()} · ${botName}`;
        const spawn = spawnPoints[slot];
        const tank = makeTank(id, team, name, spawn.x, spawn.y, spawn.angle, spawn.weapon, local);
        if (participant && multiplayer) {
          tank.networkId = participant.id;
          tank.remote = !local;
        } else if (multiplayer && !multiplayer.isHost) {
          tank.remote = true;
        }
        tanks.push(tank);
        if (local && multiplayer) {
          multiplayer.seat = { team, slot };
          multiplayer.localPlayerId = participant.id;
        }
      }
    }
    if (!multiplayer) {
      tanks[0].name = `${currentPlayerName()} · STRIKER`;
    }
    }
    playerTank = tanks.find((tank) => tank.isPlayer) || tanks.find((tank) => tank.team === "blue") || null;
    rockets = [];
    effects = [];
    dust = [];
    obstacles.forEach((obstacle) => {
      if (obstacle.type === "crate") obstacle.hp = obstacle.maxHp;
    });
    explored.fill(0);
    visibleTiles.fill(0);
    visionTimer = 0;
    matchTime = 0;
    networkSyncTimer = 0;
    gameOver = false;
    gameRunning = true;
    selectedWeapon = 0;
    shake = 0;
    keys.clear();
    overlay.classList.remove("visible");
    updateMatchExitButton();
    canvas.focus({ preventScroll: true });
    if (multiplayer) {
      titleEl.textContent = "Match in progress";
      messageEl.textContent = "Fight with your team. Disconnecting abandons this tank.";
    } else {
      titleEl.textContent = "Lock and load.";
    }
    if (!multiplayer) {
      titleEl.textContent = "Lock and load.";
      startButton.textContent = "Quick match vs AI";
    }
    updateHUD();
  }

  function endMatch(won, reason = "elimination") {
    if (gameOver) return;
    gameOver = true;
    gameRunning = false;
    updateMatchExitButton();
    titleEl.textContent = matchMode === "team-deathmatch"
      ? won === null ? "Team Deathmatch tied." : won ? "Team Deathmatch victory." : "Team Deathmatch lost."
      : won === null ? "Match drawn." : won ? "Arena secured." : "Squad eliminated.";
    if (reason === "time") {
      if (matchMode === "team-deathmatch") {
        messageEl.textContent = `Time expired. BLUE ${teamScores.blue} — RED ${teamScores.red}. ${
          won === null ? "The match is tied." : `${playerTank?.team === "blue" ? "Blue" : "Red"} wins!`
        }`;
        startButton.textContent = "Redeploy";
        overlay.classList.add("visible");
        return;
      }
      if (matchMode === "survival") {
        const standing = tanks.filter((tank) => tank.alive);
        const leader = standing.sort((a, b) => b.hp - a.hp)[0];
        messageEl.textContent = won === null
          ? `Time expired at ${formatTime(matchTime)}. Survival ended in a draw.`
          : `Time expired at ${formatTime(matchTime)}. ${leader?.name || "The leader"} wins on remaining health.`;
        startButton.textContent = "Redeploy";
        overlay.classList.add("visible");
        return;
      }
      const remaining = tanks.filter((tank) => tank.alive && tank.team === playerTank?.team).length;
      const opposing = tanks.filter((tank) => tank.alive && tank.team !== playerTank?.team).length;
      messageEl.textContent = won === null
        ? `Time expired at ${formatTime(matchTime)} with the teams tied.`
        : `Time expired. Your team held ${remaining} tank${remaining === 1 ? "" : "s"} against ${opposing}.`;
    } else if (reason === "survival") {
      messageEl.textContent = won
        ? "You are the last tank standing. Survival victory!"
        : won === null ? "Every tank was eliminated. The Survival match is a draw."
          : "You were eliminated. Another tank survived the arena.";
    } else {
      messageEl.textContent = won
        ? `All hostiles eliminated in ${formatTime(matchTime)}. Your team owns the Steel Yard.`
        : "Your team has been destroyed. Regroup, switch weapons, and try a new approach.";
    }
    startButton.textContent = "Redeploy";
    overlay.classList.add("visible");
  }

  function timeLimitWinner() {
    if (matchMode === "team-deathmatch") {
      if (teamScores.blue === teamScores.red) return null;
      return playerTank?.team === "blue"
        ? teamScores.blue > teamScores.red
        : teamScores.red > teamScores.blue;
    }
    if (matchMode === "survival") {
      const standing = tanks.filter((tank) => tank.alive);
      if (!standing.length) return null;
      const bestHp = Math.max(...standing.map((tank) => tank.hp));
      const leaders = standing.filter((tank) => tank.hp === bestHp);
      if (leaders.length !== 1) return null;
      return leaders[0] === playerTank;
    }
    const blueLimit = multiplayer?.maxBlue || 3;
    const redLimit = multiplayer?.maxRed || 3;
    const blue = tanks.filter((tank) => tank.team === "blue" && tank.alive);
    const red = tanks.filter((tank) => tank.team === "red" && tank.alive);
    const blueStanding = blue.length / blueLimit;
    const redStanding = red.length / redLimit;
    if (blueStanding !== redStanding) return playerTank?.team === "blue" ? blueStanding > redStanding : redStanding > blueStanding;
    const blueHealth = blue.reduce((total, tank) => total + tank.hp, 0) / blueLimit;
    const redHealth = red.reduce((total, tank) => total + tank.hp, 0) / redLimit;
    if (blueHealth === redHealth) return null;
    return playerTank?.team === "blue" ? blueHealth > redHealth : redHealth > blueHealth;
  }

  function formatTime(seconds) {
    const safeSeconds = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(safeSeconds / 60).toString().padStart(2, "0");
    const secs = (safeSeconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  }

  function selectWeapon(index) {
    selectedWeapon = index;
    if (playerTank) playerTank.weaponId = index;
    updateWeaponUI();
    if (index === 1) recordTutorialAction("select", index);
    if (index === 2) recordTutorialAction("select", index);
  }

  function updateTutorialHUD() {
    if (!tutorial) {
      tutorialHud.hidden = true;
      return;
    }
    tutorialHud.hidden = false;
    const complete = tutorial.stage >= tutorialSteps.length;
    tutorialTitle.textContent = complete ? "Training complete!" : tutorialSteps[tutorial.stage].title;
    tutorialInstruction.textContent = complete
      ? "You are ready for battle. Return to the lobby to deploy in a match."
      : tutorialSteps[tutorial.stage].instruction;
    tutorialProgress.textContent = complete ? "07 / 07" : `${String(tutorial.stage + 1).padStart(2, "0")} / 07`;
    tutorialProgressBar.style.width = `${(tutorial.stage / tutorialSteps.length) * 100}%`;
    tutorialHud.classList.toggle("complete", complete);
    tutorialExitButton.textContent = complete ? "Return to lobby" : "Exit tutorial";
  }

  function advanceTutorial() {
    if (!tutorial || tutorial.stage >= tutorialSteps.length) return;
    tutorial.stage += 1;
    updateTutorialHUD();
  }

  function recordTutorialAction(action, weaponId, hasTarget = true) {
    if (!tutorial) return;
    if (action === "fire" && tutorial.stage === 2 && weaponId === 0) advanceTutorial();
    else if (action === "select" && tutorial.stage === 3 && weaponId === 1) advanceTutorial();
    else if (action === "fire" && tutorial.stage === 4 && weaponId === 1) {
      if (hasTarget) advanceTutorial();
      else tutorialInstruction.textContent = "No target in sight. Move until a tank is visible, then fire.";
    }
    else if (action === "select" && tutorial.stage === 5 && weaponId === 2) advanceTutorial();
    else if (action === "fire" && tutorial.stage === 6 && weaponId === 2) advanceTutorial();
  }

  function startTutorial() {
    tutorialSettings = {
      matchMode: matchModeSelect.value,
      playerLimit: playerLimitSelect.value,
      mode: modeSelect.value,
    };
    matchModeSelect.value = "survival";
    playerLimitSelect.value = "4";
    modeSelect.value = "practice";
    tutorial = { stage: 0, origin: null };
    resetMatch();
    tutorial.origin = { x: playerTank.x, y: playerTank.y };
    updateTutorialHUD();
  }

  function exitTutorial() {
    if (!tutorialSettings) return;
    const completed = tutorial.stage >= tutorialSteps.length;
    tutorial = null;
    gameRunning = false;
    gameOver = false;
    tutorialHud.hidden = true;
    matchModeSelect.value = tutorialSettings.matchMode;
    playerLimitSelect.value = tutorialSettings.playerLimit;
    modeSelect.value = tutorialSettings.mode;
    tutorialSettings = null;
    matchMode = matchModeSelect.value;
    matchDuration = selectedMatchDuration();
    matchTime = 0;
    tanks = [];
    playerTank = null;
    rockets = [];
    effects = [];
    dust = [];
    teamScores = { blue: 0, red: 0 };
    selectedWeapon = 0;
    updateMatchModeFields();
    updateModePresentation();
    updateHUD();
    overlay.classList.add("visible");
    titleEl.textContent = completed ? "Training complete." : "Training paused.";
    messageEl.textContent = completed
      ? "Your controls are ready. Start a quick match whenever you are ready."
      : "You can start training again any time. Start a quick match whenever you are ready.";
    startButton.textContent = "Quick match vs AI";
    updateMatchExitButton();
  }

  function updateMatchExitButton() {
    exitMatchButton.hidden = !(gameRunning || gameOver) || Boolean(tutorial);
  }

  function exitMatch() {
    if (tutorial) {
      exitTutorial();
      return;
    }
    const wasMultiplayer = Boolean(multiplayer);
    const notifiedServer = !wasMultiplayer || sendOnline({ type: "leaveRoom" });
    multiplayer = null;
    roomLobbyState = null;
    roomLobby.hidden = true;
    matchModeSelect.disabled = false;
    mapSelect.disabled = false;
    teamFormatSelect.disabled = false;
    playerLimitSelect.disabled = false;
    matchDurationSelect.disabled = false;
    gameRunning = false;
    gameOver = false;
    matchMode = matchModeSelect.value;
    selectedMapId = mapSelect.value;
    matchTime = 0;
    matchDuration = selectedMatchDuration();
    tanks = [];
    playerTank = null;
    rockets = [];
    effects = [];
    dust = [];
    teamScores = { blue: 0, red: 0 };
    selectedWeapon = 0;
    keys.clear();
    mouse.down = false;
    explored.fill(0);
    visibleTiles.fill(0);
    obstacles.splice(0, obstacles.length, ...mapDefinitions[selectedMapId].createObstacles());
    updateMatchModeFields();
    updateModePresentation();
    overlay.classList.add("visible");
    titleEl.textContent = "Match exited.";
    messageEl.textContent = "You have returned to the lobby. Start another match whenever you are ready.";
    startButton.textContent = "Quick match vs AI";
    updateHUD();
    updateMatchExitButton();
    if (wasMultiplayer) {
      setOnlineStatus(notifiedServer
        ? "You left the online match."
        : "Match ended locally, but the room server could not be reached.", !notifiedServer);
    }
  }

  function updateHUD() {
    const blue = tanks.filter((tank) => tank.alive && tank.team === "blue");
    const red = tanks.filter((tank) => tank.alive && tank.team === "red");
    const survivors = tanks.filter((tank) => tank.alive);
    blueCountEl.textContent = matchMode === "survival" ? survivors.length.toString()
      : matchMode === "team-deathmatch" ? teamScores.blue.toString() : blue.length.toString();
    redCountEl.textContent = matchMode === "survival" ? (multiplayer?.maxPlayers || tanks.length).toString()
      : matchMode === "team-deathmatch" ? teamScores.red.toString() : red.length.toString();
    const friendlyTeam = playerTank?.team || "blue";
    const friendlies = matchMode === "survival" ? tanks : tanks.filter((tank) => tank.team === friendlyTeam);
    alliesEl.replaceChildren();
    friendlies.forEach((tank) => {
      const percent = clamp(tank.hp / tank.maxHp * 100, 0, 100);
      const status = !tank.alive ? (matchMode === "survival" ? "OUT"
        : matchMode === "team-deathmatch" ? `RESPAWN ${tank.respawnTimer.toFixed(1)}s` : "KIA")
        : tank.hp < 30 ? "CRITICAL" : tank.isPlayer ? "YOU" : matchMode === "survival" ? "ALIVE" : "ACTIVE";
      const entry = document.createElement("div");
      entry.className = "tank-entry";
      const row = document.createElement("div");
      row.className = "tank-row";
      const icon = document.createElement("span");
      icon.className = "tank-icon";
      icon.style.background = tankColor(tank).body;
      icon.style.borderColor = tankColor(tank).body;
      const name = document.createElement("span");
      name.textContent = tank.name;
      const state = document.createElement("small");
      state.textContent = status;
      row.append(icon, name, state);
      const track = document.createElement("div");
      track.className = "health-track";
      const health = document.createElement("span");
      health.style.width = `${percent}%`;
      if (tank.hp < 30) health.style.background = "#f06450";
      track.append(health);
      entry.append(row, track);
      alliesEl.append(entry);
    });
    timerEl.textContent = formatTime(matchDuration ? Math.max(0, matchDuration - matchTime) : matchTime);
    timerEl.setAttribute("aria-label", matchDuration ? "Match time remaining" : "Match elapsed time");
    updateWeaponUI();
  }

  function updateWeaponUI() {
    const weapon = weapons[selectedWeapon];
    if (!playerTank) {
      weaponNameEl.textContent = weapon.name;
      weaponSlotEl.textContent = `0${selectedWeapon + 1} / 03`;
      weaponInfoEl.textContent = ["Balanced · quick reload", "Tracks visible targets", "Splash damage · slow"][selectedWeapon];
      reloadBarEl.style.width = "100%";
      reloadCaptionEl.textContent = "READY TO FIRE";
      return;
    }
    const ammo = playerTank.ammo[selectedWeapon];
    weaponNameEl.textContent = weapon.name;
    weaponSlotEl.textContent = `0${selectedWeapon + 1} / 03`;
    weaponInfoEl.textContent = `${["Balanced · quick reload", "Tracks visible targets", "Splash damage · slow"][selectedWeapon]} · ${ammo}/${weapon.capacity} rounds`;
    const reloadTimer = playerTank.reloadTimers[selectedWeapon];
    const fireCooldown = playerTank.fireCooldowns[selectedWeapon];
    const progress = reloadTimer > 0
      ? 1 - reloadTimer / playerTank.reloadDurations[selectedWeapon]
      : fireCooldown > 0 ? 1 - fireCooldown / weapon.reload : 1;
    reloadBarEl.style.width = `${clamp(progress * 100, 0, 100)}%`;
    reloadCaptionEl.textContent = reloadTimer > 0
      ? `RELOADING ${reloadTimer.toFixed(1)}s`
      : fireCooldown > 0 ? `TUBE RESET ${fireCooldown.toFixed(1)}s` : "READY TO FIRE";
  }

  function updateCamera() {
    if (!playerTank) {
      camera.x = 0;
      camera.y = 0;
      return;
    }
    const viewport = canvasViewport();
    camera.x = clamp(playerTank.x - viewport.width / 2, 0, WORLD.width - viewport.width);
    camera.y = clamp(playerTank.y - viewport.height / 2, 0, WORLD.height - viewport.height);
  }

  function canvasViewport() {
    return { width: canvas.width / renderScale, height: canvas.height / renderScale };
  }

  function resizeCanvasToDisplaySize() {
    if (document.fullscreenElement !== document.querySelector(".game-shell")) {
      if (canvas.width !== 1000 || canvas.height !== 650) {
        canvas.width = 1000;
        canvas.height = 650;
      }
      renderScale = 1;
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.round(rect.width * pixelRatio));
    const height = Math.max(1, Math.round(rect.height * pixelRatio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    renderScale = Math.max(canvas.width / 1000, canvas.height / 650);
  }

  function worldMouse() {
    return { x: mouse.x + camera.x, y: mouse.y + camera.y };
  }

  function createExplosion(x, y, radius, color, strength) {
    effects.push({ type: "explosion", x, y, radius, color, life: 0.58, maxLife: 0.58, strength });
    effects.push({ type: "smoke", x, y, radius: radius * 0.6, color: "#657166", life: 1.2, maxLife: 1.2 });
    shake = Math.max(shake, strength);
    playSound("explosion");
    for (let i = 0; i < Math.min(25, 9 + Math.floor(radius / 5)); i += 1) {
      const angle = Math.random() * TAU;
      const speed = 50 + Math.random() * (100 + radius * 1.2);
      effects.push({
        type: "spark", x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        radius: 1.5 + Math.random() * 3, color: i % 3 ? color : "#ffdda0", life: 0.35 + Math.random() * 0.4,
      });
    }
  }

  function fireRocket(tank, targetOverride) {
    if (!tank || !tank.alive) return false;
    const weaponId = tank.isPlayer ? selectedWeapon : tank.weaponId;
    const weapon = weapons[weaponId];
    if (tank.fireCooldowns[weaponId] > 0 || tank.reloadTimers[weaponId] > 0) return false;
    if (tank.ammo[weaponId] <= 0) {
      tank.reloadDurations[weaponId] = weapon.reload * (weaponId === 0 ? 2.2 : 2.8);
      tank.reloadTimers[weaponId] = tank.reloadDurations[weaponId];
      return false;
    }
    const target = targetOverride || worldMouse();
    let angle = Math.atan2(target.y - tank.y, target.x - tank.x);
    if (!tank.isPlayer && weapon.turn === 0) angle = tank.turret;
    const x = tank.x + Math.cos(angle) * 25;
    const y = tank.y + Math.sin(angle) * 25;
    let homingTarget = null;
    if (weaponId === 1) {
      const candidates = getVisibleEnemies(tank.team);
      homingTarget = targetOverride && candidates.includes(targetOverride)
        ? targetOverride
        : candidates.sort((a, b) => distance(tank, a) - distance(tank, b))[0] || null;
      if (homingTarget) angle = Math.atan2(homingTarget.y - tank.y, homingTarget.x - tank.x);
    }
    const rocket = {
      x, y, vx: Math.cos(angle) * weapon.speed, vy: Math.sin(angle) * weapon.speed,
      angle, team: tank.team, owner: tank, weaponId, target: homingTarget,
      life: weapon.range / weapon.speed, maxLife: weapon.range / weapon.speed,
      color: weapon.color, trail: [],
    };
    rockets.push(rocket);
    if (multiplayer && multiplayer.connected &&
        (tank.isPlayer || (multiplayer.isHost && !tank.remote && !tank.networkId))) {
      sendOnline({
        type: "fireRocket",
        shot: { x, y, angle, weaponId, targetId: homingTarget?.id ?? null, tankId: tank.id },
      });
    }
    tank.ammo[weaponId] -= 1;
    tank.fireCooldowns[weaponId] = weapon.reload;
    if (tank.ammo[weaponId] <= 0) {
      tank.reloadDurations[weaponId] = weapon.reload * (weaponId === 0 ? 2.2 : 2.8);
      tank.reloadTimers[weaponId] = tank.reloadDurations[weaponId];
    }
    createMuzzle(x, y, angle, weapon.color);
    playSound("fire", weaponId);
    recordTutorialAction("fire", weaponId, Boolean(homingTarget));
    return true;
  }

  function spawnRemoteRocket(message) {
    const owner = tanks.find((tank) => tank.id === message.tankId) ||
      tanks.find((tank) => tank.networkId === message.playerId);
    const shot = message.shot;
    if (!owner || !owner.alive || !shot) return;
    const weapon = weapons[shot.weaponId];
    if (!weapon) return;
    const target = Number.isInteger(shot.targetId) ? tanks.find((tank) => tank.id === shot.targetId) : null;
    rockets.push({
      id: `net-${message.playerId}-${receivedShotCounter++}`,
      x: shot.x, y: shot.y,
      vx: Math.cos(shot.angle) * weapon.speed,
      vy: Math.sin(shot.angle) * weapon.speed,
      angle: shot.angle, team: owner.team, owner, weaponId: shot.weaponId, target,
      life: weapon.range / weapon.speed, maxLife: weapon.range / weapon.speed,
      color: weapon.color, trail: [],
    });
    createMuzzle(shot.x, shot.y, shot.angle, weapon.color);
    playSound("fire", shot.weaponId);
  }

  function createMuzzle(x, y, angle, color) {
    for (let i = 0; i < 4; i += 1) {
      effects.push({ type: "spark", x, y, vx: Math.cos(angle) * (65 + i * 18), vy: Math.sin(angle) * (65 + i * 18),
        radius: 2 + Math.random() * 2, color, life: 0.16 + Math.random() * 0.1 });
    }
  }

  function damageTank(tank, amount, attacker = null) {
    if (!tank.alive || tank.invulnerable > 0 || tutorial) return;
    if (attacker && attacker.team !== tank.team) tank.lastDamagedBy = attacker;
    tank.hp = Math.max(0, tank.hp - amount);
    tank.damagedSmoke = 0.3;
    if (tank.hp <= 0) {
      tank.alive = false;
      if (matchMode === "team-deathmatch") tank.respawnTimer = 3;
      createExplosion(tank.x, tank.y, 75, tankColor(tank).body, 12);
      if (matchMode === "team-deathmatch" && tank.lastDamagedBy) {
        teamScores[tank.lastDamagedBy.team] += 1;
      }
      if (tank.isPlayer && !multiplayer &&
          matchMode !== "survival" && matchMode !== "team-deathmatch") endMatch(false);
    }
  }

  function explodeRocket(rocket, hitTank) {
    const weapon = weapons[rocket.weaponId];
    const blastRadius = weapon.radius || 30;
    createExplosion(rocket.x, rocket.y, weapon.radius ? blastRadius : 20, weapon.color, weapon.radius ? 14 : 5);
    if (weapon.radius > 0) {
      tanks.forEach((tank) => {
        if (!tank.alive || tank.team === rocket.team) return;
        const dist = distance(rocket, tank);
        if (dist <= blastRadius && !lineBlocked(rocket.x, rocket.y, tank.x, tank.y)) {
          const falloff = Math.max(0.24, 1 - dist / blastRadius);
          damageTank(tank, weapon.damage * falloff, rocket.owner);
        }
      });
    } else if (hitTank && hitTank.team !== rocket.team) {
      damageTank(hitTank, weapon.damage, rocket.owner);
    }
  }

  function moveTank(tank, dt, desiredAngle, throttle, handbrake) {
    const difficulty = difficultyScale[difficultySelect.value] || 1;
    const turning = tank.isPlayer ? 3.25 : (2.1 + difficulty * 0.4);
    const angleDiff = normalizeAngle(desiredAngle - tank.angle);
    tank.angle += clamp(angleDiff, -turning * dt, turning * dt);

    const forwardX = Math.cos(tank.angle);
    const forwardY = Math.sin(tank.angle);
    const acceleration = tank.isPlayer ? 390 : 260 * difficulty;
    const maxSpeed = tank.isPlayer ? 245 : 175 * difficulty;
    const drive = throttle * acceleration;
    tank.vx += forwardX * drive * dt;
    tank.vy += forwardY * drive * dt;

    const grip = handbrake ? 0.65 : 4.2;
    const forwardSpeed = tank.vx * forwardX + tank.vy * forwardY;
    const lateralX = tank.vx - forwardX * forwardSpeed;
    const lateralY = tank.vy - forwardY * forwardSpeed;
    tank.vx -= lateralX * Math.min(1, grip * dt);
    tank.vy -= lateralY * Math.min(1, grip * dt);
    const drag = handbrake ? 0.45 : (throttle === 0 ? 1.65 : 0.42);
    tank.vx *= Math.max(0, 1 - drag * dt);
    tank.vy *= Math.max(0, 1 - drag * dt);
    const currentSpeed = Math.hypot(tank.vx, tank.vy);
    if (currentSpeed > maxSpeed) {
      tank.vx = tank.vx / currentSpeed * maxSpeed;
      tank.vy = tank.vy / currentSpeed * maxSpeed;
    }
    tank.speed = Math.hypot(tank.vx, tank.vy);

    const nextX = tank.x + tank.vx * dt;
    const nextY = tank.y + tank.vy * dt;
    const oldX = tank.x;
    const oldY = tank.y;
    if (tankCanOccupy(tank, nextX, tank.y)) tank.x = nextX;
    else tank.vx *= -0.16;
    if (tankCanOccupy(tank, tank.x, nextY)) tank.y = nextY;
    else tank.vy *= -0.16;

    if (handbrake && tank.speed > 75 && Math.random() < 0.45) {
      dust.push({ x: tank.x - forwardX * 16, y: tank.y - forwardY * 16,
        vx: (oldX - tank.x) * 1.5 + (Math.random() - 0.5) * 30,
        vy: (oldY - tank.y) * 1.5 + (Math.random() - 0.5) * 30,
        life: 0.45 + Math.random() * 0.25, maxLife: 0.7, radius: 3 + Math.random() * 5 });
    }
  }

  function updatePlayer(dt) {
    if (!playerTank || !playerTank.alive) return;
    let moveX = (keys.has("d") ? 1 : 0) - (keys.has("a") ? 1 : 0);
    let moveY = (keys.has("s") ? 1 : 0) - (keys.has("w") ? 1 : 0);
    const magnitude = Math.hypot(moveX, moveY);
    if (magnitude > 0) { moveX /= magnitude; moveY /= magnitude; }
    if (magnitude > 0) {
      const desired = Math.atan2(moveY, moveX);
      const reverse = Math.abs(normalizeAngle(desired - playerTank.angle)) > Math.PI * 0.64;
      moveTank(playerTank, dt, reverse ? normalizeAngle(desired + Math.PI) : desired,
        reverse ? -1 : 1, keys.has(" ") || keys.has("shift"));
    } else {
      moveTank(playerTank, dt, playerTank.angle, 0, keys.has(" ") || keys.has("shift"));
    }
    if (tutorial?.stage === 0 && tutorial.origin &&
        distance(playerTank, tutorial.origin) >= 120) advanceTutorial();
    else if (tutorial?.stage === 1 && (keys.has(" ") || keys.has("shift")) && playerTank.speed > 70) {
      advanceTutorial();
    }
    const aim = worldMouse();
    playerTank.turret = Math.atan2(aim.y - playerTank.y, aim.x - playerTank.x);
    if (mouse.down) fireRocket(playerTank);
  }

  function aiTarget(tank) {
    const visible = getVisibleEnemies(tank.team);
    if (visible.length) {
      return visible.sort((a, b) => distance(tank, a) - distance(tank, b))[0];
    }
    return null;
  }

  function nearestCoverPoint(tank, threat) {
    let best = null;
    let bestScore = Infinity;
    obstacles.forEach((obstacle) => {
      if (obstacle.type === "grass" || (obstacle.type === "crate" && obstacle.hp <= 0)) return;
      const cx = obstacle.x + obstacle.w / 2;
      const cy = obstacle.y + obstacle.h / 2;
      const away = Math.atan2(cy - threat.y, cx - threat.x);
      const px = cx + Math.cos(away) * (Math.max(obstacle.w, obstacle.h) / 2 + 54);
      const py = cy + Math.sin(away) * (Math.max(obstacle.w, obstacle.h) / 2 + 54);
      if (!tankCanOccupy(tank, px, py)) return;
      const protectedByCover = lineBlocked(px, py, threat.x, threat.y);
      const score = distance(tank, { x: px, y: py }) + (protectedByCover ? 0 : 260);
      if (score < bestScore) { bestScore = score; best = { x: px, y: py }; }
    });
    return best;
  }

  function dodgePoint(tank) {
    const incoming = rockets.find((rocket) => rocket.team !== tank.team &&
      Math.hypot(rocket.x - tank.x, rocket.y - tank.y) < 260);
    if (!incoming) return null;
    const side = Math.random() < 0.5 ? -1 : 1;
    return { x: tank.x + Math.cos(tank.angle + side * Math.PI / 2) * 125,
      y: tank.y + Math.sin(tank.angle + side * Math.PI / 2) * 125 };
  }

  function updateAI(tank, dt) {
    const target = aiTarget(tank);
    tank.aiThink -= dt;
    tank.invulnerable = Math.max(0, tank.invulnerable - dt);
    const critical = tank.hp < 29;
    tank.retreat = critical;

    if (target) {
      const targetAngle = Math.atan2(target.y - tank.y, target.x - tank.x);
      tank.turret += clamp(normalizeAngle(targetAngle - tank.turret), -3.5 * dt, 3.5 * dt);
      const targetDistance = distance(tank, target);
      const preferred = tank.weaponId === 2 ? 330 : tank.weaponId === 1 ? 390 : 310;
      const directSight = canSee(tank, target, weapons[tank.weaponId].range);
      let goalAngle = targetAngle;
      let throttle = 0.55;

      if (tank.retreat || targetDistance < 175) {
        goalAngle = normalizeAngle(targetAngle + Math.PI);
        throttle = 0.8;
      } else if (!directSight) {
        goalAngle = normalizeAngle(targetAngle + tank.strafe * Math.PI / 2);
        throttle = 0.78;
      } else if (targetDistance > preferred + 65) {
        throttle = 0.9;
      } else {
        goalAngle = normalizeAngle(targetAngle + tank.strafe * Math.PI / 2);
        throttle = 0.48;
      }

      if (tank.aiThink <= 0) {
        tank.aiThink = 0.5 + Math.random() * 0.45;
        tank.strafe = Math.random() < 0.5 ? -1 : 1;
        const dodge = dodgePoint(tank);
        if (dodge) { tank.targetX = dodge.x; tank.targetY = dodge.y; }
        else if (tank.hp < 58 || !directSight) {
          const cover = nearestCoverPoint(tank, target);
          if (cover) { tank.targetX = cover.x; tank.targetY = cover.y; }
        }
      }
      if (Math.hypot(tank.targetX - tank.x, tank.targetY - tank.y) > 50 && tank.aiThink > 0.12) {
        goalAngle = Math.atan2(tank.targetY - tank.y, tank.targetX - tank.x);
        throttle = 0.75;
      }

      const difficulty = difficultyScale[difficultySelect.value] || 1;
      const aimError = (1.15 - difficulty) * (Math.random() - 0.5);
      const shotTarget = { x: target.x, y: target.y };
      if (modeSelect.value === "practice" && (matchMode === "survival" || tank.team === "red")) {
        throttle = targetDistance > 250 ? 0.3 : 0.12;
      } else if (directSight && Math.abs(normalizeAngle(tank.turret - targetAngle)) < 0.33 + (1.15 - difficulty) * 0.45 &&
        targetDistance < weapons[tank.weaponId].range * 0.78 && Math.random() < dt * (1.25 + difficulty * 0.7)) {
        const leadTime = Math.min(targetDistance / weapons[tank.weaponId].speed, 0.55);
        const aim = { x: shotTarget.x + (target.vx || 0) * leadTime + Math.cos(targetAngle + aimError) * 22,
          y: shotTarget.y + (target.vy || 0) * leadTime + Math.sin(targetAngle + aimError) * 22 };
        fireRocket(tank, tank.weaponId === 1 ? target : aim);
      }
      moveTank(tank, dt, avoidObstacleAngle(tank, goalAngle), throttle, false);
    } else {
      const leader = tanks.find((other) => other.isPlayer && other.alive);
      const isFriendly = tank.team === "blue";
      let goal;
      if (matchMode === "survival") {
        const patrolPoints = [
          { x: 620, y: 250 }, { x: 900, y: 250 }, { x: 1180, y: 250 },
          { x: 620, y: 950 }, { x: 900, y: 950 }, { x: 1180, y: 950 },
        ];
        goal = patrolPoints[tank.id % patrolPoints.length];
      } else if (isFriendly && leader) {
        const offset = tank.id === 1 ? -78 : 78;
        goal = { x: leader.x - Math.cos(leader.angle) * 105 - Math.sin(leader.angle) * offset,
          y: leader.y - Math.sin(leader.angle) * 105 + Math.cos(leader.angle) * offset };
        if (distance(tank, goal) < 55) {
          moveTank(tank, dt, tank.angle, 0, false);
          return;
        }
      } else {
        goal = { x: tank.team === "red" ? 1180 : 620, y: tank.id % 2 ? 370 : 820 };
      }
      const goalAngle = Math.atan2(goal.y - tank.y, goal.x - tank.x);
      const dodge = dodgePoint(tank);
      const desired = dodge ? Math.atan2(dodge.y - tank.y, dodge.x - tank.x) : goalAngle;
      moveTank(tank, dt, avoidObstacleAngle(tank, desired),
        dodge ? 0.95 : 0.55, false);
    }
  }

  function updateRockets(dt) {
    for (let i = rockets.length - 1; i >= 0; i -= 1) {
      const rocket = rockets[i];
      const weapon = weapons[rocket.weaponId];
      rocket.life -= dt;
      if (weapon.turn > 0 && rocket.target && rocket.target.alive &&
          canSee(rocket.owner, rocket.target, 900)) {
        const desired = Math.atan2(rocket.target.y - rocket.y, rocket.target.x - rocket.x);
        rocket.angle += clamp(normalizeAngle(desired - rocket.angle), -weapon.turn * dt, weapon.turn * dt);
        rocket.vx = Math.cos(rocket.angle) * weapon.speed;
        rocket.vy = Math.sin(rocket.angle) * weapon.speed;
      }
      rocket.trail.push({ x: rocket.x, y: rocket.y, life: 0.28 });
      if (rocket.trail.length > 10) rocket.trail.shift();
      rocket.trail.forEach((point) => { point.life -= dt; });
      const nextX = rocket.x + rocket.vx * dt;
      const nextY = rocket.y + rocket.vy * dt;
      const hitObstacle = obstacles.find((obstacle) => obstacle.type !== "grass" &&
        circleRectCollision(nextX, nextY, 5, obstacle));
      if (hitObstacle) {
        if (hitObstacle.type === "crate") {
          hitObstacle.hp -= weapon.damage * (weapon.radius ? 0.8 : 1);
          if (hitObstacle.hp <= 0) {
            const obstacleIndex = obstacles.indexOf(hitObstacle);
            obstacles.splice(obstacleIndex, 1);
            createExplosion(hitObstacle.x + hitObstacle.w / 2, hitObstacle.y + hitObstacle.h / 2, 38, "#d3a45e", 4);
          }
        }
        rocket.x = nextX; rocket.y = nextY;
        explodeRocket(rocket, null);
        rockets.splice(i, 1);
        continue;
      }
      rocket.x = nextX;
      rocket.y = nextY;
      const hitTank = tanks.find((tank) => tank.alive && tank.team !== rocket.team &&
        Math.hypot(tank.x - rocket.x, tank.y - rocket.y) < TANK_RADIUS + 6);
      if (hitTank) {
        explodeRocket(rocket, hitTank);
        rockets.splice(i, 1);
        continue;
      }
      if (rocket.life <= 0 || rocket.x < 0 || rocket.y < 0 || rocket.x > WORLD.width || rocket.y > WORLD.height) {
        if (weapon.radius > 0) explodeRocket(rocket, null);
        rockets.splice(i, 1);
      }
    }
  }

  function updateVisibility(dt) {
    visionTimer -= dt;
    if (visionTimer > 0) return;
    visionTimer = 0.14;
    visibleTiles.fill(0);
    const cols = WORLD.width / TILE;
    const rows = WORLD.height / TILE;
    const scouts = matchMode === "survival"
      ? tanks.filter((tank) => tank.alive && tank.isPlayer)
      : tanks.filter((tank) => tank.alive && tank.team === (playerTank?.team || "blue"));
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const index = row * gridWidth + col;
        const point = { x: col * TILE + TILE / 2, y: row * TILE + TILE / 2, alive: true };
        for (const tank of scouts) {
          const radius = tank === playerTank ? 590 : 470;
          const dx = tank.x - point.x;
          const dy = tank.y - point.y;
          if (dx * dx + dy * dy <= radius * radius && !lineBlocked(tank.x, tank.y, point.x, point.y)) {
            visibleTiles[index] = 1;
            explored[index] = 1;
            break;
          }
        }
      }
    }
  }

  function updateEffects(dt) {
    effects = effects.filter((effect) => {
      effect.life -= dt;
      if (effect.type === "spark") { effect.x += effect.vx * dt; effect.y += effect.vy * dt; }
      if (effect.type === "smoke") effect.radius += dt * 13;
      return effect.life > 0;
    });
    dust = dust.filter((particle) => {
      particle.life -= dt;
      particle.x += particle.vx * dt; particle.y += particle.vy * dt;
      return particle.life > 0;
    });
  }

  function updateRemoteTank(tank, dt) {
    if (!tank.targetState) return;
    const state = tank.targetState;
    const blend = Math.min(1, dt * 14);
    tank.x += (state.x - tank.x) * blend;
    tank.y += (state.y - tank.y) * blend;
    tank.angle += normalizeAngle(state.angle - tank.angle) * blend;
    tank.turret += normalizeAngle(state.turret - tank.turret) * blend;
    tank.vx = Number.isFinite(state.vx) ? state.vx : 0;
    tank.vy = Number.isFinite(state.vy) ? state.vy : 0;
    tank.hp = clamp(state.hp, 0, tank.maxHp);
    tank.invulnerable = Number.isFinite(state.invulnerable) ? Math.max(0, state.invulnerable) : 0;
    tank.respawnTimer = Number.isFinite(state.respawnTimer) ? Math.max(0, state.respawnTimer) : tank.respawnTimer;
    tank.weaponId = Number.isInteger(state.weaponId) ? clamp(state.weaponId, 0, 2) : tank.weaponId;
    if (Array.isArray(state.ammo) && state.ammo.length === 3) {
      tank.ammo = state.ammo.map((amount, index) => clamp(Number(amount) || 0, 0, weapons[index].capacity));
    }
    if (tank.alive && !state.alive) {
      tank.alive = false;
      createExplosion(tank.x, tank.y, 70, tankColor(tank).body, 8);
    } else {
      tank.alive = state.alive;
    }
  }

  function synchronizePlayer() {
    if (!multiplayer?.connected || !playerTank || !networkSocket || networkSocket.readyState !== WebSocket.OPEN) return;
    const stateFor = (tank) => ({
      x: tank.x, y: tank.y, angle: tank.angle, turret: tank.turret,
      hp: tank.hp, alive: tank.alive, weaponId: tank.weaponId, ammo: tank.ammo,
      vx: tank.vx, vy: tank.vy, invulnerable: tank.invulnerable, respawnTimer: tank.respawnTimer,
    });
    const bots = multiplayer.isHost
      ? tanks.filter((tank) => !tank.isPlayer && !tank.remote && !tank.networkId)
        .map((tank) => ({ id: tank.id, state: stateFor(tank) }))
      : [];
    sendOnline({
      type: "tankState",
      state: stateFor(playerTank),
      bots,
    });
  }

  function updateGame(dt) {
    matchTime += dt;
    if (playerTank) playerTank.invulnerable = Math.max(0, playerTank.invulnerable - dt);
    tanks.filter((tank) => tank.alive).forEach((tank) => {
      weapons.forEach((weapon, index) => {
        tank.fireCooldowns[index] = Math.max(0, tank.fireCooldowns[index] - dt);
        if (tank.reloadTimers[index] > 0) {
          tank.reloadTimers[index] = Math.max(0, tank.reloadTimers[index] - dt);
          if (tank.reloadTimers[index] === 0) tank.ammo[index] = weapon.capacity;
        }
      });
    });
    tanks.filter((tank) => tank.alive && !tank.isPlayer && !tank.remote).forEach((tank) => {
      updateAI(tank, dt);
      tank.damagedSmoke = Math.max(0, tank.damagedSmoke - dt);
    });
    tanks.filter((tank) => tank.remote).forEach((tank) => updateRemoteTank(tank, dt));
    updateRespawns(dt);
    updatePlayer(dt);
    updateRockets(dt);
    updateEffects(dt);
    updateCamera();
    updateVisibility(dt);
    networkSyncTimer -= dt;
    if (networkSyncTimer <= 0) {
      synchronizePlayer();
      networkSyncTimer = 0.05;
    }
    uiTimer += dt;
    if (uiTimer > 0.12) { updateHUD(); uiTimer = 0; }
    if (matchMode === "survival") {
      const standing = tanks.filter((tank) => tank.alive);
      if (standing.length <= 1) endMatch(standing[0] ? standing[0] === playerTank : null, "survival");
      else if (matchDuration > 0 && matchTime >= matchDuration) endMatch(timeLimitWinner(), "time");
    } else if (matchMode === "team-deathmatch") {
      if (matchDuration > 0 && matchTime >= matchDuration) endMatch(timeLimitWinner(), "time");
    } else {
      const blueAlive = tanks.some((tank) => tank.alive && tank.team === "blue");
      const redAlive = tanks.some((tank) => tank.alive && tank.team === "red");
      if (!redAlive) endMatch(playerTank?.team === "blue");
      else if (!blueAlive) endMatch(playerTank?.team === "red");
      else if (matchDuration > 0 && matchTime >= matchDuration) endMatch(timeLimitWinner(), "time");
    }
  }

  function drawGround() {
    const forest = mapDefinitions[selectedMapId].detail === "forest";
    ctx.fillStyle = mapDefinitions[selectedMapId].ground;
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);
    const light = ctx.createRadialGradient(WORLD.width * 0.48, WORLD.height * 0.42, 80,
      WORLD.width * 0.48, WORLD.height * 0.42, WORLD.width * 0.68);
    light.addColorStop(0, forest ? "rgba(255,224,164,.11)" : "rgba(195,224,177,.075)");
    light.addColorStop(1, "rgba(3,9,8,.32)");
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);
    const tileSize = forest ? 100 : 80;
    for (let row = 0; row < WORLD.height / tileSize; row += 1) {
      for (let col = 0; col < WORLD.width / tileSize; col += 1) {
        const x = col * tileSize;
        const y = row * tileSize;
        const alternate = (row + col) % 2 === 0;
        ctx.fillStyle = forest
          ? alternate ? "rgba(239,203,143,.035)" : "rgba(87,59,31,.035)"
          : alternate ? "rgba(196,222,176,.025)" : "rgba(3,12,9,.035)";
        ctx.fillRect(x, y, tileSize, tileSize);
      }
    }
    ctx.save();
    ctx.shadowColor = "rgba(2,7,5,.8)";
    ctx.shadowBlur = 24;
    ctx.strokeStyle = forest ? "rgba(250,224,173,.62)" : "rgba(171,194,149,.46)";
    ctx.lineWidth = 7;
    ctx.strokeRect(24, 24, WORLD.width - 48, WORLD.height - 48);
    ctx.restore();
    ctx.strokeStyle = forest ? "rgba(255,232,186,.28)" : "rgba(222,235,193,.2)";
    ctx.lineWidth = 2;
    ctx.strokeRect(27, 27, WORLD.width - 54, WORLD.height - 54);
    const floorEdge = ctx.createLinearGradient(0, WORLD.height - 36, 0, WORLD.height);
    floorEdge.addColorStop(0, "rgba(4,9,7,0)");
    floorEdge.addColorStop(1, "rgba(3,7,6,.34)");
    ctx.fillStyle = floorEdge;
    ctx.fillRect(24, WORLD.height - 36, WORLD.width - 48, 36);
    ctx.strokeStyle = forest ? "rgba(244,218,165,.14)" : "rgba(153,177,143,.045)";
    ctx.lineWidth = 1;
    if (!forest) {
      for (let x = 24; x < WORLD.width; x += 50) {
        ctx.beginPath(); ctx.moveTo(x, 24); ctx.lineTo(x, WORLD.height - 24); ctx.stroke();
      }
      for (let y = 24; y < WORLD.height; y += 50) {
        ctx.beginPath(); ctx.moveTo(24, y); ctx.lineTo(WORLD.width - 24, y); ctx.stroke();
      }
    }
    ctx.fillStyle = forest ? "rgba(237,202,138,.24)" : "rgba(139,158,119,.09)";
    for (let i = 0; i < (forest ? 190 : 95); i += 1) {
      const x = (i * 197 + 91) % WORLD.width;
      const y = (i * 113 + 41) % WORLD.height;
      ctx.beginPath();
      ctx.ellipse(x, y, forest ? 4 + i % 12 : 9 + i % 13,
        forest ? 3 + i % 5 : 3 + i % 4, i * 0.7, 0, TAU);
      ctx.fill();
    }
    ctx.strokeStyle = forest ? "rgba(255,226,170,.48)" : "rgba(182,203,164,.11)";
    ctx.setLineDash([12, 13]);
    ctx.strokeRect(24, 24, WORLD.width - 48, WORLD.height - 48);
    ctx.setLineDash([]);
  }

  function drawObstacle(obstacle) {
    if (obstacle.type === "grass") {
      ctx.fillStyle = "rgba(6,18,9,.2)";
      ctx.beginPath();
      ctx.ellipse(obstacle.x + obstacle.w / 2 + 3, obstacle.y + obstacle.h / 2 + 6,
        obstacle.w / 2 + 2, obstacle.h / 2 + 2, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = obstacle.color;
      ctx.beginPath();
      ctx.ellipse(obstacle.x + obstacle.w / 2, obstacle.y + obstacle.h / 2,
        obstacle.w / 2, obstacle.h / 2, 0, 0, TAU);
      ctx.fill();
      for (let blade = 0; blade < 18; blade += 1) {
        const x = obstacle.x + ((blade * 47 + 19) % obstacle.w);
        const y = obstacle.y + ((blade * 31 + 13) % obstacle.h);
        ctx.strokeStyle = blade % 2 ? "#53c653" : "#9be35a";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y + 8);
        ctx.quadraticCurveTo(x - 7, y, x - 3, y - 5);
        ctx.moveTo(x, y + 8);
        ctx.quadraticCurveTo(x + 6, y + 1, x + 5, y - 4);
        ctx.stroke();
      }
    } else if (obstacle.type === "stone") {
      ctx.fillStyle = "rgba(5,10,8,.35)";
      ctx.beginPath();
      ctx.ellipse(obstacle.x + obstacle.w / 2 + 4, obstacle.y + obstacle.h / 2 + 14,
        obstacle.w * 0.52, obstacle.h * 0.43, -0.12, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#414b40";
      ctx.beginPath();
      ctx.ellipse(obstacle.x + obstacle.w / 2, obstacle.y + obstacle.h / 2 + 7,
        obstacle.w / 2, obstacle.h / 2, -0.12, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#777f69";
      ctx.beginPath();
      ctx.ellipse(obstacle.x + obstacle.w / 2, obstacle.y + obstacle.h / 2,
        obstacle.w / 2, obstacle.h / 2, -0.12, 0, TAU);
      ctx.fill();
      const stoneLight = ctx.createLinearGradient(obstacle.x, obstacle.y, obstacle.x + obstacle.w, obstacle.y + obstacle.h);
      stoneLight.addColorStop(0, "#c5c99b");
      stoneLight.addColorStop(0.5, "#aeb38a");
      stoneLight.addColorStop(1, "#78836f");
      ctx.fillStyle = stoneLight;
      ctx.beginPath();
      ctx.ellipse(obstacle.x + obstacle.w * 0.4, obstacle.y + obstacle.h * 0.32,
        obstacle.w * 0.29, obstacle.h * 0.2, -0.2, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#56604f";
      ctx.lineWidth = 4;
      ctx.stroke();
    } else if (obstacle.type === "wall") {
      const depth = 19;
      const x = obstacle.x;
      const y = obstacle.y;
      const right = x + obstacle.w;
      const bottom = y + obstacle.h;
      ctx.fillStyle = "rgba(3,7,6,.42)";
      ctx.beginPath();
      ctx.moveTo(x + 9, y + 8);
      ctx.lineTo(right + 14, y + 8);
      ctx.lineTo(right + 14, bottom + depth + 5);
      ctx.lineTo(x + 9, bottom + depth + 5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#252e29";
      ctx.beginPath();
      ctx.moveTo(x, bottom);
      ctx.lineTo(right, bottom);
      ctx.lineTo(right, bottom + depth);
      ctx.lineTo(x, bottom + depth);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#303b34";
      ctx.beginPath();
      ctx.moveTo(right, y);
      ctx.lineTo(right + 11, y + 8);
      ctx.lineTo(right + 11, bottom + depth + 1);
      ctx.lineTo(right, bottom + depth);
      ctx.closePath();
      ctx.fill();
      const topSurface = ctx.createLinearGradient(x, y, right, bottom);
      topSurface.addColorStop(0, "#718269");
      topSurface.addColorStop(0.48, "#596451");
      topSurface.addColorStop(1, "#3d493f");
      ctx.fillStyle = topSurface;
      ctx.fillRect(x, y, obstacle.w, obstacle.h);
      const topLight = ctx.createLinearGradient(obstacle.x, obstacle.y, obstacle.x + obstacle.w, obstacle.y + obstacle.h);
      topLight.addColorStop(0, "rgba(196,218,173,.22)");
      topLight.addColorStop(1, "rgba(8,15,11,.18)");
      ctx.fillStyle = topLight;
      ctx.fillRect(obstacle.x + 3, obstacle.y + 3, obstacle.w - 6, Math.min(5, obstacle.h - 6));
      ctx.fillStyle = "rgba(173,194,154,.58)";
      ctx.fillRect(x, y, obstacle.w, 2);
      ctx.fillRect(x, y, 2, obstacle.h);
      ctx.fillStyle = "rgba(10,17,13,.45)";
      ctx.fillRect(x, bottom - 2, obstacle.w, 2);
      ctx.fillRect(right - 2, y, 2, obstacle.h);
      ctx.strokeStyle = "rgba(196,211,170,.14)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 7, y + 8, obstacle.w - 14, obstacle.h - 16);
      if (obstacle.w > obstacle.h) {
        for (let x = obstacle.x + 15; x < obstacle.x + obstacle.w; x += 35) {
          ctx.fillStyle = "#7d8a73"; ctx.fillRect(x, obstacle.y + 12, 3, 10);
          ctx.fillStyle = "rgba(15,22,18,.45)"; ctx.fillRect(x + 3, obstacle.y + 12, 2, 10);
        }
      } else {
        for (let y = obstacle.y + 18; y < obstacle.y + obstacle.h; y += 38) {
          ctx.fillStyle = "#7d8a73"; ctx.fillRect(obstacle.x + 12, y, 10, 3);
          ctx.fillStyle = "rgba(15,22,18,.45)"; ctx.fillRect(obstacle.x + 12, y + 3, 10, 2);
        }
      }
    } else if (obstacle.type === "barrier") {
      const depth = 12;
      ctx.fillStyle = "rgba(3,7,6,.32)";
      ctx.fillRect(obstacle.x + 7, obstacle.y + depth + 5, obstacle.w + 5, obstacle.h);
      ctx.fillStyle = "#303a35";
      ctx.beginPath();
      ctx.moveTo(obstacle.x, obstacle.y + obstacle.h);
      ctx.lineTo(obstacle.x + obstacle.w, obstacle.y + obstacle.h);
      ctx.lineTo(obstacle.x + obstacle.w + 7, obstacle.y + obstacle.h + depth);
      ctx.lineTo(obstacle.x + 7, obstacle.y + obstacle.h + depth);
      ctx.closePath();
      ctx.fill();
      const metalTop = ctx.createLinearGradient(obstacle.x, obstacle.y, obstacle.x, obstacle.y + obstacle.h);
      metalTop.addColorStop(0, "#a5ad91");
      metalTop.addColorStop(0.45, "#687565");
      metalTop.addColorStop(1, "#424d47");
      ctx.fillStyle = metalTop;
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
      ctx.fillStyle = "#d4d4ad";
      for (let x = obstacle.x + 9; x < obstacle.x + obstacle.w; x += 20) {
        ctx.fillRect(x, obstacle.y + 4, 9, obstacle.h - 8);
      }
      ctx.strokeStyle = "#c3a55d";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(obstacle.x + 5, obstacle.y + 4); ctx.lineTo(obstacle.x + obstacle.w - 5, obstacle.y + obstacle.h - 4); ctx.stroke();
    } else {
      const depth = 12;
      ctx.fillStyle = "rgba(3,7,6,.34)";
      ctx.fillRect(obstacle.x + 8, obstacle.y + depth + 5, obstacle.w + 5, obstacle.h);
      ctx.fillStyle = "#392c20";
      ctx.beginPath();
      ctx.moveTo(obstacle.x, obstacle.y + obstacle.h);
      ctx.lineTo(obstacle.x + obstacle.w, obstacle.y + obstacle.h);
      ctx.lineTo(obstacle.x + obstacle.w, obstacle.y + obstacle.h + depth);
      ctx.lineTo(obstacle.x, obstacle.y + obstacle.h + depth);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#4c3926";
      ctx.beginPath();
      ctx.moveTo(obstacle.x + obstacle.w, obstacle.y);
      ctx.lineTo(obstacle.x + obstacle.w + 8, obstacle.y + 6);
      ctx.lineTo(obstacle.x + obstacle.w + 8, obstacle.y + obstacle.h + depth);
      ctx.lineTo(obstacle.x + obstacle.w, obstacle.y + obstacle.h + depth);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#765b38";
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
      const crateTop = ctx.createLinearGradient(obstacle.x, obstacle.y, obstacle.x + obstacle.w, obstacle.y + obstacle.h);
      crateTop.addColorStop(0, "#b78b50");
      crateTop.addColorStop(1, "#705333");
      ctx.fillStyle = crateTop;
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
      ctx.fillStyle = "#d0a467";
      ctx.fillRect(obstacle.x + 5, obstacle.y + 5, obstacle.w - 10, 7);
      ctx.strokeStyle = "#493522";
      ctx.lineWidth = 3;
      ctx.strokeRect(obstacle.x + 4, obstacle.y + 4, obstacle.w - 8, obstacle.h - 8);
      ctx.strokeStyle = "rgba(224,183,117,.68)";
      ctx.beginPath();
      ctx.moveTo(obstacle.x + 8, obstacle.y + 8); ctx.lineTo(obstacle.x + obstacle.w - 8, obstacle.y + obstacle.h - 8);
      ctx.moveTo(obstacle.x + obstacle.w - 8, obstacle.y + 8); ctx.lineTo(obstacle.x + 8, obstacle.y + obstacle.h - 8);
      ctx.stroke();
      ctx.fillStyle = "rgba(224,183,117,.32)";
      ctx.fillRect(obstacle.x + 8, obstacle.y + 12, 4, obstacle.h - 24);
      if (obstacle.hp < obstacle.maxHp) {
        ctx.fillStyle = "#211d17"; ctx.fillRect(obstacle.x, obstacle.y - 12, obstacle.w, 4);
        ctx.fillStyle = "#d3aa68"; ctx.fillRect(obstacle.x, obstacle.y - 12, obstacle.w * obstacle.hp / obstacle.maxHp, 4);
      }
    }
  }

  function drawTank(tank) {
    if (!tank.alive) return;
    const palette = tankColor(tank);
    const color = palette.body;
    const dark = palette.dark;
    ctx.fillStyle = "rgba(0,0,0,.4)";
    ctx.beginPath();
    ctx.ellipse(tank.x + 4, tank.y + 10, 25, 19, 0, 0, TAU);
    ctx.fill();
    ctx.save();
    ctx.translate(tank.x, tank.y + 5);
    ctx.rotate(tank.angle);
    ctx.fillStyle = "#131a17";
    ctx.fillRect(-19, -16, 38, 6);
    ctx.fillRect(-19, 10, 38, 6);
    ctx.fillStyle = "#85917a";
    for (let x = -15; x <= 14; x += 8) {
      ctx.fillRect(x, -15, 3, 4);
      ctx.fillRect(x, 11, 3, 4);
    }
    ctx.fillStyle = "#0d1311";
    ctx.fillRect(-17, 8, 34, 3);
    ctx.fillStyle = dark;
    ctx.fillRect(-17, -11, 34, 22);
    const hull = ctx.createLinearGradient(0, -10, 0, 12);
    hull.addColorStop(0, palette.light);
    hull.addColorStop(0.26, color);
    hull.addColorStop(1, dark);
    ctx.fillStyle = hull;
    ctx.fillRect(-13, -10, 26, 19);
    ctx.fillStyle = "rgba(245,255,235,.48)";
    ctx.fillRect(-10, -8, 7, 3);
    ctx.fillStyle = "rgba(8,16,13,.32)";
    ctx.fillRect(-12, 6, 24, 3);
    ctx.strokeStyle = "rgba(237,250,222,.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(-13, -10, 26, 19);
    ctx.restore();

    ctx.save();
    ctx.translate(tank.x, tank.y + 1);
    ctx.rotate(tank.turret);
    ctx.fillStyle = "rgba(0,0,0,.35)";
    ctx.fillRect(-5, -1, 29, 9);
    const barrel = ctx.createLinearGradient(0, -5, 0, 5);
    barrel.addColorStop(0, "#aeb8a0");
    barrel.addColorStop(0.45, "#48564d");
    barrel.addColorStop(1, "#202a25");
    ctx.fillStyle = barrel;
    ctx.fillRect(-4, -5, 29, 8);
    ctx.fillStyle = "#121b17";
    ctx.fillRect(20, -5, 7, 8);
    ctx.fillStyle = "rgba(224,239,214,.6)";
    ctx.fillRect(21, -4, 4, 2);
    ctx.fillStyle = "rgba(0,0,0,.32)";
    ctx.beginPath(); ctx.ellipse(0, 3, 13, 12, 0, 0, TAU); ctx.fill();
    const turret = ctx.createRadialGradient(-5, -7, 2, 0, 0, 16);
    turret.addColorStop(0, palette.light);
    turret.addColorStop(0.55, color);
    turret.addColorStop(1, dark);
    ctx.fillStyle = turret;
    ctx.beginPath(); ctx.ellipse(0, 0, 12, 11, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = "rgba(239,252,223,.38)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(0, 0, 12, 11, 0, 0, TAU); ctx.stroke();
    ctx.restore();

    if (tank.isPlayer) {
      ctx.strokeStyle = "rgba(197,225,153,.8)";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(tank.x, tank.y, 25, 0, TAU); ctx.stroke();
      if (tank.invulnerable > 0 && Math.floor(tank.invulnerable * 12) % 2 === 0) {
        ctx.strokeStyle = "#d8f2ac"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(tank.x, tank.y, 31, 0, TAU); ctx.stroke();
      }
    }
    if (tank.hp < 100) {
      ctx.fillStyle = "#121712"; ctx.fillRect(tank.x - 20, tank.y - 30, 40, 4);
      ctx.fillStyle = palette.bar;
      ctx.fillRect(tank.x - 20, tank.y - 30, 40 * tank.hp / tank.maxHp, 4);
    }
    if (tank.damagedSmoke > 0 || tank.hp < 30) {
      if (Math.random() < 0.12) effects.push({ type: "smoke", x: tank.x + (Math.random() - 0.5) * 12,
        y: tank.y - 8, radius: 7 + Math.random() * 5, color: "#53584f", life: 0.7, maxLife: 0.7 });
    }
  }

  function drawRockets() {
    rockets.forEach((rocket) => {
      rocket.trail.forEach((point) => {
        ctx.globalAlpha = Math.max(0, point.life / 0.28) * 0.5;
        ctx.fillStyle = rocket.color;
        ctx.beginPath(); ctx.arc(point.x, point.y, 2 + point.life * 7, 0, TAU); ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(0,0,0,.35)";
      ctx.beginPath(); ctx.ellipse(rocket.x + 3, rocket.y + 6, 8, 3, 0, 0, TAU); ctx.fill();
      ctx.save();
      ctx.translate(rocket.x, rocket.y - 3);
      ctx.rotate(rocket.angle);
      ctx.shadowBlur = 13; ctx.shadowColor = rocket.color;
      ctx.fillStyle = rocket.color;
      ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(-5, -4); ctx.lineTo(-3, 0); ctx.lineTo(-5, 4); ctx.closePath(); ctx.fill();
      ctx.restore();
      if (rocket.weaponId === 1 && rocket.target && rocket.target.alive) {
        ctx.strokeStyle = "rgba(255,117,201,.25)";
        ctx.setLineDash([4, 5]);
        ctx.beginPath(); ctx.moveTo(rocket.x, rocket.y); ctx.lineTo(rocket.target.x, rocket.target.y); ctx.stroke();
        ctx.setLineDash([]);
      }
    });
  }

  function drawEffects() {
    effects.forEach((effect) => {
      const alpha = clamp(effect.life / effect.maxLife, 0, 1);
      if (effect.type === "explosion") {
        const progress = 1 - alpha;
        const radius = effect.radius * (0.22 + progress * 0.78);
        ctx.globalAlpha = alpha * 0.76;
        const gradient = ctx.createRadialGradient(effect.x, effect.y, 0, effect.x, effect.y, radius);
        gradient.addColorStop(0, "#fff2bd");
        gradient.addColorStop(0.32, effect.color);
        gradient.addColorStop(1, "rgba(232,77,40,0)");
        ctx.fillStyle = gradient;
        ctx.beginPath(); ctx.arc(effect.x, effect.y, radius, 0, TAU); ctx.fill();
        ctx.globalAlpha = 1;
      } else if (effect.type === "smoke") {
        ctx.globalAlpha = alpha * 0.22;
        ctx.fillStyle = effect.color;
        ctx.beginPath(); ctx.arc(effect.x, effect.y, effect.radius, 0, TAU); ctx.fill();
        ctx.globalAlpha = 1;
      } else if (effect.type === "spark") {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = effect.color;
        ctx.beginPath(); ctx.arc(effect.x, effect.y, effect.radius, 0, TAU); ctx.fill();
        ctx.globalAlpha = 1;
      }
    });
    dust.forEach((particle) => {
      ctx.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1) * 0.3;
      ctx.fillStyle = "#c5c3a1";
      ctx.beginPath(); ctx.arc(particle.x, particle.y, particle.radius, 0, TAU); ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function drawFog() {
    for (let row = 0; row < WORLD.height / TILE; row += 1) {
      for (let col = 0; col < gridWidth; col += 1) {
        const x = col * TILE + TILE / 2;
        const y = row * TILE + TILE / 2;
        const visible = visibleTiles[row * gridWidth + col] === 1;
        if (visible) continue;
        const discovered = explored[row * gridWidth + col] === 1;
        ctx.fillStyle = discovered ? "rgba(4,8,7,.64)" : "rgba(3,6,5,.94)";
        ctx.fillRect(col * TILE, row * TILE, TILE + 1, TILE + 1);
      }
    }
  }

  function drawMinimap() {
    const scaleX = radar.width / WORLD.width;
    const scaleY = radar.height / WORLD.height;
    radarCtx.fillStyle = mapDefinitions[selectedMapId].detail === "forest" ? "#a9824e" : "#141d16";
    radarCtx.fillRect(0, 0, radar.width, radar.height);
    obstacles.forEach((obstacle) => {
      radarCtx.fillStyle = obstacle.type === "grass" ? "#36b94b"
        : obstacle.type === "stone" ? "#aab394" : "#344033";
      radarCtx.fillRect(obstacle.x * scaleX, obstacle.y * scaleY,
        Math.max(1, obstacle.w * scaleX), Math.max(1, obstacle.h * scaleY));
    });
    tanks.forEach((tank) => {
      if (!tank.alive || !tankVisibleToPlayer(tank)) return;
      radarCtx.fillStyle = tankColor(tank).map;
      radarCtx.beginPath();
      radarCtx.arc(tank.x * scaleX, tank.y * scaleY, tank.isPlayer ? 3.5 : 2.5, 0, TAU);
      radarCtx.fill();
    });
    radarCtx.strokeStyle = "rgba(171,203,155,.4)";
    const viewport = canvasViewport();
    radarCtx.strokeRect(camera.x * scaleX, camera.y * scaleY,
      viewport.width * scaleX, viewport.height * scaleY);
  }

  function draw() {
    const shakeX = shakeEnabled && shake > 0 ? (Math.random() - 0.5) * shake : 0;
    const shakeY = shakeEnabled && shake > 0 ? (Math.random() - 0.5) * shake : 0;
    const viewport = canvasViewport();
    ctx.save();
    ctx.setTransform(renderScale, 0, 0, renderScale, 0, 0);
    ctx.clearRect(0, 0, viewport.width, viewport.height);
    ctx.translate(-camera.x + shakeX, -camera.y + shakeY);
    drawGround();
    obstacles.filter((obstacle) => obstacle.type === "grass").forEach(drawObstacle);
    const depthLayers = [
      ...obstacles.filter((obstacle) => obstacle.type !== "grass")
        .map((obstacle) => ({
          depth: obstacle.y + obstacle.h + (obstacle.type === "wall" ? 19 : obstacle.type === "barrier" ? 12 : 12),
          draw: () => drawObstacle(obstacle),
        })),
      ...tanks.filter((tank) => tank.alive && tankVisibleToPlayer(tank))
        .map((tank) => ({ depth: tank.y + TANK_RADIUS, draw: () => drawTank(tank) })),
    ];
    depthLayers.sort((a, b) => a.depth - b.depth);
    depthLayers.forEach((layer) => layer.draw());
    drawRockets();
    drawEffects();
    drawFog();
    ctx.restore();
    drawMinimap();
  }

  function frame(timestamp) {
    const dt = Math.min((timestamp - (lastFrame || timestamp)) / 1000, 0.035);
    lastFrame = timestamp;
    if (gameRunning && !gameOver) {
      updateGame(dt);
      shake = Math.max(0, shake - dt * 20);
    }
    draw();
    requestAnimationFrame(frame);
  }

  function setMousePosition(event) {
    const rect = canvas.getBoundingClientRect();
    const viewport = canvasViewport();
    mouse.x = (event.clientX - rect.left) * viewport.width / rect.width;
    mouse.y = (event.clientY - rect.top) * viewport.height / rect.height;
  }

  function controlKey(event) {
    if (event.code.startsWith("Key")) return event.code.slice(3).toLowerCase();
    if (event.code.startsWith("Digit")) return event.code.slice(5);
    return event.code === "Space" ? " " : event.key.toLowerCase();
  }

  function isTextEntryTarget(target) {
    return target instanceof HTMLElement &&
      (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
  }

  function clearControls() {
    keys.clear();
    mouse.down = false;
  }

  window.addEventListener("pointermove", setMousePosition);
  canvas.addEventListener("pointerdown", (event) => {
    setMousePosition(event);
    canvas.focus({ preventScroll: true });
    if (event.button === 0) {
      mouse.down = true;
      fireRocket(playerTank);
    }
  });
  window.addEventListener("pointerup", (event) => { if (event.button === 0) mouse.down = false; });
  canvas.addEventListener("pointercancel", clearControls);
  canvas.addEventListener("contextmenu", (event) => event.preventDefault());
  window.addEventListener("keydown", (event) => {
    if (isTextEntryTarget(event.target)) return;
    const key = controlKey(event);
    if ([" ", "w", "a", "s", "d"].includes(key)) event.preventDefault();
    keys.add(key);
    if (key === "1") selectWeapon(0);
    if (key === "2") selectWeapon(1);
    if (key === "3") selectWeapon(2);
  });
  window.addEventListener("keyup", (event) => keys.delete(controlKey(event)));
  window.addEventListener("blur", clearControls);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearControls();
  });
  startButton.addEventListener("click", () => {
    activateAudio();
    if (multiplayer && gameOver) {
      sendOnline({ type: "leaveRoom" });
      multiplayer = null;
      roomLobbyState = null;
      roomLobby.hidden = true;
      matchModeSelect.disabled = false;
      mapSelect.disabled = false;
      teamFormatSelect.disabled = false;
      playerLimitSelect.disabled = false;
      matchDurationSelect.disabled = false;
      titleEl.textContent = "Lock and load.";
      messageEl.textContent = matchModeSelect.value === "survival"
        ? "Survival is free-for-all: eliminate everyone else and be the last tank standing."
        : "Lead your squad, break enemy lines, and destroy all three hostile tanks. Walls stop rockets and block vision.";
      startButton.textContent = "Quick match vs AI";
      gameOver = false;
      updateMatchExitButton();
      setOnlineStatus("You left the online match.");
      return;
    }
    resetMatch();
  });
  tutorialButton.addEventListener("click", () => {
    activateAudio();
    startTutorial();
  });
  tutorialExitButton.addEventListener("click", exitTutorial);
  exitMatchButton.addEventListener("click", exitMatch);
  publicMatchButton.addEventListener("click", () => lobbyAction("findPublic"));
  createRoomButton.addEventListener("click", () => lobbyAction("createPrivate"));
  joinRoomButton.addEventListener("click", () => {
    const code = roomCodeInput.value.trim().toUpperCase();
    if (code.length !== 6) {
      setOnlineStatus("Enter the six-character private room code.", true);
      return;
    }
    lobbyAction("joinPrivate", { code });
  });
  roomStartButton.addEventListener("click", () => sendOnline({ type: "startRoom" }));
  leaveRoomButton.addEventListener("click", () => {
    sendOnline({ type: "leaveRoom" });
    roomLobbyState = null;
    roomLobby.hidden = true;
    matchModeSelect.disabled = false;
    mapSelect.disabled = false;
    teamFormatSelect.disabled = false;
    playerLimitSelect.disabled = false;
    matchDurationSelect.disabled = false;
    setOnlineStatus("You left the room.");
  });
  copyRoomButton.addEventListener("click", async () => {
    if (!roomLobbyState?.code) return;
    try {
      await navigator.clipboard.writeText(roomLobbyState.code);
      setOnlineStatus(`Room code ${roomLobbyState.code} copied.`);
    } catch {
      setOnlineStatus(`Share this room code: ${roomLobbyState.code}`);
    }
  });
  playerNameInput.value = localStorage.getItem("ironclad-player-name") || "";
  playerNameInput.addEventListener("change", currentPlayerName);
  matchModeSelect.addEventListener("change", updateMatchModeFields);
  mapSelect.addEventListener("change", () => {
    selectedMapId = mapSelect.value;
    updateModePresentation();
  });
  shakeToggle.addEventListener("click", () => {
    shakeEnabled = !shakeEnabled;
    shakeToggle.textContent = `SHAKE: ${shakeEnabled ? "ON" : "OFF"}`;
    shakeToggle.setAttribute("aria-pressed", (!shakeEnabled).toString());
  });
  soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem("ironclad-sound-enabled", soundEnabled.toString());
    if (soundEnabled) activateAudio();
    updateSoundToggle();
  });
  function updateFullscreenButton() {
    const isFullscreen = document.fullscreenElement === document.querySelector(".game-shell");
    fullscreenToggle.textContent = isFullscreen ? "EXIT FULLSCREEN" : "FULLSCREEN";
    fullscreenToggle.setAttribute("aria-label", isFullscreen ? "Exit fullscreen" : "Enter fullscreen");
    fullscreenToggle.setAttribute("aria-pressed", isFullscreen.toString());
    fullscreenExit.hidden = !isFullscreen;
    resizeCanvasToDisplaySize();
  }
  fullscreenToggle.addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.querySelector(".game-shell").requestFullscreen();
      }
    } catch (error) {
      onlineStatus.textContent = `Fullscreen could not be changed: ${error.message}`;
      onlineStatus.classList.add("error");
    }
  });
  fullscreenExit.addEventListener("click", async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
  });
  document.addEventListener("fullscreenchange", updateFullscreenButton);
  document.addEventListener("fullscreenchange", resizeCanvasToDisplaySize);
  window.addEventListener("resize", resizeCanvasToDisplaySize);
  difficultySelect.addEventListener("change", () => { if (gameRunning) updateHUD(); });
  modeSelect.addEventListener("change", () => {
    messageEl.textContent = modeSelect.value === "practice"
      ? "Practice mode: enemy tanks will maneuver but will not fire back. Try all three rocket types."
      : matchModeSelect.value === "survival"
        ? "Survival is free-for-all: eliminate everyone else and be the last tank standing."
        : "Lead your squad, break enemy lines, and destroy all three hostile tanks. Walls stop rockets and block vision.";
  });

  updateMatchModeFields();
  updateModePresentation();
  updateSoundToggle();
  updateCamera();
  updateHUD();
  requestAnimationFrame(frame);
})();
