---
status: completed
title: "Entregar uma partida completa de disputa por runas"
type: feature
complexity: high
---

# Entregar uma partida completa de disputa por runas

## Resultado entregável
Partida básica de 90 s configuráveis com seleção de personagem, três bots, movimento, território, selos, pausa, resultado e revanche.

## Escopo e propriedade
Motor JS puro em src/game, controladores iniciais src/ai, composição/input/render/UI mínimos; JSON carregado e validado antes da contagem. Regras BR-01–07, 11–15, base sem power-ups. Reaproveitar assets onde possível; figuras legíveis onde faltarem. Não anunciar itens indisponíveis.

## Subtarefas
- [x] Implementar/produzir o resultado pelo fluxo real previsto.
- [x] Executar as verificações próprias e corrigir falhas.
- [x] Registrar evidência e pendências de integração na memória antes de concluir.

## Contratos
[_spec.md](_spec.md), [_items.md](_items.md), [_game-design.md](_game-design.md), [_user_stories.md](_user_stories.md), [_uiux.md](_uiux.md), [_dx.md](_dx.md), [_tests.md](_tests.md). ADRs 003/004/005 prevalecem sobre a ADR-001 histórica.

## Testes e evidência
UT-001, UT-002, UT-003, UT-004, UT-005, UT-006, UT-007, UT-008, UT-009, IT-001, IT-002, IT-003, IT-004, E2E-001, E2E-002.
Suites e entradas/resultados em `_tests.md`; verificações integradas restantes pertencem à task_07. Evidência desta tarefa em `evidence/task_01/` e `memory/task_01.md`.

## Aceitação
Resultado alcançável, casos atribuídos aprovados e comandos aplicáveis sem falha. Nenhum item simulado só na UI, nenhum save falso, nenhuma regra substituída silenciosamente. Preservar trabalho anterior. Entrega local; nenhum destino de deploy/PR é inventado.
