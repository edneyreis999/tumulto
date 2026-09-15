# Pesquisa inicial — Pogo Pandemonium, de Crash Bash

**Data da pesquisa:** 15 de setembro de 2026.  
**Objetivo:** reunir as regras e a organização visual necessárias para recriar a experiência em HTML, CSS e JavaScript, usando formas e ícones simples.  
**Escopo:** funcionamento do jogo original, diferenças entre arenas, controles, pontuação, itens, desafios e decisões necessárias para uma implementação.

## 1. Conclusão principal e como usar este documento

**Pogo Pandemonium é uma categoria de minigames, não o nome de uma única arena.** Ela contém **Pogo Painter, Pogo-a-Gogo, El Pogo Loco e Pogo Padlock**. O overview fornecido descreve essa família e combina mecanismos que variam entre as arenas. [Bandipedia — categoria][categoria]

Para recriar primeiro a experiência de saltar, pintar casas e converter a pintura em pontos usando caixas, a referência adequada é **Pogo Painter**. Para a experiência de fechar territórios e pontuar automaticamente, é **Pogo-a-Gogo**. As outras duas acrescentam perigos ou regras de perda e roubo.

### Classificação das informações

- **Confirmado:** regra explícita nas telas do jogo ou sustentada por fontes concordantes.
- **Observado:** comportamento visível nos trechos examinados; não significa que todos os casos extremos foram testados.
- **Relatado:** informação específica de guia, wiki ou medição comunitária, sem validação independente suficiente.
- **Proposta HTML:** decisão de implementação sugerida nesta pesquisa; não é apresentada como regra descoberta no original.
- **Em aberto:** detalhe que as fontes não esclarecem ou sobre o qual há divergência.

O documento permite construir um protótipo consistente. **Não constitui uma engenharia reversa completa:** distribuição aleatória, colisões simultâneas, algumas prioridades de eventos e durações exatas continuam em aberto. Essas lacunas estão reunidas na seção 13.

## 2. Visão comparativa das quatro arenas

| Arena | Como obter território | Como converter em pontos | Particularidade |
| --- | --- | --- | --- |
| **Pogo Painter** | Aterrissar nas casas; usar setas | Pisar em caixa roxa `!` | Versão básica |
| **Pogo-a-Gogo** | Pintar caminhos e cercar regiões | Fechar uma região válida | Sem caixas de pontuação; bordas coloridas participam do fechamento |
| **El Pogo Loco** | Pintar caminhos, usar setas e cercar regiões | Pisar em caixa roxa `!` | Fechar região preenche o interior; Ripper Roo cria perigos |
| **Pogo Padlock** | Pintar casas e roubar território com mísseis | Pisar em caixa roxa `!` | Reentrar na própria cor causa perda de território; cadeado protege |

Essa divisão aparece nos guias das arenas e nas instruções exibidas antes das partidas. [Ejexy — regras dos minigames][ejexy], [Bandipedia — Pogo Pandemonium][categoria]

**Consequência para a recriação:** implementar as quatro como conjuntos de regras configuráveis sobre o mesmo tabuleiro. Não ativar fechamento automático, penalidade por própria cor e pontuação por caixas indiscriminadamente em todos os modos.

## 3. Arena, layout e interface

### 3.1 Geometria funcional

O tabuleiro tem **8 colunas × 8 linhas, totalizando 64 casas**. A partida acontece em uma única arena compartilhada. O guia de SpyroCrashJak descreve as 64 casas; a contagem também é compatível com as capturas examinadas. [SpyroCrashJak — Pogo Painter][spyro]

Nas imagens do jogo, a câmera mostra o tabuleiro inteiro em perspectiva elevada e fixa. O fundo da arena fica visualmente mais estreito que a frente. Não há tela dividida nos trechos observados. O HUD fica no alto, com dois retratos à esquerda, cronômetro central e outros dois retratos à direita. Cada retrato possui um placar numérico. Há números flutuantes ao pontuar, efeitos de atordoamento e uma tela de vitórias entre rodadas. [Gameplay de NintendoMovies, início de Pogo Painter][video-painter]

### 3.2 Cores e posições

| Participante | Cor | Posição inicial observada |
| --- | --- | --- |
| P1 | Amarelo | Canto inferior esquerdo |
| P2 | Vermelho | Canto superior esquerdo |
| P3 | Azul | Canto superior direito |
| P4 | Verde | Canto inferior direito |

As cores pertencem ao **slot do jogador**, não ao personagem escolhido. O mapeamento é documentado na página de Pogo Painter. As posições foram conferidas no início do vídeo demonstrativo de Pogo-a-Gogo. [Bandipedia — Pogo Painter][painter], [Demonstração de Crash Land][video-curto]

Representação lógica, vista de cima:

```text
              colunas →
        0  1  2  3  4  5  6  7
     0  R  ·  ·  ·  ·  ·  ·  B
     1  ·  ·  ·  ·  ·  ·  ·  ·
     2  ·  ·  ·  ·  ·  ·  ·  ·
     3  ·  ·  ·  ·  ·  ·  ·  ·
     4  ·  ·  ·  ·  ·  ·  ·  ·
     5  ·  ·  ·  ·  ·  ·  ·  ·
     6  ·  ·  ·  ·  ·  ·  ·  ·
     7  Y  ·  ·  ·  ·  ·  ·  G

Y = P1; R = P2; B = P3; G = P4.
As letras indicam posições, não território inicial obrigatório.
```

### 3.3 Limites e ocupação

