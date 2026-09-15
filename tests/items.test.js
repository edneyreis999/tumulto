import test from "node:test";
import assert from "node:assert/strict";
import { stepMatch, publicView, cellIndex } from "../src/game/engine.js";
import { contactTime, flowCells } from "../src/game/effects.js";
import { decideBot, createBotMemory } from "../src/ai/bots.js";
import { fixture, item, land } from "./helpers.js";

test("UT-010: impulse refresh and departure duration survive expiry", () => {
  const s = fixture();
  s.tick = 99;
  item(s, "impulse", 0, 1);
  land(s, 0, 0, 1, 100);
  stepMatch(s);
  assert.equal(s.players[0].impulseUntilTick, 580);
  s.tick = 199;
  item(s, "impulse", 0, 2);
  land(s, 0, 0, 2, 200);
  stepMatch(s);
  assert.equal(s.players[0].impulseUntilTick, 680);
  s.tick = 678;
  stepMatch(s, { 0: { direction: "south" } });
  assert.equal(s.players[0].hop.durationTicks, 20);
  for (let i = 0; i < 20; i++) stepMatch(s);
  assert.equal(s.players[0].hop, null);
  stepMatch(s, { 0: { direction: "south" } });
  assert.equal(s.players[0].hop.durationTicks, 36);
});
test("UT-011: invalid fire preserves inventory; edge fire consumes one only", () => {
  const s = fixture(),
    p = s.players[0];
  p.weapon = { kind: "spark", charges: 1 };
  stepMatch(s, { 0: { direction: "east" } });
  stepMatch(s, { 0: { firePressed: true } });
  assert.equal(p.weapon.charges, 1);
  assert.equal(s.projectiles.length, 0);
  p.hop = null;
  p.stunnedUntilTick = s.tick + 10;
  stepMatch(s, { 0: { firePressed: true } });
  assert.equal(p.weapon.charges, 1);
  p.stunnedUntilTick = 0;
  p.facing = "east";
  stepMatch(s, { 0: { firePressed: true } });
  assert.equal(p.weapon, null);
  assert.equal(s.projectiles.length, 1);
  stepMatch(s);
  assert.equal(s.projectiles.length, 1);
});
test("UT-012: swept collision catches moving target and protected target does not block", () => {
  assert.notEqual(
    contactTime(
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: -1 },
      0.1,
    ),
    null,
  );
  const s = fixture();
  s.players[0].cell = { row: 3, col: 0 };
  s.players[0].weapon = { kind: "spark", charges: 1 };
  s.players[1].cell = { row: 3, col: 1 };
  s.players[1].protectedUntilTick = 200;
  s.players[2].cell = { row: 3, col: 2 };
  stepMatch(s, { 0: { direction: "east", firePressed: true } });
  for (let i = 0; i < 15; i++) stepMatch(s);
  assert.equal(s.players[1].stunnedUntilTick, 0);
  assert.ok(s.players[2].stunnedUntilTick > s.tick);
  assert.equal(s.players[0].stunnedUntilTick, 0);
});
test("UT-013: impact clears inventory but landing still collects and protection ends", () => {
  const s = fixture();
  s.tick = 99;
  const p = s.players[1];
  p.cell = { row: 2, col: 2 };
  p.weapon = { kind: "spark", charges: 1 };
  p.impulseUntilTick = 1000;
  land(s, 1, 2, 3, 100);
  item(s, "impulse", 2, 3);
  s.projectiles.push({
    id: 55,
    ownerId: 0,
    x: 2.5,
    y: 2.5,
    direction: "east",
    spawnTick: 99,
    expiresAtTick: 300,
  });
  stepMatch(s);
  assert.equal(p.stunnedUntilTick, 190);
  assert.equal(p.protectedUntilTick, 220);
  assert.equal(p.weapon, null);
  assert.equal(p.impulseUntilTick, 580);
  assert.deepEqual(p.cell, { row: 2, col: 3 });
  stepMatch(s, { 1: { direction: "south" } });
  assert.equal(p.hop, null);
  s.tick = 189;
  stepMatch(s, { 1: { direction: "south" } });
  assert.ok(p.hop);
});
test("UT-014: flow takes rival territory without triggering items or points", () => {
  const s = fixture();
  item(s, "flow", 3, 3, {
    direction: "east",
    initialDirection: "east",
    spawnTick: 0,
  });
  const untouched = item(s, "seal", 3, 5);
  s.owners[3 * 8 + 6] = 2;
  land(s, 0, 3, 3);
  stepMatch(s);
  for (let col = 3; col < 8; col++) assert.equal(s.owners[24 + col], 0);
  assert.ok(s.items.includes(untouched));
  assert.equal(s.players[0].score, 0);
});
test("UT-015: simultaneous flows resolve once per cell before two conversions", () => {
  const s = fixture();
  item(s, "flow", 3, 3, { direction: "east" });
  item(s, "flow", 2, 4, { direction: "south" });
  item(s, "seal", 7, 6);
  item(s, "seal", 7, 7);
  s.owners[1] = 2;
  s.owners[2] = 3;
  land(s, 0, 3, 3);
  land(s, 1, 2, 4);
  land(s, 2, 7, 6);
  land(s, 3, 7, 7);
  stepMatch(s);
  assert.equal(s.owners[3 * 8 + 4], 0);
  assert.equal(s.players[2].score, 2);
  assert.equal(s.players[3].score, 2);
  assert.equal(s.events.filter((e) => e.payload.type === "scored").length, 2);
});
test("UT-016: generation follows cadence, capacity, expiration and available types", () => {
  const s = fixture();
  s.nextItemSpawnTick = 120;
  for (let i = 0; i < 119; i++) stepMatch(s);
  assert.equal(s.items.length, 0);
  stepMatch(s);
  assert.equal(s.items.length, 1);
  assert.ok(["impulse", "spark", "flow"].includes(s.items[0].kind));
  const id = s.items[0].id;
  s.tick = s.items[0].expiresAtTick - 1;
  stepMatch(s);
  assert.ok(!s.items.some((i) => i.id === id));
  const full = fixture();
  full.nextItemSpawnTick = 1;
  for (let i = 0; i < full.config.spawns.maxOtherItems; i++)
    item(full, "spark", 3, i);
  stepMatch(full);
  assert.equal(full.items.length, full.config.spawns.maxOtherItems);
});
test("UT-017: bot chooses nearby seal, rethinks removed target and fire is one pulse", () => {
  const s = fixture();
  const p = s.players[1];
  p.cell = { row: 3, col: 3 };
  for (const i of [2, 3, 4, 5, 6]) s.owners[i] = 1;
  item(s, "seal", 3, 4);
  let m = createBotMemory();
  let decision = decideBot(publicView(s), 1, m, s.config.bots.standard);
  assert.equal(decision.input.direction, "east");
  m = decision.memory;
  assert.ok(!Object.hasOwn(publicView(s), "rngState"));
  s.items = [];
  s.tick = 18;
  decision = decideBot(publicView(s), 1, m, s.config.bots.standard);
  assert.ok(decision.memory.nextDecisionTick > 18);
  p.weapon = { kind: "spark", charges: 1 };
  s.players[0].cell = { row: 3, col: 4 };
  s.items = [];
  s.tick = 36;
  item(s, "seal", 3, 4);
  decision = decideBot(
    publicView(s),
    1,
    decision.memory,
    s.config.bots.standard,
  );
  assert.equal(decision.input.firePressed, true);
  s.tick = 37;
  assert.equal(
    decideBot(publicView(s), 1, decision.memory, s.config.bots.standard).input
      .firePressed,
    false,
  );
});
test("IT-005: effects update through real step events and bot cooldown uses active ticks", () => {
  const s = fixture();
  item(s, "impulse", 0, 1);
  land(s, 0, 0, 1);
  const result = stepMatch(s);
  assert.equal(
    result.events.filter((e) => e.payload.type === "effect-changed").length,
    1,
  );
  assert.equal(
    result.events.filter((e) => e.payload.type === "item-collected").length,
    1,
  );
  const memory = decideBot(
    publicView(s),
    1,
    createBotMemory(),
    s.config.bots.standard,
  ).memory;
  const paused = structuredClone(s);
  assert.deepEqual(publicView(s), publicView(paused));
  assert.equal(
    decideBot(publicView(s), 1, memory, s.config.bots.standard).memory
      .nextDecisionTick,
    memory.nextDecisionTick,
  );
});
