import numpy as np

def calculate_tukey_five_number_summary(data):
    """
    Calcula o resumo de 5 números e as cercas de Tukey
    utilizando a exclusão da mediana para os subconjuntos (método de Tukey).
    """
    data_sorted = sorted(data)
    n = len(data_sorted)
    
    # Mediana (Q2)
    if n % 2 == 1:
        med_idx = n // 2
        q2 = data_sorted[med_idx]
        lower_half = data_sorted[:med_idx]
        upper_half = data_sorted[med_idx+1:]
    else:
        med_idx = n // 2
        q2 = (data_sorted[med_idx - 1] + data_sorted[med_idx]) / 2.0
        lower_half = data_sorted[:med_idx]
        upper_half = data_sorted[med_idx:]
        
    def get_median(arr):
        m = len(arr)
        if m == 0: return None
        if m % 2 == 1:
            return arr[m // 2]
        else:
            return (arr[m // 2 - 1] + arr[m // 2]) / 2.0

    q1 = get_median(lower_half)
    q3 = get_median(upper_half)
    
    iqr = q3 - q1
    lower_fence = q1 - 1.5 * iqr
    upper_fence = q3 + 1.5 * iqr
    
    outliers_inferiores = [x for x in data_sorted if x < lower_fence]
    outliers_superiores = [x for x in data_sorted if x > upper_fence]
    
    valores_validos = [x for x in data_sorted if lower_fence <= x <= upper_fence]
    whisker_inferior = min(valores_validos) if valores_validos else q1
    whisker_superior = max(valores_validos) if valores_validos else q3
    
    return {
        "n": n,
        "rol": data_sorted,
        "minimo": data_sorted[0],
        "q1": q1,
        "q2": q2,
        "q3": q3,
        "maximo": data_sorted[-1],
        "iqr": iqr,
        "lower_fence": lower_fence,
        "upper_fence": upper_fence,
        "whisker_inferior": whisker_inferior,
        "whisker_superior": whisker_superior,
        "outliers_inferiores": outliers_inferiores,
        "outliers_superiores": outliers_superiores
    }

def calculate_percentile(data, p):
    """
    Calcula percentis (0 a 100) usando o método da interpolação linear padrão.
    """
    return np.percentile(data, p, method='linear')
