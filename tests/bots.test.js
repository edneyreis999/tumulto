import test from "node:test";
import assert from "node:assert/strict";
import { decideBot, createBotMemory } from "../src/ai/bots.js";
import { publicView, ticks } from "../src/game/engine.js";
import { hopDuration } from "../src/game/effects.js";
import { fixture, item } from "./helpers.js";
test("UT-027: profiles use public state, independent reproducible randomness and identical physics", () => {
  const state = fixture();
  state.players[1].cell = { row: 3, col: 3 };
  item(state, "seal", 3, 4);
  const view = publicView(state);
  assert.equal(view.rng, undefined);
  assert.equal(view.seed, undefined);
  for (const name of ["standard", "hard"]) {
    const profile = state.config.bots[name],
      memory = createBotMemory(73, 1);
    const first = decideBot(view, 1, memory, profile);
    assert.deepEqual(first, decideBot(view, 1, memory, profile));
    assert.equal(
      first.memory.nextDecisionTick,
      ticks(state, profile.decisionMs),
    );
    const waiting = decideBot(
      { ...view, tick: first.memory.nextDecisionTick - 1 },
      1,
      first.memory,
      profile,
    );
    assert.equal(waiting.input.firePressed, false);
    assert.equal(waiting.memory, first.memory);
    assert.equal(
      hopDuration(state, state.players[1]),
      hopDuration(state, state.players[0]),
    );
  }
  assert.ok(
    state.config.bots.hard.decisionMs < state.config.bots.standard.decisionMs,
  );
  assert.ok(
    state.config.bots.hard.planningHops >
      state.config.bots.standard.planningHops,
  );
});
test("UT-028: bots avoid known hazards and discard vanished targets without reading future spawns", () => {
  const state = fixture();
  state.players[1].cell = { row: 3, col: 3 };
  state.owners.fill(1);
  const goal = item(state, "impulse", 3, 5);
  item(state, "nitro", 3, 4);
  const profile = structuredClone(state.config.bots.hard);
  profile.mistakeChance = 0;
  profile.weights.danger = 100;
  const first = decideBot(publicView(state), 1, createBotMemory(1, 1), profile);
  assert.notEqual(first.input.direction, "east");
  state.items = state.items.filter((i) => i.id !== goal.id);
  state.tick = first.memory.nextDecisionTick;
  const second = decideBot(publicView(state), 1, first.memory, profile);
  assert.notEqual(second.memory.targetKey, `item:${goal.id}`);
  assert.notEqual(second.input.direction, "east");
});
