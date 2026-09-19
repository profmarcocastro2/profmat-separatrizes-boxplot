# Roteiro de Aula: Medidas Separatrizes e Boxplot
**Duração Total:** 35 minutos
**Público-alvo:** 13 mestrandos e 1 professor avaliador

## Cronograma (Minuto a Minuto)

### Introdução (00:00 - 05:00)
- **00:00 - 01:00:** Boas-vindas e apresentação do tema: "Medidas Separatrizes, Boxplot e a Origem do Fator 1.5".
- **01:00 - 03:00:** Apresentação do Caso Real. Tempo de deslocamento da própria turma ($n=13$). Leitura do rol ordenado.
- **03:00 - 05:00:** Relevância do tema. Por que não usar apenas a média? A sensibilidade a valores atípicos (outliers).

### Desenvolvimento Teórico e Prático (05:00 - 20:00)
- **05:00 - 08:00:** Definição formal de Medidas Separatrizes (Quartis, Decis, Percentis). Foco na Mediana ($Q_2$) como divisor central (posição 7 para $n=13$).
- **08:00 - 13:00:** Cálculo dos Quartis (Método de exclusão da Mediana).
  - Cálculo de $Q_1$ usando a metade inferior (n=6).
  - Cálculo de $Q_3$ usando a metade superior (n=6).
  - Obtenção da Amplitude Interquartílica ($IQR = 21,0$).
- **13:00 - 18:00:** O Boxplot e as Cercas de Tolerância. 
  - Cálculo da Cerca Inferior ($-5,0$) e Cerca Superior ($79,0$).
  - O limite das hastes (whiskers) atrelado aos valores reais da amostra (18 e 55).
- **18:00 - 20:00:** Identificação formal do outlier. O tempo de 90 min (maior que 79,0).

### Aprofundamento: O Fator 1.5 de Tukey (20:00 - 28:00)
- **20:00 - 25:00:** De onde vem o 1.5? Relação com a Distribuição Normal Padrão ($Z \sim N(0,1)$).
- **25:00 - 28:00:** Demonstração analítica (Tukey Derivation): O corte de aproximadamente 2,7 $\sigma$ e o IQR em $Z$ ($1,349$). A equação do fator $k \approx 1,5$.

### Aplicação Interativa (28:00 - 32:00)
- **28:00 - 32:00:** Demonstração ao vivo do App Streamlit. Apresentação do código em Python gerando o Boxplot. Interseção entre Estatística e Ciência de Dados.

### Conclusão e Dúvidas (32:00 - 35:00)
- **32:00 - 33:00:** Síntese final. O Boxplot como ferramenta exploratória robusta.
- **32:00 - 40:00:** Abertura para perguntas dos presentes (professor e colegas).
