# Tumulto V1 — contrato de testes

Contrato planejado; nenhum caso foi executado contra uma implementação. Fonte: [_spec.md](_spec.md), [_user_stories.md](_user_stories.md), [_uiux.md](_uiux.md) e [_dx.md](_dx.md).

## Estratégia e suites

- `tests/unit/game/`: motor real, tabelas pequenas para regras; Node test runner.
- `tests/unit/ai/`: controlador real sobre `PublicMatchView`.
- Opções visuais somente em memória; persistência do jogador foi retirada pela ADR-004.
- `tests/integration/`: composição com relógio, entropia e plataforma controláveis; nenhuma substituição da lógica de jogo.
- `tests/e2e/`: Playwright, menus/teclado reais e fixtures instaladas somente no bootstrap de teste. Build público não contém essas entradas.
- `npm run test:unit` executa UT e IT; `npm run test:e2e` executa jornadas. Verificações de JavaScript e build são gates adicionais sem inventar IDs de comportamento.

IDs estáveis e propriedade exclusiva em `_tasks.md`; UT-018 foi retirado pela ADR-004. Subvariações de entrada exercitam o mesmo invariante; não exigir quantidade de testes por arquivo.

## Unit tests

| ID / classe | Suite | Entrada e resultado esperado | Owner |
| --- | --- | --- | --- |
| UT-001 — state | `game/setup.test.js` | `createMatch({seed:42,humanCharacter:'dam'})` → 64 casas, quatro personagens distintos, só Dam humano, quatro cantos distintos marcados e todos os placares zero | task_01 |
| UT-002 — boundary | `game/movement.test.js` | No chão em (0,0), direção norte → não sai, não cria salto, mira norte; leste → destino (0,1) | task_01 |
| UT-003 — ordering | `game/movement.test.js` | Salto leste normal começa em t=1; mudar input para sul no ar não altera destino/duração 36; próximo salto usa sul; input nulo não inicia novo salto | task_01 |
| UT-004 — state | `game/ownership.test.js` | Casa de P2 tomada por P1 com placares 7 e 9 → dono P1, placares 7 e 9; reentrada própria não apaga nem multiplica | task_01 |
| UT-005 — happy | `game/scoring.test.js` | P1 possui quatro casas, duas desconectadas; pousa em selo neutro → +5, zero casas próprias; casa/item de P2 permanecem | task_01 |
| UT-006 — concurrency | `game/conflicts.test.js` | P0 e P1 aterrissam no mesmo selo em t, seed controlada → um coletor conforme prioridade circular; variar t muda prioridade; não há consumo duplo | task_01 |
| UT-007 — boundary | `game/result.test.js` | Selo com chegada em t=5399 pode pontuar; chegada em t=5400 não pontua; runas pendentes não entram; todos zero → quatro vencedores; novo step de estado final não muda resultado | task_01 |
| UT-008 — boundary | `game/seals.test.js` | Início tem três selos em posições válidas; consumir um em t=100 gera dueTick=148, não antes; sem casa válida fica pendente e aparece no primeiro tick com vaga; nunca há dois itens na mesma casa | task_01 |
| UT-009 — idempotency | `game/replay.test.js` | Mesma seed 42 e mesmo log de 600 ticks/inputs → mesmos snapshots e eventos, independentemente de chamadas extras ao render; seed 0 normaliza para 1 | task_01 |
| UT-010 — ordering | `game/impulse.test.js` | Coleta em t=100 → until=580; recoleta em t=200 → until=680; salto iniciado antes da expiração conserva 20 ticks mesmo depois; próximo usa 36 | task_02 |
| UT-011 — boundary | `game/spark.test.js` | Inventário 0/1, tentativa aérea, atordoada ou cheia → BR-09; único `firePressed` válido no chão consome 1 e cria 1 projétil; ausência de novo pulso não repete | task_02 |
| UT-012 — boundary | `game/collision.test.js` | Trajeto atravessa primeiro rival elegível, outro protegido e o próprio emissor → acerta somente primeiro elegível no tempo de contato; variação com alvo em movimento exige colisão varrida; empate exato usa prioridade | task_02 |
| UT-013 — state | `game/stun.test.js` | Vítima com arma/impulso é atingida em t=100 durante salto → stunUntil=190, protectedUntil=220, carga/impulso removidos, salto termina e pode coletar; não começa outro salto antes de 190 e não recebe novo acerto antes de 220 | task_02 |
| UT-014 — happy | `game/flow.test.js` | Fluxo leste em (3,3) marca colunas 3–7 da linha 3, toma rivais e mantém item em (3,5); não dispara fluxo/colhe selo nessa outra casa nem altera placar | task_02 |
| UT-015 — concurrency | `game/conflicts.test.js` | Dois fluxos cruzados e duas coletas de selos em casas distintas no mesmo tick → interseção fica com prioridade circular; conversões usam fotografia final e nenhuma casa paga duas vezes | task_02 |
| UT-016 — boundary | `game/items.test.js` | Outros itens só tentam surgir em múltiplos de 120 ticks; teto 3; expirados saem aos 720 ticks de vida; espaço inválido não gera item; listas estáveis e amostras controladas de RNG escolhem cada um dos três tipos | task_02 |
| UT-017 — state | `ai/bots.test.js` | Bot com cinco runas e selo adjacente escolhe selo; objetivo removido replaneja em até 18 ticks; arma/alvo alinhado emite pulso único; view não oferece RNG/futuras entradas; parâmetros físicos vêm do motor comum | task_02 |
| UT-018 — withdrawn | — | Retirado: persistência do jogador rejeitada na ADR-004; reset de opções é coberto em E2E-005 | — |

