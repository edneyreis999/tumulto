# QA — Dashboard de game design — 16/09/2026

- Escopo: pedido de teste real do dashboard; targeted.
- Build: 593deef, código 7511b1b; alterações locais somente documentação.
- Ambiente: http://127.0.0.1:4174/game-design.html, servidor real, Chromium headed via agent-browser.
- Persona: Edney, autor ajustando balanceamento; desktop e inspeção em largura pequena.
- Charter: CH-balanceamento-salvo, Multi-Tab Tour, 30 minutos; probes adicionais de validação, descarte, exportação e falha de rede.
- Status: closed.

## Matrix
| Jornada | Status |
| --- | --- |
| DSG-salvar-reabrir: salvar, reler, conflito, recuperação e restaurar | Pass |

## Session Debriefs
### CH-balanceamento-salvo — Edney
- Sessão real no Chromium headed: abriu o painel, editou duração 90000→60000 e raio 0.28→0.3; salvou e recarregou, confirmando ambos pela UI.
- Segunda sessão aberta antes da gravação tentou salvar 45000: recebeu conflito, manteve rascunho e impediu sobrescrita. Exportar rascunho baixou JSON válido com 45000. Cancelar o descarte preservou o valor; aceitar recarregou os 60000 salvos pela primeira sessão.
- Validação: duração 1 mostrou três erros; duração vazia foi rejeitada; quatro selos iniciais com limite três mostrou erro cruzado. Salvar ficou indisponível. Correção dos campos removeu os erros.
- Peso do impulso em zero mostrou chance 0.0%; restauração em seis removeu a alteração pendente.
- Offline no navegador: tentativa de salvar 80000 exibiu erro e manteve o rascunho; reconectar e salvar funcionou, persistindo após reload.
- Os quatro seletores foram alterados e salvos em sessão independente usando Playwright headed e selectOption, sem mocks/harness: sparse, extend, extend, seededRandom. Reload confirmou todos. Restauração pela interface também confirmada.
- Particularidade do driver: agent-browser select alterou o valor visual sem atualizar o rascunho; seleção por teclado em popup nativo também não produziu mudança confirmada. Probe independente com Playwright selectOption produziu os eventos esperados e comprovou salvamento/reload dos quatro campos. Não atribuir ao produto uma falha exclusiva desse comando de automação; nenhuma correção de código foi feita. Esta sessão não aprova navegação por teclado nos popups nativos.
- Inspeção visual em 1280×800 e 375×812: campos, descrições, navegação por seção e barra de ações legíveis; bots Difícil alcançável em largura pequena.
- Encerramento: duração 90000, raio 0.28 e todos os seletores originais restaurados pela UI. Comparação byte a byte com original.json confirmou arquivo idêntico. Sessão auxiliar fechada; janela principal deixada aberta no painel restaurado.

## Evidências
Diretório: `docs/qa/evidence/2026-09-16-game-design/`. Capturas inspecionadas: inicial.png, mobile-top.png, mobile-bots.png, seletores-salvos.png; checkpoints adicionais: conflito.png, invalido.png, final-restaurado.png. Exportação: rascunho.json. Backup inicial: original.json.

## Paper Cuts
Durante falha de conexão, a mensagem começa com “Failed to fetch” e termina em português (“Seu rascunho foi mantido.”). Fricção leve de linguagem, sem perda de dados; sugestão de polimento futuro. Nenhum bloqueio funcional confirmado.

## Runtime Errors Observed
Falha de rede provocada intencionalmente; recuperação confirmada. Nenhum erro espontâneo de runtime observado nas consultas finais do console.

## What Was Fixed
Nenhuma alteração de produto necessária ou realizada. Valores restaurados; documentos de know-issue existentes preservados.

## Human Verifications Needed
Nenhuma para o escopo funcional percorrido. Teclado dos seletores nativos não aprovado nesta sessão; não há afirmação de auditoria completa de acessibilidade ou de outros navegadores.

## Decisions for a Human
Nenhuma decisão bloqueante.

## Final Status
- **Gate:** cinco testes Node de game-design PASS; E2E-008 PASS (save, falhas, conflitos e snapshot da partida até revanche); npm run check PASS. Arquivos temporários dos testes isolados do JSON autoral.
- **Impacto:** zero bugs funcionais confirmados; uma observação leve de linguagem registrada acima, sem bloqueio.
- **Cobertura:** 1/1 jornada planejada concluída; UI real com servidor local, mais probes automatizados. Não houve teste de cada combinação possível dos 79 parâmetros nem auditoria de todos os navegadores.
- **Veredito:** dashboard pronto para uso nos fluxos testados. Configuração original preservada; nenhuma publicação/PR solicitada.

