# Três modos de jogo e captura por contorno

**Status:** planejado para implementação futura; ainda não implementado.  
**Data:** 15/09/2026.  
**Origem:** playtest do autor e decisão de oferecer três variantes para comparar diversão.

## Problema observado

O autor fechou quadrados com sua cor e esperou receber pontos. No Tumulto atual, isso não acontece: somente coletar um **Selo ◎** converte as casas próprias em pontos. Fechar um contorno também não pinta seu interior.

O comportamento corresponde às regras BR-05/BR-06 da [spec V1](../.compozy/tasks/tumulto-v1/_spec.md), mas a comparação anterior com o original deixou de destacar uma diferença importante: **Pogo Pandemonium é uma família de variantes de Crash Bash, com regras distintas de captura e pontuação**. A implementação atual usa a conversão de Pogo Painter e mistura itens de outras variantes.

## Diferença confirmada no original

| Variante de referência | Fechar um contorno | Como garantir pontos |
| --- | --- | --- |
| Pogo Painter | Não é o mecanismo de captura/pontuação da variante. | Coletar a caixa converte as casas pintadas. |
| Pogo-A-Gogo | Cercar uma área com sua cor gera pontuação, incluindo o interior. | O fechamento substitui a coleta de caixas. |
| El Pogo Loco | Cercar uma área pinta o interior com sua cor. | Ainda é necessário coletar a caixa para converter o território em pontos. |

