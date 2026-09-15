import {
  prepareEffects,
  hopDuration,
  fireWeapon,
  advanceProjectiles,
  applyPickups,
  generateOtherItem,
  cellPriority,
} from "./effects.js";
import { validateConfig } from "../../tools/game-design-schema.js";
export const DIRECTIONS = ["north", "east", "south", "west"];
export const DELTAS = {
  north: [-1, 0],
  east: [0, 1],
  south: [1, 0],
  west: [0, -1],
};
export const CHARACTERS = ["ghork", "lala", "drull", "dam"];
export const cellIndex = ({ row, col }) => row * 8 + col;
export const sameCell = (a, b) => a.row === b.row && a.col === b.col;
export const distance = (a, b) =>
  Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
export const ticks = (state, ms) =>
  Math.ceil((ms * state.config.simulation.tickRate) / 1000);
export const active = (state, until) => state.tick < (until || 0);
export function nextRandom(state) {
  let x = state.rngState;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  state.rngState = x >>> 0;
  return state.rngState / 4294967296;
}
export function frozenCopy(value) {
  const copy = structuredClone(value);
  const freeze = (item) => {
    if (item && typeof item === "object") {
      Object.values(item).forEach(freeze);
      Object.freeze(item);
    }
    return item;
  };
  return freeze(copy);
}
export function emit(state, type, data = {}) {
  state.events.push({
    id: `${state.tick}:${state.events.length}`,
    tick: state.tick,
    payload: { type, ...data },
  });
}
export function playerPosition(player, time) {
  if (!player.hop)
    return { x: player.cell.col + 0.5, y: player.cell.row + 0.5 };
  const amount = Math.max(
    0,
    Math.min(1, (time - player.hop.startTick) / player.hop.durationTicks),
  );
  return {
    x:
      player.hop.from.col +
      0.5 +
      (player.hop.to.col - player.hop.from.col) * amount,
    y:
      player.hop.from.row +
      0.5 +
      (player.hop.to.row - player.hop.from.row) * amount,
  };
}
export function paint(state, cell, playerId, cause = "landing") {
  const index = cellIndex(cell),
    previous = state.owners[index];
  if (
    previous === playerId ||
    (previous !== null && active(state, state.players[previous].lockUntilTick))
  )
    return;
  state.owners[index] = playerId;
  emit(state, "ownership-changed", { cell, previous, owner: playerId, cause });
}
export const pendingCount = (state, playerId) =>
  state.owners.filter((id) => id === playerId).length;
