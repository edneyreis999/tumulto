# Tumulto

Protótipo descartável de disputa por runas, com um humano e três bots, em JavaScript e Canvas 2D. Universo de **Ghork e a Prova de Fogo**, de Edney A. Reis Filho. Arte provisória reaproveitada do projeto indicado pelo autor.

## Jogar e ajustar

Requer Node.js 22 ou posterior.

```sh
npm ci
npm run dev
```

- Jogo: http://127.0.0.1:4174/
- Game design: http://127.0.0.1:4174/game-design.html

O painel altera `game-design.json` no disco com **Salvar**. Configuração salva vale na próxima rodada/revanche; uma partida em curso mantém seus parâmetros. O servidor aceita somente o endereço local. Para outra porta: `TUMULTO_DESIGN_PORT=4182 npm run dev`.

WASD/setas movem; Espaço dispara arma equipada; Escape pausa. Saltar pinta, selo converte marcas em pontos. Marcas não convertidas não pontuam no fim. Preferências e progresso não são salvos entre visitas.

## Testar e gerar versão estática

```sh
npx playwright install chromium
npm run check
npm run test:unit
npm run test:e2e
npm run build
npm run preview
```

Preview abre em http://127.0.0.1:4175/. O build em `dist/` funciona servido como site estático, inclusive em subpasta, com recursos relativos. Não inclui servidor de gravação, dashboard ou fixtures de testes. Não há rede para bots/regras após carregamento, contas, telemetria ou manuscrito no bundle.

O dashboard é uma ferramenta local de autoria; abrir seu HTML por `file://` não oferece gravação no projeto. `Exportar rascunho` baixa uma cópia; é diferente de Salvar. Evite editar o arquivo manualmente ao mesmo tempo em que o painel está salvando. Em conflito, exporte o rascunho, recarregue e reaplique as alterações desejadas.

## Diagnóstico e decisões

Pausa e erro oferecem **Copiar diagnóstico**; clipboard negado mostra texto selecionável. O relatório inclui seed, tick, dificuldade e revisão da configuração, sem dados pessoais. Seed sozinha não reproduz os comandos humanos.

[Spec e tasks](.compozy/tasks/tumulto-v1/_spec.md) · [ADRs](docs/adr/) · [Game design](.compozy/tasks/tumulto-v1/_game-design.md). Valores são hipóteses de playtest, não engenharia reversa dos timings originais. Aprovação da diversão cabe ao autor jogando.
