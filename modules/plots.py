import plotly.graph_objects as go
import plotly.express as px

def create_tukey_boxplot(stats):
    """
    Cria um boxplot baseado explicitamente nas estatísticas de Tukey calculadas,
    garantindo que os limites e outliers sejam exatamente os ensinados teoricamente.
    """
    fig = go.Figure()

    fig.add_trace(go.Box(
        y=stats["rol"],
        name="Tempo de Deslocamento",
        boxpoints='outliers', 
        jitter=0,
        marker=dict(color='rgb(255, 65, 54)', size=10, symbol='x'),
        line=dict(color='rgb(31, 119, 180)'),
        fillcolor='rgba(31, 119, 180, 0.5)',
        # Forçando valores para que o Plotly não recalcule usando outro método
        q1=[stats["q1"]],
        median=[stats["q2"]],
        q3=[stats["q3"]],
        lowerfence=[stats["whisker_inferior"]],
        upperfence=[stats["whisker_superior"]],
    ))
    
    # Linhas para as cercas (invisíveis ou pontilhadas) para fins didáticos
    fig.add_hline(y=stats["upper_fence"], line_dash="dash", line_color="red", 
                  annotation_text=f"Cerca Superior ({stats['upper_fence']})")
    fig.add_hline(y=stats["lower_fence"], line_dash="dash", line_color="red", 
                  annotation_text=f"Cerca Inferior ({stats['lower_fence']})")

    fig.update_layout(
        title="Boxplot - Tempos de Deslocamento (Método de Tukey)",
        yaxis_title="Tempo (minutos)",
        template="plotly_white"
    )
    
    return fig

def create_histogram(data):
    """Cria um histograma dos dados"""
    fig = px.histogram(x=data, nbins=10, 
                       title="Histograma - Distribuição dos Tempos",
                       labels={'x':'Tempo (minutos)', 'count': 'Frequência'})
    fig.update_layout(template="plotly_white")
    return fig
