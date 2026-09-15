import { DELTAS, DIRECTIONS, distance, cellIndex, pendingCount, ticks, active } from '../game/engine.js';
export function createBotMemory() { return { nextDecisionTick: 0, direction: null, target: null, targetChosenTick: 0 }; }
export function decideBot(view, playerId, memory, profile) {
  if (view.tick < memory.nextDecisionTick) return { input: { direction: memory.direction, firePressed: false }, memory };
  const player = view.players[playerId], origin = player.hop?.to || player.cell;
  const pendings = pendingCount(view, playerId);
  const choices = [];
  for (const item of view.items) {
    let benefit = item.kind === 'seal' && (pendings >= profile.depositThreshold || view.timeRemainingMs <= profile.endgameMs) ? profile.weights.seal * pendings : 0;
    if (item.kind === 'impulse' && !active(view, player.impulseUntilTick)) benefit = profile.weights.impulse;
    if (item.kind === 'spark' && !player.weapon) benefit = profile.weights.weapon;
    if (item.kind.startsWith('flow')) benefit = profile.weights.flow;
    if (benefit > 0) choices.push({ cell: item.cell, value: benefit / Math.max(1, distance(origin, item.cell)) });
  }
  for (let index = 0; index < 64; index++) {
    const owner = view.owners[index], cell = { row: Math.floor(index / 8), col: index % 8 };
    if (owner !== playerId && distance(origin, cell)) choices.push({ cell, value: (owner === null ? profile.weights.neutral : profile.weights.rival) / distance(origin, cell) });
  }
  choices.sort((a, b) => b.value - a.value || ((cellIndex(a.cell) + playerId * 17) % 64) - ((cellIndex(b.cell) + playerId * 17) % 64));
  const target = choices[0]?.cell;
  const order = [...DIRECTIONS.slice(playerId), ...DIRECTIONS.slice(0, playerId)];
  const legal = order.filter((d) => { const [dr, dc] = DELTAS[d]; return origin.row + dr >= 0 && origin.row + dr < 8 && origin.col + dc >= 0 && origin.col + dc < 8; });
  const direction = legal.find((d) => target && distance({ row: origin.row + DELTAS[d][0], col: origin.col + DELTAS[d][1] }, target) < distance(origin, target)) || legal[0] || null;
  memory = { ...memory, nextDecisionTick: view.tick + ticks(view, profile.decisionMs), direction, target };
  const [dr, dc] = DELTAS[direction] || [0,0];
  const firePressed = Boolean(player.weapon && !player.hop && !active(view,player.stunnedUntilTick) && view.players.some(other => {
    if(other.id===playerId || active(view,other.protectedUntilTick))return false;
    const row=other.cell.row-player.cell.row,col=other.cell.col-player.cell.col;
    return (dr ? col===0 && row*dr>0 : row===0 && col*dc>0) && Math.abs(row)+Math.abs(col)<=profile.fireRange;
  }));
  return { input: { direction, firePressed }, memory };
}
