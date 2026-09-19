with open("app.py", "r", encoding="utf-8") as f:
    content = f.read()

# Tab 2
content = content.replace("options=[1, 2, 3]", "options=[1, 2, 3, 4]")

# Tab 3
content = content.replace(
"""    else:
        idx_classe = 3  # (posição 10.1 a 12 cai na 4ª classe, pois a 3ª classe tem fi=0)
        l_i = 135
        f_ant = 10
        f_i = 2
        nome_classe = "4ª Classe (135 ⊢ 175)\"""",
"""    elif posicao <= 12:
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
        nome_classe = "5ª Classe (175 ⊢ 215)\"""")

content = content.replace("rol_vals = {1: 22.5, 2: 70.0, 3: 115.0}", "rol_vals = {1: 22.5, 2: 70.0, 3: 115.0, 4: 210.0}")

with open("app.py", "w", encoding="utf-8") as f:
    f.write(content)
