# ADR-005 — Itens ampliados, dificuldades e editor local de game design

## Status
Aceita em 15/09/2026 para o escopo explicitamente solicitado pelo autor; parâmetros e combinação dos efeitos são hipóteses de implementação/playtest. O autor autorizou execução completa via cy-loop-tasks, sem pausas para perguntas.

## Decisão
Adicionar fluxos giratórios, duplos e em cruz; Centelha em cruz; Raio elétrico; Cadeado; TNT, Nitro e cogumelos venenosos. Manter a arena 8×8 de conversão por selos. Oferecer Padrão e Difícil. Centralizar parâmetros de balanceamento em `game-design.json`; criar `game-design.html` com leitura, alteração e Salvar que grava o arquivo.

## Contexto e alternativas
O navegador servido não grava silenciosamente um arquivo do projeto sem uma ponte. Usar Node local, já aceito para o protótipo, com leitura e PUT de um único arquivo. Download de cópia não satisfaz Salvar. Não introduzir banco ou serviço de partidas. O JSON é configuração de autoria persistente; esta exceção explícita complementa a ADR-004 e não autoriza salvar preferências/progresso do jogador.

## Defaults de implementação
Os itens de variantes diferentes coexistem como experimento de Tumulto. TNT e Nitro atordoam; cogumelos envenenam e atrasam saltos; não há eliminação. Isso preserva a rodada com quatro participantes e é uma adaptação declarada, não uma alegação sobre os cristais originais. A inclusão de Ripper Roo, captura por contorno, penalidade de própria cor, roubo por míssil e demais modos não foi solicitada. Detalhes em `_items.md`.

## Consequências e validação
O jogo carrega um snapshot validado do JSON em cada nova rodada; Save não muda uma partida ativa. Editor funciona só em loopback e usa gravação atômica e verificação de revisão. Testes de arquivo e navegador verificam o save real. Dificuldade altera decisões dos bots, nunca sua física ou conhecimento de informação oculta. Playtest do autor continua sendo a aprovação de diversão.

## Referências
- [ADR-004](adr-004-prototipo-descartavel-e-implementacao-minima.md)
- [Spec](../../.compozy/tasks/tumulto-v1/_spec.md)
- [Itens](../../.compozy/tasks/tumulto-v1/_items.md)
- [Game design](../../.compozy/tasks/tumulto-v1/_game-design.md)
