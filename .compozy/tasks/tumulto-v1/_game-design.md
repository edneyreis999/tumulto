# Game design — JSON e dashboard local

## Fonte única

`game-design.json` na raiz contém os valores iniciais e efetivos de balanceamento, versão 1. `tools/game-design-schema.js` define campos, rótulos, unidades, tipos e limites; é compartilhado pelo painel, servidor e carregador do jogo. Não duplicar valores de balanceamento em UI ou motor. O catálogo gerado abaixo descreve a configuração, sem se tornar outra fonte de valores.

O JSON não inclui manuscrito, assets, progresso ou preferências do jogador. O tabuleiro 8×8, quatro participantes, um dono por casa e pontos exclusivamente por selos são invariantes não editáveis. A configuração autoral persistente é autorizada pela ADR-005.

## Jornada do autor

`npm run game-design` → abrir `http://127.0.0.1:4174/game-design.html` → alterar campos → **Salvar** → arquivo `game-design.json` alterado no disco. A UI mostra campos inválidos, alterações não salvas, salvando, sucesso e erro. **Exportar rascunho** baixa uma cópia e não se apresenta como Salvar. **Recarregar arquivo** pede confirmação se houver alterações pendentes. Fechar/recarregar aba com rascunho usa aviso nativo.

Navegação por seções: partida, geração, pesos, efeitos, armas, perigos, arbitragem, bots Padrão e Difícil. Números têm unidade e limites; pesos mostram probabilidade normalizada. Tudo operável por teclado. Save só habilita para rascunho válido, diferente do salvo e sem conflito.

## Gravação real

Servidor Node sem dependências, somente `127.0.0.1`, porta 4174 ou `TUMULTO_DESIGN_PORT`. Serve uma lista explícita de arquivos do produto; não serve a árvore do projeto. GET `/game-design.json` retorna bytes + ETag da revisão. PUT `/api/game-design` recebe o objeto completo, Content-Type application/json, Origin da própria página e If-Match da leitura.

Validação antes de escrever: campos obrigatórios/tipos/limites/steps, schemaVersion=1, nenhum campo desconhecido, impulso não mais lento que salto normal, cargas por coleta não excedem capacidade, selos iniciais não excedem teto, pelo menos um peso positivo e janela de fim dos bots não maior que rodada. Erros 400 (JSON), 422 (campos), 413 (>64 KB), 428 (sem revisão), 409 (revisão obsoleta), 403 (origem/host), 500 (arquivo). Falha preserva rascunho e não afirma sucesso.

Save serializado entre requisições deste servidor; comparar revisão antes da gravação. Gravar arquivo temporário no mesmo diretório, sincronizar e renomear. Conflito exige recarregar/reaplicar, sem overwrite automático. A verificação detecta mudanças externas já presentes na leitura anterior ao write; não fornece bloqueio transacional contra um editor externo que escreva exatamente durante o rename. Evitar edição manual simultânea ao save.

## Consumo pelo jogo

Antes da contagem de cada rodada (incluindo revanche), carregar `/game-design.json` sem cache, validar e copiar o objeto para o estado da rodada. Incluir `configRevision` (ETag quando disponível; hash do conteúdo no build estático) no diagnóstico. Falha de leitura/validação mantém preparação com erro e Repetir; não usar um default silencioso que mascare o arquivo do autor. Rodada iniciada nunca recarrega config. Preferências visuais são somente da visita atual.

Converter durações com `ceil(ms * tickRate / 1000)`. O ritmo de render não muda regras. Instruções/relógio usam os valores da rodada. Build estático inclui JSON e carregador/schema; servidor de gravação e painel são ferramentas locais, não dependência das regras durante a partida. Save no painel aplica à próxima partida, inclusive em aba de jogo já aberta.

## Dificuldades

A preparação oferece Padrão e Difícil; seleção inicial Padrão, mantida na revanche da mesma visita. Perfis do JSON alteram reação, horizonte limitado de planejamento, chance de escolha subótima, limiares, manutenção de objetivo e pesos. Todos os bots da rodada usam o perfil escolhido. Física e visibilidade são idênticas às do humano. Não há chamadas de modelos de IA.

## Catálogo de parâmetros

Gerado da metadata compartilhada. Os valores iniciais estão somente no JSON.

### Partida e movimento

