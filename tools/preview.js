import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
const port = Number(process.env.TUMULTO_PREVIEW_PORT || 4175);
createServer(async (req, res) => {
  const url = new URL(req.url, "http://127.0.0.1");
  const pathname = decodeURIComponent(url.pathname);
  const relative = pathname.replace(/^\/+/, "") || "index.html";
  const file = path.resolve("dist", relative);
  if (
    !file.startsWith(path.resolve("dist") + path.sep) ||
    req.method !== "GET"
  ) {
    res.writeHead(404);
    res.end();
    return;
  }
  try {
    const bytes = await readFile(file);
    res.writeHead(200, {
      "Content-Type":
        {
          ".html": "text/html",
          ".js": "text/javascript",
          ".css": "text/css",
          ".json": "application/json",
          ".png": "image/png",
        }[path.extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(bytes);
  } catch {
    res.writeHead(404);
    res.end("Arquivo não encontrado.");
  }
}).listen(port, "127.0.0.1", () =>
  console.log(`Preview: http://127.0.0.1:${port}/`),
);
