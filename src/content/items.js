// Shared item identity for gameplay, help and the authoring dashboard.
export const items = {
  seal: { symbol: "◎", label: "Selo", help: "Converte suas runas em pontos." },
  impulse: { symbol: "↑", label: "Impulso", help: "Acelera os saltos." },
  spark: {
    symbol: "✧",
    label: "Centelha",
    help: "Uma centelha na direção em que você olha.",
  },
  flow: {
    symbol: "➜",
    label: "Fluxo simples",
    help: "Pinta uma linha; a seta gira.",
  },
  flowDouble: {
    symbol: "↔",
    label: "Fluxo duplo",
    help: "Pinta nos dois sentidos da seta.",
  },
  flowCross: {
    symbol: "✣",
    label: "Fluxo em cruz",
    help: "Pinta linha e coluna.",
  },
  sparkCross: {
    symbol: "✥",
    label: "Centelha em cruz",
    help: "Dispara nas quatro direções.",
  },
  beam: {
    symbol: "ϟ",
    label: "Raio elétrico",
    help: "Atinge rivais em linha reta.",
  },
  lock: {
    symbol: "▣",
    label: "Cadeado",
    help: "Protege suas runas contra rivais.",
  },
  tnt: { symbol: "T", label: "TNT", help: "Arma uma explosão ao pisar." },
  nitro: {
    symbol: "N",
    label: "Nitro",
    help: "Explode imediatamente ao pisar.",
  },
  mushroom: {
    symbol: "☂",
    label: "Cogumelo venenoso",
    help: "Deixa seus saltos mais lentos.",
  },
};
export const enabledItems = Object.keys(items).filter(
  (kind) => kind !== "seal",
);
export const itemSymbols = Object.fromEntries(
  Object.entries(items).map(([kind, item]) => [kind, item.symbol]),
);
export const itemLabels = Object.fromEntries(
  Object.entries(items).map(([kind, item]) => [kind, item.label]),
);
export const itemNames = Object.fromEntries(
  enabledItems.map((kind) => [kind, items[kind].label]),
);
