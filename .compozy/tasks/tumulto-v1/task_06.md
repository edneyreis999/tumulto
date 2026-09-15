---
status: completed
title: "Planejar QA integrada e reconciliar evidências"
type: qa-report
complexity: medium
---

# Planejar QA integrada e reconciliar evidências

## Resultado entregável
Plano de jornadas cobrindo o protótipo inteiro e o save de configuração, sem repetir evidência válida.

## Escopo e propriedade
Revisar docs/qa, memórias task_01–05, contratos e riscos; selecionar jornadas restantes, cenários/personas, cobertura visual e matriz de evidências. Plano antes da execução; não afirmar sessões realizadas.

## Subtarefas
- [x] Implementar/produzir o resultado pelo fluxo real previsto.
- [x] Executar as verificações próprias e corrigir falhas.
- [x] Registrar evidência e pendências de integração na memória antes de concluir.

## Contratos
[_spec.md](_spec.md), [_items.md](_items.md), [_game-design.md](_game-design.md), [_user_stories.md](_user_stories.md), [_uiux.md](_uiux.md), [_dx.md](_dx.md), [_tests.md](_tests.md). ADRs 003/004/005 prevalecem sobre a ADR-001 histórica.

## Testes e evidência
Planejamento; sem novos IDs de testes.
Suites e entradas/resultados em `_tests.md`; verificações integradas restantes pertencem à task_07. Evidência desta tarefa em `evidence/task_06/` e `memory/task_06.md`.

## Aceitação
Resultado alcançável, casos atribuídos aprovados e comandos aplicáveis sem falha. Nenhum item simulado só na UI, nenhum save falso, nenhuma regra substituída silenciosamente. Preservar trabalho anterior. Entrega local; nenhum destino de deploy/PR é inventado.
