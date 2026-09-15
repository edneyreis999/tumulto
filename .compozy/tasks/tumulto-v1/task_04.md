---
status: completed
title: "Adicionar fluxos ampliados, armas, cadeado e perigos"
type: feature
complexity: high
---

# Adicionar fluxos ampliados, armas, cadeado e perigos

## Resultado entregável
Todos os itens solicitados aparecem, são legíveis e alteram a rodada conforme _items.md.

## Escopo e propriedade
Implementar fluxos duplo/cruz, Centelha em cruz, Raio, Cadeado, TNT/Nitro/cogumelos; integrar geração, colisões, efeitos, arbitragem, HUD, instruções e bots. Valores do JSON. Sem eliminação, fechamento de áreas ou NPC de perigo. Não deixar item apenas desenhado sem ação real.

## Subtarefas
- [x] Implementar/produzir o resultado pelo fluxo real previsto.
- [x] Executar as verificações próprias e corrigir falhas.
- [x] Registrar evidência e pendências de integração na memória antes de concluir.

## Contratos
[_spec.md](_spec.md), [_items.md](_items.md), [_game-design.md](_game-design.md), [_user_stories.md](_user_stories.md), [_uiux.md](_uiux.md), [_dx.md](_dx.md), [_tests.md](_tests.md). ADRs 003/004/005 prevalecem sobre a ADR-001 histórica.

## Testes e evidência
UT-019, UT-020, UT-021, UT-022, UT-023, UT-024, UT-025, IT-007, E2E-006.
Suites e entradas/resultados em `_tests.md`; verificações integradas restantes pertencem à task_07. Evidência desta tarefa em `evidence/task_04/` e `memory/task_04.md`.

## Aceitação
Resultado alcançável, casos atribuídos aprovados e comandos aplicáveis sem falha. Nenhum item simulado só na UI, nenhum save falso, nenhuma regra substituída silenciosamente. Preservar trabalho anterior. Entrega local; nenhum destino de deploy/PR é inventado.
