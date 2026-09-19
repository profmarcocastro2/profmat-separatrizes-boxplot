import numpy as np
import matplotlib.pyplot as plt
from scipy import stats
from fpdf import FPDF
import os

# --- 1. GERAR GRÁFICOS (MATPLOTLIB) ---
color_main = "#4F46E5"
color_outlier = "#E11D48"

# Gráfico 1: Boxplot
dados = [18, 22, 25, 28, 30, 32, 35, 40, 42, 45, 50, 55, 90]
fig, ax = plt.subplots(figsize=(10, 2))
box = ax.boxplot(dados, orientation="horizontal", patch_artist=True)
for patch in box['boxes']:
    patch.set_facecolor("cornflowerblue")
    patch.set_alpha(0.5)
for whisker in box['whiskers']:
    whisker.set(color=color_main, linewidth=2)
for cap in box['caps']:
    cap.set(color=color_main, linewidth=2)
for median in box['medians']:
    median.set(color=color_main, linewidth=2)
for flier in box['fliers']:
    flier.set(marker='D', color=color_outlier, alpha=1)

ax.set_title("Diagrama de Caixa (Boxplot)")
ax.set_xlabel("Tempo (Minutos)")
ax.set_yticks([])
plt.tight_layout()
plt.savefig("plot_box.png", dpi=300)
plt.close()

# Gráfico 2: Tríptico
fig, (ax1, ax2, ax3) = plt.subplots(1, 3, figsize=(15, 3))
x = np.linspace(-4, 4, 100)
ax1.plot(x, stats.norm.pdf(x), color="#2563EB")
ax1.fill_between(x, stats.norm.pdf(x), alpha=0.2, color="#2563EB")
ax1.set_title("Simétrica")
ax1.set_yticks([])

x = np.linspace(0.1, 8, 100)
ax2.plot(x, stats.lognorm.pdf(x, 0.6, scale=np.exp(0.5)), color="#059669")
ax2.fill_between(x, stats.lognorm.pdf(x, 0.6, scale=np.exp(0.5)), alpha=0.2, color="#059669")
ax2.set_title("Assimétrica Positiva")
ax2.set_yticks([])

x = np.linspace(-8, -0.1, 100)
ax3.plot(x, stats.lognorm.pdf(-x, 0.6, scale=np.exp(0.5)), color="#DC2626")
ax3.fill_between(x, stats.lognorm.pdf(-x, 0.6, scale=np.exp(0.5)), alpha=0.2, color="#DC2626")
ax3.set_title("Assimétrica Negativa")
ax3.set_yticks([])
plt.tight_layout()
plt.savefig("plot_triptico.png", dpi=300)
plt.close()

# Gráfico 3: Normal
fig, ax = plt.subplots(figsize=(10, 3.5))
x = np.linspace(-4, 4, 200)
ax.plot(x, stats.norm.pdf(x), color=color_main)
corte = 2.7
tail_sup = x[x >= corte]
tail_inf = x[x <= -corte]
ax.fill_between(tail_sup, stats.norm.pdf(tail_sup), color="#E11D48", alpha=0.5)
ax.fill_between(tail_inf, stats.norm.pdf(tail_inf), color="#E11D48", alpha=0.5)
ax.axvline(corte, color="#E11D48", linestyle="--")
ax.axvline(-corte, color="#E11D48", linestyle="--")
ax.axvline(0.6745, color="blue", linestyle=":")
ax.axvline(-0.6745, color="blue", linestyle=":")
ax.set_title("Normal Padrão e Cercas de Tukey (+/- 2.7 sigma)")
ax.set_yticks([])
plt.tight_layout()
plt.savefig("plot_normal.png", dpi=300)
plt.close()

# --- 2. GERAR PDF (FPDF2) ---
class PDF(FPDF):
    def header(self):
        self.set_font("helvetica", "B", 12)
        self.set_x(15)
        self.cell(w=260, h=10, text="Apresentacao Didatica PROFMAT - Probabilidade e Estatistica", border=0, align="R")
        self.ln(10)

pdf = PDF(orientation="L", unit="mm", format="A4")
pdf.set_auto_page_break(auto=True, margin=15)
largura = 260

