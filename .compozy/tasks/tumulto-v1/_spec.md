# Tumulto — especificação da primeira versão

**Estado:** contrato atualizado por decisões do autor; jogo não implementado. O editor local está em desenvolvimento e será verificado/integrado na task_05.  
**Data:** 2026-09-15. **Slug:** `tumulto-v1`. **Idioma do produto:** português brasileiro.

## Decisões e autoridade

As [ADR-003](../../../docs/adr/adr-003-prototipo-solo-contra-bots.md), [ADR-004](../../../docs/adr/adr-004-prototipo-descartavel-e-implementacao-minima.md) e [ADR-005](../../../docs/adr/adr-005-itens-dificuldades-e-game-design.md) registram o escopo vigente: protótipo descartável em JavaScript/CSS/Canvas 2D, testes em Node, câmera fixa, um humano e três bots, tabuleiro 8×8 e regras básicas completas. Sem progresso ou preferências persistentes do jogador. O arquivo de balanceamento é uma exceção explícita de autoria: o autor pediu JSON persistente e dashboard local com Salvar. A etapa futura de RPG Maker/online permanece separada.

Atualização solicitada em 15/09/2026: incorporar setas giratórias e de dois/quatro sentidos, arma em cruz, raio, cadeado, TNT, Nitro e cogumelos; oferecer dificuldades **Padrão** e **Difícil**; concentrar o balanceamento em `game-design.json` e disponibilizar `game-design.html`. Essa ampliação combina itens de variantes distintas em uma arena de conversão por selos. Não declara reprodução exata das quatro arenas originais. Detalhes novos de combinação são hipóteses de playtest, com autoridade em [_items.md](_items.md).

O usuário definiu o nome **Tumulto**, o formato de jogo em HTML com assets simples, a pesquisa como referência mecânica e o universo do seu livro como identidade. Não foi pedido um clone visual nem uma adaptação literal da narrativa.

O modo de **um humano e três bots** foi aceito pelo autor na [ADR-003 — Protótipo solo contra bots como escopo vigente](../../../docs/adr/adr-003-prototipo-solo-contra-bots.md). Até sua substituição, todas as decisões devem considerar a experiência solo. A migração para party online é uma intenção posterior à aprovação do protótipo e não impõe requisitos à etapa atual. Os parâmetros de balanceamento são valores iniciais ajustáveis; textos e identidade editorial continuam propostos.

O nome público é somente **Tumulto**. “Pátio da Áurea” é o nome da arena, não um subtítulo. As propostas narrativas ficam explicitamente separadas do cânone em [_universe.md](_universe.md). Este documento passa a ser a autoridade das regras de Tumulto: dúvidas sobre o funcionamento do jogo de referência não bloqueiam a implementação.

## Documentos

- [_user_stories.md](_user_stories.md): histórias e critérios de aceitação.
- [_uiux.md](_uiux.md): telas, estados, controles e leitura visual.
- [_dx.md](_dx.md): execução local, artefato estático e diagnóstico.
- [_universe.md](_universe.md): personagens, vocabulário, proveniência e adaptação.
- [_tests.md](_tests.md): casos de verificação com um único proprietário.
- [_items.md](_items.md): contrato dos itens adicionais, perigos e interação com as regras básicas.
- [_game-design.md](_game-design.md): JSON, dashboard, validação, gravação e integração com o jogo.
- [_tasks.md](_tasks.md): sequência proposta de implementação.
- [_issue.md](_issue.md): texto preparado para uma futura issue.
- [_preflight.md](_preflight.md): verificações da especificação e pendências de publicação.

# Part I — Product

## Overview

### Problema motivador

Hoje existem pesquisa e personagens, mas nenhuma partida jogável. O leitor precisa conseguir abrir Tumulto, escolher um personagem, entender a disputa e concluir uma rodada sem conhecer o jogo que inspirou a pesquisa.

### Resultado observável

Em um navegador de computador, a pessoa escolhe Ghork, Lala, Drull ou Dam, disputa por uma rodada de duração configurável (inicialmente 90 segundos) um tabuleiro de runas contra os outros três personagens controlados por bots, converte seu território em pontos e vê um resultado que permite revanche.

### Proposta do jogo

Uma atividade encantada no pátio da Áurea saiu do controle. Os quatro amigos saltam entre pedras rúnicas: cada aterrissagem deixa sua marca, e os selos espalhados pelo pátio transformam as marcas em pontos. Runas podem ser tomadas pelos rivais antes da conversão. Poções, armas, fluxos, proteção de território e perigos tornam a corrida imprevisível.

Essa é uma **premissa original do spin-off**, não um episódio que o livro afirma ter acontecido. A competição é uma brincadeira entre amigos, sem morte ou combate letal.

## Goals

- G1: concluir uma partida completa, do menu à revanche, usando somente teclado e controles visíveis.
- G2: distinguir runas pendentes de pontos garantidos e tornar legível cada transferência e conversão.
- G3: reconhecer os quatro amigos e a Áurea mesmo com ilustrações geométricas simples.
- G4: tomar decisões entre explorar, tomar runas, coletar selos, obter impulso e atrapalhar rivais.
- G5: ter partidas justas: personagens e bots obedecem às mesmas regras físicas e de pontuação.
- G6: pausar ou perder o foco da janela sem perder tempo de partida nem retomar com movimento preso.

