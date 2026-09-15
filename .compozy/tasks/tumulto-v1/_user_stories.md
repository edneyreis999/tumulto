# Tumulto V1 — histórias de usuário

Catálogo canônico dos critérios de aceitação. Regras e valores: [_spec.md](_spec.md). Estados visuais: [_uiux.md](_uiux.md). Critérios de aceitação da implementação; evidências nas tasks e no relatório de QA.

## Personas

- **Visitante:** não conhece Ghork e quer jogar rapidamente.
- **Leitor:** reconhece o elenco e quer uma brincadeira coerente com seu universo.
- **Jogador com preferência de acessibilidade:** usa teclado, símbolos e redução de movimento.

## Índice

| ID | História |
| --- | --- |
| US-001 | Escolher um dos quatro amigos |
| US-002 | Entender e iniciar a rodada |
| US-003 | Saltar e disputar runas |
| US-004 | Converter runas em pontos |
| US-005 | Acelerar com impulso |
| US-006 | Disparar e receber centelhas |
| US-007 | Marcar uma linha com fluxo |
| US-008 | Disputar contra bots |
| US-009 | Pausar e voltar com segurança |
| US-010 | Ver resultado e jogar de novo |
| US-011 | Ler a partida e ajustar apresentação |

## US-001 — Escolher um dos quatro amigos

Como visitante ou leitor, quero escolher meu personagem para entrar na disputa com um amigo reconhecível.

- AC-1: ao abrir o site, vejo **Tumulto** e a ação “Jogar”.
- AC-2: na preparação, encontro Ghork, Lala, Drull e Dam com nome, silhueta, marca e indicação de seleção.
- AC-3: ao selecionar Dam e começar, controlo Dam; os outros três personagens aparecem uma vez como bots.
- AC-4: as informações da seleção não prometem poderes ou estatísticas diferentes.
- EC-1: começo sem alterar seleção → Ghork é o padrão visível; não existe seleção vazia invisível.

## US-002 — Entender e iniciar a rodada

Como visitante, quero saber o objetivo e os controles para jogar sem consultar material externo.

- AC-1: antes de começar, leio que saltar marca runas, selos convertem em pontos e rivais podem tomar marcas ainda não convertidas.
- AC-2: controles de movimento, disparo e pausa aparecem na preparação.
- AC-3: “Começar” inicia `3, 2, 1`, e somente depois o cronômetro passa a contar de `1:30`.
- EC-1: apertar Começar repetidamente → apenas uma rodada e uma contagem são criadas.

## US-003 — Saltar e disputar runas

Como jogador, quero mover-me por casas e tomar território para preparar minha próxima conversão.

- AC-1: segurar direção produz saltos cardinais regulares; soltar interrompe a sequência após o salto em andamento.
- AC-2: aterrissar em casa rival troca sua marca para a minha; o placar garantido dos dois não muda.
- AC-3: voltar à própria casa não apaga minhas runas nem adiciona uma runa extra.
- AC-4: reconheço a casa de destino e a direção para a qual dispararia.
- EC-1: pressionar contra uma borda → permaneço na grade e posso mudar a mira.
- EC-2: apertar duas direções → não salto na diagonal; prevalece a mais recente ainda pressionada.
- EC-3: aterrissagem simultânea na mesma casa → apenas uma marca prevalece; ninguém é empurrado para fora.

## US-004 — Converter runas em pontos

Como jogador, quero coletar selos para garantir o valor do território que consegui manter.

- AC-1: HUD distingue “Pontos” de “Runas a converter”.
- AC-2: com quatro runas e um selo em casa neutra, aterrissar no selo acrescenta cinco pontos, mostra `+5` e libera as cinco casas.
- AC-3: minhas runas desconectadas também entram na mesma conversão.
- AC-4: o selo desaparece e outro aparece depois, preservando a pintura e itens dos rivais.
- EC-1: dois participantes chegam juntos ao mesmo selo → só um recebe a conversão.
- EC-2: dois selos são coletados em casas diferentes no mesmo instante → cada dono recebe apenas o território que lhe pertence após a disputa daquele instante.

## US-005 — Acelerar com impulso

Como jogador, quero usar um elixir para alcançar mais casas e itens durante alguns segundos.

