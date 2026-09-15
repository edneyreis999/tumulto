# ADR-004 — Protótipo descartável e implementação técnica mínima

## Status

**Aceita em 15/09/2026**, consolidando as decisões explícitas do autor durante a entrevista.

Complementa a [ADR-003](adr-003-prototipo-solo-contra-bots.md), que permanece vigente. Abrange vários temas do questionário; o número deste registro não limita seu alcance ao tema visual.

## Contexto

O protótipo existe para descobrir se as mecânicas de Tumulto são divertidas. O autor pretende descartar todo o código e fazer uma nova implementação em plugins para RPG Maker na etapa futura. Reutilização de código e preparação para multiplayer online não são objetivos desta etapa.

## Critérios

- Implementar as regras básicas completas que o autor quer experimentar.
- Minimizar o trabalho técnico necessário para tornar essas regras jogáveis e testáveis.
- Priorizar a leitura da partida; acabamento visual não é objetivo de avaliação.
- Evitar recriar uma infraestrutura genérica para recursos que serão tratados na futura implementação em RPG Maker.

## Alternativas

1. **Protótipo descartável com implementação mínima:** escolhido para avaliar as mecânicas.
2. **Base evolutiva para reaproveitar na versão futura:** descartada; o autor prevê uma nova implementação no formato de plugins.
3. **Antecipar infraestrutura para RPG Maker ou party online:** fora do escopo enquanto a ADR-003 permanecer vigente.

## Decisão e justificativa

Todo o código do protótipo é descartável. Decisões técnicas devem atender ao experimento atual pelo caminho mais simples, sem obrigação de reutilização futura.

| Área | Decisão aceita |
| --- | --- |
| Plataforma | Navegador de computador, usando o computador atual do autor como referência. Celular fica fora desta etapa. |
| Stack | JavaScript, CSS e Canvas 2D; Node.js para testes das regras. TypeScript não será usado. |
| Representação | Jogo 2D, visão de cima no estilo RPG Maker e câmera fixa durante o protótipo. |
| Assets | Reaproveitar arquivos de `/Users/edney/projects/coreto/projectX/frontend/img`. O autor pretende gerar os que faltarem com o GPT-6 Astra. Produção de assets e acabamento não devem bloquear a avaliação das mecânicas. |
| Regras | Manter as regras básicas da proposta e o tabuleiro 8×8; não reduzir o conjunto que se pretende testar para economizar implementação técnica. |
| Pontuação | Pintar acumula território pendente. Coletar um selo converte as casas próprias em pontos e as torna neutras. Território não convertido é perdido no fim da rodada. |
| Simulação | Atualizar as regras em intervalos fixos, independentemente da renderização. A frequência exata não foi fixada nesta entrevista. |
| Persistência | Não guardar progresso, resultados ou configurações entre visitas. Cada visita começa do zero. |
| Destino futuro | Nova implementação em plugins para RPG Maker, com intenção de party online após aprovação do protótipo e substituição da ADR-003. |

Detalhes técnicos rotineiros devem ser resolvidos conforme esse critério de simplicidade. Só precisam retornar à entrevista quando mudarem as regras, o escopo ou a experiência que será testada.

## Consequências

- O objetivo é validar as mecânicas, sem construir uma base de produção ou uma engine reutilizável.
- Os testes em Node podem avançar a simulação sem renderizar nem esperar o tempo real da partida.
- A adoção de passo fixo não implica compromisso com replay, rollback ou determinismo entre plataformas.
- A simplicidade técnica não autoriza remover regras básicas aprovadas.
- Escolhas antigas de TypeScript, persistência de preferências ou acabamento visual obrigatório deixam de orientar o protótipo quando conflitarem com esta ADR.
- A escolha da versão do RPG Maker e dos contratos de plugins pertence à etapa futura.

## Validação

A avaliação será feita pelo autor jogando o protótipo e julgando se está bom. Não serão exigidos critérios formais de aprovação nesta conversa. Testes técnicos verificam regras, mas não substituem esse julgamento.

Nenhuma implementação ou aprovação do protótipo é declarada por este registro.

## Quando revisar

Revisar se o autor mudar o propósito descartável do protótipo, sua plataforma ou a prioridade de validar apenas as mecânicas. A etapa em RPG Maker exige decisões próprias; a transição para online continua sujeita à substituição explícita da ADR-003.

## Referências

- [Questionário de decisões](../../know-issue/README.md).
- [Proposta de regras de Tumulto](../../.compozy/tasks/tumulto-v1/_spec.md).