## User Stories

Catálogo canônico: [_user_stories.md](_user_stories.md).

| Histórias | Área |
| --- | --- |
| US-001–US-002 | Entrar, escolher personagem e aprender |
| US-003–US-004 | Mover, marcar e converter runas |
| US-005–US-007 | Impulso, centelha e runa de fluxo |
| US-008 | Oponentes controlados pelo jogo |
| US-009–US-010 | Pausa, resultado e revanche |
| US-011 | Legibilidade, preferências e limites de dispositivo |
| US-012–US-014 | Fluxos adicionais, armas e proteção de território |
| US-015 | Perigos: TNT, Nitro e cogumelos |
| US-016 | Escolher Padrão ou Difícil |
| US-017 | Editar e salvar balanceamento no dashboard |

## Core Features

| ID | Recurso | Comportamento |
| --- | --- | --- |
| F1 | Partida rápida | Um humano, três bots, 90 segundos, todos contra todos |
| F2 | Elenco | Ghork, Lala, Drull e Dam, cada um presente uma vez |
| F3 | Disputa de runas | Aterrissagens marcam o chão; marcas rivais podem ser tomadas |
| F4 | Selos de conversão | Coleta soma todas as próprias runas ao placar e libera suas casas |
| F5 | Itens e perigos | Impulso, Centelha simples/cruz, Raio, Fluxo simples/duplo/cruz, Cadeado, TNT, Nitro e cogumelos |
| F6 | Bots | Padrão e Difícil; mesmas regras do humano, reação e planejamento configuráveis |
| F7 | Fluxo completo | Instruções, contagem inicial, pausa, resultado e revanche |
| F8 | Apresentação legível | Assets reaproveitados, símbolos distintos e linguagem do universo de Ghork |
| F9 | Game design | Dashboard local lê, valida, altera e salva o JSON de balanceamento |

## Business Rules

As regras BR abaixo são normativas para esta versão. Os valores numéricos de balanceamento citados são exemplos da configuração inicial; a autoridade dos valores é `game-design.json`. O dashboard pode alterar esses parâmetros. Os contratos de efeitos e invariantes não se tornam configuráveis apenas por serem escritos em código. A implementação não deve tentar inferir novamente o original.

### BR-01 — Participantes e personagem

- Quatro participantes: os quatro amigos, sem duplicação de personagem.
- O humano escolhe um; os outros três usam a dificuldade escolhida na preparação: “Padrão” (inicial) ou “Difícil”. Todos os bots usam o mesmo perfil na rodada.
- Todos têm a mesma velocidade, colisão, duração de efeitos e capacidade de arma.
- Personagem determina aparência, nome, símbolo e cor, nunca vantagem oculta.
- Os quatro cantos são distribuídos por sorteio reproduzível a cada rodada; escolher personagem não fixa um canto melhor.

### BR-02 — Arena

- Tabuleiro 8×8, coordenadas inteiras de 0 a 7.
- Vizinhança de movimento: norte, leste, sul e oeste. Não há diagonal nem passagem entre bordas opostas.
- Sem buracos, paredes internas, quedas ou piso destrutível.
- Personagens podem atravessar uns aos outros. Não há empurrão nem bloqueio físico.
- Antes da contagem, o chão é neutro. A composição cria o motor somente na liberação da rodada; nesse momento, cada personagem marca sua casa inicial; seu placar continua zero.
- Pintura, item e presença de personagem são informações distintas da casa.

### BR-03 — Relógio e estados

- Fluxo: menu → preparação → contagem `3, 2, 1` → partida → resultado.
- Preparação reúne seleção e instruções. A contagem usa `round.countdownMs` e não consome `round.durationMs`; iniciais três e 90 segundos.
- Somente a fase de partida avança relógio, bots, efeitos, projéteis e geração de itens.
- Pausa congela contagem ou partida e registra a fase de retorno.
- O intervalo de jogo é fechado no início e aberto no fim: eventos no passo de encerramento (`roundTicks`) não pontuam.
- Resultado é calculado uma única vez. A animação de encerramento não abre tempo extra.

### BR-04 — Movimento e entrada

- Saltos usam `movement.normalHopMs` e `movement.impulseHopMs` (iniciais: 600 e 333 ms), convertidos em passos por arredondamento para cima. Veneno multiplica a duração escolhida, conforme `_items.md`.
- A direção é escolhida ao iniciar o salto. Alterá-la no ar só prepara o próximo salto.
- A duração é fixada na decolagem. Ganhar ou perder impulso não acelera nem interrompe um salto já iniciado.
- Sem direção pressionada, permanece no lugar. Animação de repouso não é aterrissagem nova.
- Havendo direções simultâneas, vale a tecla de direção pressionada mais recentemente que ainda esteja segurada; opostas não geram diagonal.
- Direção contra a borda muda a mira, mas não cria salto nem repinta a casa.
- Atordoamento impede começar outro salto e disparar; um salto já em andamento termina normalmente.

### BR-05 — Propriedade das runas

