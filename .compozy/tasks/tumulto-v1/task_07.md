---
status: completed
title: "Executar QA real do protótipo e painel"
type: qa-execution
complexity: high
---

# Executar QA real do protótipo e painel

## Resultado entregável
Build jogado e painel utilizado de ponta a ponta, defeitos corrigidos e evidência auditável.

## Escopo e propriedade
Executar plano task_06 via navegador e API local; verificar Padrão/Difícil, itens/perigos, pausa/resultado/revanche, save real e snapshot, erros, tamanho/foco. QA-M01 pertence aqui: partida completa, quatro personagens, capturas menu/seleção/partida/pausa/resultado e dashboard. Registrar bugs encontrados/fix/reteste; não afirmar aprovação de diversão pelo autor.

## Subtarefas
- [x] Implementar/produzir o resultado pelo fluxo real previsto.
- [x] Executar as verificações próprias e corrigir falhas.
- [x] Registrar evidência e pendências de integração na memória antes de concluir.

## Contratos
[_spec.md](_spec.md), [_items.md](_items.md), [_game-design.md](_game-design.md), [_user_stories.md](_user_stories.md), [_uiux.md](_uiux.md), [_dx.md](_dx.md), [_tests.md](_tests.md). ADRs 003/004/005 prevalecem sobre a ADR-001 histórica.

## Testes e evidência
QA-M01 e jornadas integradas de docs/qa; reutilizar testes e screenshots válidos.
Suites e entradas/resultados em `_tests.md`; verificações integradas restantes pertencem à task_07. Evidência desta tarefa em `evidence/task_07/` e `memory/task_07.md`.

## Aceitação
Resultado alcançável, casos atribuídos aprovados e comandos aplicáveis sem falha. Nenhum item simulado só na UI, nenhum save falso, nenhuma regra substituída silenciosamente. Preservar trabalho anterior. Entrega local; nenhum destino de deploy/PR é inventado.
