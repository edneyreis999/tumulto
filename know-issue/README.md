# Decisões antes de criar o jogo

Pesquisa realizada em 15/09/2026, organizada como questionário para preencher.

## Evoluções identificadas no playtest

- [Três modos de jogo e captura por contorno](modos-de-jogo-e-captura-por-contorno.md): diferença em relação às variantes originais; planeja Trilha de Runas (padrão), Círculos da Áurea e Domínio Rúnico para implementação futura e comparação de diversão.

## Decisões aceitas

- [ADR-003 — Protótipo solo contra bots como escopo vigente](../docs/adr/adr-003-prototipo-solo-contra-bots.md): um humano contra três bots. Todas as decisões devem considerar essa experiência até a ADR ser substituída. A migração para party online é uma intenção para depois da aprovação do protótipo.
- [ADR-004 — Protótipo descartável e implementação técnica mínima](../docs/adr/adr-004-prototipo-descartavel-e-implementacao-minima.md): JavaScript, CSS, Canvas 2D e testes em Node; navegador no computador do autor; visão de cima e câmera fixa; regras básicas e tabuleiro 8×8 mantidos; simulação em intervalos fixos; sem persistência. A futura implementação será em plugins para RPG Maker. Aprovação pelo julgamento do autor, sem critérios formais nesta conversa.

Os registros aceitos prevalecem sobre campos ainda não preenchidos neste questionário e escolhas conflitantes da especificação proposta. A entrevista passa a priorizar decisões que alterem as mecânicas ou o escopo; detalhes técnicos rotineiros seguem a implementação mais simples necessária ao protótipo.

## Como responder

1. Comece pela definição do jogo.
2. Responda aos seis temas prioritários antes de consolidar a base técnica.
3. Amadureça os demais durante o protótipo, antes de produzir muito conteúdo.
4. Marque os temas condicionais como aplicáveis ou não aplicáveis.

Pode responder “não sei ainda”. Nesse caso, anote qual experimento ajudaria a decidir. As respostas não precisam ser decisões definitivas.