## Integration tests

| ID | Suite | Fronteira e resultado | Owner |
| --- | --- | --- | --- |
| IT-001 | `match-loop.test.js` | Composição real cria humano e três controladores, roda fixture sem outros itens e com inputs registrados → há movimento/território/conversão, chega ao resultado e preserva invariantes; não usar vitórias estatísticas como assert | task_01 |
| IT-002 | `lifecycle.test.js` | Avançar 300 ticks, pausar, avançar relógio externo 20 s → tick/efeitos iguais; blur, aba oculta ou gap >250 ms pausam sem compensação; continuar requer input novo; inclui pausa de contagem | task_01 |
| IT-003 | `lifecycle.test.js` | Começar/revanche acionados duas vezes e transições menu/partida repetidas → um motor/listener de cada tipo ativo, estado limpo e seleção preservada; reload não restaura rodada | task_01 |
| IT-004 | `keyboard.test.js` | WASD/setas simultâneos, repeat de Space, foco em botão e saída da área de jogo → prioridade da última direção; disparo é borda de tecla; menus recebem teclado normal; teclas antigas não ficam presas | task_01 |
| IT-005 | `effects-loop.test.js` | Motor + bots + emissão de feedback em fixture com três tipos de item → humanos/bots coletam pela mesma via; um impacto gera uma notificação, HUD derivado acompanha carga/efeitos; pausa não envelhece cooldown de bot | task_02 |
| IT-006 | `diagnostics.test.js` | Canvas ausente ou exceção controlada → fase de erro com motor parado e código correto; copiar JSON não expõe campos extras; clipboard negado oferece texto selecionável; recuperação desmonta composição anterior | task_03 |

## End-to-end tests

