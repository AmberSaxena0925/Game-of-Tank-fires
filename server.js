"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { WebSocketServer, WebSocket } = require("ws");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 8080);
const MAX_ROOM_PLAYERS = 12;
const TEAM_FORMATS = new Set(["1v1", "2v2", "3v3", "2v3", "1v3"]);
const MATCH_MODES = new Set(["elimination", "survival", "team-deathmatch"]);
const MAP_IDS = new Set(["steel-yard", "forest"]);
const MATCH_DURATIONS = new Set([0, 300, 600, 900]);
const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};
const rooms = new Map();
const clients = new Map();

function send(socket, message) {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
}

function sendError(socket, message) {
  send(socket, { type: "error", message });
}

function sanitizeName(value) {
  const name = typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 18) : "";
  return name || "Player";
}

function parseFormat(value) {
  if (typeof value !== "string" || !TEAM_FORMATS.has(value)) return null;
  const [blue, red] = value.split("v").map(Number);
  return { name: value, blue, red };
}

function parseMode(value) {
  return typeof value === "string" && MATCH_MODES.has(value) ? value : null;
}

function parsePlayerLimit(value) {
  return Number.isInteger(value) && value >= 2 && value <= MAX_ROOM_PLAYERS ? value : null;
}

function parseMatchDuration(value) {
  const duration = value === undefined ? 300 : value;
  return Number.isInteger(duration) && MATCH_DURATIONS.has(duration) ? duration : null;
}

function roomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let index = 0; index < 6; index += 1) result += alphabet[Math.floor(Math.random() * alphabet.length)];
  return result;
}

function makeRoom(options) {
  let code = roomCode();
  while ([...rooms.values()].some((room) => room.code === code)) code = roomCode();
  const room = {
    id: randomUUID(),
    code,
    public: options.public,
    mode: options.mode,
    mapId: options.mapId,
    format: options.format.name,
    maxBlue: options.format.blue,
    maxRed: options.format.red,
    maxPlayers: options.maxPlayers,
    matchDuration: options.matchDuration,
    hostId: null,
    startRequested: false,
    phase: "waiting",
    players: new Map(),
  };
  rooms.set(room.id, room);
  return room;
}

function teamCounts(room) {
  let blue = 0;
  let red = 0;
  for (const player of room.players.values()) {
    if (player.team === "blue") blue += 1;
    else red += 1;
  }
  return { blue, red };
}

function reserveSeat(room) {
  if (room.mode === "survival") {
    const occupied = new Set([...room.players.values()].map((player) => player.slot));
    for (let slot = 0; slot < room.maxPlayers; slot += 1) {
      if (!occupied.has(slot)) return { team: "survival", slot };
    }
    return { team: "survival", slot: room.maxPlayers };
  }
  const counts = teamCounts(room);
  let team;
  if (counts.blue >= room.maxBlue) team = "red";
  else if (counts.red >= room.maxRed) team = "blue";
  else team = counts.blue <= counts.red ? "blue" : "red";
  const occupied = new Set([...room.players.values()]
    .filter((player) => player.team === team)
    .map((player) => player.slot));
  const limit = team === "blue" ? room.maxBlue : room.maxRed;
  let slot = 0;
  while (slot < limit && occupied.has(slot)) slot += 1;
  return { team, slot };
}

function roomSnapshot(room, viewerId) {
  const roster = [...room.players.values()].map((player) => ({
    id: player.id,
    name: player.name,
    team: player.team,
    slot: player.slot,
  }));
  const viewer = room.players.get(viewerId);
  return {
    type: "lobby",
    roomId: room.id,
    code: room.code,
    public: room.public,
    mode: room.mode,
    mapId: room.mapId,
    format: room.format,
    maxBlue: room.maxBlue,
    maxRed: room.maxRed,
    maxPlayers: room.maxPlayers,
    matchDuration: room.matchDuration,
    phase: room.phase,
    startRequested: room.startRequested,
    host: viewerId === room.hostId,
    playerId: viewerId,
    seat: viewer ? { team: viewer.team, slot: viewer.slot } : null,
    roster,
  };
}

function broadcastLobby(room) {
  for (const player of room.players.values()) send(player.socket, roomSnapshot(room, player.id));
}

function matchIsFull(room) {
  if (room.mode === "survival") return room.players.size >= room.maxPlayers;
  const counts = teamCounts(room);
  return counts.blue >= room.maxBlue && counts.red >= room.maxRed;
}

function roomHasTankId(room, tankId) {
  if (room.mode === "survival") return tankId >= 0 && tankId < room.maxPlayers;
  return (tankId >= 0 && tankId < room.maxBlue) ||
    (tankId >= 3 && tankId < 3 + room.maxRed);
}

function tankIdForPlayer(room, player) {
  if (room.mode === "survival") return player.slot;
  return player.team === "blue" ? player.slot : player.slot + 3;
}