- O limite externo funciona como limite da área de jogo. Os trechos analisados não mostram saída pelo lado oposto, buracos ou eliminação por queda nos modos normais de pogo.
- Itens aparecem associados às casas. Personagem, pintura e item precisam ser representados separadamente.
- A arena pode parecer industrial, de pedra ou de terra; isso não implica mudar sua estrutura lógica.
- Não foi estabelecido se dois personagens podem ocupar exatamente a mesma casa durante toda a animação, se um bloqueia o outro ou como uma disputa simultânea é resolvida.

**Proposta HTML:** começar com uma grade plana, quadrada, sem perspectiva. Usar personagens circulares com número, seta de direção e sombra. Isso preserva a leitura da mecânica. A perspectiva pode ser acrescentada depois sem alterar coordenadas ou regras.

### 3.4 Informação que a interface deve tornar legível

**Proposta HTML:** manter sempre visíveis tempo restante, pontos efetivamente obtidos, identidade de cada jogador, direção de mira, arma disponível e efeitos temporários. Um contador adicional de casas ainda não convertidas ajuda a explicar a diferença entre território e pontos, mas deve ser identificado como melhoria da recriação.

Usar número ou padrão junto à cor: somente amarelo e verde podem ser difíceis de distinguir. Não esconder a pintura sob um personagem grande; a sombra ou base deve indicar claramente sua casa lógica.

## 4. Movimento, controles e ritmo

### 4.1 Controles originais documentados

| Entrada de PlayStation | Função |
| --- | --- |
| Direcional / analógico esquerdo | Deslocamento |
| Quadrado | Disparar a arma disponível |
| Triângulo | Provocação / animação de comemoração |
| Start | Pausa |
| Select | Consultar controles |

O guia de controles diferencia pogo de Crate Crush: no pogo, o salto faz parte da locomoção; não há a exigência de apertar um botão de salto para cada casa. [SpyroCrashJak — controles][spyro], [WebWhizTommy — controles de pogo][tommy]

O movimento é percebido como uma sequência de saltos de casa em casa. Para implementação, separar **posição lógica na grade** da **animação de subida e descida**. O botão de disparo não deve substituir o deslocamento.

**Em aberto:** prioridade entre duas direções pressionadas, possibilidade de mudar a decisão durante o salto, janela de armazenamento da próxima entrada, precisão do disparo durante a animação e colisão com personagens ou projéteis no ar. Não foi confirmada locomoção diagonal direta.

### 4.2 Duração dos saltos: cuidado com a unidade

A análise de um TAS da versão USA relata:

| Personagem | Salto normal | Com botas |
| --- | ---: | ---: |
| Personagens em geral | 18 frames | 10 frames |
| Rilla Roo | 17 frames | 9 frames |

O mesmo registro informa frequência de emulação próxima de 59,94 Hz, mas não esclarece, no parágrafo dos saltos, se a contagem usa campos de vídeo, quadros renderizados ou atualizações da lógica. Portanto, **não converter automaticamente 18 frames em 300 ms**. [Craigelbagel001 — TASVideos][tas]

Uma medição comunitária diferente relata 150 saltos em 90 segundos e 24 saltos durante oito segundos de botas; para Rilla Roo, 159 e 26. Isso corresponde aproximadamente a **600 ms por salto normal e 333 ms com botas**, com vantagem pequena para Rilla Roo. A relação de velocidades é compatível com 18/10, mas a unidade ainda exige confirmação. [Discussão com medição de saltos][frames]

**Proposta HTML:** iniciar com 600 ms e 333 ms, configuráveis, e comparar lado a lado com gameplay. Se a prioridade for competição equilibrada com personagens genéricos, dar a todos a mesma velocidade. A exceção de Rilla Roo deve ser uma opção de fidelidade, não uma diferença atribuída arbitrariamente aos quatro jogadores.

### 4.3 Mapeamento sugerido para navegador

**Proposta HTML:** setas ou WASD para mover, Espaço para disparar e Escape para pausar. Segurar uma direção repete saltos no ritmo permitido pelo personagem; pressionar mais rápido não acelera a simulação. Uma direção nova pode ficar armazenada para o próximo salto.

Sem entrada, o jogador permanece na casa atual. A animação de repouso pode continuar, mas não deve produzir eventos repetidos de entrada na casa — especialmente em Pogo Padlock.

## 5. Território e pontuação: o núcleo comum

### 5.1 Há dois valores distintos

1. **Território pendente:** casas atualmente da cor do jogador.
2. **Placar acumulado:** pontos que já foram convertidos.

Em Pogo Painter, aterrissar colore a casa. Aterrissar na cor de um adversário a substitui. Ao pegar uma caixa roxa, todas as casas da sua cor voltam a neutro e cada uma rende um ponto. O placar acumula os depósitos. [SpyroCrashJak — explicação de Pogo Painter][spyro]

Portanto, pintar uma casa não equivale a acrescentar imediatamente um ponto ao placar. Roubar pintura reduz a capacidade de pontuação futura do adversário; não há indicação de que subtraia pontos já depositados. [AnimeMaster — visão geral de pogo][anime]

### 5.2 Exemplo numérico

**Exemplo derivado das regras, não transcrição de uma partida:**

- P1 tem 20 pontos no placar e 12 casas amarelas.
- P2 repinta três dessas casas.
- P1 passa a ter nove casas pendentes; seus 20 pontos continuam iguais.
- Se o conjunto contabilizado ao tocar a caixa contém nove casas, P1 ganha nove pontos: placar 29.
- Essas nove casas ficam neutras após a conversão.
- A pintura dos outros jogadores permanece.

**Detalhe em aberto:** a casa sob a caixa é pintada antes de contar, depois, ou não participa daquele depósito? O exemplo fixa explicitamente o conjunto contado para não esconder essa ambiguidade de um ponto.

### 5.3 Fórmula funcional

Modelo proposto para a implementação:

