# ADR-001 — Motor puro e primeira arena de Tumulto

## Status

**Proposed**, 2026-09-15. Direção do autor: jogo chamado Tumulto, em HTML, baseado na pesquisa e no universo de Ghork. Recorte de V1 e detalhes abaixo aguardam revisão; não registrar aprovação inexistente.

**Nota posterior:** escolhas de TypeScript, persistência e acabamento foram superadas pela ADR-004; itens/dificuldades/editor foram ampliados pela ADR-005. Este registro é histórico e não orienta essas áreas.

## Context

A pesquisa reúne quatro variantes com regras incompatíveis e lacunas de timing/colisão do original. O diretório contém apenas pesquisa e ferramentas de autoria, sem aplicação, Git, componentes ou backend. É necessário chegar rapidamente a uma partida completa cuja implementação possa ser verificada.

## Decision

Propor uma arena de disputa de runas por selos, com um humano e três bots, quatro personagens equivalentes, 90 segundos e arte própria. Resolver ambiguidades como decisões de Tumulto, não como tentativas de reproduzir um executável antigo.

Implementar motor determinístico em TypeScript sem dependência do navegador, Canvas para arena e DOM para controles. Manter regras em um único lugar, entradas comuns a humano/bots e estado persistente limitado a preferências.

## Alternatives Considered

### Todas as quatro variantes na primeira entrega

Oferece variedade, mas exige contratos de fechamento geométrico, bordas, cadeado e NPC antes de validar a primeira rodada. Esta proposta entrega o ciclo completo de território/depósito primeiro; novas variantes não são prometidas nem proibidas.

### Fechamento de áreas como regra inicial

Elimina disputa por recurso de conversão, mas põe conectividade geométrica no centro da experiência. A pesquisa permite ambos; selos tornam explícita a diferença entre território e pontos e oferecem um primeiro contrato menor.

### Engine 3D ou aplicação com backend

Facilita certas expansões, mas não é necessária para 64 casas, bots locais e recursos simples. Renderização e transporte podem ser substituídos posteriormente usando o contrato do motor, sem prometer migração automática para multiplayer.

### Regras dentro de componentes visuais

Reduz arquivos inicialmente, mas faz colisão, tempo e pontuação dependerem de frames e ciclo de vida da UI. Separar o motor permite testes de simultaneidade e reprodução com inputs iguais.

## Consequences

- Primeira tarefa já entrega uma partida, em vez de fundações sem consumidor.
- V1 completa exige itens e acabamento das tarefas seguintes.
- Cada personagem tem identidade própria sem depender de balancear quatro poderes.
- Multiplayer humano adicional muda o contrato de entrada e deve ser incorporado antes de executar, caso escolhido na revisão.
- Assets e premissa do jogo não entram automaticamente no cânone do livro.

## References

- [_spec.md](../_spec.md): regras, arquitetura, invariantes e análise de impacto.
- [_universe.md](../_universe.md): fontes literárias e invenções.
- [Pesquisa inicial](../../../../docs/pesquisa-inicial.md): alternativas mecânicas e incertezas da referência.
