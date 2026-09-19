import streamlit as st
import numpy as np
import plotly.graph_objects as go
import pandas as pd
from scipy import stats

# Configuração da Página
st.set_page_config(
    page_title="Separatrizes, Boxplot e Fator 1.5 (PROFMAT)",
    page_icon="📊",
    layout="wide"
)

# Estilização visual (UI/UX Moderna inspirada no MDA)
st.markdown("""
<style>
    /* Tipografia e espaçamentos */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
    }
    
    .main-title { 
        font-size: 2.2rem; 
        font-weight: 800; 
        background: linear-gradient(90deg, #4F46E5, #9333EA);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0px; 
        letter-spacing: -0.05em;
    }
    
    .sub-title { 
        font-size: 1.1rem; 
        font-weight: 500;
        color: #64748B; 
        margin-top: 5px;
        margin-bottom: 30px; 
    }
    
    /* Cards e Caixas de Informação */
    .info-box { 
        background-color: #F8FAFC; 
        border: 1px solid #E2E8F0;
        border-left: 5px solid #3B82F6; 
        padding: 20px; 
        border-radius: 12px; 
        margin-top: 20px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    }
    
    .pedagogic-box { 
        background-color: #FFFBEB; 
        border: 1px solid #FEF3C7;
        border-left: 5px solid #F59E0B; 
        padding: 20px; 
        border-radius: 12px; 
        margin-top: 20px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    }
    
    /* Customização nativa das abas do Streamlit */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
    }
    .stTabs [data-baseweb="tab"] {
        border-radius: 8px 8px 0px 0px;
        padding: 10px 20px;
        font-weight: 600;
    }
</style>
""", unsafe_allow_html=True)

st.markdown('<div class="main-title">Medidas Separatrizes e Boxplot</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-title">Painel Interativo PROFMAT • Probabilidade e Estatística</div>', unsafe_allow_html=True)

# Definição das Abas
tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([
    "1. Amostra Real & Boxplot",
    "2. Tabela Simples (Discreta)",
    "3. Dados Agrupados (Classes)",
    "4. Tríptico de Assimetria vs. Gaussiana",
    "5. Fator 1.5 (John Tukey)",
    "6. Normas ABNT & Declaração CAPES"
])