```text
pendentes(p) = quantidade de casas cujo dono é p

depositar(p):
    ganho = pendentes(p)
    placar[p] += ganho
    tornar neutras as casas cujo dono é p
    consumir a caixa, quando ela for o gatilho
```

Esse modelo não exige que todas as casas da cor estejam conectadas. A unidade de contagem é a casa pertencente ao jogador no instante do depósito, e não o comprimento histórico percorrido.

### 5.4 Final de rodada

Vence quem tem mais pontos quando o tempo acaba. As quatro arenas do torneio examinado começam em **1:30**. Há preparação antes da liberação dos personagens e uma apresentação do resultado antes de reiniciar a rodada. [Torneio de NintendoMovies][video]

**Em aberto:** processamento de uma coleta exatamente no zero, eventual conversão final de território pendente e distribuição de vitórias em empate. Foi localizado um relato de empates entre três jogadores, mas ele não especifica a atribuição de troféus. [Discussão de RetroAchievements][empates]

**Proposta HTML:** encerrar aos 90 segundos, comparar apenas o placar convertido e apresentar empate explícito entre líderes. Não conceder vantagem ao menor índice de jogador. Essa política deve permanecer configurável até a confirmação do comportamento original.

## 6. Itens e efeitos

### 6.1 Distribuição por arena

| Item / efeito | Painter | a-Gogo | El Pogo Loco | Padlock |
| --- | :---: | :---: | :---: | :---: |
| Caixa roxa `!` | Sim | Não | Sim | Sim |
| Botas de velocidade | Sim | Sim | Sim | Sim |
| Míssil direcional | Sim | — | Sim | Sim, com roubo |
| Míssil em quatro direções | — | Sim | — | — |
| Raio elétrico | — | Sim | — | — |
| Seta de uma direção | Sim | Sim | — | — |
| Seta de duas direções opostas | — | Sim | — | — |
| Seta de quatro direções | — | — | Sim | — |
| Cadeado | — | — | — | Sim |

Inventários descritos nas páginas de cada arena. [Pogo Painter][painter], [Pogo-a-Gogo][gogo], [El Pogo Loco][loco], [Pogo Padlock][padlock]

### 6.2 Caixa roxa de exclamação

A caixa é o gatilho de depósito nas três arenas correspondentes. É coletada ao saltar sobre sua casa. Ela deve ser um objeto consumível, separado da propriedade do piso.

Crash Land relata **até três caixas simultâneas** e tendência de aparecimento em regiões menos ocupadas. O limite é útil como referência; a distribuição espacial é uma observação estratégica do autor, não uma fórmula comprovada de geração. [Crash Land — regras e técnicas][crashland]

**Em aberto:** intervalo entre caixas, reposição imediata ou atrasada, possibilidade de aparecer sob jogador, caixa sobre piso já colorido e comportamento ao coletar com zero território.

### 6.3 Botas de velocidade

As botas aceleram a locomoção temporariamente. A duração relatada é **oito segundos**. Em Pogo Painter, ser atingido por míssil também faz perder botas ou míssil carregado. [Bandipedia — Pogo Painter][painter]

**Em aberto:** coletar novas botas renova ou soma duração? O efeito expira no meio do salto ou no seguinte? Atordoamento pausa ou apenas remove o efeito? Arma e botas usam estados independentes? Não assumir respostas a partir do desenho do item.

### 6.4 Mísseis

Nos modos básicos, mísseis atordoam. Em Padlock, acertar também transfere a pintura da vítima para o atacante. O efeito adicional é próprio dessa variante. [Bandipedia — Missile][missile]

Em Pogo-a-Gogo, a arma dispara nas quatro direções e não exige mirar uma direção específica. A vítima perde os efeitos ou armas carregados descritos pela página da arena. [Bandipedia — Pogo-a-Gogo][gogo]

**Em aberto:** quantidade de disparos por coleta, capacidade de estoque, substituição de arma, velocidade, alcance, colisão entre projéteis, travessia de personagens, imunidade após acerto e duração exata do atordoamento. Os textos consultados falam em poucos segundos, sem uma tabela precisa.

### 6.5 Electro Stun Beam

Exclusivo de Pogo-a-Gogo. Dispara na direção para a qual o personagem olha e atordoa oponentes alinhados. A descrição do guia Prima reproduzida pela wiki indica que pode afetar todos os oponentes na mesma linha ou coluna. Isso sugere um ataque de linha que pode atingir mais de uma vítima, não apenas o primeiro alvo. [Bandipedia — Electro Stun Beam][beam]

**Em aberto:** diferença temporal entre raio e míssil, duração visual, imunidade e limite geométrico exato. Para o protótipo, um raio instantâneo na semirreta à frente é uma **proposta**, sujeita a comparação com o original.

### 6.6 Setas de pintura

- **Uma direção:** pinta da casa da seta em direção à borda indicada. A seta gira; vale a direção no momento em que é acionada.
- **Duas direções opostas:** pinta a linha ou coluna inteira; também gira.
- **Quatro direções:** pinta linha e coluna, formando uma cruz. Em El Pogo Loco, Ripper Roo pode produzir essas casas.

As setas de uma direção aparecem em Painter e a-Gogo; as de duas, em a-Gogo; as de quatro, em El Pogo Loco. Padlock não tem setas. [Bandipedia — Arrow][arrow]

**Exemplo geométrico proposto:** em uma grade 8×8, uma cruz completa tem no máximo 15 casas distintas: oito na linha e oito na coluna, descontando a interseção contada duas vezes. Isso não garante 15 casas novas: algumas podem já ser da mesma cor.

**Em aberto:** consumir a seta após uso, ativação em cadeia por outra seta, interação com item na linha pintada, período de rotação e acionamento de fechamento de área causado apenas pela seta.

### 6.7 Cadeado

