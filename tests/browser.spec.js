import { test, expect } from "@playwright/test";
async function start(page, character = "Dam") {
  await page.goto("/");
  await page.getByRole("button", { name: "Jogar", exact: true }).click();
  await page.getByRole("radio", { name: new RegExp(character) }).check();
  await page.getByRole("button", { name: "Começar", exact: true }).click();
  await expect(page.locator("#arena")).toBeVisible();
  await page.clock.runFor(3100);
  await expect(page.locator("#countdown")).toBeHidden();
}
test("E2E-001 / IT-003: select, countdown, full round, result and clean rematch", async ({
  page,
}) => {
  await page.clock.install();
  await start(page);
  await expect(page.locator("#scoreboard")).toContainText("Dam");
  await page.keyboard.down("ArrowRight");
  await page.clock.runFor(1500);
  await page.keyboard.up("ArrowRight");
  await page.clock.runFor(90000);
  await expect(page.locator("#result")).toBeVisible();
  await expect(page.locator("#ranking li")).toHaveCount(4);
  await page.screenshot({
    path: ".compozy/tasks/tumulto-v1/evidence/task_01/result.png",
  });
  await page.getByRole("button", { name: "Jogar novamente" }).click();
  await page.clock.runFor(3100);
  await expect(page.locator("#score-0")).toHaveText("0");
  await expect(page.locator("#scoreboard .score-card").first()).toContainText(
    "Dam",
  );
});
test("E2E-002 / IT-002 / IT-004: pause, settings, focus loss and fresh keyboard input", async ({
  page,
}) => {
  await page.clock.install();
  await start(page);
  await page.keyboard.down("ArrowRight");
  await page.clock.runFor(650);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("dialog", { name: "Partida pausada" }),
  ).toBeVisible();
  const time = await page.locator("#timer").textContent();
  await page.clock.runFor(20000);
  await expect(page.locator("#timer")).toHaveText(time);
  await page.locator("#pause-preferences").click();
  await expect(page.locator("#settings-dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#settings-dialog")).toBeHidden();
  await expect(page.locator("#pause-dialog")).toBeVisible();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.clock.runFor(650);
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  await page.locator("#exit").click();
  await page.getByRole("button", { name: "Continuar na partida" }).click();
  await expect(page.locator("#pause-dialog")).toBeVisible();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expect(page.locator("#pause-dialog")).toBeVisible();
  await page.screenshot({
    path: ".compozy/tasks/tumulto-v1/evidence/task_01/pause.png",
  });
});
test("E2E-003: real pickups and fire through keyboard show effects and conversion", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/tests/harness.html");
  await expect(page.locator("#arena")).toBeVisible();
  for (let i = 0; i < 4; i++) {
    await page.keyboard.down("ArrowRight");
    await page.clock.runFor(80);
    await page.keyboard.up("ArrowRight");
    await page.clock.runFor(700);
    if (i === 0)
      await expect(page.locator("#effect-0")).toContainText("Impulso");
    if (i === 2)
      await expect(page.locator("#effect-0")).toContainText("Centelha");
  }
  await expect(page.locator("#score-0")).not.toHaveText("0");
  await page.keyboard.press("Space");
  await page.clock.runFor(300);
  await expect(page.locator("#effect-0")).not.toContainText("Centelha");
  await page.screenshot({
    path: ".compozy/tasks/tumulto-v1/evidence/task_02/items.png",
  });
});
test("E2E-004: viewport gate pauses and prevents continuing until resized", async ({
  page,
}) => {
  await page.clock.install();
  await page.setViewportSize({ width: 800, height: 600 });
  await page.goto("/");
  await page.getByRole("button", { name: "Jogar", exact: true }).click();
  await expect(page.locator("#viewport-warning")).toBeVisible();
  await expect(page.locator("#start")).toBeDisabled();
  await page.screenshot({
    path: ".compozy/tasks/tumulto-v1/evidence/task_03/viewport.png",
  });
  await page.setViewportSize({ width: 1280, height: 720 });
  await expect(page.locator("#start")).toBeEnabled();
  await page.locator("#start").click();
  await expect(page.locator("#arena")).toBeVisible();
  await page.clock.runFor(3100);
  await page.setViewportSize({ width: 800, height: 600 });
  await expect(page.locator("#pause-dialog")).toBeVisible();
  await expect(page.locator("#continue")).toBeDisabled();
  await page.setViewportSize({ width: 1280, height: 720 });
  await expect(page.locator("#continue")).toBeEnabled();
  await page.setViewportSize({ width: 960, height: 600 });
  await page.locator("#continue").click();
  const board = await page.locator("#board").boundingBox();
  expect(board.y + board.height).toBeLessThanOrEqual(600);
});
test("E2E-005: keyboard settings, return focus and reset on new visit", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#preferences").focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("dialog", { name: "Preferências", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Reduzir movimento").check();
  await page.getByLabel("Texturas adicionais").uncheck();
  await page.keyboard.press("Escape");
  await expect(page.locator("#settings-dialog")).toBeHidden();
  await expect(page.locator("#preferences")).toBeFocused();
  await page.reload();
  await page.locator("#preferences").click();
  await expect(page.getByLabel("Reduzir movimento")).not.toBeChecked();
  await expect(page.getByLabel("Texturas adicionais")).toBeChecked();
  await page.screenshot({
    path: ".compozy/tasks/tumulto-v1/evidence/task_03/settings.png",
  });
});
test("IT-006: Canvas failure stops game; denied clipboard exposes diagnostic text", async ({
  page,
}) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async () => {
          throw new Error("denied");
        },
      },
    });
  });
  await page.goto("/");
  await expect(page.locator("#fatal")).toBeVisible();
  await expect(page.locator("#fatal-message")).toContainText(
    "Não foi possível iniciar a arena",
  );
  await expect(page.locator("#fatal-code")).toContainText("CANVAS_UNAVAILABLE");
  await expect(page.locator("#fatal-message")).toContainText("Canvas 2D");
  await page.locator("#fatal-reload").click();
  await page.waitForLoadState();
  await expect(page.locator("#fatal")).toBeVisible();
  await page.locator("#fatal-copy").click();
  await expect(page.locator("#diagnostic-dialog")).toBeVisible();
  const json = JSON.parse(await page.locator("#diagnostic").inputValue());
  expect(json.errorCode).toBe("CANVAS_UNAVAILABLE");
  expect(Object.keys(json).sort()).toEqual(
    [
      "schemaVersion",
      "game",
      "version",
      "phase",
      "seed",
      "tick",
      "difficulty",
      "configRevision",
      "errorCode",
    ].sort(),
  );
});
test("E2E-006: extended pickups, cross/beam and hazards use real controls", async ({
  page,
}) => {
  await page.clock.install();
  for (const scene of ["cross", "beam"]) {
    await page.goto(`/tests/harness.html?scene=${scene}`);
    await expect(page.locator("#arena")).toBeVisible();
    await page.keyboard.down("ArrowRight");
    await page.clock.runFor(80);
    await page.keyboard.up("ArrowRight");
    await page.clock.runFor(700);
    await expect(page.locator("#effect-0")).toContainText(
      scene === "cross" ? "Centelha em cruz" : "Raio elétrico",
    );
    await page.keyboard.press("Space");
    await page.clock.runFor(400);
    await expect(page.locator("#effect-1")).toContainText("Protegido");
    await expect(page.locator("#effect-2")).toContainText("Protegido");
  }
  await page.goto("/tests/harness.html?scene=expanded");
  await expect(page.locator("#arena")).toBeVisible();
  for (let i = 0; i < 5; i++) {
    await page.keyboard.down("ArrowRight");
    await page.clock.runFor(80);
    await page.keyboard.up("ArrowRight");
    await page.clock.runFor(1000);
    if (i === 0)
      await expect(page.locator("#effect-0")).toContainText("Cadeado");
    if (i === 3)
      await expect(page.locator("#effect-0")).toContainText("Veneno");
  }
  await page.clock.runFor(2100);
  await expect(page.locator("#effect-0")).toContainText("Atordoado");
  await page.screenshot({
    path: ".compozy/tasks/tumulto-v1/evidence/task_04/expanded.png",
  });
});
async function writeBalance(request, config) {
  const current = await request.get("/game-design.json");
  const response = await request.put("/api/game-design", {
    headers: {
      Origin: "http://127.0.0.1:4180",
      "If-Match": current.headers().etag,
    },
    data: config,
  });
  expect(response.status()).toBe(200);
}
test("E2E-007: hard difficulty survives rematch, new visit defaults to standard", async ({
  page,
  request,
}) => {
  const original = await (await request.get("/game-design.json")).json();
  const config = structuredClone(original);
  config.round.durationMs = 10000;
  config.round.countdownMs = 3000;
  await writeBalance(request, config);
  try {
    await page.clock.install();
    await page.goto("/");
    await page.locator("#play").click();
    await page.locator("#difficulty").selectOption("hard");
    await page.locator("#start").click();
    await expect(page.locator("#arena")).toBeVisible();
    await expect(page.locator("#mode-label")).toContainText("Difícil");
    await expect(page.locator("#timer")).toHaveText("0:10");
    await page.clock.runFor(13500);
    await expect(page.locator("#result")).toBeVisible();
    await page.getByRole("button", { name: "Jogar novamente" }).click();
    await expect(page.locator("#arena")).toBeVisible();
    await expect(page.locator("#mode-label")).toContainText("Difícil");
    await page.reload();
    await page.locator("#play").click();
    await expect(page.locator("#difficulty")).toHaveValue("standard");
  } finally {
    await writeBalance(request, original);
  }
});
test("E2E-008: dashboard saves disk, retains failed drafts, detects conflicts; matches snapshot until rematch", async ({
  page,
  request,
  context,
}) => {
  const original = await (await request.get("/game-design.json")).json();
  try {
    await page.goto("/game-design.html");
    const duration = page.getByLabel("Duração da rodada", { exact: true });
    await expect(duration).toHaveValue("90000");
    await duration.fill("9");
    await expect(page.locator("#save")).toBeDisabled();
    await duration.fill("10000");
    await page.getByLabel("Contagem inicial", { exact: true }).fill("0");
    await page.locator("#save").click();
    await expect(page.locator("#status")).toHaveText("Tudo salvo");
    expect(
      (await (await request.get("/game-design.json")).json()).round.durationMs,
    ).toBe(10000);
    await page.reload();
    await expect(duration).toHaveValue("10000");
    const game = await context.newPage();
    await game.clock.install();
    await game.goto("/");
    await game.locator("#play").click();
    await game.locator("#start").click();
    await expect(game.locator("#arena")).toBeVisible();
    await expect(game.locator("#timer")).toHaveText("0:10");
    await duration.fill("20000");
    await page.locator("#save").click();
    await expect(page.locator("#status")).toHaveText("Tudo salvo");
    await game.clock.runFor(10500);
    await expect(game.locator("#result")).toBeVisible();
    await game.getByRole("button", { name: "Jogar novamente" }).click();
    await expect(game.locator("#arena")).toBeVisible();
    await expect(game.locator("#timer")).toHaveText("0:20");
    await game.close();
    await duration.fill("30000");
    await page.route("**/api/game-design", (route) => route.abort());
    await page.locator("#save").click();
    await expect(page.locator("#error")).toContainText("rascunho foi mantido");
    await expect(duration).toHaveValue("30000");
    await expect(page.locator("#status")).not.toHaveText("Tudo salvo");
    await page.unroute("**/api/game-design");
    const external = structuredClone(original);
    external.round.durationMs = 40000;
    await writeBalance(request, external);
    await page.locator("#save").click();
    await expect(page.locator("#error")).toContainText("arquivo mudou");
    await expect(page.locator("#save")).toBeDisabled();
    await expect(duration).toHaveValue("30000");
    page.once("dialog", (dialog) => dialog.accept());
    await page.locator("#reload").click();
    await expect(duration).toHaveValue("40000");
    await expect(page.locator("#status")).toHaveText("Tudo salvo");
    await page.screenshot({
      path: ".compozy/tasks/tumulto-v1/evidence/task_05/dashboard.png",
      fullPage: true,
    });
  } finally {
    await writeBalance(request, original);
  }
});
test("IT-002 countdown: pause/settings/resume completes countdown with reduced motion", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  await page.locator("#preferences").click();
  await page.getByLabel("Reduzir movimento").check();
  await page.keyboard.press("Escape");
  await page.locator("#play").click();
  await page.locator("#start").click();
  await expect(page.locator("#arena")).toBeVisible();
  await page.clock.runFor(300);
  await page.keyboard.press("Escape");
  await page.locator("#pause-preferences").click();
  await page.keyboard.press("Escape");
  await page.locator("#continue").click();
  await page.clock.runFor(4000);
  await expect(page.locator("#countdown")).toBeHidden();
  await expect(page.locator("#timer")).not.toHaveText("1:30");
});

