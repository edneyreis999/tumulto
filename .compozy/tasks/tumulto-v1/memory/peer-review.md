# Peer review — Tumulto V1

## Round 1
- Base main, head a76d252; deep-review nativo, 88 arquivos e 9.116 linhas selecionadas, duas lanes completas e sweep de spec.
- Relatório inicial: FIX_BEFORE_SHIP, cinco defeitos consolidados (três Major, dois Minor) e seis sugestões. Artefatos em .deep-review/tumulto-v1/rounds/round-1 após iniciar round2.
- Todos tratados em ab139f2: frontmatter task06, versão/debrief QA, relógio na contagem, recarregar/Canvas2D/código de erro, foco inicial, papéis na seleção, status obsoleto da spec, catálogo único dos itens, fallback com símbolos, testes de resultado sem identidade/contagem fixa e escopo de persistência nas jornadas. Nenhuma sugestão adiada.
- Validação: 35 Node PASS; sete testes Playwright afetados PASS; check, Prettier e build PASS; retorno público ao menu/seleção/início observado via agent-browser e capturado em docs/qa/evidence/2026-09-15-tumulto-v1/review-selecao.png. Evidência anterior das regras/90s reutilizada sem alteração do motor.
- Próximo passo: revisão incremental das correções, sem repetir seleção inteira nem QA estável.