Em Padlock, o item se move pela arena e protege temporariamente a pintura de quem o captura. A duração relatada é **oito segundos**. Enquanto protegido, o jogador pode pisar na própria cor sem perder território. [Bandipedia — Pogo Padlock][padlock]

Crash Land também descreve proteção contra a substituição da pintura por outros jogadores. [Crash Land — cadeado][crashland]

**Em aberto:** proteção cobre casas pintadas depois da coleta? Impede roubo por míssil? Sobrevive a atordoamento? Depósito consome o efeito? Há diferença entre proteção armazenada no jogador e em cada casa? Esses detalhes alteram substancialmente a implementação.

## 7. Regras específicas de cada arena

### 7.1 Pogo Painter

É a referência inicial recomendada para o protótipo. A disputa concentra-se em pintar, evitar que adversários repintem e alcançar caixas antes deles. Fechar uma figura não tem o papel especial de pontuação que existe em a-Gogo. [Ejexy — Pogo Painter e Pogo-a-Gogo][ejexy]

**Proposta de primeira versão:** quatro participantes, grade 8×8, rodada de 90 segundos, cores próprias, caixas, botas, mísseis e setas simples. Começar com um humano e três bots permite validar o ritmo antes de implementar controles para quatro pessoas.

### 7.2 Pogo-a-Gogo

Não possui caixas de depósito. Cercar uma região preenche o interior e converte as casas da sua cor em pontos, à razão de um ponto por casa. O perímetro pode aproveitar as bordas apropriadas da arena. [Bandipedia — Pogo-a-Gogo][gogo]

As fontes descrevem um requisito de conteúdo interno: é necessário haver ao menos uma casa interna ainda não da sua cor. Há divergência de redação entre “não colorida” e “não da sua cor”; o caso de um interior totalmente pintado por adversários exige teste. [Crash Land — regras adicionais][crashland], [Bandipedia — categoria][categoria]

#### Bordas coloridas

As bordas são divididas por cor e mudam de posição durante a rodada. Cada canto começa com segmentos da cor do jogador próximo. Somente os segmentos correspondentes à sua cor podem ser tratados como extensão do fechamento; uma borda de outra cor não deve ser considerada sua parede de captura. [Descrição de Pogo-a-Gogo por Grexi][grexi]

No vídeo curto de Crash Land, um fechamento perto do canto inferior esquerdo rende nove pontos e o território amarelo utilizado desaparece após a pontuação. O jogador depois volta a pintar outras casas. Isso ajuda a distinguir território pendente de território permanente. [Demonstração de Crash Land][video-curto]

#### Exemplos para especificar a lógica

**Exemplos derivados; os desenhos não são capturas do jogo.** `Y` é uma casa amarela; `.` é uma casa ainda não amarela.

```text
Fechamento interno:             Com uma abertura:

Y Y Y                          Y Y Y
Y . Y                          Y . .
Y Y Y                          Y Y Y

Há interior cercado.           O interior ainda tem saída.
```

No primeiro exemplo, o centro passa a amarelo. Se o conjunto total a depositar for exatamente esse bloco, são nove pontos, não apenas um ponto pelo centro.

```text
Canto com bordas amarelas:      Mesma forma com bordas rivais:

| Y Y                          | Y Y
| . Y                          | . Y
+====                          +----

“=” e o lado esquerdo          A geometria física do canto
representam borda amarela.     não basta se a cor não serve.
```

Para evitar ambiguidades do desenho, a implementação deve armazenar **cada segmento de borda**, em vez de presumir que uma lateral inteira tem sempre uma única cor.

Não limitar a lógica a círculos geométricos nem presumir que apenas quadrados perfeitos valem. Um guia apresenta também uma figura ortogonal irregular. [Ejexy — exemplos de áreas][ejexy]

### 7.3 El Pogo Loco

Fechar uma área pinta o interior, mas ainda é necessário pegar a caixa para depositar. Ripper Roo percorre a arena, cria casas de TNT, pode gerar setas de quatro direções e lança mísseis. No desafio de cristal, seus perigos passam a Nitro. [Bandipedia — El Pogo Loco][loco]

Um guia relata que, abaixo de 30 segundos restantes, Ripper Roo vai para a região central e passa a disparar mísseis. Também descreve explosões atingindo as oito casas em volta do explosivo. [Gbness — El Pogo Loco][gbness]

**Modelo geométrico derivado:** uma área 3×3 centrada no explosivo, recortada pelos limites do tabuleiro. Não converter isso em alcance de apenas quatro vizinhos ortogonais.

**Em aberto:** trajetória exata do NPC, frequência de visitas, quando cada explosivo é armado, gatilho e atraso da detonação, reação em cadeia e efeito da explosão sobre pintura e itens. A penalidade normal precisa ser diferenciada da falha instantânea do cristal.

### 7.4 Pogo Padlock

Aterrissar em uma casa da própria cor faz perder todas as casas dessa cor, salvo proteção do cadeado. Acertar alguém com míssil transfere seu território para o atacante. Caixas continuam necessárias para pontuar. [Bandipedia — Pogo Padlock][padlock]

Isso exige planejar o caminho depois do roubo: casas que antes eram do adversário podem passar a ser perigosas para você. A perda descrita é de pintura pendente; não há fundamento para zerar o placar já convertido.

**Proposta de ordem de avaliação:** verificar quem era o dono da casa antes da aterrissagem. Se ela já era sua e a proteção não se aplica, executar a penalidade. Se ela era neutra ou rival e pode ser pintada, atribuí-la ao jogador. Verificar depois o item, respeitando a política definida para casos simultâneos.

Sem essa separação, pintar primeiro e testar depois faria qualquer casa recém-pintada parecer uma infração.

## 8. Modos, equipes e desafios de Adventure

### 8.1 Rodada versus competição

