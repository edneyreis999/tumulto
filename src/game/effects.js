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
export const enabledItems = ["impulse", "spark", "flow"];
export function cellPriority(state, index, ids) {
  if (!state.cellPriorities.has(index))
    state.cellPriorities.set(index, priority(state, [0, 1, 2, 3]));
  return state.cellPriorities.get(index).filter((id) => ids.includes(id));
}
export function prepareEffects(state) {
  state.cellPriorities = new Map();
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
  return ticks(state, ms);
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
  state.projectiles.push({
    id: state.nextEntityId++,
    ownerId: player.id,
    ...playerPosition(player, state.tick),
    direction: player.facing,
    spawnTick: state.tick,
    expiresAtTick:
      state.tick + ticks(state, state.config.weapons.projectileLifetimeMs),
  });
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
  const cells = [item.cell],
    [dr, dc] = DELTAS[item.direction];
  let row = item.cell.row + dr,
    col = item.cell.col + dc;
  while (row >= 0 && row < 8 && col >= 0 && col < 8) {
    cells.push({ row, col });
    row += dr;
    col += dc;
  }
  return cells;
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
    } else if (item.kind === "spark") {
      player.weapon = {
        kind: item.kind,
        charges: Math.min(
          state.config.weapons.maxCharges,
          (player.weapon?.kind === item.kind ? player.weapon.charges : 0) +
            state.config.weapons.chargesPerPickup,
        ),
      };
    } else if (item.kind === "flow") flows.push({ player, item });
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
