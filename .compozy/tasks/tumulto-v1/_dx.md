# Tumulto — execução local

## Comandos da entrega

- `npm ci`: instala dependências de testes travadas no lockfile.
- `npm run dev`: serve jogo em `http://127.0.0.1:4174/` e dashboard em `/game-design.html`, com gravação real do JSON.
- `npm run game-design`: mesmo servidor local; entrada direta do painel.
- `npm run build`: gera `dist/` estático com index, JS/CSS, assets utilizados e JSON. Não inclui dashboard, servidor de escrita ou fixtures de testes.
- `npm run preview`: serve `dist/` em `http://127.0.0.1:4175/`; sem endpoint de gravação.
- `npm run test:unit`: testes Node de motor, itens, bots, configuração e servidor.
- `npm run test:e2e`: Playwright sobre servidor isolado de testes; instalar Chromium com `npx playwright install chromium`.
- `npm run check`: sintaxe JavaScript e contratos/documentos locais relevantes.

Node 22+. Porta ocupada falha, sem trocar silenciosamente. `TUMULTO_DESIGN_PORT` permite outra porta explícita. Não há GitHub/Linear/hosting definido; entrega local com checkpoints Git, sem publicar para repositório de outro projeto.

## Dashboard e configuração

Contrato completo em [_game-design.md](_game-design.md). O botão Salvar grava `game-design.json`, não apenas baixa um arquivo. O servidor de autoria opera somente em loopback; build de jogo é independente dele após carregar recursos. HTML não é prometido por `file://`.

## Diagnóstico da partida

Copiar diagnóstico em pausa/erro produz `{schemaVersion:1,game:'Tumulto',version:'0.1.0',phase,seed,tick,difficulty,configRevision,errorCode}`. Antes de rodada, seed/tick podem ser null. Sem stack/caminhos/manuscrito/dados pessoais. Clipboard negado mostra texto selecionável. Seed sem inputs não reproduz decisões humanas.

## Falhas

JSON ausente/inválido → preparação com explicação e Repetir; não iniciar com configuração silenciosa. Canvas indisponível → mensagem e Recarregar. Erro inesperado → motor parado, diagnóstico e menu. Viewport abaixo de 960×600 pausa e impede iniciar/continuar, com explicação. Menus permanecem utilizáveis. Interrupção/foco perdido pausa sem compensar tempo; retomar exige ação e teclas novas.

## Compatibilidade

Estado do jogador em memória, sem storage. Reutilizar assets locais copiados para o projeto. Build usa URLs relativas para funcionar em subpasta. O JSON autoral é preservado em updates de schema ou migrado explicitamente; versão desconhecida falha sem sobrescrever.