test("E2E-005 entry: initial focus, explicit roles and sprite fallback remain usable", async ({
  page,
}) => {
  await page.route("**/assets/characters.png", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator("#play")).toBeFocused();
  await page.keyboard.press("Enter");
  await page.getByRole("radio", { name: /Dam/ }).check();
  await expect(page.locator('[data-role="dam"]')).toHaveText("Você");
  await expect(page.locator('[data-role="ghork"]')).toHaveText("Bot");
  await expect(page.locator('[data-role="lala"]')).toHaveText("Bot");
  await expect(page.locator('[data-role="drull"]')).toHaveText("Bot");
  await page.screenshot({
    path: ".compozy/tasks/tumulto-v1/evidence/review/fallback-roles.png",
  });
});
test("IT-006 unexpected runtime error shows stable code and recovery", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.addInitScript(() => {
    CanvasRenderingContext2D.prototype.clearRect = () => {
      throw new Error("controlled-render-failure");
    };
  });
  await page.goto("/");
  await expect(page.locator("#fatal")).toBeVisible();
  await expect(page.locator("#fatal-code")).toContainText(
    "UNEXPECTED_GAME_ERROR",
  );
  await expect(page.locator("#fatal-message")).toContainText(
    "Recarregue ou volte ao menu",
  );
  await expect(page.locator("#fatal-reload")).toBeEnabled();
  await page.locator("#fatal-copy").click();
  await expect(page.locator("#fatal-copy-status")).toHaveText(
    "Diagnóstico copiado.",
  );
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(JSON.parse(copied).errorCode).toBe("UNEXPECTED_GAME_ERROR");
  await page.screenshot({
    path: ".compozy/tasks/tumulto-v1/evidence/review/runtime-error.png",
  });
});
