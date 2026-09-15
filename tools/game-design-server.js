import { createServer } from "node:http";
import { readFile, open, rename, unlink } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { validateConfig } from "./game-design-schema.js";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const revision = (bytes) =>
  `"${createHash("sha256").update(bytes).digest("hex")}"`;
const assets = new Map([
  ["/", ["index.html", "text/html"]],
  ["/game-design.html", ["game-design.html", "text/html"]],
  ["/tools/game-design.js", ["tools/game-design.js", "text/javascript"]],
  ["/tools/game-design.css", ["tools/game-design.css", "text/css"]],
  [
    "/tools/game-design-schema.js",
    ["tools/game-design-schema.js", "text/javascript"],
  ],
]);

export function createDesignServer({
  configPath = path.join(projectRoot, "game-design.json"),
} = {}) {
  let writeQueue = Promise.resolve();
  return createServer(async (req, res) => {
    const send = (status, body, headers = {}) => {
      res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        ...headers,
      });
      res.end(typeof body === "string" ? body : JSON.stringify(body));
    };
    try {
      const expectedHost = `127.0.0.1:${req.socket.localPort}`;
      if (req.headers.host !== expectedHost)
        return send(403, {
          error: "HOST_REJECTED",
          message: "Use o endereço local exibido no terminal.",
        });
      if (req.method === "GET" && req.url === "/game-design.json") {
        const bytes = await readFile(configPath);
        return send(200, bytes.toString(), { ETag: revision(bytes) });
      }
      if (
        req.method === "GET" &&
        (/^\/(src|assets)\/[a-zA-Z0-9_./-]+$/.test(req.url) ||
          (process.env.TUMULTO_TEST_MODE === "1" &&
            /^\/tests\/[a-zA-Z0-9_./-]+$/.test(req.url)))
      ) {
        const relative = req.url.slice(1);
        if (relative.split("/").includes(".."))
          return send(404, { error: "NOT_FOUND" });
        const extension = path.extname(relative);
        const type = {
          ".js": "text/javascript",
          ".css": "text/css",
          ".png": "image/png",
          ".html": "text/html",
        }[extension];
        if (!type) return send(404, { error: "NOT_FOUND" });
        try {
          const bytes = await readFile(path.join(projectRoot, relative));
          res.writeHead(200, {
            "Content-Type": type,
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
          });
          res.end(bytes);
          return;
        } catch (error) {
          if (error.code === "ENOENT") return send(404, { error: "NOT_FOUND" });
          throw error;
        }
      }
      if (req.method === "GET" && assets.has(req.url)) {
        const [file, type] = assets.get(req.url);
        return send(
          200,
          (await readFile(path.join(projectRoot, file))).toString(),
          { "Content-Type": `${type}; charset=utf-8` },
        );
      }
      if (req.url !== "/api/game-design" || req.method !== "PUT")
        return send(404, { error: "NOT_FOUND" });
      if (
        req.headers.origin !== `http://${expectedHost}` ||
        req.headers["content-type"]?.split(";")[0] !== "application/json"
      ) {
        return send(403, {
          error: "ORIGIN_REJECTED",
          message: "Salve pelo painel aberto neste servidor local.",
        });
      }
      if (!req.headers["if-match"])
        return send(428, {
          error: "REVISION_REQUIRED",
          message: "Recarregue o arquivo antes de salvar.",
        });
      const chunks = [];
      let size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 65536) {
          send(413, { error: "TOO_LARGE", message: "JSON excede 64 KB." });
          return;
        }
        chunks.push(chunk);
      }
      let config;
      try {
        config = JSON.parse(Buffer.concat(chunks).toString());
      } catch {
        return send(400, { error: "INVALID_JSON", message: "JSON inválido." });
      }
      const errors = validateConfig(config);
      if (errors.length)
        return send(422, {
          error: "INVALID_CONFIG",
          errors,
          message: "Corrija os campos indicados.",
        });
      const write = async () => {
        const current = await readFile(configPath);
        if (req.headers["if-match"] !== revision(current))
          return send(409, {
            error: "CONFLICT",
            message:
              "O arquivo mudou em outra aba ou editor. Exporte seu rascunho e recarregue o arquivo antes de reaplicar as alterações.",
          });
        const bytes = `${JSON.stringify(config, null, 2)}\n`;
        const temporaryPath = `${configPath}.${randomUUID()}.tmp`;
        try {
          const file = await open(temporaryPath, "wx", 0o600);
          try {
            await file.writeFile(bytes);
            await file.sync();
          } finally {
            await file.close();
          }
          await rename(temporaryPath, configPath);
        } finally {
          await unlink(temporaryPath).catch((error) => {
            if (error.code !== "ENOENT") throw error;
          });
        }
        return send(
          200,
          { saved: true, file: "game-design.json", config },
          { ETag: revision(bytes) },
        );
      };
      const pending = writeQueue.then(write);
      writeQueue = pending.catch(() => {});
      await pending;
    } catch (error) {
      if (!res.headersSent)
        send(500, {
          error: "FILE_ERROR",
          message:
            "Não foi possível ler ou gravar o arquivo. Verifique o JSON e a permissão da pasta; seu rascunho continua no painel.",
        });
      console.error("Game design:", error.message);
    }
  });
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const port = Number(process.env.TUMULTO_DESIGN_PORT || 4174);
  if (!Number.isInteger(port) || port < 1024 || port > 65535)
    throw new Error(
      "TUMULTO_DESIGN_PORT deve ser uma porta entre 1024 e 65535.",
    );
  const server = createDesignServer();
  server.on("error", (error) => {
    console.error(`Não foi possível iniciar: ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(port, "127.0.0.1", () =>
    console.log(
      `Tumulto · Game design\nhttp://127.0.0.1:${port}/game-design.html\nSalvar altera game-design.json. Ctrl+C encerra.`,
    ),
  );
}
