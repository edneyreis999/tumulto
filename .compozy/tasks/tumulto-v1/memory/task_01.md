# Task Memory: task_01

## Objective Snapshot
Partida básica completa: seleção, bots, runas/selos, pausa, resultado e revanche.

## Important Decisions
Seguir ADRs 003/004/005; execução local autorizada sem perguntas.

## Learnings
Verificação dentro da task; não usar testes unitários como substituto da jornada de navegador.

## Files / Surfaces
Contratos e arquivos listados na task; mudanças registradas no checkpoint local.

## Errors / Corrections
Escape abria a pausa e o comportamento nativo fechava o diálogo no mesmo evento. Corrigido preventDefault somente quando o jogo trata Escape; dialogs receberam nomes acessíveis. Reexecução do teste afetado passou.

## Ready for Next Run
PASS — 10 testes Node aprovados (UT-001–009 e IT-001); E2E-001/IT-003 aprovados no navegador; E2E-002/IT-002/IT-004 aprovados após correção; check/build OK. Capturas result.png e pause.png.
QA integrada restante pertence às tasks 06/07; aprovação de diversão continua com o autor.
