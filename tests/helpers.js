import { readFileSync } from 'node:fs';
import { createMatch } from '../src/game/engine.js';
export const configuration = () => JSON.parse(readFileSync(new URL('../game-design.json',import.meta.url),'utf8'));
export function fixture() {const config=configuration();config.spawns.firstItemMs=30000;const state=createMatch({seed:42,humanCharacter:'dam',config});state.owners.fill(null);state.items=[];state.players.forEach((p,i)=>{p.cell={row:i===0?0:7,col:i===0?0:i+2};p.hop=null;});return state;}
export function item(state,kind,row,col,extra={}) {const value={id:state.nextEntityId++,kind,cell:{row,col},spawnTick:0,expiresAtTick:kind==='seal'?null:10000,direction:kind.startsWith('flow')?'east':null,armedAtTick:null,...extra};state.items.push(value);return value;}
export function land(state,id,row,col,at=state.tick+1) {const p=state.players[id];p.hop={from:{...p.cell},to:{row,col},startTick:at-1,durationTicks:1};}
