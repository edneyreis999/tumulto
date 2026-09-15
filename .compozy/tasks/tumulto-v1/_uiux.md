# Tumulto V1 — contrato de interface

Mapa das superfícies futuras, derivado de [_user_stories.md](_user_stories.md). Não há UI anterior, `DESIGN.md`, biblioteca de componentes ou `@compozy/ui` neste diretório. Os caminhos abaixo são destinos propostos, não arquivos existentes.

## Direção e referência

Identidade: [_universe.md](_universe.md). Nenhum screenshot de Crash é referência de paridade visual. **Artboards: nenhum — não foi fornecida referência visual normativa.** O livro fundamenta personagens e lugares, não impõe copiar sua diagramação ou ilustrações.

Renderização inicial: Canvas visto de cima, moldura de pátio, símbolos simples; HUD e menus em HTML semântico. Implementação deve permitir que as marcas do chão permaneçam legíveis sob os personagens e efeitos.

| Token semântico novo | Uso |
| --- | --- |
| `--surface-page`, `--surface-panel`, `--surface-board` | Fundo, menus e piso neutro |
| `--text-primary`, `--text-muted`, `--focus-ring` | Leitura e navegação |
| `--player-ghork`, `--player-lala`, `--player-drull`, `--player-dam` | Identificação consistente, sempre redundante com símbolo |
| `--effect-impulse`, `--effect-stun`, `--effect-protected` | Efeitos distintos, com ícone/rótulo |

Valores cromáticos finais são responsabilidade de implementação, com contraste mínimo de 4,5:1 em texto normal e 3:1 em controles/gráficos essenciais. Fundo não usa as quatro cores de jogador como decoração predominante. UI não depende de piscadas; nenhuma animação acima de três flashes por segundo.

## Surface map

| ID | Superfície | Destino proposto | Histórias |
| --- | --- | --- | --- |
| S1 | Entrada | `src/ui/menu.js` | US-001, US-011 |
| S2 | Preparação e instruções | `src/ui/setup.js` | US-001, US-002 |
| S3 | Contagem e partida | `src/ui/hud.js`, `src/render/arena.js` | US-002–US-008 |
| S4 | Pausa e confirmação de saída | `src/ui/pause.js` | US-009 |
| S5 | Resultado | `src/ui/results.js` | US-010 |
| S6 | Preferências, compatibilidade e erro | `src/ui/settings.js`, `src/ui/error.js` | US-011 |

## S1 — Entrada

- Título somente “Tumulto”; sem subtítulo Ghork, Pogo ou Caos na Áurea.
- Ações: Jogar e Preferências. Crédito literário discreto no rodapé.
- Estados: pronto, viewport insuficiente, dispositivo fora do alvo e falha de inicialização.
- Jogar leva à preparação. Não inicia imediatamente a simulação.
- Foco inicial no título/contêiner principal de forma que a ordem de tabulação comece em Jogar.

## S2 — Preparação

- Seleção única entre quatro cards semânticos, equivalentes a radio buttons; Ghork começa selecionado.
- Cada card: nome, figura, marca, frase breve original. Sem barras de estatística.
- Identificar claramente “Você” e “Bots” depois da seleção.
- Arena: Pátio da Áurea; modo: “Você contra três bots”; dificuldade: Padrão ou Difícil; duração lida do JSON.
- Instruções: “Salte para marcar runas.” / “Colete um selo para transformar suas runas em pontos.” / “Seus rivais podem tomar runas que você ainda não converteu.”
- Controles: WASD ou setas, Espaço para centelha, Escape para pausa.
- Ações: Começar e Voltar. Repetição de Começar é ignorada após transição.

## S3 — Contagem e partida

- Grade ocupa o centro; HUD usa quatro cartões em faixa superior, cronômetro central em linha própria ou bloco claramente separado.
- Cartão: personagem, símbolo, “Você” no humano, Pontos e Runas a converter. Não reorganizar cartões a cada mudança de liderança.
- Estados: contagem, ativo, salto, impulso, arma carregada, atordoado, proteção e último trecho de tempo.
- Relógio exibido por teto dos segundos restantes: `1:30`, `1:29`… `0:01`, seguido de `0:00` no resultado.
- Pausa visível, acessível por teclado; controles resumidos no rodapé.
- Selo tem forma circular com núcleo e halo; elixir é frasco; centelha é estrela de energia; fluxo é pedra com direção. Objetos não reutilizam ícones do jogo pesquisado.
- Impulso: trilha curta e indicador no HUD. Atordoamento: marca sobre a cabeça e texto. Proteção: contorno suave diferente, sem piscar agressivo.
- Conversão mostra `+N` por 700 ms perto do coletor, atualiza HUD imediatamente e limpa território. No modo reduzido, número aparece estático.
- Identificação de casa: pequena marca pessoal além da cor; textura opcional é extra, não a única redundância.
- Personagens sobrepostos recebem pequeno deslocamento visual para preservar suas marcas; destinos e colisões permanecem no motor.

