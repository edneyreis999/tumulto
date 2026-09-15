import { character } from '../content/characters.js';
import { playerPosition, active } from '../game/engine.js';
const sprites = new Image(); sprites.src = new URL('../../assets/characters.png', import.meta.url).href;
export const itemSymbols = { seal: '◎', impulse: '↑', spark: '✧', flow: '➜', flowDouble: '↔', flowCross: '✣', sparkCross: '✥', beam: 'ϟ', lock: '▣', tnt: 'T', nitro: 'N', mushroom: '☂' };
export const itemLabels = { seal: 'Selo', impulse: 'Impulso', spark: 'Centelha', flow: 'Fluxo', flowDouble: 'Fluxo duplo', flowCross: 'Fluxo em cruz', sparkCross: 'Centelha em cruz', beam: 'Raio elétrico', lock: 'Cadeado', tnt: 'TNT', nitro: 'Nitro', mushroom: 'Veneno' };
const dirAngle = { east: 0, south: Math.PI / 2, west: Math.PI, north: -Math.PI / 2 };
export function drawAvatar(ctx, info, x, y, size, direction = 'south', frame = 1) {
  if (sprites.complete && sprites.naturalWidth) {
    const w = sprites.naturalWidth / 12, h = sprites.naturalHeight / 8;
    const col = info.sprite % 4, row = Math.floor(info.sprite / 4), facing = { south: 0, west: 1, east: 2, north: 3 }[direction];
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sprites, (col * 3 + frame) * w, (row * 4 + facing) * h, w, h, x - size * 0.36, y - size * 0.7, size * 0.72, size);
  } else { ctx.fillStyle = info.color; ctx.beginPath(); ctx.arc(x, y, size * 0.27, 0, Math.PI * 2); ctx.fill(); }
}
export function renderArena(canvas, state, { alpha = 0, reducedMotion = false, patterns = true, feedback = [] } = {}) {
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('CANVAS_UNAVAILABLE');
  const size = canvas.width, margin = size * 0.035, tile = (size - margin * 2) / 8;
  ctx.clearRect(0, 0, size, size); ctx.fillStyle = '#514f39'; ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#a29677'; ctx.fillRect(5, 5, size - 10, size - 10);
  for (let i = 0; i < 64; i++) {
    const row = Math.floor(i / 8), col = i % 8, x = margin + col * tile, y = margin + row * tile;
    const owner = state.owners[i], info = owner === null ? null : character(state.players[owner].characterId);
    ctx.fillStyle = info ? info.pale : ((row + col) % 2 ? '#ded3b5' : '#e8ddc2'); ctx.fillRect(x + 1, y + 1, tile - 2, tile - 2);
    ctx.strokeStyle = '#a79d81'; ctx.lineWidth = .8; ctx.strokeRect(x + 2, y + 2, tile - 4, tile - 4);
    if (info) {
      ctx.fillStyle = info.color; ctx.font = `${tile * .24}px Georgia`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(info.symbol, x + tile * .22, y + tile * .23);
      if (patterns) { ctx.globalAlpha = .18; ctx.strokeStyle = info.color; ctx.beginPath(); ctx.moveTo(x + 10, y + tile - 8); ctx.lineTo(x + tile - 8, y + 10); ctx.stroke(); ctx.globalAlpha = 1; }
      if (active(state, state.players[owner].lockUntilTick)) { ctx.strokeStyle = info.color; ctx.lineWidth = 3; ctx.strokeRect(x + 4, y + 4, tile - 8, tile - 8); }
    }
  }
  for (const item of state.items) {
    const x = margin + (item.cell.col + .5) * tile, y = margin + (item.cell.row + .5) * tile;
    const hazard = ['tnt','nitro','mushroom'].includes(item.kind);
    ctx.fillStyle = hazard ? '#733828' : item.kind === 'seal' ? '#faf1bf' : '#f5f1df';
    ctx.strokeStyle = hazard ? '#efc396' : '#524938'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, tile * .25, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.translate(x, y); if (item.kind === 'flow' || item.kind === 'flowDouble') ctx.rotate(dirAngle[item.direction]);
    ctx.fillStyle = hazard ? '#fff0c9' : '#4c4933'; ctx.font = `bold ${tile * .38}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(itemSymbols[item.kind] || '?', 0, 0); ctx.restore();
    if (item.armedAtTick !== null) { const remaining = Math.ceil((item.armedAtTick + Math.ceil(state.config.hazards.tntFuseMs * state.config.simulation.tickRate / 1000) - state.tick) / state.config.simulation.tickRate); ctx.fillStyle = '#fff'; ctx.font = `bold ${tile*.21}px system-ui`; ctx.fillText(String(remaining), x, y - tile * .32); }
  }
  for (const projectile of state.projectiles) { ctx.fillStyle = character(state.players[projectile.ownerId].characterId).color; ctx.beginPath(); ctx.arc(margin + projectile.x * tile, margin + projectile.y * tile, tile * .1, 0, Math.PI * 2); ctx.fill(); }
  for (const player of state.players) {
    const info = character(player.characterId), pos = playerPosition(player, state.tick + alpha);
    const overlaps = state.players.filter((other) => other.id !== player.id && Math.abs(playerPosition(other,state.tick+alpha).x-pos.x)<.1 && Math.abs(playerPosition(other,state.tick+alpha).y-pos.y)<.1).length;
    const offset = overlaps ? (player.id - 1.5) * tile * .13 : 0;
    const x = margin + pos.x * tile + offset, floor = margin + pos.y * tile;
    const progress = player.hop ? Math.min(1, (state.tick + alpha - player.hop.startTick) / player.hop.durationTicks) : 0;
    const lift = reducedMotion ? 0 : Math.sin(progress * Math.PI) * tile * .2;
    ctx.fillStyle = info.color; ctx.globalAlpha = .35; ctx.beginPath(); ctx.ellipse(x, floor + tile*.18, tile*.32, tile*.13, 0, 0, Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    drawAvatar(ctx, info, x, floor-lift, tile*.82, player.facing, player.hop ? Math.floor(progress*3)%3 : 1);
    ctx.strokeStyle = info.color;ctx.lineWidth=player.id===0?3:2;ctx.beginPath();ctx.ellipse(x,floor+tile*.2,tile*.3,tile*.12,0,0,Math.PI*2);ctx.stroke();
    ctx.save();ctx.translate(x,floor);ctx.rotate(dirAngle[player.facing]);ctx.fillStyle=info.color;ctx.beginPath();ctx.moveTo(tile*.37,0);ctx.lineTo(tile*.29,-tile*.06);ctx.lineTo(tile*.29,tile*.06);ctx.fill();ctx.restore();
    if (active(state,player.stunnedUntilTick)||active(state,player.protectedUntilTick)||active(state,player.lockUntilTick)||active(state,player.poisonUntilTick)) {
      ctx.fillStyle='#fff8e4';ctx.fillRect(x-tile*.29,floor-tile*.55-lift,tile*.58,tile*.2);ctx.fillStyle=info.color;ctx.font=`bold ${tile*.15}px system-ui`;ctx.textAlign='center';ctx.fillText(active(state,player.stunnedUntilTick)?'PARADO':active(state,player.poisonUntilTick)?'VENENO':active(state,player.lockUntilTick)?'CADEADO':'PROTEGIDO',x,floor-tile*.45-lift);
    }
  }
  for (const f of feedback) {
    if (f.type === 'beam') { ctx.strokeStyle = '#fffbea';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(margin+f.from.x*tile,margin+f.from.y*tile);ctx.lineTo(margin+f.to.x*tile,margin+f.to.y*tile);ctx.stroke(); }
    if (f.type === 'score') { ctx.fillStyle='#234b36';ctx.strokeStyle='#fffce8';ctx.lineWidth=4;ctx.font=`bold ${tile*.4}px system-ui`;ctx.textAlign='center';ctx.strokeText(`+${f.amount}`,margin+f.x*tile,margin+f.y*tile-tile*.55);ctx.fillText(`+${f.amount}`,margin+f.x*tile,margin+f.y*tile-tile*.55); }
  }
}
