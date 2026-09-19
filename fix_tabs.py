with open("app.py", "r") as f:
    content = f.read()

# Fix ABA 2
content = content.replace("# ABA 2: DADOS AGRUPADOS EM CLASSES\n# ==========================================\nwith tab6:", "# ABA 3: DADOS AGRUPADOS EM CLASSES\n# ==========================================\nwith tab3:")

# Fix ABA 3
content = content.replace("# ABA 3: TRÍPTICO DE ASSIMETRIAS\n# ==========================================\nwith tab6:", "# ABA 4: TRÍPTICO DE ASSIMETRIAS\n# ==========================================\nwith tab4:")

# Fix ABA 4
content = content.replace("# ABA 4: O FATOR 1.5 DE JOHN TUKEY\n# ==========================================\nwith tab6:", "# ABA 5: O FATOR 1.5 DE JOHN TUKEY\n# ==========================================\nwith tab5:")

# Fix ABA 5
content = content.replace("# ABA 5: NORMAS ABNT E DECLARAÇÃO CAPES\n# ==========================================\nwith tab6:", "# ABA 6: NORMAS ABNT E DECLARAÇÃO CAPES\n# ==========================================\nwith tab6:")

with open("app.py", "w") as f:
    f.write(content)
