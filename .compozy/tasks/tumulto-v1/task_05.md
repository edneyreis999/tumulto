---
status: completed
title: "Entregar dificuldades e dashboard de game design integrado"
type: feature
complexity: high
---

# Entregar dificuldades e dashboard de game design integrado

## Resultado entregável
Autor altera o arquivo real pelo painel; próxima partida usa o novo JSON; jogador escolhe Padrão/Difícil.

## Escopo e propriedade
Concluir/verificar código já iniciado em game-design.html, game-design.json, tools/game-design*; validar servidor, save atômico, revisão, erros/rascunho; integrar config snapshot, diagnóstico, bot profiles e seleção/revanche. JSON é autoridade única; sem persistência de preferências do jogador.

O código parcial do painel foi criado antes da execução do loop; esta tarefa só termina após teste e integração, sem presumir conclusão.

## Subtarefas
- [x] Implementar/produzir o resultado pelo fluxo real previsto.
- [x] Executar as verificações próprias e corrigir falhas.
- [x] Registrar evidência e pendências de integração na memória antes de concluir.

## Contratos
[_spec.md](_spec.md), [_items.md](_items.md), [_game-design.md](_game-design.md), [_user_stories.md](_user_stories.md), [_uiux.md](_uiux.md), [_dx.md](_dx.md), [_tests.md](_tests.md). ADRs 003/004/005 prevalecem sobre a ADR-001 histórica.

## Testes e evidência
UT-026, UT-027, UT-028, IT-008, IT-009, IT-010, E2E-007, E2E-008.
Suites e entradas/resultados em `_tests.md`; verificações integradas restantes pertencem à task_07. Evidência desta tarefa em `evidence/task_05/` e `memory/task_05.md`.

## Aceitação
Resultado alcançável, casos atribuídos aprovados e comandos aplicáveis sem falha. Nenhum item simulado só na UI, nenhum save falso, nenhuma regra substituída silenciosamente. Preservar trabalho anterior. Entrega local; nenhum destino de deploy/PR é inventado.