# --- PÁGINA 1: Aba 1 ---
pdf.add_page()
pdf.set_font("helvetica", "B", 18)
pdf.set_text_color(79, 70, 229)
pdf.set_x(15)
pdf.cell(w=largura, h=10, text="1. Amostra Real e Boxplot", border=0, align="C")
pdf.ln(12)

pdf.set_font("helvetica", "", 12)
pdf.set_text_color(0, 0, 0)
pdf.set_x(15)
pdf.multi_cell(w=largura, h=8, text="Caso Real: Tempo de Deslocamento ao Polo (Minutos). Dados amostrais dos 13 mestrandos.")
pdf.set_font("helvetica", "B", 12)
pdf.set_x(15)
pdf.multi_cell(w=largura, h=8, text="Rol Ordenado: 18 -> 22 -> 25 -> 28 -> 30 -> 32 -> 35 -> 40 -> 42 -> 45 -> 50 -> 55 -> 90")
pdf.ln(5)

pdf.set_font("helvetica", "", 12)
pdf.set_x(15)
pdf.cell(w=50, h=10, text="Minimo: 18", border=1, align="C")
pdf.cell(w=50, h=10, text="Q1: 26.5", border=1, align="C")
pdf.cell(w=50, h=10, text="Mediana: 35", border=1, align="C")
pdf.cell(w=50, h=10, text="Q3: 47.5", border=1, align="C")
pdf.cell(w=50, h=10, text="Maximo: 90", border=1, align="C")
pdf.ln(15)

pdf.image("plot_box.png", x=20, y=75, w=250)

pdf.set_y(150)
pdf.set_x(15)
pdf.multi_cell(w=largura, h=8, text="Interpretacao: Mediana em 35 min. Amplitude interquartilica de 21 min. Outlier identificado em 90 min (maior que a cerca superior de 79).")

# --- PÁGINA 2: Aba 2 ---
pdf.add_page()
pdf.set_font("helvetica", "B", 18)
pdf.set_text_color(79, 70, 229)
pdf.set_x(15)
pdf.cell(w=largura, h=10, text="2. Dados Agrupados em Classes", border=0, align="C")
pdf.ln(12)

pdf.set_font("helvetica", "", 12)
pdf.set_text_color(0, 0, 0)
texto_agrupado = (
    "Formula de Interpolacao Linear:\n"
    "Q_k = L_k + [ (k*n/4 - F_ant) / f_classe ] * h\n\n"
    "Distribuicao em Classes (h = 15):\n"
    "[15-30): fi=4, Fi=4\n"
    "[30-45): fi=4, Fi=8\n"
    "[45-60): fi=4, Fi=12\n"
    "[60-75): fi=0, Fi=12\n"
    "[75-90): fi=0, Fi=12\n"
    "[90-105): fi=1, Fi=13\n\n"
    "Calculo de Q1 (25%):\n"
    "Posicao = 13 / 4 = 3.25. (Q1 cai na 1a classe).\n"
    "Q1 = 15 + [ (3.25 - 0) / 4 ] * 15 = 27.19 minutos.\n\n"
    "Reflexao Pedagogica:\n"
    "No Rol, Q1 = 26.50 min. Em classes, Q1 = 27.19 min. A diferenca ocorre pois a interpolacao linear pressupoe "
    "uma distribuicao uniforme das observacoes dentro da amplitude da classe, gerando uma aproximacao continua."
)
pdf.set_x(15)
pdf.multi_cell(w=largura, h=8, text=texto_agrupado)

# --- PÁGINA 3: Aba 3 ---
pdf.add_page()
pdf.set_font("helvetica", "B", 18)
pdf.set_text_color(79, 70, 229)
pdf.set_x(15)
pdf.cell(w=largura, h=10, text="3. Triptico de Assimetria vs. Gaussiana", border=0, align="C")
pdf.ln(12)

pdf.set_font("helvetica", "", 12)
pdf.set_text_color(0, 0, 0)
pdf.set_x(15)
pdf.multi_cell(w=largura, h=8, text="Deformacao do Boxplot mediante simulacoes de distribuicoes assimetricas.")
pdf.ln(5)
pdf.image("plot_triptico.png", x=15, y=45, w=260)

