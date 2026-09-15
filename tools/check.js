import { readdir, readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { validateConfig } from "./game-design-schema.js";
async function check(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const file = `${dir}/${e.name}`;
    if (e.isDirectory()) await check(file);
    else if (e.name.endsWith(".js")) {
      const result = spawnSync(process.execPath, ["--check", file], {
        encoding: "utf8",
      });
      if (result.status !== 0) throw new Error(result.stderr);
    }
  }
}
await check("src");
await check("tools");
await check("tests");
const errors = validateConfig(
  JSON.parse(await readFile("game-design.json", "utf8")),
);
if (errors.length) throw new Error(JSON.stringify(errors));
console.log("Sintaxe JavaScript e configuração válidas.");
