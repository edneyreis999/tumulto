import { validateConfig } from "../../tools/game-design-schema.js";
export async function loadConfig(
  url = new URL("../../game-design.json", import.meta.url),
) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok)
    throw new Error(
      "Não foi possível carregar game-design.json. Verifique o arquivo e tente novamente.",
    );
  const text = await response.text();
  let config;
  try {
    config = JSON.parse(text);
  } catch {
    throw new Error(
      "game-design.json contém JSON inválido. Corrija o arquivo e tente novamente.",
    );
  }
  const errors = validateConfig(config);
  if (errors.length)
    throw new Error(`Configuração inválida: ${errors[0].message}`);
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  const revision =
    response.headers.get("etag") ||
    [...new Uint8Array(digest)]
      .map((n) => n.toString(16).padStart(2, "0"))
      .join("");
  return { config, revision };
}
