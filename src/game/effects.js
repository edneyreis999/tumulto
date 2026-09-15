import {
  DELTAS,
  DIRECTIONS,
  active,
  ticks,
  emit,
  consume,
  paint,
  cellIndex,
  playerPosition,
  nextRandom,
  spawnItem,
  priority,
} from "./engine.js";
import { enabledItems } from "../content/items.js";
export { enabledItems };
export function cellPriority(state, index, ids) {
  if (!state.cellPriorities.has(index))
    state.cellPriorities.set(index, priority(state, [0, 1, 2, 3]));
  return state.cellPriorities.get(index).filter((id) => ids.includes(id));
}
export function prepareEffects(state) {
  state.cellPriorities = new Map();
  state.pendingBeams = [];
  for (const item of [...state.items].sort((a, b) => a.id - b.id))
    if (
      item.kind === "tnt" &&
      item.armedAtTick !== null &&
      state.tick >=
        item.armedAtTick + ticks(state, state.config.hazards.tntFuseMs)
    )
      explode(state, item);
  state.projectiles = state.projectiles.filter(
    (p) => state.tick < p.expiresAtTick,
  );
  for (const item of state.items)
    if (item.kind === "flow" || item.kind === "flowDouble") {
      item.initialDirection ??= item.direction;
      const turns = Math.floor(
        (state.tick - item.spawnTick) /
          ticks(state, state.config.flow.rotationMs),
      );
      item.direction =
        DIRECTIONS[(DIRECTIONS.indexOf(item.initialDirection) + turns) % 4];
    }
}
export function hopDuration(state, player) {
  const ms = active(state, player.impulseUntilTick)
    ? state.config.movement.impulseHopMs
    : state.config.movement.normalHopMs;
  return ticks(
    state,
    ms *
      (active(state, player.poisonUntilTick)
        ? state.config.hazards.poisonSlowMultiplier
        : 1),
  );
}
export function hitByWeapon(state, attackerId, victim) {
  if (active(state, victim.protectedUntilTick)) return false;
  victim.weapon = null;
  victim.impulseUntilTick = 0;
  victim.stunnedUntilTick = Math.max(
    victim.stunnedUntilTick,
    state.tick + ticks(state, state.config.weapons.stunMs),
  );
  victim.protectedUntilTick =
    victim.stunnedUntilTick +
    ticks(state, state.config.weapons.postProtectionMs);
  emit(state, "hit", { attackerId, victimId: victim.id });
  return true;
}
export function fireWeapon(state, player, input) {
  if (
    !input.firePressed ||
    !player.weapon ||
    player.hop ||
    active(state, player.stunnedUntilTick)
  )
    return;
  const kind = player.weapon.kind;
  if (--player.weapon.charges <= 0) player.weapon = null;
  const from = playerPosition(player, state.tick);
  if (kind === "beam") {
    const [dr, dc] = DELTAS[player.facing],
      range = state.config.weapons.beamRange;
    const to = {
      x: Math.max(0, Math.min(8, from.x + dc * range)),
      y: Math.max(0, Math.min(8, from.y + dr * range)),
    };
    state.pendingBeams.push({ attackerId: player.id, from, to });
    emit(state, "beam-fired", { playerId: player.id, from, to });
  } else
    for (const direction of kind === "sparkCross"
      ? DIRECTIONS
      : [player.facing]) {
      state.projectiles.push({
        id: state.nextEntityId++,
        ownerId: player.id,
        ...from,
        direction,
        spawnTick: state.tick,
        expiresAtTick:
          state.tick + ticks(state, state.config.weapons.projectileLifetimeMs),
      });
    }
  emit(state, "weapon-fired", { playerId: player.id, kind });
}
// Relative swept-circle collision handles both fast shots and moving targets.
export function contactTime(from, to, targetFrom, targetTo, radius) {
  const x = from.x - targetFrom.x,
    y = from.y - targetFrom.y;
  const dx = to.x - from.x - (targetTo.x - targetFrom.x),
    dy = to.y - from.y - (targetTo.y - targetFrom.y);
  const c = x * x + y * y - radius * radius;
  if (c <= 0) return 0;
  const a = dx * dx + dy * dy;
  if (a < 1e-12) return null;
  const b = 2 * (x * dx + y * dy),
    disc = b * b - 4 * a * c;
  if (disc < 0) return null;
  const t = (-b - Math.sqrt(disc)) / (2 * a);
  return t >= 0 && t <= 1 ? t : null;
}
export function advanceProjectiles(state) {
  for (const beam of state.pendingBeams)
    for (const victim of state.players)
      if (victim.id !== beam.attackerId) {
        const center = playerPosition(victim, state.tick);
        if (
          contactTime(
            beam.from,
            beam.to,
            center,
            center,
            state.config.movement.playerRadius +
              state.config.weapons.projectileRadius,
          ) !== null
        )
          hitByWeapon(state, beam.attackerId, victim);
      }
  state.pendingBeams = [];

  const contacts = [],
    ends = new Map(),
    speed =
      state.config.weapons.projectileSpeed / state.config.simulation.tickRate;
  for (const shot of state.projectiles) {
    const [dr, dc] = DELTAS[shot.direction],
      end = { x: shot.x + dc * speed, y: shot.y + dr * speed };
    ends.set(shot.id, end);
    const rank = priority(
      state,
      state.players.filter((p) => p.id !== shot.ownerId).map((p) => p.id),
    );
    for (const target of state.players)
      if (target.id !== shot.ownerId) {
        const time = contactTime(
          shot,
          end,
          playerPosition(target, state.tick - 1),
          playerPosition(target, state.tick),
          state.config.movement.playerRadius +
            state.config.weapons.projectileRadius,
        );
        if (time !== null)
          contacts.push({ shot, target, time, rank: rank.indexOf(target.id) });
      }
  }
  contacts.sort(
    (a, b) => a.time - b.time || a.shot.id - b.shot.id || a.rank - b.rank,
  );
  const consumed = new Set();
  for (const contact of contacts)
    if (
      !consumed.has(contact.shot.id) &&
      hitByWeapon(state, contact.shot.ownerId, contact.target)
    )
      consumed.add(contact.shot.id);
  state.projectiles = state.projectiles.filter((shot) => {
    const end = ends.get(shot.id);
    shot.x = end.x;
    shot.y = end.y;
    return (
      !consumed.has(shot.id) &&
      end.x >= 0 &&
      end.x < 8 &&
      end.y >= 0 &&
      end.y < 8
    );
  });
}
export function flowCells(item) {
  const cells = new Map([[cellIndex(item.cell), item.cell]]);
  if (item.kind === "flowDouble" || item.kind === "flowCross") {
    for (let i = 0; i < 8; i++) {
      if (
        item.kind === "flowCross" ||
        ["east", "west"].includes(item.direction)
      ) {
        const cell = { row: item.cell.row, col: i };
        cells.set(cellIndex(cell), cell);
      }
      if (
        item.kind === "flowCross" ||
        ["north", "south"].includes(item.direction)
      ) {
        const cell = { row: i, col: item.cell.col };
        cells.set(cellIndex(cell), cell);
      }
    }
  } else {
    const [dr, dc] = DELTAS[item.direction];
    let row = item.cell.row + dr,
      col = item.cell.col + dc;
    while (row >= 0 && row < 8 && col >= 0 && col < 8) {
      const cell = { row, col };
      cells.set(cellIndex(cell), cell);
      row += dr;
      col += dc;
    }
  }
  return [...cells.values()];
}
export function explosionCells(state, item) {
  const radius = state.config.hazards.blastRadius,
    cells = [];
  for (
    let row = Math.max(0, item.cell.row - radius);
    row <= Math.min(7, item.cell.row + radius);
    row++
  )
    for (
      let col = Math.max(0, item.cell.col - radius);
      col <= Math.min(7, item.cell.col + radius);
      col++
    )
      cells.push({ row, col });
  return cells;
}
export function explode(state, item) {
  state.items = state.items.filter((other) => other.id !== item.id);
  const cells = explosionCells(state, item),
    indices = new Set(cells.map(cellIndex));
  for (const player of state.players) {
    const pos = playerPosition(player, state.tick),
      cell = { row: Math.floor(pos.y), col: Math.floor(pos.x) };
    if (
      !indices.has(cellIndex(cell)) ||
      active(state, player.hazardProtectedUntilTick)
    )
      continue;
    player.weapon = null;
    player.impulseUntilTick = 0;
    player.stunnedUntilTick = Math.max(
      player.stunnedUntilTick,
      state.tick + ticks(state, state.config.hazards.explosionStunMs),
    );
    player.hazardProtectedUntilTick =
      player.stunnedUntilTick +
      ticks(state, state.config.hazards.postProtectionMs);
    emit(state, "hit", {
      attackerId: null,
      victimId: player.id,
      cause: "explosion",
    });
  }
  emit(state, "hazard-exploded", { kind: item.kind, cell: item.cell, cells });
}
export function applyPickups(state, collectors) {
  const flows = [];
  for (const { player, item } of collectors) {
    if (item.kind === "seal") continue;
    if (item.kind === "impulse") {
      player.impulseUntilTick =
        (state.config.effects.impulseRefresh === "extend"
          ? Math.max(state.tick, player.impulseUntilTick)
          : state.tick) + ticks(state, state.config.effects.impulseMs);
      emit(state, "effect-changed", {
        playerId: player.id,
        effect: "impulse",
        untilTick: player.impulseUntilTick,
      });
    } else if (["spark", "sparkCross", "beam"].includes(item.kind)) {
      player.weapon = {
        kind: item.kind,
        charges: Math.min(
          state.config.weapons.maxCharges,
          (player.weapon?.kind === item.kind ? player.weapon.charges : 0) +
            state.config.weapons.chargesPerPickup,
        ),
      };
    } else if (item.kind.startsWith("flow")) flows.push({ player, item });
    else if (item.kind === "lock") {
      player.lockUntilTick =
        (state.config.effects.lockRefresh === "extend"
          ? Math.max(state.tick, player.lockUntilTick)
          : state.tick) + ticks(state, state.config.effects.lockMs);
      emit(state, "effect-changed", {
        playerId: player.id,
        effect: "lock",
        untilTick: player.lockUntilTick,
      });
    } else if (item.kind === "mushroom") {
      player.poisonUntilTick =
        state.tick + ticks(state, state.config.hazards.poisonMs);
      emit(state, "effect-changed", {
        playerId: player.id,
        effect: "poison",
        untilTick: player.poisonUntilTick,
      });
    } else if (item.kind === "tnt") {
      if (item.armedAtTick === null) {
        item.armedAtTick = state.tick;
        emit(state, "hazard-armed", { itemId: item.id, cell: item.cell });
      }
      continue;
    } else if (item.kind === "nitro") explode(state, item);
    consume(state, item, player);
  }
  const intentions = new Map();
  for (const { player, item } of flows)
    for (const cell of flowCells(item)) {
      const owner = state.owners[cellIndex(cell)];
      if (
        owner !== null &&
        owner !== player.id &&
        active(state, state.players[owner].lockUntilTick)
      )
        continue;
      const index = cellIndex(cell);
      if (!intentions.has(index)) intentions.set(index, []);
      intentions.get(index).push(player.id);
    }
  for (const [index, ids] of [...intentions].sort(([a], [b]) => a - b))
    paint(
      state,
      { row: Math.floor(index / 8), col: index % 8 },
      cellPriority(state, index, ids)[0],
      "flow",
    );
}
export function generateOtherItem(state) {
  if (state.tick < state.nextItemSpawnTick) return;
  state.nextItemSpawnTick =
    state.tick + ticks(state, state.config.spawns.itemIntervalMs);
  if (
    state.items.filter((i) => i.kind !== "seal").length >=
    state.config.spawns.maxOtherItems
  )
    return;
  const candidates = enabledItems.filter(
      (kind) => state.config.spawns.weights[kind] > 0,
    ),
    total = candidates.reduce(
      (sum, kind) => sum + state.config.spawns.weights[kind],
      0,
    );
  if (!total) return;
  let pick = nextRandom(state) * total;
  const kind =
    candidates.find(
      (kind) => (pick -= state.config.spawns.weights[kind]) < 0,
    ) || candidates.at(-1);
  spawnItem(state, kind);
}