## S4 — Pausa

- Diálogo modal com título “Partida pausada”; motivo adicional quando automático: “A janela perdeu o foco.” ou “O jogo foi pausado após uma interrupção.”
- Congelar a imagem da arena. Ações: Continuar, Preferências, Copiar diagnóstico, Voltar ao menu.
- Escape fecha preferências para voltar à pausa; só quando pausa é o modal superior, Escape continua a fase anterior.
- Voltar ao menu abre “Sair desta partida?” com Continuar na partida e Sair. Confirmar encerra; cancelar devolve foco ao botão de origem.
- Todas as teclas de jogo são limpas na entrada e saída da pausa.

## S5 — Resultado

- Cabeçalho: “Ghork venceu!” ou equivalente; empate: “Empate!”.
- Ranking com posições compartilhadas em empate, marca, nome, pontos e indicação Você.
- Exemplo 20, 20, 12, 4 → colocações 1, 1, 3, 4.
- Runas pendentes não aparecem como desempate. Texto discreto pode lembrar que somente pontos convertidos contam.
- Ações: Jogar novamente e Voltar ao menu. Resultado não fecha sozinho.
- Anúncio de resultado em região `aria-live=polite`; não narrar cada tick de placar.

## S6 — Preferências, compatibilidade e erro

- Preferências: “Reduzir movimento” e “Texturas adicionais”. Símbolos essenciais ficam presentes em ambos os estados da segunda opção.
- Redução de movimento herda `prefers-reduced-motion` em cada visita e pode ser alterada na sessão; nenhuma opção persiste após reload.
- Viewport mínimo para iniciar: 960×600 CSS px; alvos de verificação 1280×720 e 1440×900. Controles de menu ≥44×44 CSS px.
- Abaixo do mínimo: “Amplie a janela para jogar. Tumulto precisa de pelo menos 960 × 600 pixels.” Menus e preferências continuam acessíveis; início fica indisponível com motivo visível.
- Ponteiro primário coarse/touch: “Esta versão foi feita para computador com teclado.” Não apresentar controles touch inexistentes.
- Redimensionamento abaixo do mínimo durante partida pausa e impede continuar até a condição ser satisfeita.
- Canvas indisponível: “Não foi possível iniciar a arena neste navegador.” Oferecer Recarregar e instrução para navegador com Canvas 2D.
- Erro inesperado: “A partida foi interrompida.” Mostrar código curto, Copiar diagnóstico e Voltar ao menu; simulação parada.
- Clipboard negado: mostrar JSON selecionável e “Copie o diagnóstico abaixo.”

## Component plan

Usar elementos nativos: `button`, `fieldset`/`legend` e radios para personagens, `dialog` para modais, checkboxes para preferências. Não criar framework genérico de componentes. DOM de HUD recebe atualizações por evento/tick relevante; Canvas não é substituto para semântica dos menus.

`src/ui/` possui cada superfície. `src/render/` possui figuras/piso/efeitos. `src/content/characters.js` possui nomes, símbolos e cores de identidade. A composição recebe intenções sem permitir mutation arbitrária do motor.

## Evidência visual e responsabilidade

Sem comparação pixel a pixel com referência externa. `task_07` captura menu, seleção, partida com itens, pausa e resultado em 1280×720, mais restrição de tamanho em 800×600. Verificar contraste, foco, sobreposição, diferença dos quatro personagens e ausência de elementos do universo de referência. Casos automatizados e responsáveis em [_tests.md](_tests.md).

Impacto/compatibilidade: [_spec.md — Impact Analysis](_spec.md#impact-analysis--autoridade-única).

## S7 — Dashboard local de game design

`/game-design.html`: autor edita o JSON por campos rotulados e unidades. Seções de partida, geração, pesos, efeitos, armas, perigos, arbitragem e dois perfis de bots; probabilidade por peso calculada. Botão Salvar fixo, status textual, validação de campo, rascunho preservado em falha; recarregar com confirmação de descarte; exportar cópia distinta de salvar. Conflito mostra instrução, nunca overwrite silencioso. Produção: `game-design.html`, `tools/game-design.js`, `tools/game-design.css`. Sem artboard externo obrigatório. História US-017, evidencia task_05 + integração task_07.

## Estados adicionais da partida

Preparação exibe select Padrão/Difícil; HUD/resultado identificam o nível. Inventário distingue arma simples/cruz/raio e cargas. Fluxos mostram direção giratória; Cadeado tem ícone e tempo separados da proteção contra armas. TNT exibe contagem; Nitro/cogumelo têm símbolos próprios; veneno e stun/impulso têm indicação legível. Assets reaproveitados conforme ADR-004; ícones/texto suplementam assets ausentes. Contratos `_items.md` e US-012–US-016.
