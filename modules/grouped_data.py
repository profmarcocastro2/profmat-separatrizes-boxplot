import numpy as np
import pandas as pd

def compute_grouped_statistics(classes_limites, frequencias):
    """
    Computa separatrizes via interpolação linear para dados agrupados em classes.
    classes_limites: lista de tuplas [(inf, sup), ...]
    frequencias: lista de frequências absolutas simples.
    """
    n = sum(frequencias)
    freq_acum = np.cumsum(frequencias)
    
    def get_percentile_grouped(percentil):
        posicao = (percentil / 100.0) * n
        # Encontra a classe
        classe_idx = 0
        for i, fa in enumerate(freq_acum):
            if posicao <= fa:
                classe_idx = i
                break
        
        lim_inf = classes_limites[classe_idx][0]
        h = classes_limites[classe_idx][1] - classes_limites[classe_idx][0]
        f_i = frequencias[classe_idx]
        F_ant = freq_acum[classe_idx - 1] if classe_idx > 0 else 0
        
        valor = lim_inf + ((posicao - F_ant) / f_i) * h
        return valor

    return {
        "Q1": get_percentile_grouped(25),
        "Q2_Mediana": get_percentile_grouped(50),
        "Q3": get_percentile_grouped(75)
    }