function startRoom(room) {
  if (room.phase !== "waiting") return;
  room.phase = "started";
  const players = [...room.players.values()].map((player) => ({
    id: player.id,
    name: player.name,
    team: player.team,
    slot: player.slot,
  }));
  for (const player of room.players.values()) {
    send(player.socket, {
      type: "matchStart",
      roomId: room.id,
      code: room.code,
      mode: room.mode,
      mapId: room.mapId,
      format: room.format,
      maxBlue: room.maxBlue,
      maxRed: room.maxRed,
      maxPlayers: room.maxPlayers,
      matchDuration: room.matchDuration,
      hostId: room.hostId,
      players,
    });
  }
}

function addPlayer(socket, room, name) {
  if (room.phase !== "waiting") {
    sendError(socket, "That match has already started.");
    return false;
  }
  const capacity = room.mode === "survival" ? room.maxPlayers : room.maxBlue + room.maxRed;
  if (room.players.size >= capacity || room.players.size >= MAX_ROOM_PLAYERS) {
    sendError(socket, "That room is full.");
    return false;
  }
  const id = randomUUID();
  const seat = reserveSeat(room);
  const player = {
    id,
    name: sanitizeName(name),
    team: seat.team,
    slot: seat.slot,
    socket,
    lastStateAt: 0,
    lastShotAt: new Map(),
  };
  room.players.set(id, player);
  clients.set(socket, { id, roomId: room.id });
  if (!room.hostId) room.hostId = id;
  broadcastLobby(room);
  return true;
}

function getRoomFor(socket) {
  const membership = clients.get(socket);
  return membership ? rooms.get(membership.roomId) : null;
}

function processMessage(socket, data) {
  let message;
  try {
    message = JSON.parse(data.toString());
  } catch {
    sendError(socket, "Invalid message format.");
    return;
  }
  if (!message || typeof message.type !== "string") {
    sendError(socket, "Invalid message.");
    return;
  }

  if (message.type === "createPrivate" || message.type === "findPublic") {
    if (clients.has(socket)) {
      sendError(socket, "Leave your current room before joining another.");
      return;
    }
    const mode = parseMode(message.mode || "elimination");
    if (!mode) {
      sendError(socket, "Choose a valid match mode.");
      return;
    }
    const parsedFormat = parseFormat(message.format);
    if (mode !== "survival" && !parsedFormat) {
      sendError(socket, "Choose a valid team format.");
      return;
    }
    const format = parsedFormat || { name: "SURVIVAL", blue: 0, red: 0 };
    const maxPlayers = mode === "survival" ? parsePlayerLimit(message.maxPlayers) : null;
    if (mode === "survival" && maxPlayers === null) {
      sendError(socket, "Survival rooms must allow between 2 and 12 players.");
      return;
    }
    const matchDuration = parseMatchDuration(message.matchDuration);
    if (matchDuration === null) {
      sendError(socket, "Choose a valid match length.");
      return;
    }
    const mapId = typeof message.mapId === "string" && MAP_IDS.has(message.mapId)
      ? message.mapId : null;
    if (!mapId) {
      sendError(socket, "Choose a valid arena map.");
      return;
    }
    if (message.type === "findPublic") {
      const room = [...rooms.values()].find((candidate) =>
        candidate.public && candidate.phase === "waiting" && candidate.mode === mode &&
        (mode === "survival" ? candidate.maxPlayers === maxPlayers : candidate.format === format.name) &&
        candidate.mapId === mapId && candidate.matchDuration === matchDuration &&
        !matchIsFull(candidate));
      const target = room || makeRoom({ public: true, mode, format, maxPlayers, matchDuration, mapId });
      addPlayer(socket, target, message.name);
      return;
    }
    const room = makeRoom({ public: false, mode, format, maxPlayers, matchDuration, mapId });
    addPlayer(socket, room, message.name);
    return;
  }

  if (message.type === "joinPrivate") {
    if (clients.has(socket)) {
      sendError(socket, "Leave your current room before joining another.");
      return;
    }
    const code = typeof message.code === "string" ? message.code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) : "";
    const room = [...rooms.values()].find((candidate) => !candidate.public && candidate.code === code);
    if (!room) {
      sendError(socket, "Private room not found. Check the code and try again.");
      return;
    }
    addPlayer(socket, room, message.name);
    return;
  }

  const room = getRoomFor(socket);
  const membership = clients.get(socket);
  if (!room || !membership) {
    sendError(socket, "Join a room first.");
    return;
  }
  const player = room.players.get(membership.id);
  if (!player) {
    sendError(socket, "Room membership expired. Rejoin the room.");
    return;
  }

  if (message.type === "startRoom") {
    if (player.id !== room.hostId || room.public) {
      sendError(socket, "Only the private room host can start this match.");
      return;
    }
    if (room.mode === "survival" && room.players.size < 2) {
      sendError(socket, "Survival needs at least two players to start.");
      return;
    }
    room.startRequested = true;
    broadcastLobby(room);
    startRoom(room);
    return;
  }

  if (message.type === "leaveRoom") {
    removePlayer(socket);
    return;
  }

  if (message.type === "tankState") {
    if (room.phase !== "started") return;
    const now = Date.now();
    if (now - player.lastStateAt < 40) return;
    player.lastStateAt = now;
    const state = message.state;
    if (!validTankState(state)) return;
    for (const other of room.players.values()) {
      if (other.id !== player.id) {
        send(other.socket, { type: "tankState", playerId: player.id, name: player.name, state });
      }
    }
    if (player.id === room.hostId && Array.isArray(message.bots)) {
      const humanTankIds = new Set([...room.players.values()].map((member) => tankIdForPlayer(room, member)));
      message.bots.slice(0, MAX_ROOM_PLAYERS).forEach((bot) => {
        if (!bot || !Number.isInteger(bot.id) || bot.id < 0 || bot.id >= MAX_ROOM_PLAYERS ||
            !roomHasTankId(room, bot.id) || humanTankIds.has(bot.id) || !validTankState(bot.state)) return;
        for (const other of room.players.values()) {
          if (other.id !== player.id) send(other.socket, { type: "botState", tankId: bot.id, state: bot.state });
        }
      });
    }
    return;
  }

  function validTankState(state) {
    return Boolean(state && Number.isFinite(state.x) && Number.isFinite(state.y) &&
      Number.isFinite(state.angle) && Number.isFinite(state.turret) &&
      Number.isFinite(state.hp) && typeof state.alive === "boolean" &&
      state.x >= 0 && state.x <= 1800 && state.y >= 0 && state.y <= 1200);
  }

  if (message.type === "fireRocket") {
    if (room.phase !== "started") return;
    const shot = message.shot;
    if (!shot || !Number.isFinite(shot.x) || !Number.isFinite(shot.y) ||
        !Number.isFinite(shot.angle) || !Number.isInteger(shot.weaponId) ||
        shot.weaponId < 0 || shot.weaponId > 2 || !Number.isInteger(shot.tankId) ||
        shot.tankId < 0 || shot.tankId >= MAX_ROOM_PLAYERS) return;
    const playerTankId = tankIdForPlayer(room, player);
    const humanTankIds = new Set([...room.players.values()].map((member) => tankIdForPlayer(room, member)));
    const isHostBot = room.mode !== "survival" && player.id === room.hostId && !humanTankIds.has(shot.tankId);
    if (!roomHasTankId(room, shot.tankId) || (shot.tankId !== playerTankId && !isHostBot)) return;
    const now = Date.now();
    if (now - (player.lastShotAt.get(shot.tankId) || 0) < 120) return;
    player.lastShotAt.set(shot.tankId, now);
    for (const other of room.players.values()) {
      if (other.id !== player.id) {
        send(other.socket, {
          type: "fireRocket",
          playerId: player.id,
          tankId: shot.tankId,
          shot,
        });
      }
    }
    return;
  }
  sendError(socket, "Unsupported room action.");
}