export function priority(state, ids) {
  const ordered = [...new Set(ids)].sort((a, b) => a - b);
  if (state.config.rules.sameCellPriority === "seededRandom") {
    for (let i = ordered.length - 1; i > 0; i--) {
      const j = Math.floor(nextRandom(state) * (i + 1));
      [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
    }
    return ordered;
  }
  const start = ((state.seed % 4) + state.tick) % 4;
  return ordered.sort((a, b) => ((a - start + 4) % 4) - ((b - start + 4) % 4));
}
export function validSpawnCells(state) {
  const positions = state.players.flatMap((p) =>
    p.hop ? [p.cell, p.hop.to] : [p.cell],
  );
  return Array.from({ length: 64 }, (_, i) => ({
    row: Math.floor(i / 8),
    col: i % 8,
  })).filter(
    (cell) =>
      !state.items.some((item) => sameCell(item.cell, cell)) &&
      positions.every(
        (pos) => distance(pos, cell) > state.config.spawns.minDistance,
      ),
  );
}
export function spawnItem(state, kind) {
  const cells = validSpawnCells(state);
  if (!cells.length) return false;
  let cell;
  if (state.config.spawns.distribution === "sparse") {
    const positions = state.players.flatMap((p) =>
      p.hop ? [p.cell, p.hop.to] : [p.cell],
    );
    const weights = cells.map(
      (c) => 1 + Math.min(...positions.map((pos) => distance(c, pos))),
    );
    let pick = nextRandom(state) * weights.reduce((a, b) => a + b, 0);
    cell = cells.find((_, i) => (pick -= weights[i]) < 0) || cells.at(-1);
  } else cell = cells[Math.floor(nextRandom(state) * cells.length)];
  const item = {
    id: state.nextEntityId++,
    kind,
    cell,
    spawnTick: state.tick,
    expiresAtTick:
      kind === "seal"
        ? null
        : state.tick + ticks(state, state.config.spawns.itemLifetimeMs),
    direction: kind.startsWith("flow")
      ? DIRECTIONS[Math.floor(nextRandom(state) * 4)]
      : null,
    armedAtTick: null,
  };
  state.items.push(item);
  return true;
}
export function createMatch({
  seed = 1,
  humanCharacter = "ghork",
  difficulty = "standard",
  config,
  configRevision = null,
}) {
  const errors = validateConfig(config);
  if (errors.length)
    throw new Error(`Configuração inválida: ${errors[0].message}`);
  if (
    !CHARACTERS.includes(humanCharacter) ||
    !["standard", "hard"].includes(difficulty)
  )
    throw new Error("Personagem ou dificuldade inválido.");
  seed = seed >>> 0 || 1;
  const state = {
    schemaVersion: 1,
    seed,
    rngState: seed,
    config: frozenCopy(config),
    configRevision,
    difficulty,
    tick: 0,
    status: "running",
    owners: Array(64).fill(null),
    players: [],
    items: [],
    projectiles: [],
    pendingSealSpawns: [],
    nextEntityId: 1,
    nextItemSpawnTick: 0,
    result: null,
    events: [],
  };
  const corners = [
    { row: 0, col: 0 },
    { row: 0, col: 7 },
    { row: 7, col: 7 },
    { row: 7, col: 0 },
  ];
  for (let i = 3; i > 0; i--) {
    const j = Math.floor(nextRandom(state) * (i + 1));
    [corners[i], corners[j]] = [corners[j], corners[i]];
  }
  state.players = [
    humanCharacter,
    ...CHARACTERS.filter((c) => c !== humanCharacter),
  ].map((characterId, id) => ({
    id,
    characterId,
    controller: id ? "bot" : "human",
    cell: corners[id],
    facing: corners[id].row === 0 ? "south" : "north",
    hop: null,
    score: 0,
    weapon: null,
    impulseUntilTick: 0,
    stunnedUntilTick: 0,
    protectedUntilTick: 0,
    lockUntilTick: 0,
    poisonUntilTick: 0,
    hazardProtectedUntilTick: 0,
  }));
  for (const p of state.players) state.owners[cellIndex(p.cell)] = p.id;
  for (let i = 0; i < config.spawns.initialSeals; i++)
    if (!spawnItem(state, "seal"))
      state.pendingSealSpawns.push({ id: state.nextEntityId++, dueTick: 1 });
  state.nextItemSpawnTick = Math.max(
    1,
    ticks(state, config.spawns.firstItemMs),
  );
  return state;
}
export function publicView(state) {
  return {
    tick: state.tick,
    timeRemainingMs: Math.max(
      0,
      state.config.round.durationMs -
        (state.tick * 1000) / state.config.simulation.tickRate,
    ),
    owners: [...state.owners],
    players: structuredClone(state.players),
    items: structuredClone(state.items),
    config: state.config,
  };
}
export function consume(state, item, player) {
  state.items = state.items.filter((candidate) => candidate.id !== item.id);
  emit(state, "item-collected", {
    playerId: player.id,
    itemId: item.id,
    kind: item.kind,
  });
}
export function convert(state, player, item) {
  const amount = pendingCount(state, player.id);
  player.score += amount;
  state.owners.forEach((owner, index) => {
    if (owner === player.id) {
      state.owners[index] = null;
      emit(state, "ownership-changed", {
        cell: { row: Math.floor(index / 8), col: index % 8 },
        previous: owner,
        owner: null,
        cause: "conversion",
      });
    }
  });
  consume(state, item, player);
  state.pendingSealSpawns.push({
    id: state.nextEntityId++,
    dueTick: state.tick + ticks(state, state.config.spawns.sealRespawnMs),
  });
  emit(state, "scored", { playerId: player.id, amount, total: player.score });
}
export function finish(state) {
  state.status = "finished";
  const scores = state.players.map((p) => p.score),
    max = Math.max(...scores);
  state.result = {
    scores,
    winnerIds: state.players.filter((p) => p.score === max).map((p) => p.id),
  };
  emit(state, "finished", state.result);
}
export function stepMatch(state, inputs = {}) {
  if (state.status === "finished") return { state, events: [] };
  state.events = [];
  state.tick++;
  if (state.tick >= ticks(state, state.config.round.durationMs)) {
    finish(state);
    return { state, events: state.events };
  }
  prepareEffects(state);
  state.items = state.items.filter(
    (i) =>
      i.expiresAtTick === null ||
      i.armedAtTick !== null ||
      state.tick < i.expiresAtTick,
  );
  for (const player of state.players) {
    const input = inputs[player.id] || {};
    if (DELTAS[input.direction]) player.facing = input.direction;
    fireWeapon(state, player, input);
    if (
      !player.hop &&
      !active(state, player.stunnedUntilTick) &&
      DELTAS[input.direction]
    ) {
      const [dr, dc] = DELTAS[input.direction],
        to = { row: player.cell.row + dr, col: player.cell.col + dc };
      if (to.row >= 0 && to.row < 8 && to.col >= 0 && to.col < 8)
        player.hop = {
          from: { ...player.cell },
          to,
          startTick: state.tick,
          durationTicks: hopDuration(state, player),
        };
    }
  }
  advanceProjectiles(state);
  const landingGroups = new Map();
  for (const player of state.players)
    if (
      player.hop &&
      state.tick >= player.hop.startTick + player.hop.durationTicks
    ) {
      player.cell = player.hop.to;
      player.hop = null;
      const key = cellIndex(player.cell);
      if (!landingGroups.has(key)) landingGroups.set(key, []);
      landingGroups.get(key).push(player.id);
      emit(state, "landed", { playerId: player.id, cell: player.cell });
    }
  const collectors = [];
  for (const [index, ids] of [...landingGroups].sort(([a], [b]) => a - b)) {
    const player = state.players[cellPriority(state, index, ids)[0]];
    paint(state, player.cell, player.id);
    const item = state.items.find(
      (i) => cellIndex(i.cell) === index && i.spawnTick < state.tick,
    );
    if (item) collectors.push({ player, item });
  }
  applyPickups(state, collectors);
  for (const { player, item } of collectors)
    if (item.kind === "seal") convert(state, player, item);
  for (const due of [...state.pendingSealSpawns].sort((a, b) => a.id - b.id))
    if (
      due.dueTick <= state.tick &&
      state.items.filter((i) => i.kind === "seal").length <
        state.config.spawns.maxSeals &&
      spawnItem(state, "seal")
    )
      state.pendingSealSpawns = state.pendingSealSpawns.filter(
        (p) => p.id !== due.id,
      );
  generateOtherItem(state);
  return { state, events: state.events };
}