- Aterrissar em casa neutra ou rival atribui sua propriedade ao participante.
- Aterrissar em casa já própria mantém seu dono sem multiplicar a contagem.
- Não há penalidade por revisitar a própria cor. Casa rival protegida por cadeado não pode ser repintada; o personagem ainda pode atravessar e coletar seu item.
- Tomar uma runa rival altera apenas território pendente, nunca pontos já convertidos.
- Não existe pontuação passiva, bônus por salto, fechamento de círculo ou captura automática de interiores.

### BR-06 — Conversão

- Um **Selo de Conversão** ocupa uma casa e pode ser coletado por qualquer participante ao aterrissar.
- A casa de aterrissagem é marcada **antes** da conversão e participa da contagem.
- Cada casa própria vale um ponto, inclusive casas desconectadas do caminho recente.
- `ganho = número de casas próprias`; `placar += ganho`; todas essas casas tornam-se neutras.
- O selo é consumido. Território dos outros participantes e outros itens não são removidos.
- Não há permanência automática da marca sob o coletor após a conversão: é necessário sair e voltar para marcar de novo.
- Exemplo: quatro runas próprias antes de aterrissar em selo sobre casa neutra resultam em cinco pontos e zero runas pendentes depois.

### BR-07 — Itens e disponibilidade

- Uma casa contém no máximo um recurso/perigo. Pintura e personagem são informações separadas.
- Selos têm geração própria: `initialSeals` no início, teto `maxSeals` e reposição individual após `sealRespawnMs`. Não expiram. Se a criação inicial não tiver vagas, o saldo fica pendente.
- Recursos e perigos adicionais compartilham `maxOtherItems`; tentativa em `firstItemMs` e depois `itemIntervalMs`; teto atingido descarta a tentativa. Peso zero desativa um tipo; pesos positivos são normalizados para probabilidade.
- `itemLifetimeMs` limita permanência no chão; TNT já armada permanece até explodir, ocupa vaga e ignora essa expiração.
- Casas válidas: sem item, sem jogador ou destino reservado e distância Manhattan estritamente maior que `minDistance` de todas as posições lógicas e destinos. Distribuição `uniform` escolhe uniformemente; `sparse` pesa cada casa por `1 + menor distância Manhattan` ao conjunto de posições/destinos.
- Sem vaga para selo devido: repetir no próximo passo. Para outros itens: esperar a próxima tentativa.
- Consumo e vencimento precedem geração. Item novo só pode ativar em aterrissagem posterior. Não favorecer humano ou placar.
- Inventário e comportamento de cada tipo: [_items.md](_items.md). Todos os tipos pedidos começam com peso positivo no JSON inicial.

### BR-08 — Elixir de Impulso

- Coleta ativa `effects.impulseMs` de impulso imediatamente (inicialmente oito segundos).
- Recoleta segue `effects.impulseRefresh`: `renew` renova a partir de agora; `extend` soma ao término ainda ativo. O padrão inicial é `renew`.
- Ocupa um estado separado da arma: pode coexistir com Centelha.
- Acerto de Centelha encerra o impulso atual. O salto já iniciado conserva sua duração.

### BR-09 — Armas

- Arma única equipada: Centelha simples, Centelha em cruz ou Raio elétrico; cargas definidas em `weapons`. Coletar outra arma substitui o tipo/cargas; mesmo tipo soma até o teto, consumindo a coleta.
- Disparo é um pulso, permitido somente no chão sem atordoamento. Disparo inválido não consome nem fica enfileirado. Disparar em cruz consome uma carga e produz quatro projéteis.
- Velocidade, raio, vida útil, atordoamento, proteção posterior, capacidade e alcance do raio vêm do JSON.
- Acerto remove arma/impulso da vítima, atordoa e concede proteção contra armas durante atordoamento mais o período posterior. Salto iniciado termina, marca e pode coletar; item coletado após o impacto funciona sem cancelar o atordoamento.
- Pontos e território não são roubados por armas. O atacante não é atingido pela própria arma. Regras de raio, cruz e simultaneidade estão em [_items.md](_items.md).

### BR-10 — Fluxos

- Tipos simples, duplo e cruz. Simples e duplo giram 90° a cada `flow.rotationMs`; a cruz é invariável.
- A direção inicial é sorteada. Coleta usa a direção exibida no passo da aterrissagem e consome a runa.
- Simples pinta a casa e semirreta até a borda; duplo pinta linha/coluna inteira; cruz pinta ambas (até 15 casas distintas).
- Não ativa itens em cadeia nem converte pontos. Respeita cadeado e conflitos por casa. Detalhes em [_items.md](_items.md).

### BR-11 — Disputas simultâneas

- Duas ou mais aterrissagens na mesma casa e no mesmo passo formam uma disputa única. Um vencedor marca a casa e coleta seu item, se houver.
- Vencedor definido por `rules.sameCellPriority` (`rotating` ou `seededRandom`), reproduzível; nunca por um privilégio constante do slot humano.
- Os outros personagens terminam seus movimentos na mesma casa, sem pintura ou coleta adicional naquele passo. Sobreposição visual usa deslocamento pequeno dos avatares, sem alterar a regra.
- A prioridade também resolve interseções de fluxos e vítimas à mesma distância do mesmo projétil.
- Conversões simultâneas em casas diferentes contam a fotografia do território após todas as aterrissagens e fluxos daquele passo. Como cada casa tem um único dono, nenhum ponto é duplicado.
- O algoritmo e a ordem exatos ficam na Parte II; não usar ordem de callbacks do navegador.

