# Medidas Separatrizes e Boxplot - PROFMAT 2025

Este repositório contém o código-fonte, a documentação teórica e o roteiro didático de apoio para a Prova Didática da disciplina de Probabilidade e Estatística do PROFMAT.
O tema foca nas Medidas Separatrizes, construção do Boxplot e a prova analítica do Fator 1.5 de John Tukey.

## Estrutura do Projeto
- `src/`: Aplicação web interativa construída com React, Vite, TypeScript e Tailwind CSS.
  - `src/components/Tab1RealSample.tsx`: Aba 1 (Amostra Real & Boxplot com Curva KDE, Cercas e Outliers).
  - `src/components/Tab2SimpleTable.tsx`: Aba 2 (Tabela Simples Discreta com Varredura de Frequência Acumulada).
  - `src/components/Tab3GroupedData.tsx`: Aba 3 (Dados Agrupados em Classes com Interpolação Linear).
  - `src/components/Tab4Triptych.tsx`: Aba 4 (Tríptico Comparativo de Assimetrias e Densidade).
  - `src/components/Tab5TukeyFactor.tsx`: Aba 5 (Origem Teórica do Fator 1.5 de John Tukey na Normal).
  - `src/components/Tab6References.tsx`: Aba 6 (Normas ABNT e Declaração CAPES).
- `docs/`: Roteiro de aula, demonstrações formais, declaração de uso de IA e referências ABNT.
- `data/`: Dados amostrais em JSON.

## Como Executar
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Acesse a aplicação na porta 3000.
