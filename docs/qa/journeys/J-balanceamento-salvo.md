# Ajustar e reabrir os valores realmente salvos

```mermaid
flowchart TD
 A[Entrada pública] --> B[Configurar e agir]
 B --> C[Confirmar resultado visível]
 C --> D[Reabrir e confirmar estado final]
 B -->|erro ou conflito| E[Mensagem e recuperação]
 E --> B
 B -->|abandonar| F[Voltar ao menu ou fechar]
 F -->|nova visita| A
```

```yaml
journey:
  id: J-balanceamento-salvo
  name: Ajustar e reabrir os valores realmente salvos
  value_statement: Nova leitura mostra o valor salvo e outra aba não sobrescreve sem conflito
  personas: [Edney]
  entry_points: [http://127.0.0.1:4174/game-design.html]
  actions: [Painel → edição → salvar → reabrir → próxima partida]
  goal: {observable: "Nova leitura mostra o valor salvo e outra aba não sobrescreve sem conflito"}
  true_end_state: Nova leitura mostra o valor salvo e outra aba não sobrescreve sem conflito
  abandonment: [Fechar ou voltar sem confirmação; nova visita respeita persistência documentada]
  crosses: [UI, motor, JSON local]
```
