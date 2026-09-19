import scipy.stats as stats

def explain_tukey_factor():
    """
    Retorna o texto explicativo sobre a dedução do fator 1.5 de Tukey
    baseado na distribuição Normal Padrão.
    """
    z_q3 = stats.norm.ppf(0.75)
    z_q1 = stats.norm.ppf(0.25)
    iqr_z = z_q3 - z_q1
    
    # Para uma Normal Padrão, queremos cobrir ~99.3% (isto é, +/- 2.7 sigma)
    # Limite superior = z_q3 + k * IQR
    # 2.7 = 0.6745 + k * 1.349
    # k = (2.7 - 0.6745) / 1.349 = ~1.5
    
    texto = f"""
    A origem do fator 1,5 na construção do Boxplot por John Tukey (1977) 
    tem raízes na distribuição Normal Padrão (Z ~ N(0, 1)).
    
    1. Os quartis na Normal Padrão:
       Q1 (25%) corresponde a Z ≈ {z_q1:.4f}
       Q3 (75%) corresponde a Z ≈ {z_q3:.4f}
       
    2. A Amplitude Interquartílica (IQR):
       IQR = Q3 - Q1 ≈ {iqr_z:.4f}
       
    3. Cobertura da curva:
       Tukey queria que as cercas representassem valores raros para uma curva normal. 
       Na estatística, ±3 desvios (3 sigma) cobrem 99,73%. Tukey optou por um corte aproximado de ±2,7 desvios padrão (cobertura de 99,3%).
       
    4. A dedução do fator k:
       Cerca Superior = Q3 + k * IQR = 2,7
       {z_q3:.4f} + k * {iqr_z:.4f} = 2,7
       k = (2,7 - {z_q3:.4f}) / {iqr_z:.4f}
       k ≈ 1,5
       
    Assim, se os dados seguem uma distribuição perfeitamente normal, o fator 1,5 rotula 
    apenas 0,7% dos dados como outliers, proporcionando um critério robusto de detecção 
    sem falsos positivos excessivos.
    """
    return texto