# ==========================================
# ABA 1: AMOSTRA REAL E BOXPLOT
# ==========================================
with tab1:
    st.subheader("1. Caso Real: Tempo de Deslocamento ao Polo (Minutos)")
    df_turma = pd.DataFrame({
        "Nome": ["Betinha", "Claudio", "Gleicy", "Leone", "Thiago", "Marco", "Luan", "Wellington", "José", "Leonardo", "Pablo", "Guilherme", "Felippe"],
        "Tempo (min)": [15, 20, 20, 25, 50, 56, 70, 80, 90, 90, 140, 170, 210]
    })
    
    col_tabela_nomes, col_inputs = st.columns([1, 3.5])
    
    with col_tabela_nomes:
        st.dataframe(
            df_turma, 
            hide_index=True, 
            use_container_width=True, 
            height=490,
            column_config={
                "Nome": st.column_config.TextColumn("Nome", alignment="center"),
                "Tempo (min)": st.column_config.NumberColumn("Tempo (min)", alignment="center")
            }
        )
        
    with col_inputs:
        st.write("Edite a lista numérica abaixo para testar a robustez do Boxplot ou simular a inserção de novos alunos (fictícios) na turma:")
        
        dados_padrao = "15, 20, 20, 25, 50, 56, 70, 80, 90, 90, 140, 170, 210"
        entrada_usuario = st.text_input("Valores da Amostra (separados por vírgula):", dados_padrao)
        
        try:
            dados = sorted([float(x.strip()) for x in entrada_usuario.split(",") if x.strip()])
            n = len(dados)
        except:
            dados = [15, 20, 20, 25, 50, 56, 70, 80, 90, 90, 140, 170, 210]
            n = len(dados)

        st.markdown(f"**Rol Ordenado ($n = {n}$):**")
        st.info(" → ".join([f"**{x:g}**" for x in dados]))

    # Cálculos exatos pelo Método das Medianas (Tukey)
    q2 = float(np.median(dados))
    metade_inf = [x for x in dados if x < q2] if n % 2 != 0 else dados[:n//2]
    metade_sup = [x for x in dados if x > q2] if n % 2 != 0 else dados[n//2:]
    
    q1 = float(np.median(metade_inf)) if metade_inf else q2
    q3 = float(np.median(metade_sup)) if metade_sup else q2
    iqr = q3 - q1
    
    cerca_inf = q1 - 1.5 * iqr
    cerca_sup = q3 + 1.5 * iqr
    
    outliers = [x for x in dados if x < cerca_inf or x > cerca_sup]
    regulares = [x for x in dados if cerca_inf <= x <= cerca_sup]
    lim_inf = min(regulares) if regulares else min(dados)
    lim_sup = max(regulares) if regulares else max(dados)

    col1, col2, col3, col4, col5 = st.columns(5)
    col1.metric("Mínimo Regular", f"{lim_inf:g}")
    col2.metric("Q1 (25%)", f"{q1:g}")
    col3.metric("Mediana Q2 (50%)", f"{q2:g}")
    col4.metric("Q3 (75%)", f"{q3:g}")
    col5.metric("Máximo Regular", f"{lim_sup:g}")

    
    # Calcular KDE para a curva assimétrica
    kde = stats.gaussian_kde(dados, bw_method=0.4)
    x_kde = np.linspace(min(dados)-10, max(dados)+10, 200)
    y_kde = kde(x_kde)
    
    # Boxplot com estatísticas fixadas (hover exato para Q1 e Q3)
    fig_box = go.Figure()
    
    # Adicionando a curva de densidade (Violin/Raincloud effect)
    fig_box.add_trace(go.Scatter(
        x=x_kde, y=y_kde,
        mode='lines',
        line=dict(color='#3B82F6', width=2),
        fill='tozeroy',
        fillcolor='rgba(59, 130, 246, 0.2)',
        name="Densidade (Assimetria)",
        yaxis="y2"
    ))

    fig_box.add_trace(go.Box(

        name="Turma PROFMAT",
        orientation="h",
        q1=[q1],
        median=[q2],
        q3=[q3],
        lowerfence=[lim_inf],
        upperfence=[lim_sup],
        y=["Turma PROFMAT"],
        marker_color="#4F46E5",
        line_color="#4F46E5",
        fillcolor="rgba(79, 70, 229, 0.2)"
    ))

    if outliers:
        fig_box.add_trace(go.Scatter(
            x=outliers,
            y=["Turma PROFMAT"] * len(outliers),
            mode="markers",
            name="Outlier",
            marker=dict(color="#E11D48", size=9, symbol="diamond"),
            hovertext=[f"Outlier: {val} min" for val in outliers],
            hoverinfo="text"
        ))

    fig_box.add_vline(x=cerca_sup, line_dash="dash", line_color="#E11D48", annotation_text=f"Cerca Superior ({cerca_sup:g})", annotation_position="top right")
    fig_box.add_vline(x=cerca_inf, line_dash="dash", line_color="#F59E0B", annotation_text=f"Cerca Inferior ({cerca_inf:g})", annotation_position="top left")

    fig_box.update_layout(
        title="<b>Diagrama de Caixa (Boxplot) com Curva de Densidade Assimétrica</b>",
        xaxis_title="Tempo de Deslocamento (Minutos)",
        height=400,
        margin=dict(l=40, r=40, t=40, b=40),
        template="plotly_white",
        dragmode=False,
        showlegend=False,
        xaxis=dict(fixedrange=True),
        yaxis=dict(fixedrange=True, domain=[0, 0.3], showticklabels=False),
        yaxis2=dict(fixedrange=True, domain=[0.35, 1], showticklabels=False)
    )
    st.plotly_chart(fig_box, use_container_width=True)

    # Box de Interpretação
    texto_outlier = f"Foi identificado um valor de {outliers} minutos, ultrapassando a cerca de Tukey ({cerca_sup:g} min). Este colega mora excepcionalmente longe em comparação ao padrão da turma." if outliers else "Não foram identificados valores atípicos nesta amostra."
    st.markdown(f"""
    <div class="info-box">
        <b>Interpretação Analítica do Conjunto de Dados:</b><br>
        • <b>Centro (Mediana):</b> 50% dos mestrandos levam até {q2:g} minutos para chegar ao polo, e a outra metade leva mais tempo.<br>
        • <b>Dispersão Central (Caixa):</b> 50% dos tempos orbitam a faixa central da distribuição, concentrando-se entre {q1:g} e {q3:g} minutos (Amplitude Interquartílica de {iqr:g} min).<br>
        • <b>Valores Discrepantes (Outliers):</b> {texto_outlier}
    </div>
    """, unsafe_allow_html=True)

    with st.expander("📚 Ver Fórmulas e Memória de Cálculo Passo a Passo (Método de Tukey)", expanded=True):
        st.markdown(f"**1. Mediana ($Q_2$):** Valor central do rol ($n={n}$).")
        st.latex(r"Q_2 = \text{Mediana}(Rol) = " + f"{q2:g}")
        
        st.markdown(f"**2. Primeiro Quartil ($Q_1$):** Mediana da metade inferior (excluindo a mediana global).")
        st.latex(r"Q_1 = \text{Mediana}(" + ", ".join(f"{x:g}" for x in metade_inf) + r") = " + f"{q1:g}")
        
        st.markdown(f"**3. Terceiro Quartil ($Q_3$):** Mediana da metade superior (excluindo a mediana global).")
        st.latex(r"Q_3 = \text{Mediana}(" + ", ".join(f"{x:g}" for x in metade_sup) + r") = " + f"{q3:g}")
        
        st.markdown("**4. Amplitude Interquartílica (IQR):** Medida de dispersão (tamanho da caixa).")
        st.latex(r"IQR = Q_3 - Q_1 = " + f"{q3:g} - {q1:g} = {iqr:g}")
        
        st.markdown("**5. Cercas de Tukey (Fator 1,5):** Limites teóricos para detecção de anomalias (Outliers).")
        st.latex(r"\text{Cerca Inferior} = Q_1 - 1,5 \times IQR \Rightarrow " + f"{q1:g} - 1,5({iqr:g}) = {cerca_inf:g}")
        st.latex(r"\text{Cerca Superior} = Q_3 + 1,5 \times IQR \Rightarrow " + f"{q3:g} + 1,5({iqr:g}) = {cerca_sup:g}")
        
        st.info("💡 **Nota Didática:** Como a Cerca Inferior resultou em um valor negativo (teoricamente impossível para a variável 'tempo de deslocamento'), concluímos matematicamente que é impossível haver outliers inferiores nesta amostra. Esse 'efeito de piso' no zero é a prova cabal da forte assimetria positiva destes dados!")


# ==========================================
# ABA 2: DADOS EM TABELA SIMPLES (DISCRETA)
# ==========================================
with tab2:
    st.subheader("2. Tabela Simples: Frequência Acumulada (Sem Interpolação)")
    st.write("Quando os dados se repetem muito (variável discreta), usamos a varredura na coluna de **Frequência Acumulada ($F_i$)**.")
    
    col_tab_simples, col_calc_simples = st.columns([1, 1.2])
    
    df_simples = pd.DataFrame({
        "Tempo (xi)": ["10 min", "15 min", "20 min", "25 min", "30 min", "45 min", "TOTAL"],
        "Frequência (fi)": ["2", "5", "6", "4", "2", "1", "Σfi = 20"],
        "Frequência Acumulada (Fi)": ["2", "7", "13", "17", "19", "20", "-"]
    })
    
    st.markdown("Selecione o Quartil para ver a posição teórica e como ela mapeia na tabela:")
    k_simples = st.radio("Selecione o Quartil:", options=[1, 2, 3, 4], format_func=lambda x: f"Q{x} ({25*x}%)", horizontal=True, key="ksimples")
    
    n_simples = 20
    pos_simples = (k_simples * n_simples) / 4
    
    if pos_simples <= 2: idx_s = 0; val_q = 10
    elif pos_simples <= 7: idx_s = 1; val_q = 15
    elif pos_simples <= 13: idx_s = 2; val_q = 20
    elif pos_simples <= 17: idx_s = 3; val_q = 25
    elif pos_simples <= 19: idx_s = 4; val_q = 30
    else: idx_s = 5; val_q = 45
    
    def highlight_row_simples(row):
        if row.name == idx_s:
            return ['background-color: rgba(16, 185, 129, 0.3); font-weight: bold'] * len(row)
        return [''] * len(row)

    with col_tab_simples:
        st.dataframe(df_simples.style.apply(highlight_row_simples, axis=1), hide_index=True, use_container_width=True)
        
    with col_calc_simples:
        st.markdown(f"**Cálculo da Posição ($Q_{{{k_simples}}}$):**")
        st.write(rf"1. Posição teórica (simplificada): $Pos = \frac{{{k_simples} \times 20}}{{4}} = {pos_simples:g}$")
        st.write(f"2. Varredura na coluna $F_i$: Buscamos o primeiro valor que seja **maior ou igual** a {pos_simples:g}.")
        st.write(f"3. O Tempo ($x_i$) correspondente à frequência acumulada que engloba a posição {pos_simples:g} está na linha destacada.")
        st.latex(rf"Q_{{{k_simples}}} = {val_q} \text{{ min}}")
        
    st.markdown('''
    <div class="pedagogic-box" style="border-left-color: #10B981; background-color: #ECFDF5; border-color: #D1FAE5;">
        <b>💡 Reflexão Pedagógica para o PROFMAT: Tabela Simples vs Interpolação</b><br>
        Diferente dos dados em classes (Aba 3), aqui <b>não usamos interpolação linear</b> porque os tempos de 15, 20 ou 25 minutos são cravados, não são uma faixa contínua entre dois limites. É como buscar a posição exata de um aluno numa fila ordenada.
    </div>
    ''', unsafe_allow_html=True)

    # Gráfico Dinâmico Tab 2
    dados_simples = [10]*2 + [15]*5 + [20]*6 + [25]*4 + [30]*2 + [45]*1
    kde_simples = stats.gaussian_kde(dados_simples, bw_method=0.4)
    x_s = np.linspace(5, 50, 200)
    y_s = kde_simples(x_s)
    
    fig_s = go.Figure()
    # Curva total
    fig_s.add_trace(go.Scatter(x=x_s, y=y_s, mode='lines', line_color='#10B981', name="Distribuição", hoverinfo="skip"))
    
    # Área varrida
    x_fill = x_s[x_s <= val_q]
    y_fill = y_s[x_s <= val_q]
    fig_s.add_trace(go.Scatter(x=np.concatenate([x_fill, [val_q]]), y=np.concatenate([y_fill, [0]]), fill='tozeroy', fillcolor='rgba(16, 185, 129, 0.4)', line=dict(color='rgba(255,255,255,0)'), name=f"Área Varrida (Q{k_simples})"))
    
    # Linha do Quartil
    fig_s.add_vline(x=val_q, line_dash="dash", line_color="#047857", annotation_text=f"Q{k_simples} = {val_q}", annotation_position="top left")
    
    # Pontos reais no eixo X
    fig_s.add_trace(go.Scatter(x=list(set(dados_simples)), y=[0]*len(set(dados_simples)), mode="markers", marker=dict(color="#047857", size=8), name="Valores Discretos"))
    
    fig_s.update_layout(height=250, margin=dict(l=20, r=20, t=30, b=20), template="plotly_white", showlegend=False, yaxis=dict(showticklabels=False), title=f"<b>Efeito Varredor: Acumulando {k_simples*25}% da Amostra (Discreta)</b>")
    st.plotly_chart(fig_s, use_container_width=True)


# ==========================================
# ABA 3: DADOS AGRUPADOS EM CLASSES
# ==========================================
with tab3:
    st.subheader("2. Interpolação Linear para Dados Agrupados em Classes")
    st.write("Agrupamento contínuo em intervalos de amplitude constante ($h = 15$ minutos):")
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Parâmetros consistentes: Q_k e L_k
    st.latex(r"Q_k = L_k + \left[ \frac{\frac{k \cdot n}{4} - F_{\text{ant}}}{f_{\text{classe}}} \right] \cdot h")
    
    st.markdown("<br>", unsafe_allow_html=True)

    # Tabela com Σfi = 13
    df_classes = pd.DataFrame({
        "Classe (minutos)": ["15 ⊢ 55", "55 ⊢ 95", "95 ⊢ 135", "135 ⊢ 175", "175 ⊢ 215", "TOTAL"],
        "Frequência Simples (fi)": ["5", "5", "0", "2", "1", "Σfi = 13"],
        "Frequência Acumulada (Fi)": ["5", "10", "10", "12", "13", "-"]
    })
    
    st.markdown("Selecione o Quartil que deseja calcular para visualizar a mudança dinâmica nas variáveis e no destaque da tabela:")
    k_sel = st.radio("Selecione o Quartil para Cálculo:", options=[1, 2, 3, 4], format_func=lambda x: f"Q{x} ({25*x}%)", horizontal=True, label_visibility="collapsed")
    
    # Cálculos dinâmicos da posição e identificação da classe
    n_total = 13
    h_amp = 40
    posicao = (k_sel * n_total) / 4
    
    if posicao <= 5:
        idx_classe = 0
        l_i = 15
        f_ant = 0
        f_i = 5
        nome_classe = "1ª Classe (15 ⊢ 55)"
    elif posicao <= 10:
        idx_classe = 1
        l_i = 55
        f_ant = 5
        f_i = 5
        nome_classe = "2ª Classe (55 ⊢ 95)"
    elif posicao <= 12:
        idx_classe = 3  # (posição 10.1 a 12 cai na 4ª classe, pois a 3ª classe tem fi=0)
        l_i = 135
        f_ant = 10
        f_i = 2
        nome_classe = "4ª Classe (135 ⊢ 175)"
    else:
        idx_classe = 4
        l_i = 175
        f_ant = 12
        f_i = 1
        nome_classe = "5ª Classe (175 ⊢ 215)"
        
    q_agrup = l_i + ((posicao - f_ant) / f_i) * h_amp
    
    # Valores correspondentes do Rol (Aba 1) para efeito de comparação na reflexão
    rol_vals = {1: 22.5, 2: 70.0, 3: 115.0, 4: 210.0}
    q_rol = rol_vals[k_sel]

    col_tabela, col_calc = st.columns([1, 1.2])
    
    def highlight_row(row):
        # Destaca a linha da classe selecionada, ignorando a linha "TOTAL" (idx 5)
        if row.name == idx_classe:
            return ['background-color: rgba(59, 130, 246, 0.3); font-weight: bold'] * len(row)
        return [''] * len(row)

    with col_tabela:
        st.dataframe(df_classes.style.apply(highlight_row, axis=1), hide_index=True, use_container_width=True)

    with col_calc:
        st.markdown(f"**Cálculo Demonstrativo do Quartil ($Q_{k_sel}$):**")
        st.write(f"1. Posição teórica acumulada: $P = \\frac{{{k_sel} \\times 13}}{{4}} = {posicao:g}$")
        st.write(f"2. A posição **{posicao:g}** reside na **{nome_classe}** (varrendo a coluna $F_i$):")
        st.write(f"   * Limite Inferior ($L_{k_sel}$) = {l_i}, $F_{{\\text{{ant}}}} = {f_ant}$, $f_{{\\text{{classe}}}} = {f_i}$, $h = {h_amp}$")
        
        # Formatação do latex adaptado para o k_sel
        str_pos = f"{posicao:g}".replace('.', '{,}')
        str_q = f"{q_agrup:.2f}".replace('.', '{,}')
        st.latex(r"Q_" + str(k_sel) + r" = " + str(l_i) + r" + \left[ \frac{" + str_pos + r" - " + str(f_ant) + r"}{" + str(f_i) + r"} \right] \cdot " + str(h_amp) + r" = " + str_q + r"\text{ min}")

    # Box de reflexão pedagógica dinâmico
    st.markdown(f'''
    <div class="pedagogic-box">
        <b>💡 Reflexão Pedagógica para o PROFMAT: Rol Ordenado vs. Classes Agrupadas</b><br>
        Observe que na <b>Aba 1 (Rol)</b> obtivemos <b>Q<sub>{k_sel}</sub> = {q_rol:g} min</b>, enquanto na <b>Aba 3 (Classes)</b> o valor estimado resultou em <b>Q<sub>{k_sel}</sub> = {q_agrup:.2f} min</b>.<br><br>
        <b>Por que essa diferença ocorre?</b><br>
        • <b>No Rol Ordenado:</b> Trabalhamos com a localização discreta exata das observações reais.<br>
        • <b>Nos Dados Agrupados em Classes:</b> Ocorre <i>perda da informação individual</i>. A fórmula de interpolação linear assume a hipótese geométrica de que os {f_i} mestrandos da classe estão <b>uniformemente distribuídos</b> ao longo de toda a amplitude de {h_amp} minutos. Essa aproximação contínua produz uma variação numérica inerente ao agrupamento estatístico!
    </div>
    ''', unsafe_allow_html=True)
    
    # Gráfico Dinâmico Tab 3
    # Gerando dados fictícios que respeitam as classes para gerar a curva
    dados_classes = np.random.uniform(15, 55, 5).tolist() + np.random.uniform(55, 95, 5).tolist() + np.random.uniform(135, 175, 2).tolist() + np.random.uniform(175, 215, 1).tolist()
    kde_c = stats.gaussian_kde(dados_classes, bw_method=0.5)
    x_c = np.linspace(10, 220, 300)
    y_c = kde_c(x_c)
    
    fig_c = go.Figure()
    fig_c.add_trace(go.Scatter(x=x_c, y=y_c, mode='lines', line_color='#3B82F6', name="Distribuição das Classes"))
    
    # Área varrida até o quartil interpolado
    x_fill_c = x_c[x_c <= q_agrup]
    y_fill_c = y_c[x_c <= q_agrup]
    fig_c.add_trace(go.Scatter(x=np.concatenate([x_fill_c, [q_agrup]]), y=np.concatenate([y_fill_c, [0]]), fill='tozeroy', fillcolor='rgba(59, 130, 246, 0.4)', line=dict(color='rgba(255,255,255,0)'), name=f"Área Varrida (Q{k_sel})"))
    
    fig_c.add_vline(x=q_agrup, line_dash="dash", line_color="#1E3A8A", annotation_text=f"Q{k_sel} Interpolado = {q_agrup:.1f}", annotation_position="top left")
    
    fig_c.update_layout(height=250, margin=dict(l=20, r=20, t=30, b=20), template="plotly_white", showlegend=False, yaxis=dict(showticklabels=False), title=f"<b>Efeito Varredor Contínuo: Acumulando {k_sel*25}% da Amostra Interpolada</b>")
    st.plotly_chart(fig_c, use_container_width=True)

# ==========================================
# ABA 4: TRÍPTICO DE ASSIMETRIAS
# ==========================================
with tab4:
    st.subheader("3. Tríptico Comparativo: Boxplot vs. Curva de Densidade")
    
    st.markdown("Comparativo visual do comportamento do Boxplot e sua densidade sob diferentes distribuições. O painel central reflete a **realidade assimétrica da nossa amostra**, enquanto os laterais representam contra-cenários didáticos fictícios baseados nela.")

    col_a, col_b, col_c = st.columns(3)
    
    # DADOS DA AMOSTRA PARA OS GRÁFICOS
    # Real (Assimétrica Positiva)
    dados_pos = np.array([15, 20, 20, 25, 50, 56, 70, 80, 90, 90, 140, 170, 210])
    kde_pos = stats.gaussian_kde(dados_pos, bw_method=0.4)
    x_pos = np.linspace(min(dados_pos)-20, max(dados_pos)+20, 200)
    y_pos = kde_pos(x_pos)

    # Simétrica Fictícia (Baseada no centro)
    dados_sim = np.array([10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130])
    kde_sim = stats.gaussian_kde(dados_sim, bw_method=0.4)
    x_sim = np.linspace(min(dados_sim)-20, max(dados_sim)+20, 200)
    y_sim = kde_sim(x_sim)

    # Assimétrica Negativa Fictícia (Espelhamento invertido dos dados reais)
    dados_neg = 225 - dados_pos
    kde_neg = stats.gaussian_kde(dados_neg, bw_method=0.4)
    x_neg = np.linspace(min(dados_neg)-20, max(dados_neg)+20, 200)
    y_neg = kde_neg(x_neg)

    # 1. Distribuição Simétrica
    with col_a:
        st.markdown("#### **Distribuição Simétrica**")
        st.caption("Contra-cenário Fictício (Dados ideais)")
        
        fig_sim = go.Figure()
        fig_sim.add_trace(go.Scatter(x=x_sim, y=y_sim, fill='tozeroy', fillcolor='rgba(59, 130, 246, 0.2)', line_color='#2563EB', name="Densidade"))
        fig_sim.add_trace(go.Box(x=dados_sim, name="Boxplot", orientation="h", yaxis="y2", marker_color="#1E3A8A", boxpoints="all", jitter=0.3, pointpos=-1.8))
        fig_sim.update_layout(height=350, template="plotly_white", showlegend=False, yaxis=dict(domain=[0.35, 1], showticklabels=False), yaxis2=dict(domain=[0, 0.25], showticklabels=False), margin=dict(l=10, r=10, t=10, b=10), dragmode=False, xaxis=dict(fixedrange=True), yaxis_fixedrange=True, yaxis2_fixedrange=True)
        st.plotly_chart(fig_sim, use_container_width=True)
        
        st.info("**Relação:** Média ≈ Mediana ≈ Moda. A massa de dados está perfeitamente equilibrada ao redor do centro.")
        
        st.markdown("""
        <div class="pedagogic-box" style="font-size: 0.85rem; padding: 15px; margin-top: 5px;">
            <b>Se a realidade fosse esta:</b><br>
            A turma estaria distribuída em formato de Sino. Para cada aluno que mora perto, teríamos um equivalente exato que mora longe. O centro (mediana) seria um eixo cravado em 70 min e a caixa seria idêntica dos dois lados.
        </div>
        """, unsafe_allow_html=True)

    # 2. Assimétrica Positiva (REAL)
    with col_b:
        st.markdown("#### **Assimétrica Positiva (Nossa Amostra)**")
        st.caption("Amostra PROFMAT (Realidade da Turma)")
        
        fig_pos = go.Figure()
        fig_pos.add_trace(go.Scatter(x=x_pos, y=y_pos, fill='tozeroy', fillcolor='rgba(16, 185, 129, 0.2)', line_color='#059669', name="Densidade"))
        fig_pos.add_trace(go.Box(x=dados_pos, name="Boxplot", orientation="h", yaxis="y2", marker_color="#047857", boxpoints="all", jitter=0.3, pointpos=-1.8))
        fig_pos.update_layout(height=350, template="plotly_white", showlegend=False, yaxis=dict(domain=[0.35, 1], showticklabels=False), yaxis2=dict(domain=[0, 0.25], showticklabels=False), margin=dict(l=10, r=10, t=10, b=10), dragmode=False, xaxis=dict(fixedrange=True), yaxis_fixedrange=True, yaxis2_fixedrange=True)
        st.plotly_chart(fig_pos, use_container_width=True)

        st.info("**Relação:** Média > Mediana > Moda. Valores altos extremos puxam a Média para cima, esticando a caixa e a haste direita.")
        
        st.markdown("""
        <div class="pedagogic-box" style="font-size: 0.85rem; padding: 15px; margin-top: 5px; border-left-color: #059669; background-color: #ECFDF5; border-color: #D1FAE5;">
            <b>Nossa Realidade (Real):</b><br>
            Note como a massa da turma mora <b>muito perto</b> do polo (bolão verde na esquerda). Contudo, a cauda longa (os poucos heróis que levam até 3h) empurra a distribuição e a média para a direita, esticando a haste.
        </div>
        """, unsafe_allow_html=True)

    # 3. Assimétrica Negativa
    with col_c:
        st.markdown("#### **Assimétrica Negativa (Esquerda)**")
        st.caption("Contra-cenário Fictício (Dados espelhados)")
        
        fig_neg = go.Figure()
        fig_neg.add_trace(go.Scatter(x=x_neg, y=y_neg, fill='tozeroy', fillcolor='rgba(239, 68, 68, 0.2)', line_color='#DC2626', name="Densidade"))
        fig_neg.add_trace(go.Box(x=dados_neg, name="Boxplot", orientation="h", yaxis="y2", marker_color="#B91C1C", boxpoints="all", jitter=0.3, pointpos=-1.8))
        fig_neg.update_layout(height=350, template="plotly_white", showlegend=False, yaxis=dict(domain=[0.35, 1], showticklabels=False), yaxis2=dict(domain=[0, 0.25], showticklabels=False), margin=dict(l=10, r=10, t=10, b=10), dragmode=False, xaxis=dict(fixedrange=True), yaxis_fixedrange=True, yaxis2_fixedrange=True)
        st.plotly_chart(fig_neg, use_container_width=True)

        st.info("**Relação:** Média < Mediana < Moda. Valores baixos extremos puxam a Média para baixo, alongando a haste inferior.")
        
        st.markdown("""
        <div class="pedagogic-box" style="font-size: 0.85rem; padding: 15px; margin-top: 5px; border-left-color: #DC2626; background-color: #FEF2F2; border-color: #FEE2E2;">
            <b>Se a realidade fosse esta:</b><br>
            A maioria absoluta da turma moraria <b>muito longe</b> do polo, formando um paredão denso lá nos altos tempos. Teríamos apenas poucos outliers morando "perto demais", puxando a haste inteira para a esquerda.
        </div>
        """, unsafe_allow_html=True)

# ==========================================
# ABA 5: O FATOR 1.5 DE JOHN TUKEY
# ==========================================
with tab5:
    st.subheader("4. Origem Teórica do Fator 1.5 na Distribuição Normal")
    st.write("Demonstração visual do porquê o corte com $1{,}5 \\times \\text{IQR}$ equivale a aproximadamente $\\pm 2{,}7\\sigma$:")

    c_fator = st.slider("Selecione o Multiplicador de Tukey (c):", min_value=1.0, max_value=3.0, value=1.5, step=0.1)

    z_q3 = 0.67449
    z_iqr = 2 * z_q3
    z_corte = z_q3 + c_fator * z_iqr
    prob_outlier = 2 * (1 - stats.norm.cdf(z_corte))

    col_fig, col_text = st.columns([3, 2])

    with col_fig:
        # Ampliado para -5.5 a 5.5 para garantir que cercas maiores que 4 sejam renderizadas no gráfico
        z_vals = np.linspace(-5.5, 5.5, 500)
        pdf_vals = stats.norm.pdf(z_vals)

        fig_normal = go.Figure()
        fig_normal.add_trace(go.Scatter(x=z_vals, y=pdf_vals, mode="lines", line_color="#1E3A8A", name="Densidade N(0,1)"))

        z_tail_sup = z_vals[z_vals >= z_corte]
        z_tail_inf = z_vals[z_vals <= -z_corte]
        fig_normal.add_trace(go.Scatter(x=z_tail_sup, y=stats.norm.pdf(z_tail_sup), fill="tozeroy", fillcolor="rgba(239, 68, 68, 0.5)", line=dict(color="rgba(0,0,0,0)"), name=f"C. Superior ({(prob_outlier/2)*100:.2f}%)"))
        fig_normal.add_trace(go.Scatter(x=z_tail_inf, y=stats.norm.pdf(z_tail_inf), fill="tozeroy", fillcolor="rgba(245, 158, 11, 0.5)", line=dict(color="rgba(0,0,0,0)"), name=f"C. Inferior ({(prob_outlier/2)*100:.2f}%)"))

        # Plotagem dos indivíduos (QI fictício)
        z_pessoas = [2.0, 3.2, 4.0]
        nomes = ["João", "Maria", "Einstein"]
        cores = ["#EF4444" if z > z_corte else "#10B981" for z in z_pessoas]
        textos_hover = [f"<b>{n}</b><br>Escore z: {z}<br>Status: {'🚨 OUTLIER' if z > z_corte else '✅ REGULAR'}" for n, z in zip(nomes, z_pessoas)]

        fig_normal.add_trace(go.Scatter(
            x=z_pessoas, 
            y=[0.02, 0.02, 0.02], # Pouco acima do eixo X
            mode="markers+text", 
            marker=dict(size=14, color=cores, line=dict(width=2, color="white")),
            text=nomes,
            textposition="top center",
            textfont=dict(family="Inter", size=12),
            hovertext=textos_hover,
            hoverinfo="text",
            name="Casos (QI)"
        ))

        fig_normal.add_vline(x=z_q3, line_dash="dot", line_color="blue", annotation_text="Q3 (+0.67σ)")
        fig_normal.add_vline(x=-z_q3, line_dash="dot", line_color="blue", annotation_text="Q1 (-0.67σ)")
        fig_normal.add_vline(x=z_corte, line_dash="dash", line_color="red", annotation_text=f"Cerca (+{z_corte:.2f}σ)")
        fig_normal.add_vline(x=-z_corte, line_dash="dash", line_color="red", annotation_text=f"Cerca (-{z_corte:.2f}σ)")

        fig_normal.update_layout(
            title=f"<b>Distribuição Normal com Corte em ±{z_corte:.2f}σ</b>",
            xaxis_title="Escore Padronizado (z)",
            yaxis_title="Densidade φ(z)",
            template="plotly_white",
            height=380,
            margin=dict(l=20, r=20, t=40, b=20),
            dragmode=False, xaxis=dict(fixedrange=True), yaxis=dict(fixedrange=True),
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
        )
        st.plotly_chart(fig_normal, use_container_width=True)

    with col_text:
        st.info("💡 **Exemplo Prático (Teste de QI):** João ($z=2.0$, QI 130), Maria ($z=3.2$, QI 148) e Einstein ($z=4.0$, QI 160). Observe como o critério escolhido define quem é classificado como Outlier (🔴) ou Regular (🟢).")
        st.markdown(f"### Resultados para $c = {c_fator:.1f}$:")
        st.markdown(f"* **Ponto de corte padronizado:** $\\pm {z_corte:.3f}\\sigma \\approx \\pm {z_corte:.1f}\\sigma$")
        st.markdown(f"* **Probabilidade de Outlier Teórico:** **`{prob_outlier*100:.2f}%`**")
        
        # Mensagens dinâmicas com formatação pura sem conflito de f-string
        if c_fator < 1.4:
            st.warning("**Análise:** Com c = " + f"{c_fator:.1f}" + ", as cercas estão muito curtas (apenas ±" + f"{z_corte:.2f}" + "σ). O critério está excessivamente sensível, gerando falsos positivos na distribuição normal (" + f"{prob_outlier*100:.1f}" + "% dos dados normais seriam classificados incorretamente como anomalias).")
        elif c_fator > 1.6:
            st.error("**Análise:** Com c = " + f"{c_fator:.1f}" + ", as cercas estão excessivamente afastadas (alcançando ±" + f"{z_corte:.2f}" + "σ). O critério torna-se conservador demais, ignorando anomalias reais distribuídas nas caudas.")
        else:
            st.success("**Análise:** O valor clássico de Tukey (c = 1,5) estabelece as cercas em aproximadamente ±2,7σ. Ele encontra o equilíbrio ideal: acomoda a dispersão natural gaussiana e classifica apenas desvios genuínos (probabilidade residual de " + f"{prob_outlier*100:.2f}" + "%).")
            
        # Tabela comparativa Gauss vs Tukey Dinâmico
        st.markdown("---")
        st.markdown("**Comparação: Modelo Selecionado vs Regra de Gauss ($3\\sigma$)**")
        df_comp = pd.DataFrame({
            "Critério": [f"Tukey (c = {c_fator:.1f})", "Regra de Gauss"],
            "Corte (z)": [f"± {z_corte:.2f}σ", "± 3.00σ"],
            "Falsos Positivos": [f"{prob_outlier*100:.2f}%", "0.27%"]
        })
        st.table(df_comp)

# ==========================================
# ABA 6: NORMAS ABNT E DECLARAÇÃO CAPES
# ==========================================
with tab6:
    st.subheader("5. Referências Bibliográficas (ABNT) e Transparência no Uso de IA")
    
    st.markdown("""
    #### Referências Bibliográficas (ABNT NBR 6023:2018)
    * BARBETTA, Pedro Alberto. **Estatística aplicada às ciências sociais**. 8. ed. Florianópolis: Editora da UFSC, 2012.
    * BUSSAB, Wilton de Oliveira; MORETTIN, Pedro Alberto. **Estatística básica**. 9. ed. São Paulo: Saraiva, 2017.
    * MORGADO, Augusto César de Oliveira et al. **Análise combinatória e probabilidade**. 10. ed. Rio de Janeiro: SBM, 2016. (Coleção do Professor de Matemática).
    * PROVENZA, Marcello Montillo. **Probabilidade e Estatística: notas de aula**. Rio de Janeiro: Universidade do Estado do Rio de Janeiro (UERJ) / PROFMAT, 2026. 6 fascículos em PDF. Material didático de circulação interna.
    * TUKEY, John Wilder. **Exploratory data analysis**. Reading, MA: Addison-Wesley, 1977.
    * HOAGLIN, David C.; IGLEWICZ, Boris; TUKEY, John W. Performance of alternative principles of the rule for identification of outliers. **Journal of the American Statistical Association**, v. 81, n. 396, p. 991-999, 1986.

    ---
    #### Declaração de Transparência no Uso de IA Generativa (Padrão CAPES / CNPq)
    > **DECLARAÇÃO DE USO DE FERRAMENTAS DE INTELIGÊNCIA ARTIFICIAL GENERATIVA**  
    > *(Em conformidade com as diretrizes de integridade da CAPES e alinhada ao Art. 9º da Portaria CNPq nº 2.664/2026)*  
    >
    > Declaro que utilizei a ferramenta de Inteligência Artificial Generativa **Google Gemini** (Gemini 2.5 Pro e Gemini Notebook) exclusivamente como apoio instrumental para concepção didática, estruturação lógica do tempo de apresentação, geração de templates computacionais em Python/Plotly e formatação LaTeX das expressões analíticas.  
    > **Todos os cálculos, conceitos matemáticos, análises descritivas e interpretações foram revisados, verificados e validados pelo autor humano**, que assume responsabilidade científica e autoral integral pelo trabalho.
    """)