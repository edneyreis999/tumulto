# Itens e perigos — contrato ampliado

Escopo aceito na ADR-005. Valores iniciais em `game-design.json`; os nomes adicionais são descrições provisórias. As regras abaixo combinam recursos das quatro arenas, mantendo conversão por selos, sem captura por contorno ou eliminação.

## Inventário

| kind | Exibição | Coleta/ativação |
| --- | --- | --- |
| seal | Selo | Soma casas próprias e as neutraliza |
| impulse | Impulso | Acelera próximos saltos |
| spark | Centelha | Arma cardinal de primeiro alvo |
| flow | Fluxo simples | Pinta semirreta incluindo casa atual |
| flowDouble | Fluxo duplo | Pinta linha/coluna inteira |
| flowCross | Fluxo em cruz | Pinta linha e coluna, interseção única |
| sparkCross | Centelha em cruz | Uma carga lança quatro projéteis cardinais |
| beam | Raio elétrico | Uma carga atinge todos os rivais elegíveis na semirreta |
| lock | Cadeado | Protege propriedade do coletor |
| tnt | TNT | Aterrissagem arma contagem; explosão após `tntFuseMs` |
| nitro | Nitro | Aterrissagem causa explosão imediata |
| mushroom | Cogumelo venenoso | Consome e aplica veneno |

## Fluxos

Simples e duplo têm direção inicial aleatória, giram 90° a cada `flow.rotationMs` desde spawn. Cruz não gira. Atualizar orientação antes das aterrissagens; o render mostra a mesma direção que será usada. Coletar pinta a casa da runa e o conjunto do tipo; casas duplicadas contam uma vez. Itens na linha não são ativados nem removidos. Nenhuma pintura tomada de participante com cadeado ativo é elegível. Conflitos entre fluxos usam a mesma prioridade por casa do passo; fluxo vence pintura básica quando elegível. Conversões usam a fotografia final, após fluxos.

## Armas

Inventário único `{kind, charges}`. Coleta de mesmo tipo soma `chargesPerPickup` limitada a `maxCharges`; outra arma substitui tipo e cargas. Todo pickup é consumido, mesmo cheio. Disparo usa uma carga; arma fica nula ao zerar. Só no chão e sem atordoamento; sem buffer de disparo aéreo. Direção do input atual atualiza a mira antes do tiro e do salto.

Centelha simples: projétil cardinal, primeiro rival interceptado. Cruz: quatro projéteis independentes emitidos do mesmo centro, uma carga total. Altura visual não dá imunidade. Protegidos não bloqueiam projéteis; atacante é ignorado; projéteis não colidem entre si. Raio: semirreta instantânea de largura lógica igual ao diâmetro do projétil e comprimento `beamRange`, testa interseção com círculo do personagem no instante do tiro; afeta todos os elegíveis, não apenas primeiro. Efeito visual é breve, sem repetir impactos.

Acerto válido remove arma/impulso, aplica `weapons.stunMs` e proteção de armas por stun + `postProtectionMs`. Armas não removem cadeado/veneno, não roubam pintura, não alteram pontos. Salto em curso termina com duração já fixada. Itens coletados depois do impacto funcionam sem cancelar stun. Vários projéteis no mesmo passo são processados por instante de contato e id; o primeiro impacto protege contra os posteriores. Intenções de disparo são coletadas para todos os participantes elegíveis antes dos impactos; raios são resolvidos antes dos projéteis, evitando cancelar o tiro simultâneo de um slot posterior. Em caso de empate de distância/tempo dentro de um projétil, aplica-se arbitragem configurada.

## Cadeado

`effects.lockMs` protege todas as casas próprias, inclusive novas marcas durante o efeito. Rivais continuam atravessando/coletando, mas aterrissagens e fluxos não tomam essas casas. Conversão pelo dono funciona e neutraliza suas casas; não termina o cadeado. Recoleta segue `lockRefresh` (renew/extend). Acertos, veneno e explosões não removem cadeado e não são evitados por ele. Expiração libera tomada a partir daquele passo.

Coletas/ativações seguem ordem row-major da casa, com coletor único. Coletas de cadeado do passo são aplicadas depois de todas as marcas básicas e antes dos fluxos. Não rever retroativamente uma tomada por aterrissagem já resolvida. Duas proteções não disputam a mesma casa porque cada casa tem um único dono.

## Perigos

TNT não é arma coletável: a primeira aterrissagem arma `armedAtTick`; mantém o item na casa e um contador visível. Reentrar não renova. Depois de armada não expira por `itemLifetimeMs`; ocupa uma vaga até explodir. Nitro detona ao primeiro contato e é removido. Explosões não encadeiam outras TNT/Nitro, não removem itens/território e não alteram pontos.

A área é quadrada, com raio Chebyshev `blastRadius`, recortada na arena (raio 1 = até 3×3 casas). Afeta todo personagem cujo centro interpolado esteja numa dessas casas, incluindo o ativador e quem estiver saltando. Cada explosão aplica no máximo um impacto por vítima: remove arma/impulso, atordoa por `explosionStunMs` e protege contra explosões pelo atordoamento + `hazards.postProtectionMs`. Esta proteção é independente de armas. Sobreposição de stuns mantém o maior término; não encurta efeito vigente. TNTs vencidas são resolvidas por id no início do passo; Nitro, após a marca da aterrissagem. Não elimina ninguém.

Cogumelo consome ao aterrissar e renova veneno por `poisonMs`; próximos saltos têm duração normal/com impulso multiplicada por `poisonSlowMultiplier`. Não soma multiplicadores nem altera salto já iniciado, não bloqueia tiro. Mostrar estado e tempo; expiração retoma ritmo para novos saltos. É uma escolha de Tumulto, não a falha instantânea do cristal original.

## Geração e leitura

Todos os tipos têm peso positivo no JSON inicial. Peso zero permite desligar o tipo durante balanceamento. TNT/Nitro/cogumelos compartilham o teto de outros itens e são gerados com a mesma exclusão de casas ocupadas/destinos. Selos têm teto próprio. Simples/duplo exibem direção; cruz exibe quatro pontas; armas são distintas por ícone e rótulo; Cadeado e proteções de personagem têm indicadores separados; perigos usam símbolos e contador/texto, sem depender só da cor.

## Verificação

Cobertura: UT-019–UT-025, IT-007 e E2E-006 em `_tests.md`. A task_04 implementa os novos recursos e integra o comportamento dos bots. O editor task_05 permite ajustar todos os parâmetros sem mudar a regra de conversão.
