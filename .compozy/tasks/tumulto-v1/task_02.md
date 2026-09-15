---
status: pending
title: "Adicionar impulso, centelhas e fluxos à disputa"
type: feature
complexity: high
---

# Adicionar impulso, centelhas e fluxos à disputa

## Resultado entregável
Três itens básicos utilizáveis em partida real, com bots e HUD correspondentes.

## Escopo e propriedade
Impulso, Centelha simples e Fluxo simples; geração/expiração, tiro no chão, colisão varrida, proteção, conversão e ordem de eventos. Fluxo já usa rotação da regra ampliada, evitando implementar regra superada. Suíte de itens/motor e E2E próprio; equilíbrio global continua no QA.

## Subtarefas
- [ ] Implementar/produzir o resultado pelo fluxo real previsto.
- [ ] Executar as verificações próprias e corrigir falhas.
- [ ] Registrar evidência e pendências de integração na memória antes de concluir.

## Contratos
[_spec.md](_spec.md), [_items.md](_items.md), [_game-design.md](_game-design.md), [_user_stories.md](_user_stories.md), [_uiux.md](_uiux.md), [_dx.md](_dx.md), [_tests.md](_tests.md). ADRs 003/004/005 prevalecem sobre a ADR-001 histórica.

## Testes e evidência
UT-010, UT-011, UT-012, UT-013, UT-014, UT-015, UT-016, UT-017, IT-005, E2E-003.
Suites e entradas/resultados em `_tests.md`; verificações integradas restantes pertencem à task_07. Evidência desta tarefa em `evidence/task_02/` e `memory/task_02.md`.

## Aceitação
Resultado alcançável, casos atribuídos aprovados e comandos aplicáveis sem falha. Nenhum item simulado só na UI, nenhum save falso, nenhuma regra substituída silenciosamente. Preservar trabalho anterior. Entrega local; nenhum destino de deploy/PR é inventado.
