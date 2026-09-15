# Entrega local — Tumulto V1

## Resultado
- Sete tasks adicionadas/revisadas no grafo vigente e concluídas; contratos de itens, dificuldades e editor implementados.
- Revisão final SHIP: `.deep-review/tumulto-v1/review.md`; todas as reparações posteriores registradas em `peer-review.md`.
- Código final: 7511b1b3297736052342842028432675b151d158. Checkpoint de revisão: a8a6a39d75af46848a129ddf38940e9e310e6128. Commits posteriores são registros de entrega.
- QA: três jornadas reais concluídas, bug encontrado corrigido, zero bugs abertos. Relatório em `docs/qa/reports/2026-09-15-tumulto-v1.md`.
- Verificação reutilizada por escopo: 35 testes Node; 12 casos Playwright cobertos pela suíte e probes afetados; cinco testes de game-design e dois IT-006 repetidos após último ajuste. Check, Prettier, build e diff-check PASS. Sem mudança posterior de código/dependências/configuração.

## Acesso
- Jogo: http://127.0.0.1:4174/
- Editor: http://127.0.0.1:4174/game-design.html
- Servidor local mantido ativo como entrega (PID 48369); runtime/log em `docs/qa/evidence/local-delivery/`. Ambos os caminhos responderam HTTP 200 no fechamento.
- Para reiniciar: `npm run dev` na raiz. Build estático em `dist/`; `npm run preview` serve somente o jogo.
- Salvar valida e grava o `game-design.json` real; alterações entram na próxima partida, inclusive revanche. A rodada ativa mantém seu snapshot.

## Decisões aplicadas sem interromper o autor
TNT/Nitro atordoam e cogumelos reduzem velocidade, sem eliminação. Parâmetros são defaults de playtest; não há alegação de reprodução exata de todas as variantes originais ou validação de diversão pelo autor. Arte provisória conforme ADR-004.

## Limite da fase E remota
`git remote -v` não retornou destinos. Não existe PR ou conjunto de checks remotos a observar. O objetivo local está concluído; publicação/CI do procedimento genérico não foi executada. `state.delivery.ci_status` permanece null, sem inventar aprovação, URL ou head remoto. O detector continuará indicando `phase=E action=await_ci` por exigir esse contrato externo; não significa task de implementação pendente. Não emitir a assinatura de sucesso que pressupõe CI remoto. Nenhuma pergunta foi feita e nenhuma publicação foi tentada.
