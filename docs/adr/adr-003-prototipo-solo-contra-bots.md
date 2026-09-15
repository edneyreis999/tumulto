# ADR-003 — Protótipo solo contra bots como escopo vigente

## Status

**Aceita em 15/09/2026**, por decisão explícita do autor durante a entrevista de definição do jogo.

Esta ADR corresponde ao tema “Modelo de execução e conectividade” do [questionário](../../know-issue/README.md). Sua orientação de escopo se aplica a todas as decisões do protótipo enquanto não for formalmente substituída.

## Contexto

Tumulto precisa primeiro validar sua experiência jogável: movimentar-se, marcar runas, tomar território e converter marcas em pontos. A proposta existente prevê um humano contra três bots.

O autor escolheu essa experiência solo para o primeiro protótipo e declarou a intenção de migrar o jogo para um party game online depois de aprová-lo. Essa evolução é uma intenção futura, não um requisito da etapa atual.

## Critérios

- Permitir que uma pessoa experimente a disputa sem depender de outros jogadores.
- Concentrar o trabalho na diversão e na clareza do ciclo de jogo.
- Avaliar escopo, tecnologia, arquitetura e validação pelas necessidades do protótipo solo.
- Evitar trabalho cuja única justificativa seja a futura modalidade online.

## Alternativas

1. **Solo contra bots:** um humano contra três bots. Alternativa escolhida.
2. **Multiplayer local:** pessoas disputando no mesmo computador. Fora do escopo vigente.
3. **Party online desde o protótipo:** pessoas disputando de computadores diferentes. Adiado para depois da aprovação do protótipo e da substituição desta ADR.

## Decisão e justificativa

O primeiro protótipo será uma experiência solo, com **um humano contra três bots**. Seu objetivo é validar a diversão da disputa de runas e da conversão em pontos.

**Até esta ADR ser substituída, todas as decisões devem ser tomadas com a visão dessa experiência solo.** A intenção de criar um party game online não deve impor requisitos, infraestrutura, abstrações ou trabalho antecipado ao protótipo.

Uma escolha também útil para o futuro online pode ser adotada quando tiver justificativa suficiente no protótipo atual. A possibilidade de reutilização, sozinha, não justifica seu custo.

Não fazem parte desta etapa partidas entre humanos, salas online, matchmaking, sincronização de rede, servidores de partida ou tratamento de reconexão. Questões como acesso inicial ao site e funcionamento sem conexão após o carregamento permanecem decisões próprias; escolher solo não as resolve automaticamente.

Esta decisão aprova o modo solo contra bots e sua prioridade. Não aprova automaticamente os demais parâmetros, a stack ou toda a especificação existente.

## Consequências

- As próximas decisões da entrevista e da implementação devem se justificar pelo uso solo contra bots.
- A avaliação inicial pode ocorrer sem reunir outros jogadores ou operar partidas em rede.
- Aceita-se a possibilidade de adaptar ou reescrever partes do protótipo ao migrar para online; não há promessa de migração automática ou de reaproveitamento integral.
- O protótipo pode validar a diversão contra bots, mas não comprova a experiência social ou a viabilidade técnica do party online.
- Propostas anteriores devem ser interpretadas à luz desta ADR quanto ao modo de jogo e à prioridade de escopo.

## Validação

O protótipo deverá permitir experimentar uma partida solo contra três bots e avaliar movimentação, disputa por território e conversão em pontos.

A aprovação será pelo julgamento do autor ao experimentar o jogo, sem critérios formais nesta conversa. Esta ADR registra uma escolha de escopo, não um resultado de playtest ou uma aprovação do protótipo.

A [ADR-004](adr-004-prototipo-descartavel-e-implementacao-minima.md) complementa esta decisão: o protótipo será descartado, e a etapa futura terá nova implementação em plugins para RPG Maker. Isso não altera a prioridade solo vigente.

## Quando revisar

Após o autor aprovar o protótipo, retomar a intenção de migrar Tumulto para um party game online e definir o novo escopo em uma ADR substituta.

A aprovação do protótipo, por si só, não altera esta decisão. A mudança de orientação exige substituição explícita desta ADR, com referência ao novo registro. Até lá, a visão solo contra bots continua vigente.

## Referências

- [Questionário de decisões](../../know-issue/README.md).
- [Especificação proposta de Tumulto](../../.compozy/tasks/tumulto-v1/_spec.md).
- [Proposta anterior de motor e primeira arena](../../.compozy/tasks/tumulto-v1/adrs/adr-001-motor-e-primeira-arena.md), cujas demais decisões continuam propostas.
