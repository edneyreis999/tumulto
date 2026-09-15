import {
  DELTAS,
  DIRECTIONS,
  distance,
  cellIndex,
  pendingCount,
  ticks,
  active,
  playerPosition,
} from "../game/engine.js";
import { flowCells, hopDuration, explosionCells } from "../game/effects.js";
export function createBotMemory(seed = 1, id = 0) {
  return {
    nextDecisionTick: 0,
    direction: null,
    target: null,
    targetKey: null,
    targetChosenTick: 0,
    randomState: ((seed >>> 0) ^ Math.imul(id + 1, 0x9e3779b9)) >>> 0 || 1,
  };
}
function random(memory) {
  let x = memory.randomState;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  memory.randomState = x >>> 0;
  return memory.randomState / 4294967296;
}
function moved(cell, direction) {
  const [dr, dc] = DELTAS[direction];
  return { row: cell.row + dr, col: cell.col + dc };
}
function inside(cell) {
  return cell.row >= 0 && cell.row < 8 && cell.col >= 0 && cell.col < 8;
}
function canPaint(view, playerId, cell) {
  const owner = view.owners[cellIndex(cell)];
  return (
    owner !== playerId &&
    (owner === null || !active(view, view.players[owner].lockUntilTick))
  );
}
function dangerAt(view, cell, arrivalTick) {
  let danger = 0;
  for (const item of view.items) {
    if (
      ["nitro", "mushroom", "tnt"].includes(item.kind) &&
      cellIndex(item.cell) === cellIndex(cell)
    )
      danger++;
    if (
      item.kind === "tnt" &&
      item.armedAtTick !== null &&
      item.armedAtTick + ticks(view, view.config.hazards.tntFuseMs) <=
        arrivalTick &&
      explosionCells(view, item).some((c) => cellIndex(c) === cellIndex(cell))
    )
      danger++;
  }
  return danger;
}
function benefit(view, player, profile, cell, arrivalTick, pendings) {
  const owner = view.owners[cellIndex(cell)];
  let value = canPaint(view, player.id, cell)
    ? owner === null
      ? profile.weights.neutral
      : profile.weights.rival
    : 0;
  const item = view.items.find((i) => cellIndex(i.cell) === cellIndex(cell));
  if (!item) return { value, key: `cell:${cellIndex(cell)}:${owner}` };
  let resource = 0;
  if (
    item.kind === "seal" &&
    (pendings >= profile.depositThreshold ||
      view.timeRemainingMs <= profile.endgameMs)
  )
    resource = profile.weights.seal * pendings;
  if (item.kind === "impulse" && !active(view, player.impulseUntilTick))
    resource = profile.weights.impulse;
  if (["spark", "sparkCross", "beam"].includes(item.kind) && !player.weapon)
    resource = profile.weights.weapon;
  if (item.kind === "lock" && !active(view, player.lockUntilTick))
    resource = profile.weights.lock * pendings;
  if (item.kind.startsWith("flow")) {
    const estimated = { ...item };
    if (item.kind !== "flowCross") {
      const rotations = Math.floor(
        (arrivalTick - item.spawnTick) /
          ticks(view, view.config.flow.rotationMs),
      );
      estimated.direction =
        DIRECTIONS[
          (DIRECTIONS.indexOf(item.initialDirection || item.direction) +
            rotations) %
            4
        ];
    }
    resource =
      profile.weights.flow *
      flowCells(estimated).filter((c) => canPaint(view, player.id, c)).length;
  }
  return { value: Math.max(value, resource), key: `item:${item.id}` };
}
function willFire(view, player, direction, profile) {
  if (
    !player.weapon ||
    player.hop ||
    active(view, player.stunnedUntilTick) ||
    !direction
  )
    return false;
  const [dr, dc] = DELTAS[direction],
    from = playerPosition(player, view.tick),
    radius =
      view.config.movement.playerRadius + view.config.weapons.projectileRadius;
  const range = Math.min(
    profile.fireRange,
    player.weapon.kind === "beam" ? view.config.weapons.beamRange : Infinity,
  );
  return view.players.some((other) => {
    if (other.id === player.id || active(view, other.protectedUntilTick))
      return false;
    const pos = playerPosition(other, view.tick),
      row = pos.y - from.y,
      col = pos.x - from.x;
    const aligned =
      player.weapon.kind === "sparkCross"
        ? Math.abs(row) <= radius || Math.abs(col) <= radius
        : dr
          ? Math.abs(col) <= radius && row * dr > 0
          : Math.abs(row) <= radius && col * dc > 0;
    return aligned && Math.abs(row) + Math.abs(col) <= range;
  });
}
export function decideBot(view, playerId, previousMemory, profile) {
  if (view.tick < previousMemory.nextDecisionTick)
    return {
      input: { direction: previousMemory.direction, firePressed: false },
      memory: previousMemory,
    };
  const memory = { ...previousMemory },
    player = view.players[playerId],
    origin = player.hop?.to || player.cell;
  const order = [
    ...DIRECTIONS.slice(playerId),
    ...DIRECTIONS.slice(0, playerId),
  ];
  const legal = order.filter((d) => inside(moved(origin, d))),
    duration = hopDuration(view, player),
    pendings = pendingCount(view, playerId);
  const goals = Array.from({ length: 64 }, (_, i) => ({
    row: Math.floor(i / 8),
    col: i % 8,
  }));
  const arrival = (cell) =>
    view.tick + Math.max(1, distance(origin, cell)) * duration;
  const baseGoals = goals.map((cell) => ({
    cell,
    ...benefit(view, player, profile, cell, arrival(cell), pendings),
  }));
  let direction = null,
    target = null,
    targetKey = null;
  // Briefly keep a still-useful objective; abandon vanished pickups and known danger.
  const held =
    memory.target &&
    baseGoals.find(
      (g) =>
        cellIndex(g.cell) === cellIndex(memory.target) &&
        g.key === memory.targetKey &&
        g.value > 0,
    );
  if (
    held &&
    distance(origin, held.cell) > 0 &&
    view.tick - memory.targetChosenTick < ticks(view, profile.targetHoldMs)
  ) {
    direction =
      legal.find(
        (d) =>
          distance(moved(origin, d), held.cell) < distance(origin, held.cell) &&
          dangerAt(view, moved(origin, d), view.tick + duration) === 0,
      ) || null;
    if (direction) {
      target = held.cell;
      targetKey = held.key;
    }
  }
  if (!direction) {
    const routes = [];
    function explore(cell, path, visited, total) {
      if (path.length === profile.planningHops) {
        let continuation = 0,
          goal = null;
        for (const candidate of baseGoals)
          if (candidate.value > 0 && !visited.has(cellIndex(candidate.cell))) {
            const value =
              candidate.value / Math.max(1, distance(cell, candidate.cell));
            if (value > continuation) {
              continuation = value;
              goal = candidate;
            }
          }
        const destination = baseGoals.find(
          (g) => cellIndex(g.cell) === cellIndex(cell),
        );
        routes.push({
          direction: path[0],
          score: total + continuation,
          target: goal || destination,
        });
        return;
      }
      for (const d of order) {
        const next = moved(cell, d),
          index = cellIndex(next);
        if (!inside(next) || visited.has(index)) continue;
        const at = view.tick + (path.length + 1) * duration;
        const reward = benefit(view, player, profile, next, at, pendings).value;
        const item = view.items.find((i) => cellIndex(i.cell) === index);
        const contested =
          item &&
          view.players.some(
            (other) =>
              other.id !== playerId &&
              distance(other.hop?.to || other.cell, next) <
                distance(origin, next),
          );
        const score =
          reward -
          profile.weights.danger * dangerAt(view, next, at) -
          (contested ? profile.weights.contest : 0);
        explore(
          next,
          [...path, d],
          new Set([...visited, index]),
          total + score,
        );
      }
    }
    explore(origin, [], new Set([cellIndex(origin)]), 0);
    routes.sort(
      (a, b) =>
        b.score - a.score ||
        order.indexOf(a.direction) - order.indexOf(b.direction),
    );
    direction = routes[0]?.direction || legal[0] || null;
    target = routes[0]?.target?.cell || null;
    targetKey = routes[0]?.target?.key || null;
    memory.targetChosenTick = view.tick;
  }
  if (random(memory) < profile.mistakeChance && legal.length > 1) {
    const alternatives = legal.filter((d) => d !== direction);
    direction = alternatives[Math.floor(random(memory) * alternatives.length)];
    target = null;
    targetKey = null;
  }
  memory.nextDecisionTick = view.tick + ticks(view, profile.decisionMs);
  memory.direction = direction;
  memory.target = target;
  memory.targetKey = targetKey;
  return {
    input: {
      direction,
      firePressed: willFire(view, player, direction, profile),
    },
    memory,
  };
}