### BR-12 — Fim e revanche

- Vence o maior placar convertido. Runas pendentes não são convertidas no encerramento.
- Empate pelo primeiro lugar é resultado válido, incluindo empate com zero pontos. Não há morte súbita nem critério secreto por território.
- Resultado lista os quatro personagens, pontos e colocação; empatados compartilham colocação.
- Revanche mantém personagem e preferências, cria rodada nova com outra semente e zera todo estado transitório.
- Voltar ao menu encerra a rodada atual. Ao sair durante uma partida, há confirmação “Sair desta partida?”; revanche na tela de resultado não exige confirmação extra.

### BR-13 — Bots e equidade

- Bots usam as mesmas entradas e validações que o humano.
- Decidem conforme `bots.standard.decisionMs` ou `bots.hard.decisionMs`; movimento em curso não é interrompido para trocar de objetivo.
- Podem consultar apenas estado atual público: casas, itens, posições, mira, efeitos e tempo restante. Não leem futuras gerações, entrada humana pendente ou resultados futuros do sorteio.
- Priorizam selos quando possuem território, itens úteis e casas neutras/rivais. Disparam quando há oponente vulnerável alinhado à frente.
- Não existe ajuste de velocidade, geração de itens ou precisão física por dificuldade ou placar.
- Dois perfis nesta versão: Padrão e Difícil. Reação, planejamento, erros e pesos são configuráveis. Difícil não recebe velocidade extra, imunidade, visão futura ou itens favorecidos.

### BR-14 — Controles e interrupções

- Movimento: WASD ou setas. Disparo: Espaço. Pausa/retorno: Escape ou botão visível “Pausar”.
- Controles de jogo são capturados apenas durante contagem/partida com a área de jogo ativa. Não interferem com botões focados nos menus.
- Ao ocultar a aba ou perder foco da janela, pausar automaticamente e limpar teclas pressionadas. Não retomar automaticamente.
- Suspensão longa do navegador não consome a rodada retroativamente.
- Recarregar a página abandona a rodada. A primeira versão não promete recuperar partida em andamento.

### BR-15 — Identidade e legibilidade

- Nenhum nome, personagem, ícone, caixa com exclamação, bota vermelha, míssil, veículo de salto, interface, som ou cenário do universo de referência aparece no produto.
- Personagens saltam com impulsos do piso encantado; não usam pogo sticks nem equipamentos equivalentes associados à referência.
- Cor acompanha o personagem e vem sempre acompanhada de símbolo; tamanho visual não muda a área de acerto.
- Vocabulário e limites de cânone estão em [_universe.md](_universe.md).
- Reaproveitar assets de `/Users/edney/projects/coreto/projectX/frontend/img`, copiando apenas os usados para recursos locais do protótipo; não carregar caminhos absolutos em runtime. Usar figuras simples onde faltar asset. Acabamento e produção de imagens não bloqueiam avaliar as mecânicas.

### BR-16 — Cadeado e perigos

Cadeado protege a propriedade, TNT explode após ativação, Nitro explode no contato e cogumelo causa veneno. Contratos completos, ordem de efeitos e valores configuráveis em [_items.md](_items.md). A combinação inicial usa efeitos temporários sem eliminação como hipótese de playtest; não recria os desafios de cristal.

### BR-17 — Game design e configuração por rodada

O autor abre `game-design.html`, altera parâmetros e salva `game-design.json` no disco. JSON inválido e gravação concorrente não sobrescrevem o arquivo silenciosamente. Cada nova rodada/revanche carrega uma configuração validada e imutável até seu fim. Alteração durante a partida vale apenas na próxima. O painel mostra que a integração com o jogo ainda está pendente. Contrato: [_game-design.md](_game-design.md).

## User Experience

Pessoa que não leu o livro: entende as regras em três frases, escolhe um amigo pelo nome e visual, joga e reconhece quando pontuou. Leitor: identifica o grupo e o humor, sem depender de spoilers ou relações narrativas novas tratadas como cânone.

Jornada principal: abrir → Jogar → escolher personagem → revisar controles → Começar → contagem → disputar → resultado → Jogar novamente.

Inventário de estados e mapeamento de produção: [_uiux.md](_uiux.md), S1–S6. Critérios verificáveis: [_user_stories.md](_user_stories.md).

## High-Level Technical Constraints

- Aplicação HTML/CSS/JavaScript executável como site estático, sem conta, backend de partida, downloads de modelos ou chamadas de IA. O dashboard de autoria possui servidor Node exclusivamente local para gravar seu JSON.
- Jogabilidade de computador com teclado. Menus adaptáveis a telas pequenas; requisitos de tamanho e controles são mostrados antes de iniciar.
- A partida funciona depois do carregamento dos recursos locais, sem depender de rede para regras ou bots. Instalação offline/PWA não está prometida.
- Nenhum dado do manuscrito, caminho local, telemetria ou informação pessoal é enviado por funcionalidades do jogo.
- Botões com teclado, foco visível, cores redundantes com símbolos e redução de movimento. A grade dinâmica não promete equivalência completa para jogo não visual nesta versão.
- Diagnóstico para desenvolvedores por execução local, testes de regras, JSON de balanceamento e relatório de diagnóstico; não criar infraestrutura de daemon, CLI de serviço ou integrações Compozy sem necessidade do jogo.

