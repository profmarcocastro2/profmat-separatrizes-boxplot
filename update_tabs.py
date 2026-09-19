import re

with open("app.py", "r", encoding="utf-8") as f:
    content = f.read()

# For Tab 1: We just need to add the KDE trace to fig_box
tab1_kde_code = """
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
"""
content = re.sub(r"# Boxplot com estatísticas fixadas.*?fig_box\.add_trace\(go\.Box\(", tab1_kde_code, content, flags=re.DOTALL)

tab1_layout_update = """
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
"""
content = re.sub(r"fig_box\.update_layout\(.*?yaxis=dict\(fixedrange=True\)\n    \)", tab1_layout_update.strip(), content, flags=re.DOTALL)


# For Tab 2: Add dynamic plot
tab2_plot_code = """
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
"""
content = re.sub(r"st\.markdown\('''\n    <div class=\"pedagogic-box\".*?</div>\n    ''', unsafe_allow_html=True\)", tab2_plot_code.strip(), content, flags=re.DOTALL)


# For Tab 3: Add dynamic plot
tab3_plot_code = """
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
"""
content = re.sub(r"# Box de reflexão pedagógica dinâmico.*?</div>\n    \"\"\", unsafe_allow_html=True\)", tab3_plot_code.strip(), content, flags=re.DOTALL)

with open("app.py", "w", encoding="utf-8") as f:
    f.write(content)