| Campo | Propósito | Valores aceitos |
| --- | --- | --- |
| `round.durationMs` | Duração da rodada | 10000–600000; passo 1; ms |
| `round.countdownMs` | Contagem inicial | 0–10000; passo 1; ms |
| `simulation.tickRate` | Passos da simulação | 20–120; passo 1; Hz |
| `movement.normalHopMs` | Salto normal | 100–2000; passo 1; ms |
| `movement.impulseHopMs` | Salto com impulso | 50–2000; passo 1; ms |
| `movement.playerRadius` | Raio de colisão do personagem | 0.05–0.49; passo 0.01; casa |

### Geração de itens

| Campo | Propósito | Valores aceitos |
| --- | --- | --- |
| `spawns.initialSeals` | Selos no início | 1–8; passo 1; sem unidade |
| `spawns.maxSeals` | Limite de selos | 1–8; passo 1; sem unidade |
| `spawns.sealRespawnMs` | Reposição de selo | 0–30000; passo 1; ms |
| `spawns.firstItemMs` | Primeiro sorteio de item | 0–30000; passo 1; ms |
| `spawns.itemIntervalMs` | Intervalo entre sorteios | 100–30000; passo 1; ms |
| `spawns.maxOtherItems` | Limite de outros itens e perigos | 1–24; passo 1; sem unidade |
| `spawns.itemLifetimeMs` | Permanência no chão | 500–120000; passo 1; ms |
| `spawns.minDistance` | Distância mínima de jogadores e destinos | 0–4; passo 1; casas |
| `spawns.distribution` | Distribuição espacial | uniform, sparse |

### Frequência por item

| Campo | Propósito | Valores aceitos |
| --- | --- | --- |
| `spawns.weights.impulse` | Impulso | 0–100; passo 1; sem unidade |
| `spawns.weights.spark` | Centelha | 0–100; passo 1; sem unidade |
| `spawns.weights.flow` | Fluxo simples | 0–100; passo 1; sem unidade |
| `spawns.weights.flowDouble` | Fluxo duplo | 0–100; passo 1; sem unidade |
| `spawns.weights.flowCross` | Fluxo em cruz | 0–100; passo 1; sem unidade |
| `spawns.weights.sparkCross` | Centelha em cruz | 0–100; passo 1; sem unidade |
| `spawns.weights.beam` | Raio elétrico | 0–100; passo 1; sem unidade |
| `spawns.weights.lock` | Cadeado | 0–100; passo 1; sem unidade |
| `spawns.weights.tnt` | TNT | 0–100; passo 1; sem unidade |
| `spawns.weights.nitro` | Nitro | 0–100; passo 1; sem unidade |
| `spawns.weights.mushroom` | Cogumelo venenoso | 0–100; passo 1; sem unidade |

### Impulso, fluxos e cadeado

| Campo | Propósito | Valores aceitos |
| --- | --- | --- |
| `effects.impulseMs` | Duração do impulso | 100–60000; passo 1; ms |
| `effects.lockMs` | Proteção do território | 100–60000; passo 1; ms |
| `flow.rotationMs` | Intervalo de rotação de 90° | 100–10000; passo 1; ms |
| `effects.impulseRefresh` | Recoleta de impulso | renew, extend |
| `effects.lockRefresh` | Recoleta de cadeado | renew, extend |

### Armas e impactos

| Campo | Propósito | Valores aceitos |
| --- | --- | --- |
| `weapons.maxCharges` | Capacidade de cargas | 1–8; passo 1; sem unidade |
| `weapons.chargesPerPickup` | Cargas por coleta | 1–8; passo 1; sem unidade |
| `weapons.projectileSpeed` | Velocidade da centelha | 1–40; passo 0.1; casas/s |
| `weapons.projectileRadius` | Raio da centelha | 0.01–0.4; passo 0.01; casa |
| `weapons.projectileLifetimeMs` | Tempo máximo de voo | 100–10000; passo 1; ms |
| `weapons.stunMs` | Atordoamento por arma | 100–10000; passo 1; ms |
| `weapons.postProtectionMs` | Proteção após atordoamento | 0–10000; passo 1; ms |
| `weapons.beamRange` | Alcance do raio | 1–8; passo 1; casas |

### TNT, Nitro e cogumelos