Os guias de [Ejexy](https://gamefaqs.gamespot.com/ps/914119-crash-bash/faqs/10087) e [Gbness](https://gamefaqs.gamespot.com/ps/914119-crash-bash/faqs/24420) descrevem essas diferenças. O guia de Ejexy também mostra contornos irregulares e explica o uso de bordas da cor do jogador em Pogo-A-Gogo. Portanto, a ideia não se limita a reconhecer quadrados ou retângulos perfeitos.

Essas fontes sustentam a distinção entre as variantes. Detalhes novos de interação com os itens de Tumulto devem ter contrato próprio; não devem ser apresentados como reprodução comprovada do original.

## Decisão do autor

Implementar futuramente **três modos selecionáveis**, um baseado em cada variante, para descobrir qual experiência é mais divertida. O padrão será o modo baseado em **Pogo Painter**.

Nomes definidos para esta proposta, usando a linguagem do [universo de Tumulto](../.compozy/tasks/tumulto-v1/_universe.md):

| Nome no jogo | Referência interna | Descrição para a seleção |
| --- | --- | --- |
| **Trilha de Runas** — padrão | Pogo Painter | “Pinte o caminho e recolha selos para ganhar pontos.” |
| **Círculos da Áurea** | Pogo-A-Gogo | “Cerque uma área com suas runas para ganhar pontos.” |
| **Domínio Rúnico** | El Pogo Loco | “Cerque áreas para expandir suas runas. Recolha selos para pontuar.” |

Os nomes são criações para o jogo, não termos ou acontecimentos canônicos do livro. “Círculos” significa contornos fechados no tabuleiro; não exige uma forma circular. Os nomes das variantes de Crash ficam apenas na documentação de referência.

## Comportamento esperado por modo

### Trilha de Runas

- Preservar a regra atual: salto pinta, selo converte todas as casas próprias em pontos e as neutraliza.
- Fechamento não concede bônus nem preenche interiores.
- Manter este modo selecionado ao abrir uma nova visita ao jogo.

### Círculos da Áurea

- Detectar uma área cercada pelas runas do participante, incluindo contornos irregulares.
- Fechamento válido captura o interior e dispara a conversão; não gerar selos neste modo.
- Proposta de regra para Tumulto: após capturar o interior, converter todas as casas próprias em pontos, uma vez, e neutralizá-las. Isso reaproveita a conversão atual com outro gatilho; deve ser explicitado no contrato futuro, sem presumir que todos os detalhes sejam idênticos ao original.
- Mostrar a área capturada e o ganho de pontos para tornar a causa da pontuação evidente.

### Domínio Rúnico

- Fechamento válido pinta o interior da cor do participante, aumentando suas runas pendentes.
- Fechar uma área não aumenta imediatamente o placar.
- Selos continuam convertendo todas as casas próprias e neutralizando-as.
- Mostrar separadamente a captura de território e sua posterior conversão em pontos.

## Seleção, bots e balanceamento

- Oferecer os três modos na preparação da partida, com nome e descrição curta; mostrar o modo ativo no HUD e no resultado.
- Modo e dificuldade são escolhas independentes: os três modos oferecem **Padrão** e **Difícil**.
- Revanche mantém modo e dificuldade escolhidos. Uma nova visita começa em Trilha de Runas e dificuldade Padrão, sem acrescentar persistência de preferências.
- Adaptar os bots: buscar selos em Trilha; construir e disputar contornos em Círculos; equilibrar captura e conversão em Domínio. Trocar só o gatilho do placar deixaria bots orientados a selos sem estratégia em Círculos.
- Manter inicialmente tabuleiro 8×8, quatro participantes, física e duração comparáveis. Os perigos continuam não eliminatórios conforme a adaptação atual.
- Centralizar novos valores de balanceamento em `game-design.json` e expô-los no dashboard com Salvar real. Valores específicos de um modo precisam de identificação clara; cada rodada mantém seu snapshot imutável.
- Esta proposta compara principalmente captura e pontuação. Reproduzir todas as diferenças de itens, desafios e arenas originais não faz parte automaticamente desta mudança.

## Contrato a fechar durante a futura implementação

A decisão de oferecer três modos e seu padrão já foi tomada. Os pontos abaixo são detalhes a resolver na autoria das próximas tasks, com defaults documentados e testes; não exigem ação do autor agora.

- Definir conectividade por lados, interior não vazio e tratamento de diagonais, buracos e múltiplas áreas no mesmo fechamento. Um bloco 2×2 preenchido não deve ser confundido com um contorno contendo interior.
- Definir se haverá bordas coloridas ajudando a fechar áreas, como em Pogo-A-Gogo. A borda externa neutra não deve contar silenciosamente como runa de qualquer jogador.
- Definir quais eventos podem completar um contorno: aterrissagem, fluxos e capturas. Evitar conversões repetidas ou cascatas não intencionais.
- Definir interação com território rival, cadeados, casas ocupadas e itens no interior. Capturar uma casa não deve implicitamente coletar seu item nem atingir seu ocupante.
- Fixar ordem e arbitragem para capturas simultâneas e para capturar/coletar selo no mesmo passo. Preservar determinismo e a regra de que eventos no encerramento não pontuam.
- Decidir se os parâmetros comuns bastam para o primeiro playtest ou se algum modo precisa de ajustes próprios. Separar regra estrutural de valor de balanceamento.

## Critérios de aceite futuros

- [ ] Nova visita inicia em Trilha de Runas; os três modos são selecionáveis e a revanche preserva a escolha.
- [ ] Trilha mantém a pontuação atual e não captura interiores.
- [ ] Círculos pontua por fechamento válido, incluindo interior, sem selos e sem contabilização duplicada.
- [ ] Domínio captura o interior sem pontuar imediatamente; o selo converte também as casas capturadas.
- [ ] Contorno aberto não captura; contornos irregulares fechados seguem o contrato definido. Bordas, diagonais, proteção e simultaneidade têm exemplos verificáveis.
- [ ] Bots das duas dificuldades perseguem objetivos adequados a cada modo, sob as mesmas regras do humano.
- [ ] Ajuda, HUD, efeitos e resultado explicam a diferença entre pintar, capturar e pontuar.
- [ ] Dashboard salva os ajustes aplicáveis e a próxima rodada os carrega sem alterar a rodada ativa.
- [ ] Playtest real percorre uma partida e uma revanche em cada modo; registra entendimento da pontuação e preferência do autor, sem declarar diversão aprovada por testes automatizados.

## Comparação de diversão

Jogar os três modos com o mesmo personagem, dificuldade e duração inicialmente. Registrar: clareza para pontuar, satisfação ao fechar áreas, oportunidades de disputa/recuperação e vontade de jogar outra rodada. A preferência do autor orientará o próximo passo; não remover modos nem trocar o padrão automaticamente pelo maior placar.

## Impacto na implementação futura

Atualizar a spec e a ADR-005 para reconhecer a ampliação solicitada depois da entrega V1. Revisar os contratos de itens, UI, bots, configuração e testes antes de criar/executar as novas tasks. Pontos de entrada atuais: `src/game/engine.js`, `src/game/effects.js`, `src/ai/bots.js`, `src/app/ui.js`, renderização e catálogo/schema do editor.

Este registro documenta o trabalho futuro. Não altera o jogo entregue nem reabre as tasks V1 já concluídas.