function removePlayer(socket) {
  const membership = clients.get(socket);
  if (!membership) return;
  clients.delete(socket);
  const room = rooms.get(membership.roomId);
  if (!room) return;
  room.players.delete(membership.id);
  for (const player of room.players.values()) {
    send(player.socket, { type: "playerLeft", playerId: membership.id });
  }
  if (room.players.size === 0) {
    rooms.delete(room.id);
    return;
  }
  if (room.hostId === membership.id) {
    room.hostId = room.players.keys().next().value;
    if (room.phase === "started") {
      for (const player of room.players.values()) send(player.socket, { type: "hostChanged", hostId: room.hostId });
    }
  }
  if (room.phase === "waiting") broadcastLobby(room);
}

function serveFile(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end("Method not allowed");
    return;
  }
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  } catch {
    response.writeHead(400).end("Invalid path");
    return;
  }
  if (pathname === "/") pathname = "/index.html";
  const filePath = path.resolve(ROOT, `.${pathname}`);
  if (!filePath.startsWith(`${ROOT}${path.sep}`)) {
    response.writeHead(403).end("Forbidden");
    return;
  }
  fs.stat(filePath, (statError, stat) => {
    if (statError || !stat.isFile()) {
      response.writeHead(404).end("Not found");
      return;
    }
    const headers = {
      "Content-Type": MIME_TYPES[path.extname(filePath)] || "application/octet-stream",
      "Content-Length": stat.size,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache",
    };
    response.writeHead(200, headers);
    if (request.method === "HEAD") {
      response.end();
      return;
    }
    fs.createReadStream(filePath).pipe(response);
  });
}

const server = http.createServer(serveFile);
const websocketServer = new WebSocketServer({ server, maxPayload: 16 * 1024 });

websocketServer.on("connection", (socket) => {
  send(socket, { type: "connected" });
  socket.on("message", (data) => processMessage(socket, data));
  socket.on("close", () => removePlayer(socket));
  socket.on("error", () => removePlayer(socket));
});

const roomTicker = setInterval(() => {
  for (const room of rooms.values()) {
    if (room.phase !== "waiting") continue;
    const ready = room.public ? matchIsFull(room) : room.startRequested;
    if (ready) startRoom(room);
  }
}, 500);

server.on("close", () => clearInterval(roomTicker));
server.listen(PORT, "0.0.0.0", () => {
  console.log(`IRONCLAD ARENA listening on http://localhost:${PORT}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    clearInterval(roomTicker);
    websocketServer.close();
    server.close(() => process.exit(0));
  });
}
