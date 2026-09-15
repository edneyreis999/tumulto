// Metadata shared by the editor, local server and future game loader.
// Initial balance values live exclusively in game-design.json.
const number = (path, label, min, max, step = 1, unit = '') => ({ path, label, type: 'number', min, max, step, unit });
const choice = (path, label, options) => ({ path, label, type: 'select', options });
export const itemNames = {
  impulse: 'Impulso', spark: 'Centelha', flow: 'Fluxo simples',
  flowDouble: 'Fluxo duplo', flowCross: 'Fluxo em cruz', sparkCross: 'Centelha em cruz',
  beam: 'Raio elétrico', lock: 'Cadeado', tnt: 'TNT', nitro: 'Nitro', mushroom: 'Cogumelo venenoso',
};
export const groups = [
  { id: 'round', title: 'Partida e movimento', description: 'Ritmo da rodada e resposta dos personagens. A arena continua com 8 × 8 casas e quatro participantes.', fields: [
    number('round.durationMs', 'Duração da rodada', 10000, 600000, 1, 'ms'),
    number('round.countdownMs', 'Contagem inicial', 0, 10000, 1, 'ms'),
    number('simulation.tickRate', 'Passos da simulação', 20, 120, 1, 'Hz'),
    number('movement.normalHopMs', 'Salto normal', 100, 2000, 1, 'ms'),
    number('movement.impulseHopMs', 'Salto com impulso', 50, 2000, 1, 'ms'),
    number('movement.playerRadius', 'Raio de colisão do personagem', 0.05, 0.49, 0.01, 'casa'),
  ]},
  { id: 'spawns', title: 'Geração de itens', description: 'Selos têm reposição própria. Os demais recursos e perigos compartilham o limite e o sorteio por pesos.', fields: [
    number('spawns.initialSeals', 'Selos no início', 1, 8),
    number('spawns.maxSeals', 'Limite de selos', 1, 8),
    number('spawns.sealRespawnMs', 'Reposição de selo', 0, 30000, 1, 'ms'),
    number('spawns.firstItemMs', 'Primeiro sorteio de item', 0, 30000, 1, 'ms'),
    number('spawns.itemIntervalMs', 'Intervalo entre sorteios', 100, 30000, 1, 'ms'),
    number('spawns.maxOtherItems', 'Limite de outros itens e perigos', 1, 24),
    number('spawns.itemLifetimeMs', 'Permanência no chão', 500, 120000, 1, 'ms'),
    number('spawns.minDistance', 'Distância mínima de jogadores e destinos', 0, 4, 1, 'casas'),
    choice('spawns.distribution', 'Distribuição espacial', { uniform: 'Uniforme entre casas válidas', sparse: 'Favorecer áreas menos ocupadas' }),
  ]},
  { id: 'weights', title: 'Frequência por item', description: 'O peso é relativo aos demais itens. Zero desativa o aparecimento. A chance é peso ÷ soma dos pesos.', fields:
    Object.entries(itemNames).map(([key, label]) => number(`spawns.weights.${key}`, label, 0, 100)) },
  { id: 'effects', title: 'Impulso, fluxos e cadeado', description: 'Fluxos simples e duplos giram no chão. O cadeado protege o território existente e o que for pintado durante seu efeito.', fields: [
    number('effects.impulseMs', 'Duração do impulso', 100, 60000, 1, 'ms'),
    number('effects.lockMs', 'Proteção do território', 100, 60000, 1, 'ms'),
    number('flow.rotationMs', 'Intervalo de rotação de 90°', 100, 10000, 1, 'ms'),
    choice('effects.impulseRefresh', 'Recoleta de impulso', { renew: 'Renovar duração', extend: 'Somar duração' }),
    choice('effects.lockRefresh', 'Recoleta de cadeado', { renew: 'Renovar duração', extend: 'Somar duração' }),
  ]},
  { id: 'weapons', title: 'Armas e impactos', description: 'Centelha simples, quatro disparos em cruz ou raio instantâneo. Todos usam um único inventário de arma.', fields: [
    number('weapons.maxCharges', 'Capacidade de cargas', 1, 8),
    number('weapons.chargesPerPickup', 'Cargas por coleta', 1, 8),
    number('weapons.projectileSpeed', 'Velocidade da centelha', 1, 40, 0.1, 'casas/s'),
    number('weapons.projectileRadius', 'Raio da centelha', 0.01, 0.4, 0.01, 'casa'),
    number('weapons.projectileLifetimeMs', 'Tempo máximo de voo', 100, 10000, 1, 'ms'),
    number('weapons.stunMs', 'Atordoamento por arma', 100, 10000, 1, 'ms'),
    number('weapons.postProtectionMs', 'Proteção após atordoamento', 0, 10000, 1, 'ms'),
    number('weapons.beamRange', 'Alcance do raio', 1, 8, 1, 'casas'),
  ]},
  { id: 'hazards', title: 'TNT, Nitro e cogumelos', description: 'Perigos do protótipo. Os efeitos iniciais são temporários e não retiram participantes da rodada.', fields: [
    number('hazards.tntFuseMs', 'Contagem da TNT após contato', 100, 10000, 1, 'ms'),
    number('hazards.blastRadius', 'Raio da explosão em quadrado', 0, 3, 1, 'casas'),
    number('hazards.explosionStunMs', 'Atordoamento por explosão', 100, 10000, 1, 'ms'),
    number('hazards.poisonMs', 'Duração do veneno', 100, 60000, 1, 'ms'),
    number('hazards.poisonSlowMultiplier', 'Multiplicador do tempo de salto com veneno', 1, 4, 0.1, '×'),
    number('hazards.postProtectionMs', 'Proteção após explosão', 0, 10000, 1, 'ms'),
  ]},
  { id: 'rules', title: 'Arbitragem e diagnóstico', description: 'Escolhas explícitas de Tumulto para ambiguidades da pesquisa; não são parâmetros comprovados do original.', fields: [
    choice('rules.sameCellPriority', 'Disputa simultânea por casa e item', { rotating: 'Prioridade circular por passo', seededRandom: 'Sorteio reproduzível por disputa' }),
    number('simulation.maxFrameGapMs', 'Interrupção que causa pausa', 100, 2000, 1, 'ms'),
  ]},
  ...['standard', 'hard'].map((profile) => ({ id: profile, title: `Bots · ${profile === 'standard' ? 'Padrão' : 'Difícil'}`, description: 'Dificuldade altera reação, planejamento e escolha de objetivos. Física, visão do estado e sorteios continuam iguais aos do humano.', fields: [
    number(`bots.${profile}.decisionMs`, 'Intervalo de decisão', 50, 2000, 1, 'ms'),
    number(`bots.${profile}.planningHops`, 'Saltos avaliados à frente', 1, 4),
    number(`bots.${profile}.mistakeChance`, 'Chance de escolha subótima', 0, 1, 0.01),
    number(`bots.${profile}.depositThreshold`, 'Runas para priorizar conversão', 1, 64),
    number(`bots.${profile}.endgameMs`, 'Priorizar selos no fim da rodada', 1000, 60000, 1, 'ms'),
    number(`bots.${profile}.fireRange`, 'Distância para tentar disparo', 1, 8, 1, 'casas'),
    number(`bots.${profile}.targetHoldMs`, 'Tempo mínimo mantendo objetivo válido', 0, 5000, 1, 'ms'),
    ...Object.entries({ seal: 'Converter território', impulse: 'Obter impulso', weapon: 'Obter arma', flow: 'Obter fluxo', lock: 'Proteger território', rival: 'Tomar casa rival', neutral: 'Pintar casa neutra', danger: 'Evitar perigos', contest: 'Considerar rival chegando antes' }).map(([key, label]) => number(`bots.${profile}.weights.${key}`, label, 0, 100, 0.1)),
  ]})),
];
export const fields = groups.flatMap((group) => group.fields);
export const getValue = (object, path) => path.split('.').reduce((value, key) => value?.[key], object);
export function setValue(object, path, value) {
  const keys = path.split('.');
  const last = keys.pop();
  const parent = keys.reduce((item, key) => item[key] ??= {}, object);
  parent[last] = value;
}
export function validateConfig(config) {
  const errors = [];
  if (!config || typeof config !== 'object' || Array.isArray(config)) return [{ path: '', message: 'Informe um objeto JSON.' }];
  if (config.schemaVersion !== 1) errors.push({ path: 'schemaVersion', message: 'Versão de configuração não suportada; esperado 1.' });
  for (const field of fields) {
    const value = getValue(config, field.path);
    if (field.type === 'number') {
      if (typeof value !== 'number' || !Number.isFinite(value) || value < field.min || value > field.max ||
          Math.abs((value - field.min) / field.step - Math.round((value - field.min) / field.step)) > 1e-7) {
        errors.push({ path: field.path, message: `${field.label}: use ${field.min} a ${field.max}, em passos de ${field.step}.` });
      }
    } else if (!Object.hasOwn(field.options, value)) errors.push({ path: field.path, message: `${field.label}: opção inválida.` });
  }
  // Reject unknown fields so a misspelling cannot silently change intended balance.
  const allowed = new Set(['schemaVersion', ...fields.map((field) => field.path)]);
  function inspect(object, prefix = '') {
    for (const [key, value] of Object.entries(object)) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if (![...allowed].some((item) => item.startsWith(`${path}.`))) errors.push({ path, message: `Campo desconhecido: ${path}.` });
        else inspect(value, path);
      } else if (!allowed.has(path)) errors.push({ path, message: `Campo desconhecido: ${path}.` });
    }
  }
  inspect(config);
  const check = (condition, path, message) => { if (condition) errors.push({ path, message }); };
  check(config.spawns?.initialSeals > config.spawns?.maxSeals, 'spawns.initialSeals', 'Selos iniciais não podem exceder o limite de selos.');
  check(config.movement?.impulseHopMs > config.movement?.normalHopMs, 'movement.impulseHopMs', 'O impulso não pode tornar o salto mais lento.');
  check(config.weapons?.chargesPerPickup > config.weapons?.maxCharges, 'weapons.chargesPerPickup', 'Cargas por coleta não podem exceder a capacidade.');
  check(!Object.keys(itemNames).some((key) => config.spawns?.weights?.[key] > 0), 'spawns.weights.impulse', 'Pelo menos um item precisa ter peso maior que zero.');
  for (const profile of ['standard', 'hard']) {
    check(config.bots?.[profile]?.endgameMs > config.round?.durationMs, `bots.${profile}.endgameMs`, 'O trecho final não pode exceder a duração da rodada.');
  }
  return errors;
}
