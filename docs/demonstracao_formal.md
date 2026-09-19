# Demonstração Formal: Medidas Separatrizes e Cercas de Tukey

## 1. Definição Formal das Medidas Separatrizes
Seja $X = (x_1, x_2, \dots, x_n)$ um rol ordenado de observações, onde $x_1 \leq x_2 \leq \dots \leq x_n$.
As medidas separatrizes são valores que dividem a amostra ordenada em $k$ partes de frequências aproximadamente iguais.

- **Mediana ($Q_2$):** Valor que divide a distribuição ao meio.
  - Se $n$ é ímpar: Posição $\frac{n+1}{2}$.
  - Se $n$ é par: Média dos valores nas posições $\frac{n}{2}$ e $\frac{n}{2} + 1$.

- **Quartis ($Q_1$ e $Q_3$):** (Método de Tukey - Inclusão/Exclusão)
  Para $n$ ímpar, exclui-se a mediana estrita das sub-amostras inferior e superior. 
  - Sub-amostra inferior $L$: $x_1, \dots, x_{\lfloor n/2 \rfloor}$
  - Sub-amostra superior $U$: $x_{\lceil n/2 \rceil + 1}, \dots, x_n$
  $Q_1$ é a mediana de $L$ e $Q_3$ é a mediana de $U$.

## 2. Aplicação ao Caso Base ($n=13$)
Sendo o rol: $18, 22, 25, 28, 30, 32, 35, 40, 42, 45, 50, 55, 90$.
- $Q_2 = x_7 = 35$.
- O subconjunto inferior ($L$) possui $n' = 6$: $18, 22, 25, 28, 30, 32$.
- $Q_1 = \frac{x_3 + x_4}{2} = \frac{25 + 28}{2} = 26{,}5$.
- O subconjunto superior ($U$) possui $n' = 6$: $40, 42, 45, 50, 55, 90$.
- $Q_3 = \frac{x_3 + x_4}{2} = \frac{45 + 50}{2} = 47{,}5$.

Amplitude Interquartílica ($IQR$):
$IQR = Q_3 - Q_1 = 47{,}5 - 26{,}5 = 21{,}0$.

## 3. Dedução Analítica do Fator 1,5 (Critério de Tukey)
Tukey modelou as cercas assumindo uma distribuição subjacente Normal Padrão, $Z \sim \mathcal{N}(0, 1)$.
- $P(Z < z_{Q_1}) = 0{,}25 \implies z_{Q_1} \approx -0{,}6745$
- $P(Z < z_{Q_3}) = 0{,}75 \implies z_{Q_3} \approx 0{,}6745$
- $IQR_{Z} = z_{Q_3} - z_{Q_1} = 1{,}349$

Para que uma observação seja considerada atípica, Tukey definiu a cerca superior em aproximadamente 2,7 desvios padrão (cobrindo cerca de 99,3% dos dados na normal).
Cálculo do fator $k$:
$z_{Q_3} + k \cdot IQR_Z = 2{,}7$
$0{,}6745 + k \cdot 1{,}349 = 2{,}7$
$k = \frac{2{,}7 - 0{,}6745}{1{,}349} \approx 1{,}5015 \approx 1{,}5$.

Logo, as cercas empíricas tornam-se:
- $LI = Q_1 - 1{,}5 \cdot IQR$
- $LS = Q_3 + 1{,}5 \cdot IQR$
Valores fora de $[LI, LS]$ são classificados como *outliers*.