| Campo | Propósito | Valores aceitos |
| --- | --- | --- |
| `hazards.tntFuseMs` | Contagem da TNT após contato | 100–10000; passo 1; ms |
| `hazards.blastRadius` | Raio da explosão em quadrado | 0–3; passo 1; casas |
| `hazards.explosionStunMs` | Atordoamento por explosão | 100–10000; passo 1; ms |
| `hazards.poisonMs` | Duração do veneno | 100–60000; passo 1; ms |
| `hazards.poisonSlowMultiplier` | Multiplicador do tempo de salto com veneno | 1–4; passo 0.1; × |
| `hazards.postProtectionMs` | Proteção após explosão | 0–10000; passo 1; ms |

### Arbitragem e diagnóstico

| Campo | Propósito | Valores aceitos |
| --- | --- | --- |
| `rules.sameCellPriority` | Disputa simultânea por casa e item | rotating, seededRandom |
| `simulation.maxFrameGapMs` | Interrupção que causa pausa | 100–2000; passo 1; ms |

### Bots · Padrão

| Campo | Propósito | Valores aceitos |
| --- | --- | --- |
| `bots.standard.decisionMs` | Intervalo de decisão | 50–2000; passo 1; ms |
| `bots.standard.planningHops` | Saltos avaliados à frente | 1–4; passo 1; sem unidade |
| `bots.standard.mistakeChance` | Chance de escolha subótima | 0–1; passo 0.01; sem unidade |
| `bots.standard.depositThreshold` | Runas para priorizar conversão | 1–64; passo 1; sem unidade |
| `bots.standard.endgameMs` | Priorizar selos no fim da rodada | 1000–60000; passo 1; ms |
| `bots.standard.fireRange` | Distância para tentar disparo | 1–8; passo 1; casas |
| `bots.standard.targetHoldMs` | Tempo mínimo mantendo objetivo válido | 0–5000; passo 1; ms |
| `bots.standard.weights.seal` | Converter território | 0–100; passo 0.1; sem unidade |
| `bots.standard.weights.impulse` | Obter impulso | 0–100; passo 0.1; sem unidade |
| `bots.standard.weights.weapon` | Obter arma | 0–100; passo 0.1; sem unidade |
| `bots.standard.weights.flow` | Obter fluxo | 0–100; passo 0.1; sem unidade |
| `bots.standard.weights.lock` | Proteger território | 0–100; passo 0.1; sem unidade |
| `bots.standard.weights.rival` | Tomar casa rival | 0–100; passo 0.1; sem unidade |
| `bots.standard.weights.neutral` | Pintar casa neutra | 0–100; passo 0.1; sem unidade |
| `bots.standard.weights.danger` | Evitar perigos | 0–100; passo 0.1; sem unidade |
| `bots.standard.weights.contest` | Considerar rival chegando antes | 0–100; passo 0.1; sem unidade |

### Bots · Difícil

| Campo | Propósito | Valores aceitos |
| --- | --- | --- |
| `bots.hard.decisionMs` | Intervalo de decisão | 50–2000; passo 1; ms |
| `bots.hard.planningHops` | Saltos avaliados à frente | 1–4; passo 1; sem unidade |
| `bots.hard.mistakeChance` | Chance de escolha subótima | 0–1; passo 0.01; sem unidade |
| `bots.hard.depositThreshold` | Runas para priorizar conversão | 1–64; passo 1; sem unidade |
| `bots.hard.endgameMs` | Priorizar selos no fim da rodada | 1000–60000; passo 1; ms |
| `bots.hard.fireRange` | Distância para tentar disparo | 1–8; passo 1; casas |
| `bots.hard.targetHoldMs` | Tempo mínimo mantendo objetivo válido | 0–5000; passo 1; ms |
| `bots.hard.weights.seal` | Converter território | 0–100; passo 0.1; sem unidade |
| `bots.hard.weights.impulse` | Obter impulso | 0–100; passo 0.1; sem unidade |
| `bots.hard.weights.weapon` | Obter arma | 0–100; passo 0.1; sem unidade |
| `bots.hard.weights.flow` | Obter fluxo | 0–100; passo 0.1; sem unidade |
| `bots.hard.weights.lock` | Proteger território | 0–100; passo 0.1; sem unidade |
| `bots.hard.weights.rival` | Tomar casa rival | 0–100; passo 0.1; sem unidade |
| `bots.hard.weights.neutral` | Pintar casa neutra | 0–100; passo 0.1; sem unidade |
| `bots.hard.weights.danger` | Evitar perigos | 0–100; passo 0.1; sem unidade |
| `bots.hard.weights.contest` | Considerar rival chegando antes | 0–100; passo 0.1; sem unidade |