- AC-1: coletar impulso acelera os próximos saltos e mostra indicador de duração.
- AC-2: o efeito dura oito segundos ativos; ao acabar, o próximo salto iniciado volta ao ritmo normal.
- EC-1: nova coleta durante efeito → duração é renovada para oito segundos, sem soma indefinida.
- EC-2: ganhar ou perder impulso no ar → termino o salto sem mudança brusca de posição ou duração.

## US-006 — Disparar e receber centelhas

Como jogador, quero atrapalhar rivais por pouco tempo e perceber claramente quando estou impedido de agir.

- AC-1: coletar centelha mostra uma carga; disparar no chão lança energia na direção da mira e consome a carga.
- AC-2: um acerto válido atordoa por 1,5 s, remove impulso/carga atuais e mostra estado sobre a vítima.
- AC-3: a vítima volta a agir e permanece protegida por mais 0,5 s; proteção tem sinal distinto de atordoamento.
- AC-4: nenhuma centelha reduz pontos garantidos ou transfere runas.
- EC-1: disparo sem carga, no ar ou atordoado → não cria projétil nem consome futura coleta.
- EC-2: segurar disparo ou coletar arma com inventário cheio → não acumula disparos automáticos nem mais de uma carga.
- EC-3: acerto no ar → a vítima termina seu salto, podendo marcar/coletar ao aterrissar, antes de voltar a se mover.
- EC-4: projétil cruza alvo protegido → não o paralisa de novo e pode seguir até outro alvo.

## US-007 — Marcar uma linha com fluxo

Como jogador, quero ler a direção de uma runa especial e usá-la para conquistar várias casas.

- AC-1: a direção do fluxo é visível antes da coleta; simples/duplo giram no intervalo configurado e usam a direção exibida na coleta.
- AC-2: ao coletar, minha casa e a linha à frente até a borda recebem minha marca.
- AC-3: meu placar só muda quando eu coletar um selo depois.
- EC-1: a linha passa por outro item → o item permanece e não é ativado.
- EC-2: dois fluxos simultâneos se cruzam → a interseção tem um único dono, conforme arbitragem da rodada.

## US-008 — Disputar contra bots

Como jogador solo, quero três adversários ativos para ter disputa desde a primeira partida.

- AC-1: bots percorrem a arena, marcam runas e buscam selos para pontuar.
- AC-2: quando os itens estão disponíveis, bots usam impulso, fluxo e centelhas pelas mesmas regras do humano.
- AC-3: trocar o personagem humano não muda a velocidade ou as probabilidades dos rivais.
- EC-1: um objetivo desaparece antes da chegada → bot retoma a busca na sua próxima decisão, sem ficar preso para sempre.

## US-009 — Pausar e voltar com segurança

Como jogador, quero interromper a rodada sem perder tempo nem retomar uma ação indesejada.

- AC-1: Escape ou Pausar congela tempo, salto, projétil, bot e duração de itens/efeitos.
- AC-2: ao voltar, continuo do mesmo estado e preciso pressionar novamente as teclas de ação.
- AC-3: perder foco da janela ou ocultar a aba abre pausa e exige ação explícita para continuar.
- AC-4: a pausa oferece Continuar, Voltar ao menu, Preferências e Copiar diagnóstico.
- EC-1: sair para o menu durante partida → confirmação evita abandono acidental; cancelar preserva o estado pausado.
- EC-2: pausa durante `3, 2, 1` → continuar retoma a contagem de onde parou.
- EC-3: recarregar página → volta ao início, sem alegar que a rodada foi salva.

## US-010 — Ver resultado e jogar de novo

Como jogador, quero entender o desfecho e iniciar outra disputa sem refazer toda a configuração.

- AC-1: aos 90 s, resultado mostra os quatro nomes, pontos e colocações.
- AC-2: o maior placar ganha; empate de líderes é mostrado como “Empate!”.
- AC-3: Jogar novamente mantém meu personagem e inicia rodada limpa; Voltar ao menu permite outra seleção.
- EC-1: sobraram runas sem selo no fim → não entram no placar final.
- EC-2: todos têm zero pontos → resultado é empate entre os quatro.
- EC-3: clicar duas vezes na revanche → só uma partida nova, sem duplicar movimento ou relógio.

