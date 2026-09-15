import { mkdtemp, copyFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createDesignServer } from "../tools/game-design-server.js";
const directory = await mkdtemp(path.join(tmpdir(), "tumulto-browser-"));
const configPath = path.join(directory, "game-design.json");
await copyFile(new URL("../game-design.json", import.meta.url), configPath);
const server = createDesignServer({ configPath });
server.listen(4180, "127.0.0.1");
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    server.close(async () => {
      await rm(directory, { recursive: true, force: true });
      process.exit();
    });
    server.closeAllConnections();
  });
