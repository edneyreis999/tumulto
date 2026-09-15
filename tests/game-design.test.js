import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, readFile, rm, chmod } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createDesignServer } from "../tools/game-design-server.js";
import {
  fields,
  validateConfig,
  setValue,
} from "../tools/game-design-schema.js";
import { loadConfig } from "../src/app/config.js";
import { createMatch } from "../src/game/engine.js";
import { configuration } from "./helpers.js";
async function local(t) {
  const dir = await mkdtemp(path.join(tmpdir(), "tumulto-save-"));
  const configPath = path.join(dir, "game-design.json");
  await writeFile(configPath, JSON.stringify(configuration()));
  const server = createDesignServer({ configPath });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    await rm(dir, { recursive: true, force: true });
  });
  const url = `http://127.0.0.1:${server.address().port}`;
  const read = () => fetch(`${url}/game-design.json`);
  const save = (config, etag, headers = {}) =>
    fetch(`${url}/api/game-design`, {
      method: "PUT",
      headers: {
        Origin: url,
        "Content-Type": "application/json",
        ...(etag ? { "If-Match": etag } : {}),
        ...headers,
      },
      body: typeof config === "string" ? config : JSON.stringify(config),
    });
  return { configPath, url, read, save };
}
test("UT-026: all 79 tuning fields validate ranges, required values and cross-field invariants", () => {
  const leafPaths = (value, prefix = "") =>
    Object.entries(value).flatMap(([key, item]) => {
      const field = prefix ? `${prefix}.${key}` : key;
      return item && typeof item === "object"
        ? leafPaths(item, field)
        : [field];
    });
  assert.deepEqual(
    fields.map((field) => field.path).sort(),
    leafPaths(configuration())
      .filter((field) => field !== "schemaVersion")
      .sort(),
  );
  assert.deepEqual(validateConfig(configuration()), []);
  for (const field of fields) {
    const config = configuration();
    setValue(config, field.path, null);
    assert.ok(
      validateConfig(config).some((e) => e.path === field.path),
      field.path,
    );
  }
  for (const change of [
    (c) => (c.spawns.initialSeals = 8),
    (c) => (c.weapons.chargesPerPickup = 8),
    (c) => (c.movement.impulseHopMs = 1000),
    (c) =>
      Object.keys(c.spawns.weights).forEach((k) => (c.spawns.weights[k] = 0)),
    (c) => (c.round.durationMs = 9999),
    (c) => (c.unknown = 1),
  ]) {
    const config = configuration();
    change(config);
    assert.ok(validateConfig(config).length);
  }
});
test("IT-008: save writes the real JSON atomically and rejects invalid requests without changing it", async (t) => {
  const io = await local(t),
    original = await readFile(io.configPath, "utf8");
  const first = await io.read(),
    etag = first.headers.get("etag");
  const config = configuration();
  config.round.durationMs = 60000;
  assert.equal((await io.save(config)).status, 428);
  assert.equal((await io.save("{", etag)).status, 400);
  assert.equal(
    (await io.save({ ...config, schemaVersion: 2 }, etag)).status,
    422,
  );
  assert.equal(
    (await io.save(config, etag, { Origin: "https://other.example" })).status,
    403,
  );
  assert.equal(await readFile(io.configPath, "utf8"), original);
  const saved = await io.save(config, etag);
  assert.equal(saved.status, 200);
  assert.notEqual(saved.headers.get("etag"), etag);
  assert.deepEqual(JSON.parse(await readFile(io.configPath, "utf8")), config);
  assert.equal((await io.save(configuration(), etag)).status, 409);
});
test("IT-009: competing revisions preserve the winning write; read failures return a recoverable error", async (t) => {
  const io = await local(t),
    etag = (await io.read()).headers.get("etag");
  const a = configuration(),
    b = configuration();
  a.round.durationMs = 20000;
  b.round.durationMs = 30000;
  const results = await Promise.all([io.save(a, etag), io.save(b, etag)]);
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
  const winner = results[0].status === 200 ? a : b;
  assert.deepEqual(JSON.parse(await readFile(io.configPath, "utf8")), winner);
  await rm(io.configPath);
  const failed = await io.save(a, etag);
  assert.equal(failed.status, 500);
  assert.equal((await failed.json()).error, "FILE_ERROR");
});
test("IT-010: current match freezes config; next load sees disk edits; invalid disk config stops loading", async (t) => {
  const io = await local(t),
    first = await loadConfig(`${io.url}/game-design.json`);
  const match = createMatch({
    seed: 4,
    humanCharacter: "dam",
    config: first.config,
    difficulty: "hard",
  });
  first.config.round.durationMs = 20000;
  assert.equal(match.config.round.durationMs, 90000);
  assert.deepEqual(
    match.config.bots.hard.weights,
    configuration().bots.hard.weights,
  );
  assert.equal((await io.save(first.config, first.revision)).status, 200);
  const next = await loadConfig(`${io.url}/game-design.json`);
  assert.equal(next.config.round.durationMs, 20000);
  assert.notEqual(next.revision, first.revision);
  await writeFile(io.configPath, "{}");
  await assert.rejects(
    loadConfig(`${io.url}/game-design.json`),
    /Configuração inválida/,
  );
});
test("IT-008 write failure: permission denied leaves original bytes intact and next save recovers", async (t) => {
  const io = await local(t),
    original = await readFile(io.configPath, "utf8");
  const etag = (await io.read()).headers.get("etag"),
    config = configuration();
  config.round.durationMs = 20000;
  await chmod(path.dirname(io.configPath), 0o500);
  try {
    assert.equal((await io.save(config, etag)).status, 500);
    assert.equal(await readFile(io.configPath, "utf8"), original);
  } finally {
    await chmod(path.dirname(io.configPath), 0o700);
  }
  assert.equal((await io.save(config, etag)).status, 200);
});
