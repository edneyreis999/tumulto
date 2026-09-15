# Review da spec frente às ADRs aceitas

Data: 2026-09-15. Revisão documental do conjunto `tumulto-v1`, das ADRs 003/004 e do questionário de decisões. Não constitui aprovação do autor, execução de testes ou revisão do manuscrito. A spec e suas tarefas não foram alteradas nesta revisão.

## Conclusão

O conjunto precisa de consolidação antes de servir como instrução de implementação. O aviso de precedência no começo da spec está correto, mas tarefas, testes e critérios de aceitação ainda exigem comportamentos superados.

Não foi identificada decisão humana estrutural que impeça começar o protótipo dentro das ADRs vigentes. Permanecem propostas editoriais e parâmetros a experimentar, além de decisões condicionais de publicação. Não é necessário preencher todo o questionário nem aprovar novamente modo solo, stack ou persistência.

## Achados

### 1. Alta — Tarefa inicial e gates ainda exigem TypeScript

- Evidência: `task_01.md:22` manda criar TypeScript/Vite; `_dx.md:33` exige typecheck sem erros TypeScript; `_spec.md:259` descreve aplicação TypeScript. Contratos, caminhos de UI e suites também usam `.ts`.
- Autoridade: [ADR-004](../../../docs/adr/adr-004-prototipo-descartavel-e-implementacao-minima.md), tabela de decisões, determina JavaScript, CSS, Canvas 2D e testes em Node; TypeScript não será usado.
- Consequência: executar literalmente a primeira tarefa viola a stack aceita; seguir a ADR deixa gates incompatíveis com a implementação correta.
- Correção: consolidar contratos, arquivos, comandos, testes e resumo de issue em JavaScript. Vite ou Vitest não são proibidos por essa decisão; sua adoção depende de utilidade no protótipo, sem necessidade de nova entrevista.
- Decisão humana: nenhuma; já tomada.

### 2. Alta — Critérios e testes obrigam persistência expressamente descartada

- Evidência: `_spec.md:363` define `tumulto.preferences.v1`; US-011.AC-4 exige preferências após reabertura; UT-018 e E2E-005 verificam armazenamento/restauração; `task_03.md:16` manda implementar adaptadores de storage.
- Autoridade: ADR-004 determina não guardar progresso, resultados ou configurações entre visitas.
- Consequência: uma implementação fiel à ADR falharia nos critérios atuais; implementar os testes como escritos introduziria comportamento recusado.
- Correção: remover persistência, recuperação/migração de storage e suas obrigações. Se opções visuais continuarem úteis, mantê-las apenas na visita atual. Verificar o reinício com padrões ao recarregar; preservar opções numa revanche da mesma visita é compatível com a ADR.
- Decisão humana: nenhuma; já tomada.

### 3. Média — Entrega ainda está vinculada à produção de identidade visual própria

- Evidência: `_universe.md:62` prescreve SVGs autorais/desenho procedural; `task_03.md:20` exige refinar silhuetas, marcas e arena; `_spec.md:267` condiciona a V1 às três tarefas, incluindo esse acabamento. O conjunto não incorpora o reaproveitamento de assets registrado na entrevista.
- Autoridade: ADR-004 manda reaproveitar assets de `projectX/frontend/img` e determina que produção de assets e acabamento não bloqueiem a avaliação das mecânicas.
- Consequência: o plano pode adiar a avaliação de uma partida completa por trabalho visual que deixou de ser necessário nesta etapa.
- Correção: incorporar a fonte de assets aceita, permitir substitutos simples quando faltarem imagens e separar acabamento da prontidão para playtest. Preservar a legibilidade de território, itens, participantes e efeitos. Manter as regras e os três itens; simplificar o trabalho visual não autoriza cortar mecânicas.
- Decisão humana: nenhuma para esse alinhamento. Nomes, ambientação e símbolos finais permanecem sujeitos à validação editorial.

### 4. Média — Pendências e resumo reabrem decisões já aceitas

- Evidência: `_spec.md:249` mantém OQ-01 pedindo confirmar humano/três bots; `_preflight.md:80` repete a pendência; `_issue.md:60` ainda trata o recorte solo e as regras em bloco como proposta. O inventário final de ADRs da spec lista apenas a ADR-001 proposta.
- Autoridade: [ADR-003](../../../docs/adr/adr-003-prototipo-solo-contra-bots.md) aceita um humano contra três bots; ADR-004 aceita regras básicas e tabuleiro 8×8. O questionário declara que registros aceitos prevalecem sobre campos não preenchidos.
- Consequência: a documentação faz parecer que há bloqueios humanos inexistentes e apresenta um preflight anterior como se refletisse o contrato atual.
- Correção: encerrar OQ-01, atualizar resumos e referências e marcar quais partes da ADR-001 foram superadas. Preservar o status de proposta dos detalhes que não foram aprovados; atualizar o preflight após consolidar os contratos.
- Decisão humana: nenhuma para registrar fielmente o que já foi decidido.

## O que ainda depende do autor

| Tema | Situação | Impede começar o protótipo? |
| --- | --- | --- |
| Ambientação no Pátio da Áurea, nomes de itens, frases e símbolos | OQ-02 continua aberta; propostas de spin-off, sem aprovação editorial registrada | Não para testar mecânicas com conteúdo provisório; validar antes de tratá-lo como identidade aprovada |
| Duração de 90 s, velocidades, durações de efeitos e pesos dos bots | Valores propostos para experimentar, não parâmetros individualmente aprovados | Não; usar como hipóteses de playtest. Mudanças que alterem regras, escopo ou experiência precisam voltar ao autor, conforme ADR-004 |
| Diversão e qualidade da experiência | Aprovação humana explicitamente prevista após jogar | Não para implementar; necessária para aprovar o experimento e considerar a etapa seguinte |
| GitHub, Linear e hospedagem | OQ-03 é condicional à intenção de publicar | Não para implementação e avaliação locais |
| Acesso inicial totalmente offline | Não decidido; a proposta prevê recursos locais e nenhuma rede durante a partida, sem PWA | Não para o fluxo local proposto; só requer decisão se distribuição/offline se tornar requisito |
| Versão do RPG Maker, plugins e party online | Etapa futura; online exige substituição explícita da ADR-003 | Não |

Escolher a frequência exata dos passos, organizar módulos, selecionar ferramentas de teste e resolver detalhes técnicos pelo caminho mais simples é responsabilidade da implementação, respeitando as regras aceitas. Passo fixo não impõe replay, rollback ou determinismo entre plataformas. Um RNG com seed ou motor testável em Node pode ser útil ao experimento atual e não é, por si só, violação da ADR.

## Encaminhamento

Consolidar spec, histórias, DX, UI, testes, tarefas e resumo de issue com as ADRs 003/004. Preservar a partida completa de runas, conversão e itens; retirar obrigações técnicas e visuais superadas. Depois, executar o protótipo quando solicitado e submeter a experiência jogável ao julgamento do autor.