## Non-Goals — recorte proposto de V1

Esta seleção é proposta para a primeira entrega e pode ser alterada na revisão; não registra uma recusa do usuário.

- Multiplayer local/online, equipes e matchmaking: a primeira experiência é uma partida solo completa contra bots.
- Seleção entre as quatro variantes, captura por contorno, bordas móveis, penalidade por pisar na própria cor, roubo por míssil e NPC Ripper Roo: não foram incluídos na ampliação de itens. Proteção de território e perigos estão incluídos.
- Campanha do livro, Prova de Fogo, gemas, relíquias, torneio de rodadas e progressão: esta versão representa uma brincadeira lateral com rodada única.
- Poderes exclusivos por personagem: elenco reconhecível com equidade mecânica primeiro.
- Gamepad, touch e suporte a telefone como dispositivo de jogo: controles e espaço de leitura específicos ficam para uma expansão definida posteriormente.
- Modelos 3D, assets comerciais, dublagem, trilha final e extração das ilustrações do PDF: formas próprias e efeitos visuais atendem a entrega.
- Hospedagem, domínio, analytics, anúncios e monetização: preparar o build estático; publicação é outra ação.

## Open Questions

- OQ-01 encerrada pela ADR-003: um humano e três bots.
- OQ-02, editorial: validar a brincadeira no pátio e os nomes de itens como criações do spin-off. Nada disso passa a integrar automaticamente o cânone do livro.
- OQ-03, acompanhamento: definir repositório GitHub e destino Linear caso o autor queira a publicação/espelhamento. Não há repositório Git neste diretório nem issue de origem informada.

Não há regra de partida deixada como “igual ao Crash” ou “a descobrir”. OQs são escolhas de escopo, editorial e acompanhamento; esta proposta não está marcada como aprovada.

# Part II — Technical

## Executive Summary

Aplicação JavaScript, com ferramenta de build simples a definir na task_01, Canvas 2D para arena e DOM semântico para menus, HUD e diálogos. Sem framework de componentes na primeira versão: o projeto começa vazio e não possui componentes ou design system a reutilizar.

O motor evolui em passos fixos, independente do navegador; RNG com seed facilita testes locais sem compromisso de replay/rollback entre plataformas. Entradas humanas e decisões de bots convergem no mesmo contrato. A renderização lê snapshots, anima saltos e consome eventos para feedback; nunca calcula pontuação nem aplica regras.

## MVP Boundary

`task_01` entrega a partida de território/selos e leitura do JSON; `task_02` acrescenta os três itens básicos; `task_03` fecha legibilidade e build; `task_04` adiciona todos os itens/perigos novos; `task_05` conclui Padrão/Difícil e o dashboard integrado; `task_06` planeja QA e `task_07` executa QA real. Tasks 01–05 implementam o protótipo; 06–07 verificam a entrega. Acabamento visual não é gate de playtest. Grafo e testes: [_tasks.md](_tasks.md).

## Developer Experience

[_dx.md](_dx.md) define comandos, estados de erro, artefato estático e relatório de diagnóstico. [_uiux.md](_uiux.md) define as seis superfícies. Nenhum endpoint HTTP de aplicação, SDK público ou integração remota é necessário.

## System Architecture

| Módulo proposto | Responsabilidade |
| --- | --- |
| `src/game/` | Regras, modelo, tempo lógico, itens, projéteis e eventos |
| `src/ai/` | Decisões dos bots usando estado público e emitindo entrada |
| `src/render/` | Canvas, interpolação, símbolos, partículas e feedback |
| `src/input/` | Teclado, histórico de direções, foco e liberação de entradas |
| `src/ui/` | Menu, preparação, HUD, pausa, resultado e preferências |
| `src/app/` | Composição, ciclo de vida, relógio externo, carregamento do JSON e diagnóstico |
| `src/content/` | Catálogo de personagens e textos aprováveis, sem lógica de jogo |
| `tests/` | Fixtures do motor, integração e jornadas de navegador |

## Architectural Boundaries

- `src/game/` não importa DOM, Canvas, storage, áudio, UI nem AI. Sorteio vem do estado do motor.
- `src/ai/` importa tipos/leitores do motor; não altera diretamente grade, posição ou placar.
- `src/render/` e `src/ui/` recebem estado de leitura e despacham intenções para a composição; não são autoridades de regras.
- `src/content/` fornece metadados; não configura vantagens mecânicas por personagem.
- `src/app/main.js` é a raiz de composição. Não existe `daemon/` neste projeto e não será criado para satisfazer um template.
- Cada transição de aplicação tem um único proprietário; ao reiniciar, desmontar listeners e o ciclo anterior antes de criar outro.

## Implementation Design

### Core Interfaces