pdf.set_y(150)
texto_triptico = (
    "1. Simetrica (Media = Mediana = Moda): Hastes equivalentes e caixa centrada.\n"
    "2. Assimetrica Positiva (Media > Mediana > Moda): Haste direita longa.\n"
    "3. Assimetrica Negativa (Media < Mediana < Moda): Haste esquerda longa."
)
pdf.set_x(15)
pdf.multi_cell(w=largura, h=8, text=texto_triptico)

# --- PÁGINA 4: Aba 4 ---
pdf.add_page()
pdf.set_font("helvetica", "B", 18)
pdf.set_text_color(79, 70, 229)
pdf.set_x(15)
pdf.cell(w=largura, h=10, text="4. A Origem do Fator 1.5 (John Tukey)", border=0, align="C")
pdf.ln(12)

pdf.set_font("helvetica", "", 12)
pdf.set_text_color(0, 0, 0)
pdf.set_x(15)
pdf.multi_cell(w=largura, h=8, text="Demonstracao visual do porque o corte com 1.5 x IQR equivale a +/- 2.7 sigma na Normal Padrao.")
pdf.ln(5)

pdf.image("plot_normal.png", x=20, y=45, w=250)

pdf.set_y(160)
texto_tukey = (
    "A relacao: Q3 se localiza em +0.67 sigma. O IQR na normal e 1.35 sigma. "
    "Ao multiplicar por 1.5 e somar a Q3, obtemos as cercas em aproximadamente 2.7 desvios padrao. "
    "Isto isola apenas 0.7% dos dados como outliers (falsos positivos em uma distribuicao teorica normal), "
    "equilibrando conservadorismo e robustez."
)
pdf.set_x(15)
pdf.multi_cell(w=largura, h=8, text=texto_tukey)


# --- PÁGINA 5: Aba 5 ---
pdf.add_page()
pdf.set_font("helvetica", "B", 18)
pdf.set_text_color(79, 70, 229)
pdf.set_x(15)
pdf.cell(w=largura, h=10, text="5. Normas ABNT e Declaracao CAPES", border=0, align="C")
pdf.ln(15)

pdf.set_font("helvetica", "B", 12)
pdf.set_text_color(0, 0, 0)
pdf.set_x(15)
pdf.multi_cell(w=largura, h=8, text="Referencias Bibliograficas (ABNT NBR 6023:2018):")
pdf.set_font("helvetica", "", 12)
refs = (
    "* BARBETTA, Pedro Alberto. Estatistica aplicada as ciencias sociais. 8. ed. Florianopolis: Editora da UFSC, 2012.\n"
    "* BUSSAB, Wilton de Oliveira; MORETTIN, Pedro Alberto. Estatistica basica. 9. ed. Sao Paulo: Saraiva, 2017.\n"
    "* MORGADO, Augusto Cesar de Oliveira et al. Analise combinatoria e probabilidade. 10. ed. Rio de Janeiro: SBM, 2016.\n"
    "* PROVENZA, Marcello Montillo. Probabilidade e Estatistica: notas de aula. Rio de Janeiro: UERJ/PROFMAT, 2026.\n"
    "* TUKEY, John Wilder. Exploratory data analysis. Reading, MA: Addison-Wesley, 1977."
)
pdf.set_x(15)
pdf.multi_cell(w=largura, h=8, text=refs)
pdf.ln(10)

pdf.set_font("helvetica", "B", 12)
pdf.set_x(15)
pdf.multi_cell(w=largura, h=8, text="Declaracao de Transparencia no Uso de IA Generativa:")
pdf.set_font("helvetica", "", 12)
capes = (
    "Declaro que utilizei a ferramenta de Inteligencia Artificial Google Gemini como apoio instrumental para "
    "concepcao didatica, geracao de templates computacionais em Python/Plotly e formatacao LaTeX.\n"
    "Todos os calculos, conceitos matematicos e analises foram revisados e validados pelo autor humano, "
    "que assume responsabilidade cientifica integral."
)
pdf.set_x(15)
pdf.multi_cell(w=largura, h=8, text=capes)

pdf.output("Apresentacao_PROFMAT.pdf")
print("PDF gerado com sucesso!")