Uma rodada é uma disputa individual com seu cronômetro. O troféu de Adventure exige vencer três rodadas antes dos oponentes; não exige três vitórias consecutivas. As relíquias de ouro e platina exigem, respectivamente, duas e três vitórias consecutivas contra adversários mais difíceis. [TASVideos — tipos de recompensa][tas]

Battle permite disputa livre ou equipes. Battle e Tournament oferecem dificuldade de CPU e quantidade de vitórias necessárias; a página geral relata opções de duas a sete vitórias. Tournament reúne quatro minigames da categoria. [Bandipedia — modos de Crash Bash][crashbash]

### 8.2 Equipes

O guia de Pogo Painter para dois jogadores descreve cores separadas e recomenda evitar pintar sobre o aliado. Não presumir que o modo de equipe reduz o tabuleiro a apenas duas cores. [SpyroCrashJak — Pogo Painter, 2 Player][spyro]

**Em aberto:** agregação e apresentação do placar de equipe em cada modo, fogo amigo, efeitos do cadeado sobre aliado e qual conjunto é convertido por uma caixa no cooperativo. Os valores de gema abaixo são totais de equipe relatados pelas fontes, não prova de que toda propriedade de casa seja compartilhada.

**Proposta HTML:** lançar primeiro todos contra todos. Para equipes, manter `playerId` e `teamId` distintos; isso permite ajustar agregação de pontos sem mudar a identidade das casas.

### 8.3 Gemas: pontuação regressiva

Nas gemas, as conversões reduzem uma pontuação inicial até zero. Os adversários começam com uma meta menor. Não basta aplicar o placar crescente do modo normal com um rótulo diferente.

| Arena | Jogador humano, solo | Cada CPU, solo | Equipe humana, 2P | Equipe adversária, 2P |
| --- | ---: | ---: | ---: | ---: |
| Pogo Painter | 80 | 60 | 180 | 120 |
| Pogo-a-Gogo | 150 | 90 | 300 | 180 |
| El Pogo Loco | 120 | 80 | 270 | 180 |
| Pogo Padlock | 120 | 90 | 240 | 180 |

Valores relatados nas páginas das arenas. Painter especifica 60 segundos no solo e 80 segundos no cooperativo para a gema. Não extrapolar esse cronômetro às demais gemas sem confirmação. [Painter — desafios][painter], [a-Gogo — desafios][gogo], [El Pogo Loco — desafios][loco], [Padlock — desafios][padlock]

**Divergência encontrada:** o guia de AnimeMaster atribui 120/90 à gema de Painter, enquanto a página da arena e o guia de Aklite indicam 80/60. A tabela adota os valores concordantes, mantendo a divergência registrada. Versão regional, erro do autor ou confusão entre arenas não foram resolvidos. [AnimeMaster][anime], [Aklite][aklite]

### 8.4 Cristais

| Arena | Mudança |
| --- | --- |
| Pogo Painter | Vencer evitando cogumelos venenosos que aparecem na arena |
| Pogo-a-Gogo | Vale o maior depósito isolado, não a soma dos depósitos |
| El Pogo Loco | Evitar ser atingido pelos perigos Nitro de Ripper Roo |
| Pogo Padlock | Não pintar pelo deslocamento; obter território roubando com mísseis |

Essas modificações aparecem na tabela geral de desafios do jogo. [Bandipedia — desafios de cristal][crashbash]

**Exemplo derivado para a-Gogo:** depósitos de 12, 8 e 19 produzem recorde 19, não 39. Um depósito posterior de 15 não altera o recorde.

**Divergência importante em Padlock:** a página geral de Crash Bash diz que pisar na própria cor não remove território nesse cristal. O guia de Ejexy recomenda evitar a própria cor. Não transportar automaticamente a penalidade normal para esse desafio; validar uma gravação específica do cristal. [Bandipedia — desafio de Padlock][crashbash], [Ejexy — cristal de Padlock][ejexy]

Em cooperativo, a falha de um participante pode comprometer a equipe em desafios de perigos: o FAQ de Smaz menciona explicitamente o Nitro de El Pogo Loco. [Smaz — FAQ][smaz]

## 9. O que determina a experiência de jogo

As consequências abaixo são **análise desta pesquisa a partir das regras**, não parâmetros extraídos do código original:

- **Depositar cedo ou acumular:** guardar muitas casas aumenta um depósito potencial, mas prolonga a exposição ao roubo.
- **Deslocamento tem custo:** buscar caixa, arma ou botas significa deixar de pintar outro caminho.
- **Pintar sobre um rival tem valor duplo:** aumenta seu território e reduz o dele.
- **A caixa é um recurso disputado:** pegá-la também impede que alguém a use naquele momento.
- **Atordoar custa tempo ao adversário:** em um jogo de duração fixa, alguns saltos perdidos já importam.
- **a-Gogo troca a corrida por caixas por planejamento geométrico:** as bordas coloridas tornam rotas curtas interessantes.
- **El Pogo Loco adiciona risco ao caminho:** a melhor rota de pintura pode atravessar uma futura explosão.
- **Padlock pune revisitar caminhos:** um roubo grande pode ser perdido imediatamente por uma aterrissagem mal planejada.

Para preservar essas decisões, o protótipo precisa de ritmo estável, casas legíveis e itens suficientemente disputados. A fidelidade dos assets é secundária para esse objetivo.

## 10. Modelo de implementação proposto para HTML

**Toda esta seção é uma proposta técnica própria. Não descreve a arquitetura interna de Crash Bash.**

### 10.1 Estado mínimo