```js
// Contrato a implementar. Os valores pertencem à configuração validada da rodada.
createMatch({ seed, humanCharacter, difficulty, config, configRevision });
stepMatch(state, inputs); // avança um passo ativo e retorna { state, events }
decideBot(publicView, playerId, memory, profile); // { input, memory }
```

`difficulty`: `standard` ou `hard`. `inputs` mapeia cada PlayerId 0–3 a `{direction, firePressed}`; direção cardinal ou null. `stepMatch` não recebe callbacks nem tempo de parede. Pausar significa não chamá-la.

Eventos têm `{id, tick, payload}`; id `tick:sequência`, único na rodada. Payload identifica `landed`, `ownership-changed`, `item-collected`, `scored`, `weapon-fired`, `hit`, `effect-changed`, `hazard-armed`, `hazard-exploded`, `finished`, com IDs/casas/valores envolvidos. Eventos notificam, nunca reaplicam regras. Renderização usa o snapshot atual e esvazia filas na revanche.

### Data Models e justificativa

| Estado | Campos e propósito |
| --- | --- |
| `MatchState` | `schemaVersion:1`; `tick:number`; `seed:uint32`; `rngState:uint32`; `status:running\|finished`; `players`; `owners`; `items`; `projectiles`; `pendingSealSpawns`; `nextItemSpawnTick`; `nextEntityId`; `result:null\|MatchResult`; `config`; `configRevision`; `difficulty` |
| `owners` | Array de 64 valores `null\|PlayerId`; única fonte da propriedade; contagem pendente é derivada |
| `PlayerState` | `id`; `characterId`; `controller:human\|bot`; `cell`; `facing`; `hop:null\|{from,to,startTick,durationTicks}`; `score`; `weapon:null\|{kind,charges}`; `impulseUntilTick`; `stunnedUntilTick`; `protectedUntilTick`; `lockUntilTick`; `poisonUntilTick`; `hazardProtectedUntilTick` |
| `ItemState` | `id`; `kind`; `cell`; `spawnTick`; `expiresAtTick:null\|number`; `direction:null\|Direction` somente obrigatório para fluxo |
| `ProjectileState` | `id`; `ownerId`; posição contínua `x,y`; `direction`; `spawnTick`; `expiresAtTick` |
| `pendingSealSpawns` | Uma entrada `{id,dueTick}` por selo consumido; preserva reposição quando não há casa válida |
| `MatchResult` | `scores` e `winnerIds`; colocação derivada, empates preservados |
| `PublicMatchView` | Casas, itens ativos, jogadores públicos e tempo restante; não expõe RNG, filas futuras nem entrada humana |
| `BotMemory` | `nextDecisionTick`, `target`, `targetChosenTick`, RNG próprio e última direção; pertence ao controlador, é zerada na revanche |

Estado da rodada e opções visuais ficam somente em memória. Não há storage de preferências, banco ou migração de saves. `game-design.json` é configuração autoral persistente, distinta de estado do jogador, por solicitação explícita. O jogo copia o JSON validado para a rodada e inclui sua revisão no diagnóstico.

### Constantes e balanceamento

`game-design.json` é a única autoridade dos valores de balanceamento. Catálogo de campos/limites e contrato do dashboard: [_game-design.md](_game-design.md). Grade 8×8, quatro participantes, um dono por casa e pontuação exclusivamente por conversão permanecem invariantes.

Converter cada duração em `ceil(ms * tickRate / 1000)` passos, nunca arredondar para baixo. Configuração inicial gera 5400 passos de rodada, 36/20 de salto, 480 de impulso, 90 de atordoamento de arma, 30 de proteção e 48 de reposição de selo. Instruções e indicadores usam o snapshot efetivo, sem cópia de constantes na UI.

### Ordem de um tick e conflitos

`createMatch` produz tick 0, marca os quatro cantos distribuídos e gera os selos iniciais configurados em casas válidas. Cada passo calcula `t = tick + 1`; estado finalizado retorna sem mudanças. Se `t >= roundTicks`, encerra imediatamente, sem coletar, mover ou gerar eventos de jogo adicionais. Caso contrário:

1. Expirar efeitos, itens não armados e projéteis cujo término seja `<= t`; condições usam `t < untilTick`. Atualizar orientação dos fluxos. Resolver TNTs vencidas conforme `_items.md`.
2. Resolver disparos e início de saltos dos participantes que estavam no chão no começo do tick. Disparo usa a mira atualizada pela direção do mesmo input; ele parte do centro da casa antes do novo salto.
3. Avançar projéteis e posições interpoladas dos saltos; resolver impactos em ordem de contato, empate por id do projétil, antes das aterrissagens que terminem neste tick.
4. Agrupar aterrissagens por casa. Desempatar e aplicar todas as marcas básicas.
5. Ativar perigos/coletar itens não selo; ativar cadeados antes de aplicar fluxos; aplicar fluxos respeitando proteção. Detalhes e simultaneidade em `_items.md`.
6. Obter fotografia da propriedade; somar e limpar os conjuntos dos coletores de selos. Consumir selos e enfileirar reposições.
7. Executar reposições de selo devidas em ordem de `id`; depois a tentativa de outro item. Atualizar estado e emitir eventos imutáveis.