| ID | Jornada | Resultado verificável | Owner |
| --- | --- | --- | --- |
| E2E-001 | Entrada → Jogar → selecionar Dam pelo teclado → Começar → jogar → resultado → revanche | Dam humano, três nomes distintos de bots, contagem antes do relógio, Pontos/Runas separados, ranking correto para fixture inclusive empate, nova rodada limpa com Dam selecionado | task_01 |
| E2E-002 | Iniciar → jogar → Pausar → Preferências/voltar → Continuar → sair/cancelar → perder foco | Modal/foco corretos, tempo congelado, retorno sem movimento antigo, cancelamento preserva rodada; retorno à janela não continua sozinho | task_01 |
| E2E-003 | Fixture de jogo real com itens visíveis → mover/colher/disparar pelo teclado | Impulso indicado e encerrado, carga visível, centelha atordoa, fluxo marca linha sem converter, selo mostra `+N` e soma correspondente; nenhuma ferramenta de edição em `dist` | task_02 |
| E2E-004 | Abrir em 800×600 / ponteiro coarse → ampliar para 1280×720 com mouse → jogar → reduzir janela | Motivo de incompatibilidade antes de iniciar; menus acessíveis; viewport adequado libera; redução durante jogo pausa e impede continuar até adequação | task_03 |
| E2E-005 | Navegar por todos os menus por teclado → ativar redução de movimento e texturas → recarregar → jogar | Foco visível/retorno de diálogos, opções voltam aos padrões na reabertura, símbolos sempre presentes, arena sem tremor/partículas/salto decorativo; placar e regras não mudam | task_03 |

Os testes de 90 s podem usar relógio controlado do navegador e chamadas regulares de frame. Avanço que simule suspensão >250 ms deve produzir pausa, não contornar essa regra para tornar o teste mais rápido.

## Matriz de cobertura

Cada história e cada edge case tem proprietário. Agrupamento de IDs abaixo não cria novos casos.

| Fonte | Proprietário(s) |
| --- | --- |
| US-001; US-001.EC-1 | UT-001, E2E-001 |
| US-002; US-002.EC-1 | IT-003, E2E-001 |
| US-003; US-003.EC-1 | UT-002, UT-003, UT-004 |
| US-003.EC-2 | IT-004 |
| US-003.EC-3 | UT-006 |
| US-004 | UT-005, UT-008, E2E-001 |
| US-004.EC-1 | UT-006 |
| US-004.EC-2 | UT-015 |
| US-005; US-005.EC-1; US-005.EC-2 | UT-010, E2E-003 |
| US-006 | UT-011, UT-012, UT-013, E2E-003 |
| US-006.EC-1; US-006.EC-2 | UT-011, IT-004 |
| US-006.EC-3 | UT-013 |
| US-006.EC-4 | UT-012, UT-013 |
| US-007; US-007.EC-1 | UT-014, E2E-003 |
| US-007.EC-2 | UT-015 |
| US-008; US-008.EC-1 | IT-001, UT-017, IT-005 |
| US-009; US-009.EC-2 | IT-002, E2E-002 |
| US-009.EC-1 | E2E-002 |
| US-009.EC-3 | IT-003 |
| US-010; US-010.EC-1; US-010.EC-2 | UT-007, E2E-001 |
| US-010.EC-3 | IT-003 |
| US-011 | E2E-004, E2E-005, QA-M01 |
| US-011.EC-1 | E2E-005 |
| US-011.EC-2; US-011.EC-3 | IT-006 |
| BR-07: geração e disponibilidade | UT-008, UT-016 |
| Reprodução do motor e isolamento do render | UT-009 |
| Eventos de efeitos e clocks dos bots | IT-005 |

## Verificação manual necessária

**QA-M01**, owner `task_07`: jogar uma rodada completa no build de produção, percorrer as quatro opções de personagem e inspecionar menu, seleção, partida com efeitos, pausa e resultado. Confirmar silhuetas, humor, contraste, ausência de elementos de Crash e legibilidade em 1280×720. Usar uma passagem com redução de movimento. Capturar evidências e registrar limitações/regras que precisaram de ajuste.

Não transformar “divertido” em um teste unitário nem exigir vitória de um personagem em uma amostra aleatória. Desvios de balanceamento geram observação com contexto; bug de regra impede conclusão. Capturas são evidência da UI implementada, sem requisito de paridade com screenshot do jogo pesquisado.

## Execução e resultados