Um ADR (*Architecture Decision Record*) registra uma decisão importante, seu contexto, alternativas e consequências. Este questionário prepara essas decisões; cada decisão aceita pode depois virar um ADR próprio. A seleção e a prioridade abaixo são uma síntese prática da pesquisa, não um checklist universal de uma engine. [Referência: MADR](https://adr.github.io/madr/)

## 0. Definição do jogo

Estas respostas fornecem os critérios para avaliar as escolhas técnicas.

### Visão e experiência

- Qual é a ideia do jogo em uma ou duas frases?
- Qual experiência ou sensação queremos proporcionar?
- Qual é o gênero e a perspectiva da câmera?
- Qual é o ciclo principal de ações do jogador?
- Quanto dura uma sessão típica?
- Quem é o público esperado?

**Respostas:**

> A preencher.

### Escopo e recursos

- O que precisa existir no primeiro protótipo jogável?
- O que está fora desse primeiro escopo?
- Quem participa da equipe e quais tecnologias já conhece?
- Qual é o prazo e o orçamento disponível?
- Quais hipóteses sobre diversão e viabilidade técnica precisamos testar?
- Que resultado indicaria que vale avançar para produção?

**Respostas:**

> A preencher.

Desenvolver jogos exige iteração. Protótipos ajudam a testar hipóteses antes de investir na arquitetura e no conteúdo; registre se o código do protótipo será descartável ou evoluirá para produção. [Game Programming Patterns — Architecture, Performance, and Games](https://gameprogrammingpatterns.com/architecture-performance-and-games.html)

## 1. Decisões prioritárias para a base do jogo

### ADR-001 — Plataformas e limites técnicos

**Por que decidir cedo:** orienta engine, renderização e volume de conteúdo.

- Quais plataformas serão atendidas no lançamento: PC, navegador, mobile ou console?
- Quais plataformas são apenas possibilidades futuras?
- Qual é o hardware mínimo ou dispositivo de referência?
- Qual é a meta de FPS e em quais condições ela deve ser atingida?
- Quais são os limites iniciais de memória, tamanho do jogo e tempo de carregamento?
- Qual cenário representativo usaremos para medir esses limites?

**Respostas:**

> A preencher.

**Pendências / como validar:**

> A preencher.

### ADR-002 — Engine e stack de desenvolvimento

**Por que decidir cedo:** trocar a engine depois pode exigir refazer código, ferramentas e assets.

- Qual engine e linguagem pretendemos usar?
- Qual versão inicial será adotada?
- Quais alternativas reais estamos considerando?
- Quais requisitos do jogo favorecem ou eliminam cada alternativa?
- Como a experiência da equipe influencia a escolha?
- Quais custos, licenças, plugins ou serviços entram nessa escolha?
- Que pequeno protótipo comprovará que a stack atende ao jogo?

**Respostas:**

> A preencher.

**Pendências / como validar:**

> A preencher.

### ADR-003 — Modelo de execução e conectividade

**Por que decidir cedo:** determina onde o estado vive e como as regras são executadas.

- O jogo será single-player, multiplayer local, multiplayer online ou uma combinação?
- Deve funcionar completamente offline?
- Quantos jogadores haverá por sessão?
- Multiplayer faz parte do escopo ou é somente uma possibilidade distante?
- Quais funcionalidades dependerão de conexão?
- O que deve acontecer quando a conexão cair?

**Respostas:**

> Decisão aceita: um humano contra três bots, conforme a [ADR-003](../docs/adr/adr-003-prototipo-solo-contra-bots.md). Multiplayer local e online ficam fora do escopo vigente. A intenção é migrar para party online depois da aprovação do protótipo, mediante substituição explícita da ADR. Até lá, todas as decisões são orientadas pela experiência solo.

**Pendências / como validar:**

> Aprovação pelo julgamento do autor ao jogar, sem critérios formais nesta conversa. Requisitos de acesso/carregamento sem conexão não foram definidos. Validar a experiência em partidas solo contra bots; não antecipar requisitos de multiplayer.

A Epic recomenda planejar multiplayer cedo em projetos que precisam dele: adaptar uma base construída sem rede pode exigir reescrever grandes partes do gameplay. [Epic — Networking Overview](https://dev.epicgames.com/documentation/en-us/unreal-engine/networking-overview-for-unreal-engine)

### ADR-004 — Representação visual e renderização

**Por que decidir cedo:** estabelece restrições para materiais, iluminação, assets e desempenho.

- O jogo será 2D, 3D ou uma combinação?
- Qual câmera e projeção serão usadas?
- Qual estilo visual orientará a produção dos assets?
- Qual renderizador será usado e por quê?
- Quais efeitos visuais são indispensáveis?
- Quais efeitos podem ser reduzidos ou desativados em hardware limitado?
- Como validaremos a aparência e o desempenho nas plataformas escolhidas?

**Respostas:**

> A preencher.

**Pendências / como validar:**

> A preencher.

Plataforma e renderização precisam ser consideradas juntas. A documentação do Godot mostra diferenças de compatibilidade e recursos entre renderizadores; trocar entre eles pode exigir ajustes em cenas, iluminação e ambientes. [Godot — Overview of renderers](https://docs.godotengine.org/en/stable/tutorials/rendering/renderers.html)

### ADR-005 — Simulação, tempo e física

**Por que decidir cedo:** afeta movimento, colisões, pausas, replays e sincronização.

- O jogo será por turnos, em tempo real ou híbrido?
- Como as regras serão atualizadas: passo fixo, variável ou combinação?
- Usaremos a física da engine ou uma simulação própria? Qual requisito justifica isso?
- Como funcionarão pausa, câmera lenta e aceleração do tempo, se existirem?
- Precisamos reproduzir exatamente uma partida a partir dos mesmos comandos?
- A aleatoriedade precisa usar uma semente reproduzível?
- Quais comportamentos precisam permanecer consistentes em máquinas com FPS diferentes?

**Respostas:**

> A preencher.

**Pendências / como validar:**

> A preencher.

A frequência de simulação pode ser diferente da frequência de renderização. Passos fixos ajudam na estabilidade, mas não garantem determinismo por si só. [Game Programming Patterns — Game Loop](https://gameprogrammingpatterns.com/game-loop.html)

### ADR-006 — Organização do estado e das regras

**Por que decidir cedo:** evita estados duplicados e dependências excessivas entre sistemas.

- Quem controla o estado da partida?
- Quais dados pertencem à sessão, ao jogador e ao progresso permanente?
- Como separar regras do jogo, interface, áudio e efeitos visuais?
- Como as entidades e os sistemas se comunicarão?
- Usaremos a organização por cenas e componentes da engine? Há algum requisito que peça outra abordagem?
- Como representar estados como menu, partida, pausa, vitória e derrota?
- Quais regras devem poder ser verificadas sem renderizar o jogo?

**Respostas:**

> A preencher.

**Pendências / como validar:**

> A preencher.

## 2. Decisões antes de produzir muito conteúdo

### ADR-007 — Persistência e saves

- O que deve persistir entre sessões?
- Haverá salvamento manual, automático, checkpoints ou uma combinação?
- O save será local, em nuvem ou ambos?
- Como identificar entidades e reconstruir suas relações ao carregar?
- Qual formato será usado e por quê?
- Como manter ou migrar saves entre versões do jogo?
- Como lidar com gravação interrompida, save inválido ou conflito entre dispositivos?

**Respostas:**

> A preencher.

**Pendências / como validar:**

> A preencher.

Salvar envolve selecionar o estado persistente e reconstruir objetos e relações, além de escolher um formato de arquivo. [Godot — Saving games](https://docs.godotengine.org/en/4.5/tutorials/io/saving_games.html)

### ADR-008 — Dados e pipeline de conteúdo

- Como serão criados e editados inimigos, itens, habilidades e fases?
- Quais definições ficarão em código, recursos da engine ou arquivos externos?
- Quem editará esse conteúdo e quais ferramentas essa pessoa precisa?
- Como validar valores e referências antes de gerar uma build?
- Quais formatos e convenções usaremos para importar arte, animações e áudio?
- Como versionar e compartilhar arquivos grandes com a equipe?

**Respostas:**

> A preencher.

**Pendências / como validar:**

> A preencher.

### ADR-009 — Organização e carregamento do mundo

- O jogo terá fases independentes, mundo contínuo ou geração procedural?
- Quais partes serão carregadas juntas?
- Quando carregar e descarregar conteúdo?
- Como funcionarão transições e telas de carregamento?
- O estado de uma área deve permanecer ao sair e voltar?
- Como limitar o consumo de memória?
- Se houver geração procedural, o que precisa ser reproduzível por semente?

**Respostas:**

> A preencher.

**Pendências / como validar:**

> A preencher.

### ADR-010 — Entrada e interface multiplataforma

- Quais dispositivos serão suportados: teclado, mouse, controle ou toque?
- Haverá remapeamento de comandos?
- Como representar ações sem vinculá-las diretamente a um dispositivo?
- Como navegar pelos menus em cada dispositivo?
- Quais resoluções, proporções de tela e orientações precisam funcionar?
- Quais necessidades de acessibilidade devem orientar a interface desde o início?
- Quais idiomas serão suportados e como acomodar textos maiores?

**Respostas:**

> A preencher.

**Pendências / como validar:**

> A preencher.

### ADR-011 — Builds e validação técnica

- Como gerar uma versão jogável reproduzível a partir do repositório?
- Como distribuir builds para testes?
- Quais regras críticas precisam de testes automatizados?
- Quais jornadas precisam ser verificadas jogando?
- Como medir desempenho no hardware mínimo?
- Como coletar informações suficientes para diagnosticar falhas?
- Qual é o critério mínimo para considerar uma build pronta para avaliação?

**Respostas:**

> A preencher.

**Pendências / como validar:**

> A preencher.

## 3. Decisões condicionais

Os temas abaixo são sugestões conforme o escopo. Para cada um, preencha a aplicabilidade antes de detalhar soluções.

### Multiplayer online

**Aplicabilidade:** A definir — aplicável / não aplicável / adiado.

- Quem tem autoridade sobre o estado da partida?
- Haverá servidor dedicado, servidor hospedado por um jogador ou outra topologia?
- Como sincronizar o estado entre jogadores?
- Quais metas de latência e volume de jogadores precisam ser atendidas?
- Como lidar com desconexão, reconexão e saída do anfitrião?
- Qual é o orçamento de operação?

**Respostas:**

> A preencher.

### Competitivo, replay ou rollback

**Aplicabilidade:** A definir — aplicável / não aplicável / adiado.

- Qual recurso exige histórico ou reprodução da simulação?
- Precisamos de determinismo entre plataformas?
- Como registrar comandos, estados e sementes aleatórias?
- Quanto histórico será mantido?
- Como verificar divergências na reprodução?

**Respostas:**

> A preencher.

### Contas e progressão online

**Aplicabilidade:** A definir — aplicável / não aplicável / adiado.

- O jogador precisa de conta? Em qual momento?
- Onde fica a fonte oficial dos dados de progresso?
- Como sincronizar diferentes dispositivos?
- O que funciona offline e como resolver conflitos ao reconectar?

**Respostas:**

> A preencher.

### Economia e compras

**Aplicabilidade:** A definir — aplicável / não aplicável / adiado.

- Existem compras, moedas ou itens com valor persistente?
- Quem valida transações e concede itens?
- Como evitar concessões duplicadas ao repetir uma operação?
- Como recuperar uma compra interrompida?

**Respostas:**

> A preencher.

### Mods ou conteúdo de jogadores

**Aplicabilidade:** A definir — aplicável / não aplicável / adiado.

- Quais partes do jogo poderão ser modificadas?
- Quais formatos ou interfaces serão públicos?
- Como versionar e manter compatibilidade?
- Quais permissões e limites o conteúdo terá?
- Como carregar e isolar conteúdo de terceiros?

**Respostas:**

> A preencher.

### Serviço contínuo

**Aplicabilidade:** A definir — aplicável / não aplicável / adiado.

- O conteúdo poderá ser atualizado sem publicar um novo executável?
- Como manter compatibilidade entre cliente e servidor?
- Como distribuir e validar atualizações?
- Como recuperar uma versão com problemas?
- Quem será responsável pela operação após o lançamento?

**Respostas:**

> A preencher.

## 4. Modelo para formalizar uma decisão

Use uma cópia deste modelo para cada decisão que estiver madura. Se um tema contiver decisões independentes, separe os registros. Modelo adaptado do [MADR](https://adr.github.io/madr/).

```markdown
# ADR-NNN — Título da decisão

## Status
Proposta | Aceita | Substituída

## Contexto
Qual problema precisamos resolver? Quais são as restrições?

## Critérios
Como vamos comparar as opções?

## Alternativas
Quais opções reais consideramos?

## Decisão e justificativa
O que escolhemos e por quê?

## Consequências
Quais benefícios, custos e limitações aceitamos?

## Validação
Qual protótipo, teste ou medição sustenta a escolha?

## Quando revisar
Que mudança ou evidência justificaria reconsiderar?
```

## 5. Próximas decisões e experimentos

Após preencher, registre aqui apenas o que ainda impede avançar.

| Decisão ou dúvida | Experimento ou informação necessária | Responsável | Resultado |
| --- | --- | --- | --- |
| A preencher | A preencher | A preencher | A preencher |

## Fontes consultadas

- [MADR — Markdown Architectural Decision Records](https://adr.github.io/madr/): definição e estrutura de registros de decisão.
- [Game Programming Patterns — Architecture, Performance, and Games](https://gameprogrammingpatterns.com/architecture-performance-and-games.html): arquitetura, desempenho e experimentação.
- [Game Programming Patterns — Game Loop](https://gameprogrammingpatterns.com/game-loop.html): atualização, renderização e passos de simulação.
- [Epic — Networking Overview](https://dev.epicgames.com/documentation/en-us/unreal-engine/networking-overview-for-unreal-engine): planejamento de multiplayer, autoridade e modelos de servidor.
- [Godot — Overview of renderers](https://docs.godotengine.org/en/stable/tutorials/rendering/renderers.html): relação entre plataformas, hardware e renderização.
- [Godot — Saving games](https://docs.godotengine.org/en/4.5/tutorials/io/saving_games.html): persistência, serialização e reconstrução do estado.