Prioridade `rotating`: ordenar jogadores ciclicamente a partir de `(seed % 4 + t) % 4`. Menor posição vence. `seededRandom`: sortear uma permutação dos envolvidos por disputa, em ordem de casa row-major. Gerar a prioridade de pintura por casa uma única vez no passo e reutilizá-la para aterrissagem e fluxos nessa casa. Empates de alvos usam lista de PlayerIds ordenada antes do sorteio. Proteção por cadeado veta a tomada antes de arbitrar intenções elegíveis. Fluxo prevalece sobre marca básica; selo usa fotografia final. Vencedor da coleta é o definido na aterrissagem, mesmo que sua casa mude depois.

### Geometria de impactos

- Coordenadas contínuas em unidades de casa; centro da casa `(col + 0.5, row + 0.5)`.
- Centro do personagem interpola linearmente entre origem e destino no plano; altura visual do salto é ignorada na colisão.
- Raios lógicos vêm de `movement.playerRadius` e `weapons.projectileRadius`, iguais para os quatro.
- Usar colisão varrida entre posições anterior e nova de projétil/personagem; amostragem apenas no ponto final não é suficiente.
- Entre alvos elegíveis, escolher o primeiro instante de contato dentro do tick; empate exato usa prioridade circular. Remover projétil uma vez.
- Acerto no ar conserva o salto e seu destino. Não criar teletransporte ou knockback.

### Sorteio e reprodução

Semente de produção criada pela composição usando entropia do navegador; não depende de dados pessoais. Motor usa PRNG xorshift32, com deslocamentos 13, 17 e 5, operações uint32 e estado zero normalizado para 1. `randIndex(n) = floor((nextUint32 / 2^32) * n)` para listas em ordem estável. Permutação de cantos por Fisher–Yates.

Somente motor consome o RNG dos itens/disputas. Renderização não altera sorteios. Bots usam RNG separado para erro de decisão e ordem estável para empates, sem ler RNG do motor. Uma semente e a sequência de inputs/ticks reproduzem a rodada; somente a semente, sem inputs, não reproduz decisões humanas.

### Política dos bots

Perfis `bots.standard` e `bots.hard` em `game-design.json`; Padrão inicial: reação 300 ms, horizonte 1 salto, erro 10%; Difícil inicial: 150 ms, 3 saltos, erro 2%. São hipóteses ajustáveis, não engenharia reversa da CPU original.

A cada decisão, enumerar rotas cardinais até `planningHops` (máximo 4; até 256 sequências numa grade aberta). Não ler RNG de geração, entradas humanas ou estado futuro. Avaliar posições atuais de rivais, seus destinos já visíveis, itens e perigos. Rota avaliada não aplica efeitos ao motor.

Utilidade de objetivo = benefício / max(1, distância Manhattan), usando os pesos do perfil: selo = peso × pendentes quando `depositThreshold` atingido ou dentro de `endgameMs`; impulso apenas se sem efeito; arma apenas se sem carga; fluxo = peso × número de casas que mudariam de dono na direção estimada de chegada, excluindo cadeados; cadeado = peso × pendentes se não protegido; casa rival/neutra = peso correspondente. Recursos na mesma casa usam maior benefício, sem somar dupla contagem. Subtrair `danger` por aterrissagem em perigo conhecido/área de TNT que explodirá até a chegada e `contest` quando rival com posição/destino visíveis alcançaria o recurso antes.

Para cada rota, pontuar casas novas elegíveis visitadas uma vez e benefícios dos recursos alcançados uma vez; acrescentar no fim o maior benefício/distância de objetivo restante. Selecionar primeiro passo da rota de maior total. Empates seguem ordem cardinal rotacionada pelo id. Manter objetivo ainda válido até `targetHoldMs`, salvo perigo imediato; desaparecimento ou impossibilidade causa replanejamento na próxima decisão. Com `mistakeChance`, escolher outro primeiro passo legal pelo RNG exclusivo do bot derivado de seed/id; não consumir RNG dos itens. Sem utilidade positiva, explorar vizinho válido priorizando evitar perigo. Reação e horizonte limitam custo; não fazer busca global de estados futuros.

Disparo: só no chão, com carga e alvo vulnerável dentro de `fireRange`. Centelha simples/raio exigem alinhamento com a direção enviada no mesmo input; cruz aceita qualquer eixo. Raio considera todos os alvos elegíveis na semirreta. Entre decisões só direção é mantida; `firePressed` dura um passo. Tests verificam escolhas em fixtures e ausência de oscilação, nunca obrigação de vitória por amostra aleatória.

### Relógio externo e ciclo de vida

Composição usa acumulador de tempo e passo fixo; desenho usa `requestAnimationFrame`. `blur`, `visibilitychange` oculto ou intervalo entre frames superior a `simulation.maxFrameGapMs` durante jogo causam pausa, limpam entradas e descartam o intervalo suspenso. Não acelerar o relógio para compensar suspensão. Reinício cria motor/controladores novos e não deixa intervalos/listeners duplicados.

## Impact Analysis — autoridade única