Todos os casos estão **planejados**. A autoria verifica consistência documental, não passa jogos inexistentes. Cada tarefa registra comando, resultado e evidência ao implementar. Impacto/compatibilidade: [_spec.md — Impact Analysis](_spec.md#impact-analysis--autoridade-única).

## Ampliação de itens, bots e editor

| ID | Suite / entrada → resultado | Owner |
| --- | --- | --- |
| UT-019 | `tests/items.test.js`: rotação no tick de coleta; fluxo simples/duplo/cruz produz conjuntos corretos, sem duplicação | task_04 |
| UT-020 | `tests/items.test.js`: arma cruz cria quatro projéteis por uma carga; troca de arma e teto respeitados | task_04 |
| UT-021 | `tests/items.test.js`: raio atinge dois rivais alinhados, ignora protegido/atacante e não atinge lateral | task_04 |
| UT-022 | `tests/items.test.js`: cadeado veta aterrissagem/fluxo rival, aceita nova pintura e conversão própria, expira no limite | task_04 |
| UT-023 | `tests/items.test.js`: TNT reentrada não rearma, borda recorta explosão, Nitro detona contato, sem cadeia nem ponto perdido | task_04 |
| UT-024 | `tests/items.test.js`: veneno renova sem empilhar; impulso × veneno no próximo salto; duração em curso preservada | task_04 |
| UT-025 | `tests/items.test.js`: coleta de cadeado e fluxo no mesmo tick, conversões e impacto simultâneo respeitam ordem e unicidade | task_04 |
| UT-026 | `tests/game-design.test.js`: schema rejeita campo desconhecido, tipo errado, ranges e relações inválidas; JSON inicial é válido | task_05 |
| UT-027 | `tests/bots.test.js`: perfis usam reação/horizonte/erro do JSON; mesmas entradas/física; view sem RNG futuro | task_05 |
| UT-028 | `tests/bots.test.js`: objetivo some/perigo aparece → replaneja; targetHold evita oscilação em fixture de empate | task_05 |
| IT-007 | `tests/items.test.js`: rodada com recursos/perigos + bots preserva um dono, pontuação por selo e execução até fim | task_04 |
| IT-008 | `tests/game-design.test.js`: GET→PUT válido→ler disco→novo GET conserva valor e revisão; payload inválido não altera bytes | task_05 |
| IT-009 | `tests/game-design.test.js`: duas escritas com mesma revisão → uma salva e outra 409; origem alheia rejeitada | task_05 |
| IT-010 | `tests/config.test.js`: carga inválida falha antes da partida; config nova não altera snapshot de rodada ativa | task_05 |
| E2E-006 | `tests/browser.spec.js`: fixture pública somente no servidor de testes → fluxos, cruz/raio, cadeado e perigos têm estado visual e ação reais | task_04 |
| E2E-007 | `tests/browser.spec.js`: selecionar Difícil→jogar→resultado→revanche mantém perfil; nova visita Padrão | task_05 |
| E2E-008 | `tests/browser.spec.js`: abrir dashboard→alterar→Salvar→recarregar confirma arquivo; erro preserva rascunho; próxima partida usa config salva | task_05 |

| Fonte nova | Cobertura |
| --- | --- |
| US-012 e EC-1 | UT-019, UT-022, E2E-006 |
| US-013 e EC-1 | UT-020, UT-021, UT-025, E2E-006 |
| US-014 e EC-1 | UT-022, UT-025, E2E-006 |
| US-015 e EC-1/EC-2 | UT-023, UT-024, IT-007, E2E-006 |
| US-016 e EC-1 | UT-027, UT-028, E2E-007 |
| US-017 e EC-1 | UT-026, IT-008, E2E-008 |
| US-017.EC-2 | IT-009, E2E-008 |
| US-017.EC-3 | IT-008 (falha de arquivo), E2E-008 (falha de rede) |
| US-017.EC-4 | IT-010, E2E-008 |

As suites podem agrupar cenários pelos riscos; registrar IDs no nome dos testes. Fixtures do motor são reais. E2E usa o bootstrap de testes, nunca endpoint/atalho no build distribuído. QA integrada restante: task_07, com planos task_06. Não declarar playtest aprovado pelo autor.