```text
Partida
  arena / variante
  fase: instruções | contagem | jogando | pausado | resultado
  tempo restante
  jogadores
  grade de 64 casas
  segmentos de borda, se aplicável
  itens e projéteis
  perigos e estado do NPC, se aplicável
  gerador aleatório com semente

Jogador
  id e equipe opcional
  casa atual; casa de destino
  direção; próxima entrada
  início e duração do salto
  placar; vitórias; recorde de depósito, se aplicável
  arma e munição
  término de botas / atordoamento / proteção

Casa
  dono: neutro | P1 | P2 | P3 | P4
  item opcional
  perigo opcional
  proteção opcional, conforme política escolhida
```

A quantidade de casas pendentes pode ser calculada diretamente da grade. Não manter contadores independentes sem necessidade: eles podem divergir após roubo, explosão ou depósito.

### 10.2 Configuração por variante

| Opção | Painter | a-Gogo | El Pogo Loco | Padlock |
| --- | --- | --- | --- | --- |
| Gatilho de depósito | Caixa | Fechamento | Caixa | Caixa |
| Preencher região cercada | Não | Sim | Sim | Não no protótipo inicial |
| Borda colorida fecha região | Não | Sim | Não no protótipo inicial | Não |
| Reentrar na própria cor perde pintura | Não | Não | Não | Sim |
| Míssil rouba território | Não | Não | Não | Sim |
| NPC de perigos | Não | Não | Sim | Não |

Os campos marcados como escolha inicial não devem ser interpretados como prova da ausência de um comportamento no original.

### 10.3 Eventos e simultaneidade

Usar eventos explícitos: `aterrissou`, `pintou`, `coletou`, `disparou`, `foiAtingido`, `fechouArea`, `depositou` e `encerrouRodada`.

Uma ordem inicial possível é:

1. Receber entradas e atualizar temporizadores.
2. Avançar saltos e projéteis.
3. Resolver impactos com instante de colisão conhecido.
4. Resolver aterrissagens no instante correspondente.
5. Aplicar penalidade de própria cor, pintura e coleta.
6. Detectar fechamento quando a variante permitir.
7. Aplicar depósito e seus efeitos.
8. Atualizar geração de itens e perigos.
9. Encerrar a rodada ao atingir o limite temporal.

Eventos de instantes diferentes devem respeitar o tempo real da simulação. Para igualdade exata de instantes, definir uma política determinística e justa. Não deixar a ordem fixa do array favorecer sempre P1 numa caixa disputada.

### 10.4 Detecção de áreas: abordagem inicial

O problema é encontrar células sem saída para o exterior, usando a cor do jogador como barreira. Uma implementação simples para a-Gogo pode usar busca por preenchimento, também chamada de *flood fill*:

1. Tratar casas do jogador como barreiras.
2. Examinar as demais casas, conectando vizinhas ortogonais.
3. Marcar como acessíveis pelo exterior as casas expostas a segmentos de borda que não pertencem ao jogador.
4. Percorrer todas as casas alcançáveis a partir dessas entradas.
5. As casas não alcançadas são candidatas a interior cercado.
6. Verificar se apareceu uma região válida nova e se o requisito de conteúdo interno foi satisfeito.
7. Pintar o interior e executar o gatilho da variante.

Em a-Gogo, a borda da cor do jogador bloqueia a saída geométrica; as outras cores permitem essa saída para fins do algoritmo. Isso é uma abstração de captura, não permissão para o personagem sair fisicamente da arena.

**Limites dessa proposta:** a regra exata do original pode considerar conectividade e fechamento de outra forma. É necessário testar regiões com diagonais, interiores rivais, múltiplos bolsões, segmentos móveis e fechamento causado por seta. Não alegar equivalência antes desses testes.

Para El Pogo Loco, não herdar automaticamente todas as regras das bordas de a-Gogo. A primeira implementação pode exigir perímetro feito de casas do jogador e expandir após validação.

### 10.5 Renderização e relógio

- Usar Canvas 2D ou uma grade de elementos HTML; 64 casas não exigem uma engine 3D.
- Atualizar a lógica em passo de tempo estável e desenhar com `requestAnimationFrame`.
- Calcular a altura visual do salto por interpolação, sem usá-la como fonte da coordenada da grade.
- Pausar o relógio da partida e os efeitos juntos. Definir explicitamente o comportamento quando a aba perde o foco.
- Usar uma semente aleatória facilita reproduzir disputas por item e ajustar a geração.

### 10.6 Bots para uma primeira versão

Não foi localizada uma descrição suficiente do algoritmo original da CPU. **Proposta:** escolher objetivos por utilidade, considerando distância, território pendente, risco de roubo, caixas próximas, botas e adversários alinhados.

Em a-Gogo, adicionar busca por fechamentos curtos. Em Padlock, evitar entrar na própria cor e replanejar imediatamente após roubo. Em El Pogo Loco, considerar casas ameaçadas por explosões.

Dificuldade pode controlar tempo de reação, horizonte de planejamento e chance de erro. Ajustar isso é mais previsível do que dar acesso oculto a entradas futuras do humano.

## 11. Parâmetros iniciais, sem confundir proposta com descoberta

| Parâmetro | Valor inicial | Situação |
| --- | --- | --- |
| Grade | 8×8 | Documentado |
| Participantes | 4 | Referência da experiência pesquisada |
| Rodada normal | 90 s | Observado nas quatro arenas do torneio |
| Valor de casa depositada | 1 ponto | Documentado |
| Duração de botas | 8 s | Relatada pela wiki |
| Duração de cadeado | 8 s | Relatada pela wiki |
| Salto normal | 600 ms | Proposta apoiada em medição comunitária |
| Salto com botas | 333 ms | Proposta apoiada em medição comunitária |
| Atordoamento | 1.500 ms | Proposta provisória, não medição |
| Velocidade de míssil | 12 casas/s | Proposta provisória |
| Cargas de arma por coleta | 1 | Proposta provisória; estoque original em aberto |
| Máximo de caixas | 3 | Relato de Crash Land |
| Reposição de caixa | 800 ms após consumo | Proposta provisória |
| Tentativa de gerar outro item | A cada 2 s | Proposta provisória |
| Máximo de outros itens | 4 | Proposta provisória |
| Nova coleta de botas | Renovar para 8 s | Proposta provisória |
| Empate | Mostrar empate, sem desempate oculto | Proposta provisória |