## US-011 — Ler a partida e ajustar apresentação

Como jogador com preferência de acessibilidade, quero distinguir estados e acessar menus sem depender de cor ou mouse.

- AC-1: nome/símbolo acompanha cada cor no HUD e no tabuleiro; barras de efeito têm rótulo e duração.
- AC-2: todos os menus e diálogos têm foco visível e navegação por teclado; fechar diálogo devolve foco à origem.
- AC-3: redução de movimento remove tremor, partículas e salto vertical decorativo, mantendo deslocamento e regras.
- AC-4: opções de redução de movimento e texturas valem somente nesta visita; recarregar restaura padrões do sistema.
- AC-5: em viewport adequado, HUD, área jogável e pausa ficam acessíveis sem sobreposição; em tela pequena ou ponteiro primário touch, explicação aparece antes de iniciar.
- EC-1: opções alteradas e página recarregada → inicia com padrões, sem restaurar configurações do jogador.
- EC-2: Canvas não disponível ou erro inesperado → vejo mensagem de recuperação e ação para retornar/recarregar; o jogo não simula escondido.
- EC-3: copiar diagnóstico falha → diagnóstico permanece visível e selecionável para copiar manualmente.

## Referências de impacto

Mudanças públicas, estado e preservação de materiais: [_spec.md — Impact Analysis](_spec.md#impact-analysis--autoridade-única). Não há cadastro, permissões remotas, contas ou dados de partidas anteriores a migrar.

## US-012 — Usar fluxos giratórios, duplos e em cruz
- AC-1: identifico tipo/direção antes da coleta; rotação atualiza visual e lógica juntos.
- AC-2: fluxo duplo pinta linha/coluna inteira; cruz pinta ambas sem duplicar interseção.
- EC-1: item na linha permanece e casa rival protegida por cadeado mantém dono.

## US-013 — Usar Centelha em cruz e Raio elétrico
- AC-1: HUD identifica arma/cargas; trocar arma substitui o inventário.
- AC-2: cruz dispara quatro projéteis usando uma carga; raio atinge todos os rivais elegíveis alinhados.
- EC-1: dois impactos no mesmo passo não renovam stun por arma contra vítima já protegida.

## US-014 — Proteger território
- AC-1: coletar cadeado impede rivais de tomar casas próprias durante o efeito, inclusive casas pintadas depois.
- AC-2: posso converter meu território protegido; cadeado continua até expirar.
- EC-1: proteção não evita armas, veneno ou explosões.

## US-015 — Reconhecer e evitar perigos
- AC-1: TNT arma ao pisar e exibe contagem; Nitro explode imediatamente; cogumelo causa veneno visível.
- AC-2: explosão atordoa dentro da área; veneno atrasa próximos saltos; ninguém é eliminado.
- EC-1: TNT na borda não atinge fora da grade, não encadeia itens e não renova contagem ao reentrar.
- EC-2: efeito durante salto preserva duração iniciada e não subtrai pontos.

## US-016 — Escolher dificuldade
- AC-1: preparação oferece Padrão e Difícil; seleção é aplicada aos três bots e aparece na partida/resultado.
- AC-2: revanche mantém dificuldade; nova visita começa Padrão.
- EC-1: Difícil muda reação/planejamento, sem física privilegiada nem informação futura.

## US-017 — Editar e salvar game design
Como autor, quero ajustar parâmetros para experimentar ritmo e diversão sem editar código.
- AC-1: game-design.html carrega os valores reais do JSON e organiza campos por tema, unidade e limites.
- AC-2: Salvar persiste no arquivo; recarregar painel conserva os novos valores; exportar é ação distinta.
- AC-3: próxima rodada/revanche usa o arquivo salvo; rodada em curso conserva snapshot anterior.
- EC-1: campo/JSON inválido não é salvo, mostra erro e mantém rascunho.
- EC-2: arquivo alterado por outra aba/editor retorna conflito, sem sobrescrever automaticamente.
- EC-3: falha de rede/escrita não mostra sucesso nem apaga o rascunho.
- EC-4: jogo com JSON ausente/inválido mostra erro antes da contagem e permite tentar novamente.
