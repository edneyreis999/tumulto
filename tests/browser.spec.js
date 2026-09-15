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