Os valores arbitrários servem somente para fazer o protótipo funcionar e poder ser comparado. Não devem aparecer em documentação posterior como parâmetros confirmados do Crash Bash.

## 12. Casos de validação para a recriação

Esta lista é um roteiro de verificação futura, não uma afirmação de testes já executados.

### Núcleo

1. Pintar casa neutra altera o dono, mas não o placar acumulado.
2. Repintar casa rival transfere território pendente.
3. Depósito conta todas as casas do jogador, inclusive grupos desconectados.
4. Depósito não apaga pintura dos outros participantes.
5. Uma mesma caixa não pode ser consumida duas vezes.
6. Segurar uma tecla não faz o movimento depender da taxa de repetição do sistema operacional.
7. Bordas impedem sair da grade.
8. Pausar congela tempo restante, movimento e efeitos temporários.

### a-Gogo e El Pogo Loco

9. Anel 3×3 com centro neutro captura o centro.
10. Uma abertura no anel impede captura.
11. Uma forma ortogonal irregular é avaliada, não descartada por não ser quadrada.
12. Borda correta pode fechar região em a-Gogo; cor rival não deve funcionar como sua borda.
13. Interior totalmente rival e interior misto são tratados conforme a decisão validada.
14. Pintar por seta pode ou não completar a área conforme a política confirmada.
15. a-Gogo converte; El Pogo Loco apenas preenche e espera caixa.
16. No cristal de a-Gogo, depósitos menores não reduzem nem somam ao recorde.

### Padlock e perigos

17. Reentrar na própria cor remove território pendente, sem zerar o placar.
18. Permanecer parado não produz entradas fictícias na mesma casa.
19. Cadeado permite reentrada durante o período protegido.
20. Roubo de míssil atualiza o tabuleiro antes da próxima decisão do bot.
21. O cristal de Padlock não pinta por movimento.
22. Explosão próxima à borda não acessa coordenadas inválidas.
23. Efeitos simultâneos têm resolução determinística.
24. Tempo zero não permite jogar indefinidamente durante a apresentação do resultado.

## 13. Lacunas que precisam de observação dirigida

| Prioridade | Questão | Como confirmar |
| --- | --- | --- |
| Alta | A casa da caixa entra no depósito? | Partir de tabuleiro controlado e coletar caixa com zero ou uma casa pendente |
| Alta | Território restante pontua no fim? | Chegar ao zero com placar conhecido e pintura sem depósito |
| Alta | Duração real do salto | Medir sucessivas aterrissagens com versão e frequência registradas |
| Alta | Disputa pela mesma casa ou item | Repetir entradas simultâneas e inverter slots |
| Alta | Quantidade de disparos por item | Coletar uma arma e disparar até esgotar sem nova coleta |
| Alta | Duração e imunidade de atordoamento | Medir acerto, recuperação e segundo acerto controlado |
| Alta | Interior só com cor rival em a-Gogo | Fechar anel contendo exclusivamente pintura rival |
| Alta | Forma mínima válida de captura | Comparar blocos 2×2, anéis 3×3 e figuras junto à borda |
| Alta | Qual pintura é convertida em a-Gogo | Deixar casas desconectadas longe da região fechada |
| Média | Proteção contra míssil e casas futuras | Roubar jogador com cadeado e pintar depois da coleta |
| Média | Geração de caixas e power-ups | Registrar eventos em várias partidas; separar aleatoriedade de padrão |
| Média | Rotação das setas e bordas | Medir mudanças pelo relógio da partida |
| Média | Explosivos de Ripper Roo | Observar armação, contagem, contato e explosões em cadeia |
| Média | Equipe mantém propriedade individual? | Fazer pintura dos dois aliados e coletar caixa com apenas um |
| Média | Empate e troféus | Produzir dois líderes iguais e observar a tela seguinte |
| Média | Própria cor no cristal de Padlock | Roubar território e aterrissar nele sem cadeado |
| Baixa | Provocação e controle no ar | Comparar duração, interrupção e janela de disparo |
| Baixa | Diferenças PAL / NTSC-U / NTSC-J | Repetir medições em versões identificadas |

Essas verificações exigem gameplay controlado ou análise mais profunda do executável. A pesquisa na internet não encontrou respostas inequívocas para todos esses casos.

## 14. Fontes, evidências e limites da pesquisa

### 14.1 Gameplay e evidência visual

- **NintendoMovies — torneio de Pogo Pandemonium**, publicado em 7 de maio de 2019. Foram examinadas capturas das telas de regras e amostras da jogabilidade das quatro arenas; não foi feita uma auditoria de cada frame do vídeo. Pontos de entrada: [Pogo Painter, 00:00][video-painter]; [Pogo-a-Gogo, 06:58][video-gogo]; [El Pogo Loco, 15:38][video-loco]; [Pogo Padlock, 22:36][video-padlock].
- **Crash Land — demonstração curta de a-Gogo:** vídeo de aproximadamente 14 segundos, útil para acompanhar uma captura próxima à borda e a limpeza da pintura após pontuação. [Vídeo demonstrativo][video-curto]

Os tempos acima são posições nos vídeos, não cronômetros internos. A gravação do torneio informa dois humanos em todos contra todos e duas CPUs difíceis. Ela não serve, por si só, para concluir regras de equipes ou dos cristais.

