# Workflow Memory: tumulto-v1

## Objective Snapshot
Executar toda a spec localmente via cy-loop-tasks: jogo solo, todos os itens, Padrão/Difícil, JSON e dashboard com save real. Usuário ausente; continuar sem perguntas.

## Shared Decisions
- ADR-005 registra itens/editor e default de perigos não eliminatórios.
- JavaScript + Node 22, sem framework ou backend de partidas. Servidor local atende gravação autoral e desenvolvimento.
- Não há destino Git remoto; inicializar Git local para checkpoints. Nenhum deploy ou tracker de outro projeto.
- `cy-execute-task` e `cy-workflow-memory` referenciadas pela skill não estão instaladas; executar o procedimento equivalente local da fase B e o schema de memória fornecido, sem bloquear o objetivo.

## Shared Learnings
- Metadados/game-design começaram no turno anterior; tarefa 05 continua responsável por evidência real e integração.

## Open Risks
- Parâmetros novos exigem playtest; isso não bloqueia entrega funcional.
- PR/CI remotos requerem destino ainda inexistente; escopo executável será concluído localmente.

## Open Questions
Nenhuma pergunta ao usuário nesta execução. Nitro/TNT atordoam e cogumelos envenenam, sem eliminação, como escolha conservadora documentada.

## Ready for Next Run
Preflight concluído. Iniciar task_01; manter estado via scripts e evidências por tarefa.
