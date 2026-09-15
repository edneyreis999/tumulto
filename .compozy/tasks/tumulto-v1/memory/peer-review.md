# Peer review — Tumulto V1

## Round 1
- Base main, head a76d252; deep-review nativo, 88 arquivos e 9.116 linhas selecionadas, duas lanes completas e sweep de spec.
- Relatório inicial: FIX_BEFORE_SHIP, cinco defeitos consolidados (três Major, dois Minor) e seis sugestões. Artefatos em .deep-review/tumulto-v1/rounds/round-1 após iniciar round2.
- Todos tratados em ab139f2: frontmatter task06, versão/debrief QA, relógio na contagem, recarregar/Canvas2D/código de erro, foco inicial, papéis na seleção, status obsoleto da spec, catálogo único dos itens, fallback com símbolos, testes de resultado sem identidade/contagem fixa e escopo de persistência nas jornadas. Nenhuma sugestão adiada.
- Validação: 35 Node PASS; sete testes Playwright afetados PASS; check, Prettier e build PASS; retorno público ao menu/seleção/início observado via agent-browser e capturado em docs/qa/evidence/2026-09-15-tumulto-v1/review-selecao.png. Evidência anterior das regras/90s reutilizada sem alteração do motor.
- Próximo passo: revisão incremental das correções, sem repetir seleção inteira nem QA estável.

## Round 2
- Revisão incremental em e20b56b3b5859bfd7be5d603f8f3a4aceec87fdc: **SHIP**, sem Critical/Major ou divergência com os contratos. Relatório: `.deep-review/tumulto-v1/review.md`; duas lanes e sweep de spec concluídos. Os onze achados da rodada anterior foram resolvidos.
- Um achado Minor e quatro sugestões foram tratados em 7511b1b3297736052342842028432675b151d158 e neste registro: IT-010 tenta alterar a configuração ativa e outra ramificação aninhada da origem, título do teste não fixa quantidade de campos, confirmação de cópia fica visível na tela fatal e status final passa a ter esta evidência da rodada dois. Nada adiado.
- Pós-reparação: cinco testes de game-design PASS, dois testes IT-006 de navegador PASS, check/Prettier/build/diff-check PASS. Screenshot runtime-error.png inspecionada: código, confirmação de cópia e recuperação legíveis. Evidência anterior de 35 testes Node, demais testes de navegador e três jornadas reais continua válida nos caminhos inalterados.
- O relatório preserva os achados observados no snapshot revisado; este registro documenta a remediação subsequente, conforme fase D. Sem nova rodada desnecessária para as correções pequenas já verificadas.
- Resultado local: revisão SHIP e verificação PASS; seguir fechamento da entrega local.
