import { createMatch } from "../src/game/engine.js";
import { loadConfig } from "../src/app/config.js";
import { createApp } from "../src/app/ui.js";
const { config, revision } = await loadConfig();
const state = createMatch({ seed: 42, config, configRevision: revision });
state.items = [];
state.owners.fill(null);
state.players[0].cell = { row: 3, col: 0 };
state.players[0].facing = "east";
for (let id = 1; id < 4; id++) {
  state.players[id].cell = { row: id === 1 ? 3 : 7, col: id === 1 ? 6 : id };
  state.players[id].stunnedUntilTick = 600;
}
const add = (kind, row, col, more = {}) =>
  state.items.push({
    id: state.nextEntityId++,
    kind,
    cell: { row, col },
    spawnTick: 0,
    expiresAtTick: 10000,
    direction: "east",
    armedAtTick: null,
    ...more,
  });
const scene = new URLSearchParams(location.search).get("scene");
if (scene === "cross" || scene === "beam") {
  add(scene === "cross" ? "sparkCross" : "beam", 3, 1);
  state.players[1].cell = {
    row: scene === "cross" ? 2 : 3,
    col: scene === "cross" ? 1 : 3,
  };
  state.players[2].cell = {
    row: scene === "cross" ? 4 : 3,
    col: scene === "cross" ? 1 : 5,
  };
  state.players[3].cell = { row: 2, col: 5 };
} else if (scene === "expanded") {
  add("lock", 3, 1);
  add("flowDouble", 3, 2);
  add("flowCross", 3, 3);
  add("mushroom", 3, 4);
  add("tnt", 3, 5);
  add("nitro", 3, 6);
  state.players[1].cell = { row: 7, col: 7 };
} else {
  add("impulse", 3, 1);
  add("flow", 3, 2);
  add("spark", 3, 3);
  add("seal", 3, 4);
}
window.fixtureApp = createApp(document.querySelector("#app"), {
  configLoader: async () => ({ config, revision }),
  initialState: state,
});
