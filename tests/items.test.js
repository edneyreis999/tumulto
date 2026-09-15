import test from "node:test";
import assert from "node:assert/strict";
import { stepMatch, publicView, cellIndex } from "../src/game/engine.js";
import { contactTime, flowCells, enabledItems } from "../src/game/effects.js";
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
  assert.ok(enabledItems.includes(s.items[0].kind));
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

test("UT-019: rotating arrows use displayed orientation; double/cross cover distinct cells", () => {
  const s = fixture();
  s.tick = 59;
  item(s, "flow", 3, 3, { direction: "east", initialDirection: "east" });
  land(s, 0, 3, 3, 60);
  stepMatch(s);
  assert.equal(s.owners[4 * 8 + 3], 0);
  assert.equal(s.owners[3 * 8 + 4], null);
  assert.equal(
    flowCells({
      kind: "flowDouble",
      cell: { row: 3, col: 3 },
      direction: "north",
    }).length,
    8,
  );
  const cross = flowCells({
    kind: "flowCross",
    cell: { row: 3, col: 3 },
    direction: "north",
  });
  assert.equal(cross.length, 15);
  assert.equal(new Set(cross.map(cellIndex)).size, 15);
});
test("UT-020: cross costs one charge for four directions; weapon pickup replaces type", () => {
  const s = fixture();
  s.players[0].cell = { row: 3, col: 3 };
  s.players[0].weapon = { kind: "sparkCross", charges: 1 };
  stepMatch(s, { 0: { firePressed: true } });
  assert.equal(s.projectiles.length, 4);
  assert.equal(s.players[0].weapon, null);
  assert.equal(new Set(s.projectiles.map((p) => p.direction)).size, 4);
  item(s, "beam", 3, 4);
  land(s, 0, 3, 4);
  stepMatch(s);
  assert.deepEqual(s.players[0].weapon, { kind: "beam", charges: 1 });
  item(s, "spark", 3, 5);
  land(s, 0, 3, 5);
  stepMatch(s);
  assert.deepEqual(s.players[0].weapon, { kind: "spark", charges: 1 });
});
test("UT-021: beam hits all eligible aligned rivals and skips side/protected targets", () => {
  const s = fixture();
  s.players[0].cell = { row: 3, col: 0 };
  s.players[0].facing = "east";
  s.players[0].weapon = { kind: "beam", charges: 1 };
  s.players[1].cell = { row: 3, col: 2 };
  s.players[2].cell = { row: 3, col: 5 };
  s.players[3].cell = { row: 2, col: 4 };
  stepMatch(s, { 0: { firePressed: true } });
  assert.ok(s.players[1].protectedUntilTick > 0);
  assert.ok(s.players[2].protectedUntilTick > 0);
  assert.equal(s.players[3].stunnedUntilTick, 0);
  assert.equal(s.players[0].stunnedUntilTick, 0);
  const before = s.players[1].protectedUntilTick;
  s.players[0].weapon = { kind: "beam", charges: 1 };
  stepMatch(s, { 0: { firePressed: true } });
  assert.equal(s.players[1].protectedUntilTick, before);
});
test("UT-022: lock protects old/new territory but allows own conversion and expires", () => {
  const s = fixture();
  s.owners[10] = 1;
  s.players[1].lockUntilTick = 4;
  land(s, 0, 1, 2);
  stepMatch(s);
  assert.equal(s.owners[10], 1);
  land(s, 1, 1, 3);
  stepMatch(s);
  assert.equal(s.owners[11], 1);
  land(s, 0, 1, 3);
  stepMatch(s);
  assert.equal(s.owners[11], 1);
  land(s, 0, 1, 2);
  stepMatch(s);
  assert.equal(s.owners[10], 0);
  s.players[1].lockUntilTick = 100;
  item(s, "seal", 1, 3);
  land(s, 1, 1, 3);
  stepMatch(s);
  assert.equal(s.players[1].score, 1);
  assert.equal(s.owners[11], null);
  assert.equal(s.players[1].lockUntilTick, 100);
});
test("UT-023: TNT arming is idempotent, clipped blast does not chain or remove points; Nitro contacts explode", () => {
  const s = fixture();
  const bomb = item(s, "tnt", 0, 1);
  const neighbor = item(s, "nitro", 1, 1);
  land(s, 0, 0, 1);
  stepMatch(s);
  assert.equal(bomb.armedAtTick, 1);
  land(s, 0, 0, 1);
  stepMatch(s);
  assert.equal(bomb.armedAtTick, 1);
  s.players[0].score = 12;
  s.players[0].lockUntilTick = 1000;
  s.tick = 120;
  stepMatch(s);
  assert.ok(!s.items.includes(bomb));
  assert.ok(s.items.includes(neighbor));
  assert.equal(s.players[0].score, 12);
  assert.ok(s.players[0].stunnedUntilTick > s.tick);
  assert.ok(
    s.events
      .find((e) => e.payload.type === "hazard-exploded")
      .payload.cells.every((c) => c.row >= 0 && c.col >= 0),
  );
  s.players[0].hazardProtectedUntilTick = 0;
  land(s, 0, 1, 1);
  stepMatch(s);
  assert.ok(!s.items.includes(neighbor));
  assert.equal(s.status, "running");
});
test("UT-024: poison multiplies only future hops, renews without stacking", () => {
  const s = fixture();
  item(s, "mushroom", 0, 1);
  land(s, 0, 0, 1);
  stepMatch(s);
  assert.equal(s.players[0].poisonUntilTick, 301);
  s.players[0].impulseUntilTick = 1000;
  stepMatch(s, { 0: { direction: "east" } });
  assert.equal(s.players[0].hop.durationTicks, 30);
  const duration = s.players[0].hop.durationTicks;
  s.players[0].poisonUntilTick = 3;
  stepMatch(s);
  assert.equal(s.players[0].hop.durationTicks, duration);
  s.players[0].hop = null;
  item(s, "mushroom", 0, 2);
  land(s, 0, 0, 2);
  stepMatch(s);
  assert.equal(s.players[0].poisonUntilTick, s.tick + 300);
});
test("UT-025: same-step lock blocks later flow; simultaneous hits do not double stun", () => {
  const s = fixture();
  s.owners[3 * 8 + 4] = 1;
  item(s, "lock", 2, 4);
  item(s, "flow", 3, 3, { direction: "east" });
  land(s, 1, 2, 4);
  land(s, 0, 3, 3);
  stepMatch(s);
  assert.equal(s.owners[3 * 8 + 4], 1);
  const p = s.players[2];
  p.cell = { row: 6, col: 6 };
  for (let i = 0; i < 2; i++)
    s.projectiles.push({
      id: 80 + i,
      ownerId: i,
      x: 6.3,
      y: 6.5,
      direction: "east",
      spawnTick: s.tick,
      expiresAtTick: 1000,
    });
  stepMatch(s);
  assert.equal(
    s.events.filter((e) => e.payload.type === "hit" && e.payload.victimId === 2)
      .length,
    1,
  );
});
test("IT-007: all requested item kinds survive a real bot round with scoring invariants", () => {
  const s = fixture();
  const kinds = [
    "flowDouble",
    "flowCross",
    "sparkCross",
    "beam",
    "lock",
    "tnt",
    "nitro",
    "mushroom",
  ];
  for (let i = 0; i < kinds.length; i++) item(s, kinds[i], 3, i);
  s.pendingSealSpawns.push({ id: s.nextEntityId++, dueTick: 1 });
  const memory = s.players.map(() => createBotMemory());
  let scores = s.players.map((p) => p.score);
  for (let t = 0; t < 5400; t++) {
    const inputs = {},
      view = publicView(s);
    for (let id = 1; id < 4; id++) {
      const d = decideBot(view, id, memory[id], s.config.bots.standard);
      memory[id] = d.memory;
      inputs[id] = d.input;
    }
    stepMatch(s, inputs);
    for (let id = 0; id < 4; id++) assert.ok(s.players[id].score >= scores[id]);
    scores = s.players.map((p) => p.score);
    assert.ok(s.owners.every((id) => id === null || (id >= 0 && id < 4)));
  }
  assert.equal(s.status, "finished");
});
