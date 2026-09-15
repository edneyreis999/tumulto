---
schema_version: "compozy.tasks/v2"
workflow: tumulto-v1
graph:
  nodes:
    - id: task_01
      file: task_01.md
    - id: task_02
      file: task_02.md
    - id: task_03
      file: task_03.md
    - id: task_04
      file: task_04.md
    - id: task_05
      file: task_05.md
    - id: task_06
      file: task_06.md
    - id: task_07
      file: task_07.md
  edges:
    - from: task_01
      to: task_02
    - from: task_02
      to: task_03
    - from: task_03
      to: task_04
    - from: task_04
      to: task_05
    - from: task_05
      to: task_06
    - from: task_06
      to: task_07
---

# Tumulto — grafo de implementação e QA

Execução autorizada pelo autor via cy-loop-tasks. Status por frontmatter; topologia somente aqui. Tasks 01–05 implementam; 06–07 planejam/executam QA. Não há despacho paralelo implícito.

| Tarefa | Tipo | Resultado | Depende de |
| --- | --- | --- | --- |
| [task_01](task_01.md) | feature | Entregar uma partida completa de disputa por runas | — |
| [task_02](task_02.md) | feature | Adicionar impulso, centelhas e fluxos à disputa | task_01 |
| [task_03](task_03.md) | frontend | Concluir legibilidade, acessibilidade e build local | task_02 |
| [task_04](task_04.md) | feature | Adicionar fluxos ampliados, armas, cadeado e perigos | task_03 |
| [task_05](task_05.md) | feature | Entregar dificuldades e dashboard de game design integrado | task_04 |
| [task_06](task_06.md) | qa-report | Planejar QA integrada e reconciliar evidências | task_05 |
| [task_07](task_07.md) | qa-execution | Executar QA real do protótipo e painel | task_06 |

## Testes com owner único

- task_01: UT-001, UT-002, UT-003, UT-004, UT-005, UT-006, UT-007, UT-008, UT-009, IT-001, IT-002, IT-003, IT-004, E2E-001, E2E-002.
- task_02: UT-010, UT-011, UT-012, UT-013, UT-014, UT-015, UT-016, UT-017, IT-005, E2E-003.
- task_03: IT-006, E2E-004, E2E-005.
- task_04: UT-019, UT-020, UT-021, UT-022, UT-023, UT-024, UT-025, IT-007, E2E-006.
- task_05: UT-026, UT-027, UT-028, IT-008, IT-009, IT-010, E2E-007, E2E-008.
- task_06: Planejamento; sem novos IDs de testes.
- task_07: QA-M01 e jornadas integradas de docs/qa; reutilizar testes e screenshots válidos.

UT-018 retirado pela ADR-004. Não renumerar IDs. O review documental e checklist de cobertura estão em `_preflight.md`. Memórias e state.yaml registram execução real.