### 14.2 Guias e referências consultados

| Fonte | Principal utilidade |
| --- | --- |
| [Bandipedia — Pogo Pandemonium][categoria] | Nomenclatura e diferenças gerais |
| [Bandipedia — Pogo Painter][painter] | Cores, botas e desafios |
| [Bandipedia — Pogo-a-Gogo][gogo] | Fechamento, armamento e metas de gema |
| [Bandipedia — El Pogo Loco][loco] | Ripper Roo, preenchimento e Nitro |
| [Bandipedia — Pogo Padlock][padlock] | Roubo, cadeado e penalidade de reentrada |
| [Bandipedia — Arrow][arrow] | Direções e rotação das setas |
| [Bandipedia — Electro Stun Beam][beam] | Direção e múltiplos alvos do raio |
| [Bandipedia — Missile][missile] | Distinção entre atordoamento e roubo |
| [Crash Land — Pogo Pandemonium][crashland] | Caixa, bordas, captura e proteção |
| [GameFAQs — SpyroCrashJak][spyro] | 64 casas, reset ao depositar, controles e modo 2P |
| [GameFAQs — Ejexy][ejexy] | Regras e exemplos de figuras cercadas |
| [GameFAQs — WebWhizTommy][tommy] | Controles e itens básicos |
| [GameFAQs — Gbness][gbness] | Perigos e fase final de Ripper Roo |
| [GameFAQs — Aklite][aklite] | Comparação de desafios e números conflitantes |
| [GameFAQs — AnimeMaster][anime] | Guia antigo usado no confronto de informações |
| [TASVideos — Craigelbagel001][tas] | Medições de saltos e distinção entre recompensas |
| [Discussão de medição de personagens][frames] | Saltos contados em intervalos de tempo |
| [Bandipedia — Crash Bash][crashbash] | Modos gerais e exceções dos cristais |
| [Smaz — FAQ hospedado no Crash Mania][smaz] | Consequência do Nitro no cooperativo |
| [Grexi — análise de Crash Bash][grexi] | Bordas coloridas móveis de a-Gogo |
| [RetroAchievements — discussão][empates] | Evidência comunitária da possibilidade de empate |

### 14.3 Limites de confiança

Algumas páginas não aceitaram abertura direta; nesses casos foram usados seus trechos indexados pelo buscador. Crash Land foi lido diretamente e seus materiais visuais foram examinados. O acesso ao manual hospedado em Manuals.plus não forneceu uma leitura confiável do conteúdo, e o guia Prima foi encontrado como referência citada por outras páginas; **não são apresentados aqui como manuais integralmente consultados**.

Resultados que descreviam adaptações de pogo para batalhas de Pokémon foram descartados: seus números de dano, energia e casas aleatórias não pertencem a Crash Bash. Também foram evitadas páginas que misturavam cogumelos de Painter com o cristal de El Pogo Loco.

**Próximo passo recomendado:** construir Pogo Painter com os parâmetros explicitamente propostos, validar movimento, transferência de cor e depósito, e depois adicionar a-Gogo como um conjunto separado de regras. Manter esta pesquisa como referência de proveniência, preservando a distinção entre fatos, relatos e escolhas do protótipo.

[categoria]: https://crashbandicoot.fandom.com/wiki/Pogo_Pandemonium
[painter]: https://crashbandicoot.fandom.com/wiki/Pogo_Painter
[gogo]: https://crashbandicoot.fandom.com/wiki/Pogo-a-Gogo
[loco]: https://crashbandicoot.fandom.com/wiki/El_Pogo_Loco
[padlock]: https://crashbandicoot.fandom.com/wiki/Pogo_Padlock
[arrow]: https://crashbandicoot.fandom.com/wiki/Arrow
[beam]: https://crashbandicoot.fandom.com/wiki/Electro_Stun_Beam
[missile]: https://crashbandicoot.fandom.com/wiki/Missile
[crashland]: https://crashland.elynx.fr/crashbash/pogopandemonium.php
[spyro]: https://gamefaqs.gamespot.com/ps/914119-crash-bash/faqs/54749
[ejexy]: https://gamefaqs.gamespot.com/ps/914119-crash-bash/faqs/10087
[tommy]: https://gamefaqs.gamespot.com/ps/914119-crash-bash/faqs/14013
[anime]: https://gamefaqs.gamespot.com/ps/914119-crash-bash/faqs/10417
[aklite]: https://gamefaqs.gamespot.com/ps/914119-crash-bash/faqs/37195
[gbness]: https://gamefaqs.gamespot.com/ps/914119-crash-bash/faqs/24420
[tas]: https://tasvideos.org/7153S
[frames]: https://crashbandicoot.fandom.com/f/p/2881032311275888474
[crashbash]: https://crashbandicoot.fandom.com/wiki/Crash_Bash
[smaz]: https://www.crashmania.net/downloads/crash-bash/crash-bash-faq.pdf
[grexi]: https://www.fischundfleisch.com/grexi/crash-bash-das-teufelsprojekt-aus-dem-hause-crash-bandicoot-12065
[empates]: https://retroachievements.org/forums/topic/5743?comment=393158
[video]: https://www.youtube.com/watch?v=L0tmv5k1Zfc
[video-painter]: https://www.youtube.com/watch?v=L0tmv5k1Zfc&t=0s
[video-gogo]: https://www.youtube.com/watch?v=L0tmv5k1Zfc&t=418s
[video-loco]: https://www.youtube.com/watch?v=L0tmv5k1Zfc&t=938s
[video-padlock]: https://www.youtube.com/watch?v=L0tmv5k1Zfc&t=1356s
[video-curto]: https://crashland.elynx.fr/crashbash/multimedia/pogoagogo_how.flv
