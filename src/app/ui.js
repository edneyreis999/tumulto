import { enabledItems } from "../game/effects.js";
import {
  createMatch,
  stepMatch,
  publicView,
  pendingCount,
  ticks,
  active,
  playerPosition,
} from "../game/engine.js";
import { createBotMemory, decideBot } from "../ai/bots.js";
import { createKeyboard } from "../input/keyboard.js";
import {
  renderArena,
  drawAvatar,
  itemLabels,
  itemSymbols,
} from "../render/arena.js";
import { characters, character } from "../content/characters.js";
import { loadConfig } from "./config.js";

export function createApp(
  root,
  {
    configLoader = loadConfig,
    seedFactory = () => crypto.getRandomValues(new Uint32Array(1))[0],
    initialState = null,
  } = {},
) {
  let phase = "menu",
    returnPhase = null,
    match = initialState,
    selected = "ghork",
    difficulty = "standard",
    config = null,
    revision = null;
  let requestGeneration = 0;
  let countdown = 0,
    accumulator = 0,
    previous = null,
    raf = null,
    loading = false,
    configError = "",
    runtimeError = null;
  let memories = [
      null,
      createBotMemory(),
      createBotMemory(),
      createBotMemory(),
    ],
    feedback = [];
  let reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches,
    patterns = true;
  const lifecycle = new AbortController();
  const enoughSpace = () => innerWidth >= 960 && innerHeight >= 600;
  root.innerHTML = `<header class="game-header"><a href="#" id="home">TUMULTO</a><span class="world">UMA BRINCADEIRA NA ÁUREA</span><button id="preferences">Preferências</button></header>
  <main><section id="menu" class="screen menu-layout"><div class="hero"><p class="eyebrow">QUATRO AMIGOS. UM PÁTIO.</p><h1>O chão é de<br>quem chegar<br><em>primeiro.</em></h1><p>Salte, marque suas runas e encontre um selo para transformar território em pontos.</p><button class="primary big" id="play">Jogar <span aria-hidden="true">↗</span></button><p class="micro">Um humano · três bots · teclado</p></div><div class="menu-art"><canvas id="preview" width="600" height="600" aria-label="Prévia da arena 8 por 8"></canvas><p>Nem toda marca está garantida.<br><strong>Converta antes que um amigo a tome.</strong></p></div></section>
  <section id="setup" class="screen" hidden><div class="section-heading"><p class="eyebrow">ANTES DA CONFUSÃO</p><h1>Escolha seu amigo.</h1><p>Todos têm a mesma velocidade e as mesmas possibilidades.</p></div><fieldset class="characters"><legend class="sr-only">Personagem</legend>${characters.map((c) => `<label class="character-card" style="--player:${c.color}"><input type="radio" name="character" value="${c.id}" ${c.id === selected ? "checked" : ""}><canvas width="120" height="140" data-portrait="${c.id}" aria-hidden="true"></canvas><strong>${c.name} <span>${c.symbol}</span></strong><small>${c.phrase}</small></label>`).join("")}</fieldset><div class="setup-bottom"><div><h2>Marque. Converta. Dispute.</h2><ol><li>Salte para marcar runas.</li><li>Colete um selo para converter suas runas em pontos.</li><li>Seus rivais podem tomar marcas ainda não convertidas.</li></ol><p class="keys"><kbd>WASD</kbd> / <kbd>↑ ↓ ← →</kbd> mover · <kbd>Espaço</kbd> disparar · <kbd>Esc</kbd> pausar</p></div><div class="setup-actions"><label for="difficulty">Dificuldade dos bots</label><select id="difficulty"><option value="standard">Padrão</option></select><p id="round-description">Pátio da Áurea · 90 segundos</p><button id="start" class="primary big">Começar</button><button id="back">Voltar</button></div></div><p id="config-error" role="alert"></p></section>
  <section id="arena" class="screen" hidden><div class="match-heading"><span id="mode-label">Pátio da Áurea</span><strong id="timer" aria-label="Tempo restante">1:30</strong><button id="pause">Pausar</button></div><div class="scoreboard" id="scoreboard"></div><div class="play-layout"><div class="board-wrap"><canvas id="board" width="640" height="640" tabindex="0" aria-label="Arena de Tumulto. Use WASD ou setas para mover e Espaço para disparar."></canvas><div id="countdown" aria-live="polite" hidden></div></div><aside class="match-guide"><p class="eyebrow">SEU PRÓXIMO PONTO</p><h2>Marcas ainda<br>podem mudar<br>de dono.</h2><p>Encontre um <strong>Selo ◎</strong> para garantir seus pontos.</p><div id="item-guide"><p>◎ Selo · converte runas</p></div><div class="keys"><kbd>WASD</kbd> mover<br><kbd>Espaço</kbd> disparar<br><kbd>Esc</kbd> pausar</div></aside></div><p id="event-status" class="sr-only" aria-live="polite"></p></section>
  <section id="result" class="screen result-layout" hidden><p class="eyebrow">A POEIRA BAIXOU</p><h1 id="result-title" aria-live="polite"></h1><p id="result-detail"></p><ol id="ranking"></ol><p>Runas não convertidas ficam para trás. Os pontos estão garantidos.</p><div class="result-actions"><button id="rematch" class="primary big">Jogar novamente</button><button id="result-menu">Voltar ao menu</button></div></section>
  <section id="fatal" class="screen" hidden><h1>A partida foi interrompida.</h1><p id="fatal-message"></p><button id="fatal-copy">Copiar diagnóstico</button><button id="fatal-menu">Voltar ao menu</button></section>
  <p id="viewport-warning" role="status" hidden>Amplie a janela para jogar. Tumulto precisa de pelo menos 960 × 600 pixels.</p><p id="device-warning" hidden>Esta versão foi feita para computador com teclado.</p></main>
  <footer class="game-footer"><span>Com personagens de <em>Ghork e a Prova de Fogo</em>, de Edney A. Reis Filho.</span><span>PROTÓTIPO · ARTE PROVISÓRIA</span></footer>
  <dialog id="pause-dialog" aria-label="Partida pausada"><p class="eyebrow">UMA PAUSA NA BRINCADEIRA</p><h2>Partida pausada</h2><p id="pause-reason"></p><div class="dialog-actions"><button id="continue" class="primary">Continuar</button><button id="pause-preferences">Preferências</button><button id="copy">Copiar diagnóstico</button><button id="exit">Voltar ao menu</button></div></dialog>
  <dialog id="settings-dialog" aria-label="Preferências"><h2>Preferências</h2><p>Válidas somente nesta visita.</p><label class="check"><input id="reduce" type="checkbox">Reduzir movimento</label><label class="check"><input id="patterns" type="checkbox">Texturas adicionais</label><p>Os símbolos dos personagens ficam sempre visíveis.</p><button id="settings-close" class="primary">Voltar</button></dialog>
  <dialog id="exit-dialog" aria-label="Sair desta partida?"><h2>Sair desta partida?</h2><p>Os pontos desta rodada serão descartados.</p><button id="cancel-exit" class="primary">Continuar na partida</button><button id="confirm-exit">Sair</button></dialog>
  <dialog id="diagnostic-dialog" aria-label="Diagnóstico da partida"><h2>Copie o diagnóstico abaixo.</h2><textarea id="diagnostic" readonly aria-label="Diagnóstico da partida"></textarea><button id="diagnostic-close">Voltar</button></dialog>`;
  const $ = (id) => root.querySelector(`#${id}`);
  const on = (id, fn) =>
    $(id).addEventListener("click", fn, { signal: lifecycle.signal });
  $("item-guide").innerHTML = ["seal", ...enabledItems]
    .map((kind) => `<p>${itemSymbols[kind]} ${itemLabels[kind]}</p>`)
    .join("");
  const keyboard = createKeyboard(document, {
    enabled: () => phase === "playing" && document.activeElement === $("board"),
    pause: () => {
      if (
        $("diagnostic-dialog").open ||
        $("settings-dialog").open ||
        $("exit-dialog").open
      )
        return false;
      if (phase === "paused") {
        resume();
        return true;
      }
      if (phase === "playing" || phase === "countdown") {
        pause();
        return true;
      }
      return false;
    },
  });
  const show = (screen) => {
    for (const node of root.querySelectorAll(".screen"))
      node.hidden = node.id !== screen;
  };
  function updateSpace() {
    $("viewport-warning").hidden = enoughSpace();
    $("device-warning").hidden = !matchMedia("(pointer: coarse)").matches;
    $("start").disabled = loading || !enoughSpace();
    $("continue").disabled = !enoughSpace();
    if (!enoughSpace() && ["playing", "countdown"].includes(phase))
      pause("A janela ficou pequena demais para continuar.");
  }
  function paintPortraits() {
    for (const canvas of root.querySelectorAll("[data-portrait]")) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, 120, 140);
        drawAvatar(ctx, character(canvas.dataset.portrait), 60, 90, 110);
      }
    }
  }
  function closeDialogs() {
    for (const dialog of root.querySelectorAll("dialog[open]")) dialog.close();
  }
  function menu() {
    requestGeneration++;
    loading = false;
    closeDialogs();
    keyboard.clear();
    phase = "menu";
    match = null;
    feedback = [];
    runtimeError = null;
    accumulator = 0;
    show("menu");
    $("play").focus();
  }
  async function prepare() {
    const request = ++requestGeneration;
    phase = "setup";
    show("setup");
    $("start").focus();
    loading = true;
    updateSpace();
    try {
      const loaded = await configLoader();
      if (request !== requestGeneration) return;
      config = loaded.config;
      revision = loaded.revision;
      configError = "";
      $("round-description").textContent =
        `Pátio da Áurea · ${Math.ceil(config.round.durationMs / 1000)} segundos`;
    } catch (error) {
      if (request !== requestGeneration) return;
      configError = error.message;
    }
    if (request !== requestGeneration) return;
    loading = false;
    $("config-error").textContent = configError;
    $("start").textContent = configError ? "Tentar novamente" : "Começar";
    updateSpace();
  }
  async function start() {
    if (loading || !enoughSpace()) return;
    const request = ++requestGeneration;
    loading = true;
    updateSpace();
    $("config-error").textContent = "";
    try {
      const loaded = await configLoader();
      if (request !== requestGeneration) return;
      config = loaded.config;
      revision = loaded.revision;
      configError = "";
      selected = root.querySelector("[name=character]:checked").value;
      difficulty = $("difficulty").value;
      countdown = config.round.countdownMs;
      match = null;
      memories = [
        null,
        createBotMemory(),
        createBotMemory(),
        createBotMemory(),
      ];
      feedback = [];
      accumulator = 0;
      previous = null;
      phase = "countdown";
      show("arena");
      keyboard.clear();
      $("board").focus();
      setupScoreboard();
      if (countdown === 0) beginMatch();
    } catch (error) {
      if (request !== requestGeneration) return;
      configError = error.message;
      $("config-error").textContent = configError;
      $("start").textContent = "Tentar novamente";
      phase = "setup";
      show("setup");
    } finally {
      if (request === requestGeneration) {
        loading = false;
        updateSpace();
      }
    }
  }
  function beginMatch() {
    match = createMatch({
      seed: seedFactory(),
      humanCharacter: selected,
      difficulty,
      config,
      configRevision: revision,
    });
    phase = "playing";
    $("countdown").hidden = true;
    setupScoreboard();
    updateHUD();
  }
  function setupScoreboard() {
    const order = match?.players.map((p) => character(p.characterId)) || [
      character(selected),
      ...characters.filter((c) => c.id !== selected),
    ];
    $("scoreboard").innerHTML = order
      .map(
        (c, i) =>
          `<div class="score-card" style="--player:${c.color}"><div><strong>${c.symbol} ${c.name}</strong><small>${i === 0 ? "VOCÊ" : "BOT"}</small></div><p><b id="score-${i}">0</b> <span>Pontos</span><strong id="pending-${i}">0</strong> <span>Runas a converter</span></p><small id="effect-${i}" class="effects">Sem efeitos</small></div>`,
      )
      .join("");
    $("mode-label").textContent =
      `Pátio da Áurea · ${difficulty === "hard" ? "Difícil" : "Padrão"}`;
  }
  function updateHUD() {
    if (!match) return;
    const remaining = Math.max(
      0,
      Math.ceil(
        (ticks(match, config.round.durationMs) - match.tick) /
          config.simulation.tickRate,
      ),
    );
    $("timer").textContent =
      `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;
    for (const p of match.players) {
      $(`score-${p.id}`).textContent = p.score;
      $(`pending-${p.id}`).textContent = pendingCount(match, p.id);
      const effects = [];
      if (p.weapon)
        effects.push(`${itemLabels[p.weapon.kind]} ×${p.weapon.charges}`);
      for (const [field, label] of [
        ["impulseUntilTick", "Impulso"],
        ["stunnedUntilTick", "Atordoado"],
        ["protectedUntilTick", "Protegido"],
        ["lockUntilTick", "Cadeado"],
        ["poisonUntilTick", "Veneno"],
        ["hazardProtectedUntilTick", "Proteção explosiva"],
      ])
        if (active(match, p[field]))
          effects.push(
            `${label} ${Math.ceil((p[field] - match.tick) / config.simulation.tickRate)}s`,
          );
      $(`effect-${p.id}`).textContent = effects.join(" · ") || "Sem efeitos";
    }
  }
  function pause(reason = "") {
    if (!["playing", "countdown"].includes(phase)) return;
    returnPhase = phase;
    phase = "paused";
    keyboard.clear();
    accumulator = 0;
    $("pause-reason").textContent = reason;
    $("pause-dialog").showModal();
    $("continue").focus();
  }
  function resume() {
    if (phase !== "paused" || !enoughSpace()) return;
    $("pause-dialog").close();
    phase = returnPhase;
    keyboard.clear();
    previous = null;
    accumulator = 0;
    $("board").focus();
  }
  function result() {
    phase = "result";
    keyboard.clear();
    show("result");
    const winners = match.result.winnerIds.map(
      (id) => character(match.players[id].characterId).name,
    );
    $("result-title").textContent =
      winners.length > 1 ? "Empate!" : `${winners[0]} venceu!`;
    $("result-detail").textContent =
      `${difficulty === "hard" ? "Difícil" : "Padrão"} · ${Math.ceil(config.round.durationMs / 1000)} segundos`;
    const players = [...match.players].sort((a, b) => b.score - a.score);
    $("ranking").innerHTML = players
      .map((p) => {
        const c = character(p.characterId),
          rank = 1 + players.filter((other) => other.score > p.score).length;
        return `<li style="--player:${c.color}"><span>${rank}.</span><strong>${c.symbol} ${c.name} ${p.id === 0 ? "<small>Você</small>" : ""}</strong><b>${p.score} <small>pontos</small></b></li>`;
      })
      .join("");
    $("rematch").focus();
  }
  function fail(error) {
    runtimeError = error.message;
    keyboard.clear();
    closeDialogs();
    phase = "error";
    show("fatal");
    $("fatal-message").textContent =
      runtimeError === "CANVAS_UNAVAILABLE"
        ? "Não foi possível iniciar a arena neste navegador."
        : runtimeError;
    $("fatal-menu").focus();
  }
  async function copy() {
    const diagnostic = {
      schemaVersion: 1,
      game: "Tumulto",
      version: "0.1.0",
      phase,
      seed: match?.seed ?? null,
      tick: match?.tick ?? null,
      difficulty,
      configRevision: revision,
      errorCode:
        runtimeError === "CANVAS_UNAVAILABLE"
          ? "CANVAS_UNAVAILABLE"
          : runtimeError
            ? "UNEXPECTED_GAME_ERROR"
            : null,
    };
    const text = JSON.stringify(diagnostic, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      $("pause-reason").textContent = "Diagnóstico copiado.";
    } catch {
      $("diagnostic").value = text;
      $("diagnostic-dialog").showModal();
      $("diagnostic").focus();
      $("diagnostic").select();
    }
  }
  function settings() {
    if (["playing", "countdown"].includes(phase)) pause();
    $("reduce").checked = reducedMotion;
    $("patterns").checked = patterns;
    $("settings-dialog").showModal();
  }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    try {
      const delta = previous === null ? 0 : now - previous;
      previous = now;
      if (
        ["playing", "countdown"].includes(phase) &&
        delta > config.simulation.maxFrameGapMs
      ) {
        pause("O jogo foi pausado após uma interrupção.");
        return;
      }
      if (phase === "countdown") {
        countdown = Math.max(0, countdown - delta);
        $("countdown").hidden = false;
        $("countdown").textContent = Math.ceil(countdown / 1000) || "Já!";
        if (countdown <= 0) beginMatch();
      }
      if (phase === "playing") {
        accumulator += delta;
        const stepMs = 1000 / config.simulation.tickRate;
        while (accumulator >= stepMs && phase === "playing") {
          const inputs = { 0: keyboard.read() },
            view = publicView(match);
          for (let id = 1; id < 4; id++) {
            const decision = decideBot(
              view,
              id,
              memories[id],
              config.bots[difficulty],
            );
            memories[id] = decision.memory;
            inputs[id] = decision.input;
          }
          const { events } = stepMatch(match, inputs);
          accumulator -= stepMs;
          for (const event of events) {
            const p = event.payload;
            if (p.type === "scored") {
              const pos = playerPosition(match.players[p.playerId], match.tick);
              feedback.push({
                type: "score",
                amount: p.amount,
                ...pos,
                until: match.tick + ticks(match, 700),
              });
            }
            if (p.type === "hazard-exploded")
              feedback.push({
                type: "explosion",
                cells: p.cells,
                until: match.tick + ticks(match, 350),
              });
            if (p.type === "beam-fired")
              feedback.push({
                type: "beam",
                from: p.from,
                to: p.to,
                until: match.tick + ticks(match, 180),
              });
          }
          feedback = feedback.filter((f) => f.until > match.tick);
          if (match.status === "finished") result();
        }
        updateHUD();
      }
      if (match && ["playing", "paused", "countdown"].includes(phase))
        renderArena($("board"), match, {
          alpha:
            phase === "playing"
              ? accumulator / (1000 / config.simulation.tickRate)
              : 0,
          reducedMotion,
          patterns,
          feedback,
        });
      else if (phase === "countdown" && config) {
        const preview = createMatch({
          seed: 1,
          humanCharacter: selected,
          config,
        });
        renderArena($("board"), preview, { reducedMotion: true });
      }
      if (phase === "menu" && config) {
        const preview = createMatch({ seed: 13, config });
        for (let i = 0; i < 64; i++) if (i % 5 < 3) preview.owners[i] = i % 4;
        renderArena($("preview"), preview, { reducedMotion: true, patterns });
      }
      if (phase === "setup") paintPortraits();
    } catch (error) {
      if (phase !== "error") fail(error);
    }
  }
  on("play", prepare);
  on("start", start);
  on("back", menu);
  on("home", (e) => {
    e.preventDefault();
    if (["playing", "countdown", "paused"].includes(phase)) {
      pause();
      $("exit-dialog").showModal();
    } else menu();
  });
  on("pause", () => pause());
  on("continue", resume);
  on("preferences", settings);
  on("pause-preferences", settings);
  on("settings-close", () => $("settings-dialog").close());
  $("reduce").addEventListener("change", () => {
    reducedMotion = $("reduce").checked;
  });
  $("patterns").addEventListener("change", () => {
    patterns = $("patterns").checked;
  });
  on("exit", () => $("exit-dialog").showModal());
  on("cancel-exit", () => $("exit-dialog").close());
  on("confirm-exit", menu);
  on("result-menu", menu);
  on("fatal-menu", menu);
  on("copy", copy);
  on("fatal-copy", copy);
  on("diagnostic-close", () => $("diagnostic-dialog").close());
  on("rematch", start);
  $("pause-dialog").addEventListener("cancel", (event) => {
    event.preventDefault();
    resume();
  });
  window.addEventListener("blur", () => pause("A janela perdeu o foco."), {
    signal: lifecycle.signal,
  });
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) pause("A janela perdeu o foco.");
    },
    { signal: lifecycle.signal },
  );
  window.addEventListener("resize", updateSpace, { signal: lifecycle.signal });
  $("board").addEventListener("blur", keyboard.clear, {
    signal: lifecycle.signal,
  });
  updateSpace();
  configLoader()
    .then((loaded) => {
      if (requestGeneration === 0 && phase === "menu") {
        config = loaded.config;
        revision = loaded.revision;
      }
    })
    .catch(() => {});
  if (initialState) {
    config = initialState.config;
    revision = initialState.configRevision;
    selected = initialState.players[0].characterId;
    difficulty = initialState.difficulty;
    phase = "playing";
    show("arena");
    setupScoreboard();
    updateHUD();
    $("board").focus();
  }
  raf = requestAnimationFrame(frame);
  return {
    destroy() {
      requestGeneration++;
      cancelAnimationFrame(raf);
      keyboard.destroy();
      lifecycle.abort();
      root.replaceChildren();
    },
    get phase() {
      return phase;
    },
    get match() {
      return match;
    },
    pause,
    resume,
  };
}
