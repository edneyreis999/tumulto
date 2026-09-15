# Preflight — escopo autorizado e tasks revisadas

15/09/2026. Revisão documental antes da execução solicitada via cy-loop-tasks.

- ADRs 003/004/005 vinculadas. TypeScript e persistência de preferências removidos das instruções ativas; JSON autoral é exceção explícita solicitada.
- Itens ampliados especificados em `_items.md`, com interações de cadeado/fluxos, armas/impactos e perigos. Efeitos não eliminatórios são default de playtest registrado, após autorização para prosseguir sem perguntas.
- JSON raiz é fonte de parâmetros; schema/UI/server compartilhados, save real no disco, revisão e atomicidade definidos. A integração ainda será concluída em task_05.
- Tasks 01–03 preservam entregas básicas, 04 adiciona recursos, 05 configura/dificuldade/editor, 06–07 formam QA do loop. Grafo linear acíclico 01→02→03→04→05→06→07, sem dependência invertida.
- Testes atribuídos a um owner; UT-018 retirado sem renumerar. Novas histórias US-012–017 mapeadas. QA-M01 pertence à task_07.
- Verificação de links locais e títulos/frontmatter executada: OK.
- Helper de marcadores detectou 3/4, com falso negativo `4-data-model-rationale`: tabela usa `Estado`, não Field/Column/Name; `_spec.md` Data Models descreve campos e razão, `_game-design.md` cataloga config. Não há banco e não se inventou tabela SQL para satisfazer regex.
- Não há referência visual normativa externa; legibilidade, teclado/foco e fluxos reais serão testados. Acabamento não bloqueia playtest.
- Não existe destino remoto. Checkpoints serão locais; PR/CI remota não serão simulados. A ausência de destino não impede implementar, testar e deixar o protótipo disponível localmente.

Review: pacote coerente para execução. Parâmetros são hipóteses configuráveis, não reprodução exata da CPU/timings originais. Avaliação de diversão pelo autor permanece posterior à entrega.
