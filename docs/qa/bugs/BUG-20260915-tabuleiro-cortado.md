# BUG-20260915-tabuleiro-cortado: parte do tabuleiro fica abaixo da janela

- **Status:** verified
- **Impact (user-side):** Friction
- **Severity:** Medium · **Priority:** P2
- **Persona Affected:** Lia
- **Journey Step:** J-partida-completa, jogar após contagem
- **Scenarios:** GAME-primeira-partida
- **Found:** 2026-09-15 · **Report:** reports/2026-09-15-tumulto-v1.md

## Summary
Em janela 1280×633, o guia centralizado deslocava o tabuleiro e escondia a borda inferior. O guia só nomeava os itens; adicionadas explicações curtas para a primeira partida.

## Reproduction
Charter CH-partida-completa, Feature Tour. Abrir /, clicar Jogar e Começar em 1280×633. Parte inferior ultrapassa janela apesar de ela atender mínimo 960×600.

## Evidence
`docs/qa/evidence/2026-09-15-tumulto-v1/partida.png` e `partida-ativa.png`.

## Fix
Root cause: flex alinhado pelo centro de um guia mais alto que o tabuleiro. Alinhar pelo topo e limitar rolagem ao guia. Explicações dos itens e guia focável por teclado.
Fix commit: 19ded85.
Regression test: tests/browser.spec.js E2E-004 mede tabuleiro no viewport mínimo.

## Verification
Reteste real em 1280×720 e E2E-004 em 960×600 aprovados; tabuleiro inteiro visível.
