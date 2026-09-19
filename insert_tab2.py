with open("app.py", "r") as f:
    content = f.read()

tab2_code = """
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
    k_simples = st.radio("Selecione o Quartil:", options=[1, 2, 3], format_func=lambda x: f"Q{x} ({25*x}%)", horizontal=True, key="ksimples")
    
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
        st.markdown(f"**Cálculo da Posição ($Q_{k_simples}$):**")
        st.write(f"1. Posição teórica (simplificada): $Pos = \\frac{{{k_simples} \\times 20}}{{4}} = {pos_simples:g}$")
        st.write(f"2. Varredura na coluna $F_i$: Buscamos o primeiro valor que seja **maior ou igual** a {pos_simples:g}.")
        st.write(f"3. O valor $F_i$ que engloba a posição {pos_simples:g} está na linha destacada.")
        st.latex(r"Q_" + str(k_simples) + r" = " + str(val_q) + r"\text{ min}")
        
    st.markdown('''
    <div class="pedagogic-box" style="border-left-color: #10B981; background-color: #ECFDF5; border-color: #D1FAE5;">
        <b>💡 Reflexão Pedagógica para o PROFMAT: Tabela Simples vs Interpolação</b><br>
        Diferente dos dados em classes (Aba 3), aqui <b>não usamos interpolação linear</b> porque os tempos de 15, 20 ou 25 minutos são cravados, não são uma faixa contínua entre dois limites. É como buscar a posição exata de um aluno numa fila ordenada.
    </div>
    ''', unsafe_allow_html=True)

"""

# The target to replace
target = "# ==========================================\n# ABA 3: DADOS AGRUPADOS EM CLASSES\n# ==========================================\nwith tab3:"

content = content.replace(target, tab2_code + "\n" + target)

with open("app.py", "w") as f:
    f.write(content)
