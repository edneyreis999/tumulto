import {
  groups,
  fields,
  getValue,
  setValue,
  validateConfig,
} from "./game-design-schema.js";
const $ = (selector) => document.querySelector(selector);
const controls = new Map();
let baseline = null;
let draft = null;
let etag = null;
let busy = false;
let conflict = false;
let dirty = false;
let loadError = false;
const status = (title, detail) => {
  $("#status").textContent = title;
  $("#detail").textContent = detail;
};
const showError = (message = "") => {
  $("#error").hidden = !message;
  $("#error").textContent = message;
};

for (const group of groups) {
  const link = document.createElement("a");
  link.href = `#${group.id}`;
  link.textContent = group.title;
  $("#navigation").append(link);
  const section = document.createElement("section");
  section.className = "section";
  section.id = group.id;
  const title = document.createElement("h2");
  title.textContent = group.title;
  const description = document.createElement("p");
  description.textContent = group.description;
  const container = document.createElement("div");
  container.className = "fields";
  section.append(title, description, container);
  $("#sections").append(section);
  for (const field of group.fields) {
    const row = document.createElement("div");
    row.className = "field";
    const label = document.createElement("label");
    label.htmlFor = field.path;
    label.textContent = field.label;
    const wrap = document.createElement("div");
    wrap.className = "input-wrap";
    const input = document.createElement(
      field.type === "select" ? "select" : "input",
    );
    input.id = field.path;
    input.name = field.path;
    input.disabled = true;
    input.required = true;
    if (field.type === "select") {
      for (const [value, text] of Object.entries(field.options)) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = text;
        input.append(option);
      }
    } else {
      input.type = "number";
      input.min = field.min;
      input.max = field.max;
      input.step = field.step;
    }
    const unit = document.createElement("span");
    unit.className = "unit";
    unit.textContent = field.unit || "";
    const help = document.createElement("small");
    help.id = `${field.path}-help`;
    help.textContent =
      field.type === "number"
        ? `${field.min}–${field.max}${field.unit ? ` ${field.unit}` : ""}`
        : "Aplicado na próxima rodada";
    const error = document.createElement("small");
    error.id = `${field.path}-error`;
    error.className = "field-error";
    input.setAttribute("aria-describedby", `${help.id} ${error.id}`);
    wrap.append(input, unit);
    row.append(label, wrap, help, error);
    container.append(row);
    controls.set(field.path, { input, error, help });
    input.addEventListener("input", () => {
      if (!draft) return;
      setValue(
        draft,
        field.path,
        field.type === "number"
          ? input.value === ""
            ? null
            : input.valueAsNumber
          : input.value,
      );
      refresh();
    });
  }
}
function refresh() {
  const errors = draft ? validateConfig(draft) : [];
  for (const [path, { input, error }] of controls) {
    const found = errors.find((item) => item.path === path);
    input.setAttribute("aria-invalid", found ? "true" : "false");
    error.textContent = found ? `Erro: ${found.message}` : "";
    input.disabled = busy || !draft;
  }
  const changed =
    draft && baseline
      ? fields.filter(
          (field) =>
            getValue(draft, field.path) !== getValue(baseline, field.path),
        ).length
      : 0;
  dirty = changed > 0;
  $("#save").disabled = busy || !dirty || errors.length > 0 || conflict;
  $("#reload").disabled = busy;
  $("#export").disabled = !draft || busy;
  if (!busy && draft) {
    if (loadError)
      status(
        "Falha ao carregar",
        "Seu rascunho foi preservado; tente recarregar.",
      );
    else if (conflict)
      status(
        "Arquivo alterado fora deste painel",
        "Exporte seu rascunho antes de recarregar.",
      );
    else if (errors.length)
      status(
        "Revise os campos indicados",
        `${errors.length} problema(s) impedem salvar.`,
      );
    else if (dirty)
      status(
        `${changed} alteração(ões) não salva(s)`,
        "Salvar grava o arquivo no disco.",
      );
    else
      status(
        "Tudo salvo",
        "game-design.json · alterações para as próximas partidas",
      );
  }
  if (draft) {
    const total = Object.values(draft.spawns.weights).reduce(
      (sum, n) => sum + (Number(n) || 0),
      0,
    );
    for (const field of fields.filter((item) =>
      item.path.startsWith("spawns.weights."),
    )) {
      const weight = getValue(draft, field.path);
      controls.get(field.path).help.textContent =
        `Chance por sorteio: ${total > 0 && Number.isFinite(weight) ? ((100 * weight) / total).toFixed(1) : "0.0"}% · zero desativa`;
    }
  }
}
async function load() {
  if (
    dirty &&
    !confirm("Descartar as alterações não salvas e ler o arquivo do disco?")
  )
    return;
  busy = true;
  showError();
  refresh();
  status("Carregando…", "Lendo game-design.json");
  try {
    const response = await fetch("/game-design.json", { cache: "no-store" });
    if (!response.ok)
      throw new Error(
        "Não foi possível ler game-design.json. Verifique o servidor e tente recarregar.",
      );
    const config = await response.json();
    const errors = validateConfig(config);
    if (errors.length)
      throw new Error(
        `O arquivo no disco é inválido. Corrija-o no editor de texto e recarregue.\n${errors.map((item) => `${item.path}: ${item.message}`).join("\n")}`,
      );
    baseline = structuredClone(config);
    draft = structuredClone(config);
    etag = response.headers.get("etag");
    conflict = false;
    loadError = false;
    for (const [path, { input }] of controls)
      input.value = getValue(config, path);
  } catch (error) {
    loadError = true;
    showError(error.message);
    status(
      "Falha ao carregar",
      "Execute npm run game-design e use o endereço exibido no terminal.",
    );
  } finally {
    busy = false;
    refresh();
  }
}
$("#reload").addEventListener("click", load);
$("#editor").addEventListener("submit", async (event) => {
  event.preventDefault();
  refresh();
  if ($("#save").disabled) {
    const invalid = [...controls.values()].find(
      ({ input }) => input.getAttribute("aria-invalid") === "true",
    );
    invalid?.input.focus();
    return;
  }
  busy = true;
  showError();
  refresh();
  status("Salvando…", "Aguardando confirmação de gravação no disco.");
  try {
    const response = await fetch("/api/game-design", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "If-Match": etag },
      body: JSON.stringify(draft),
    });
    const body = await response.json();
    if (!response.ok) {
      if (response.status === 409) conflict = true;
      throw new Error(body.message || "Não foi possível salvar.");
    }
    baseline = structuredClone(body.config);
    draft = structuredClone(body.config);
    etag = response.headers.get("etag");
  } catch (error) {
    showError(`${error.message} Seu rascunho foi mantido.`);
  } finally {
    busy = false;
    refresh();
  }
});
$("#export").addEventListener("click", () => {
  const url = URL.createObjectURL(
    new Blob([`${JSON.stringify(draft, null, 2)}\n`], {
      type: "application/json",
    }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "game-design-rascunho.json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
window.addEventListener("beforeunload", (event) => {
  if (dirty || busy) {
    event.preventDefault();
    event.returnValue = "";
  }
});
load();