| Superfície | Impacto | Ação / compatibilidade |
| --- | --- | --- |
| Produto Web | Nova | `/` com fluxo completo; não há rota legada |
| Build / DX | Novo | Scripts em `_dx.md`; nenhum comando anterior a preservar |
| Estado do jogador | Novo | Somente em memória; nenhuma preferência ou rodada persistida |
| Configuração autoral | Nova | JSON versionado e validado; gravação atômica local com revisão; sem alteração da rodada ativa |
| Dashboard | Novo | `/game-design.html`, leitura do JSON e PUT local; não publicar servidor de gravação |
| Motor | Novo / interno | Contratos puros; sem camada de compatibilidade histórica |
| Pesquisa | Preservada | Continua como referência histórica, não é reescrita para parecer regra de Tumulto |
| Livro | Leitura de fonte | Não editar, copiar ou distribuir o PDF; resumo de cânone em `_universe.md` |
| APIs / extensões / agentes | Sem serviço existente | Diagnóstico local e testes; sem MCP, UDS, SDK ou registry de plugins |
| Rastreamento | Pendente | Texto de issue local; destinos externos não identificados |

**Delete targets:** nenhum. Projeto sem código anterior e sem Git. SD-013, usado pela skill, não exige criar compatibilidade inexistente: não há estado antigo a migrar nem API antiga a manter. Mudanças futuras de schema do JSON autoral precisam preservar dados válidos ou fornecer migração explícita; versão desconhecida é rejeitada sem sobrescrever.

## Testing Approach

Testes das regras em Node (node:test ou Vitest conforme task_01); Playwright para jornadas pelo DOM e teclado. Fixtures reais do motor, sem mocks de lógica de pintura, pontuação ou bots. Relógio e entropia são injetados na composição para testes; builds públicos não expõem métodos para editar estado.

[_tests.md](_tests.md) é a autoridade dos IDs, entradas, resultados e matriz de cobertura. Testes não confirmam balanceamento divertido: QA manual observa leitura, ritmo e diversidade de decisões, registrando seed e diagnóstico quando houver falha.

## Monitoring and Observability

Sem analytics remoto. “Copiar diagnóstico” em pausa/erro exporta somente versão, fase, seed, tick, dificuldade, revisão do JSON e código de falha; não inclui PDF, caminho local nem dados do navegador além do necessário descrito em `_dx.md`. Falhas inesperadas interrompem a rodada e exibem recuperação; não concedem vitória nem reiniciam silenciosamente.

## Safety Invariants

1. Cada casa tem zero ou um dono; cada selo tem zero ou um coletor.
2. Placar cresce apenas por conversão válida e não diminui durante a rodada.
3. Resultado e pagamento de cada coleta ocorrem no máximo uma vez.
4. Estado pausado/finalizado não recebe ticks ativos.
5. Renderização e bots não escrevem diretamente no estado canônico.
6. Identidade humana não altera arbitragem, probabilidades ou constantes físicas.
7. Após revanche existe apenas uma composição ativa com seus listeners.
8. Nenhum recurso de runtime precisa ler o livro ou um caminho da máquina do autor.
9. Save inválido ou conflitante não altera o JSON salvo; falha de save mantém rascunho.
10. Uma rodada usa um único snapshot de configuração.
11. Cadeado impede tomada de propriedade, não dá imunidade física.
12. Perigos e armas não subtraem pontos convertidos.

## File References

- [Pesquisa inicial](../../../docs/pesquisa-inicial.md), seções 3–7, 10–13: grade, território/placar e ambiguidades que esta proposta resolve.
- [_universe.md](_universe.md): evidência do livro, identidade e invenções editoriais.
- [_user_stories.md](_user_stories.md), [_uiux.md](_uiux.md), [_dx.md](_dx.md), [_tests.md](_tests.md): contratos complementares.
- [ADR-001](adrs/adr-001-motor-e-primeira-arena.md): motor independente e primeira variante.
- `src/` e `index.html`: jogo a criar. `package.json`, `game-design.html`, `game-design.json`, `tools/game-design*` e `tests/game-design.test.js`: editor local existente; reutilizar e integrar.
- [_items.md](_items.md) e [_game-design.md](_game-design.md): interações novas e contrato do editor/configuração.
- PDF `AF_Miolo_Ghork_214Pgs_14x21cm_V3.pdf`: fornecido pelo autor, consultado localmente, não incluído no repositório. Páginas relevantes indexadas em `_universe.md`.

## Assumptions and Defaults

Uma arena; rodada única; um humano; três bots; quatro personagens equivalentes; desktop com teclado; idioma pt-BR; efeitos visuais; áudio final opcional e não necessário para aceitar V1. Valores iniciais no JSON; assets reaproveitados e substitutos legíveis. Entrega local autorizada via loop; status/evidência nas tasks e memória. Hospedagem e issues não têm destino definido. A combinação dos novos itens usa regras propostas para playtest.

## Architecture Decision Records

- [ADR-001](adrs/adr-001-motor-e-primeira-arena.md): proposta histórica parcialmente superada.
- [ADR-003](../../../docs/adr/adr-003-prototipo-solo-contra-bots.md): solo vigente.
- [ADR-004](../../../docs/adr/adr-004-prototipo-descartavel-e-implementacao-minima.md): protótipo descartável em JavaScript.
- [ADR-005](../../../docs/adr/adr-005-itens-dificuldades-e-game-design.md): itens ampliados, dificuldades e editor de balanceamento.
