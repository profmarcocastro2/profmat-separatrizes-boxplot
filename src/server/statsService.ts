import { TukeyStatsSummary, KdeData, PresetDataset } from './types';

export function calculateMedian(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) {
    return sorted[mid];
  }
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

export function calculateMean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, v) => sum + v, 0) / arr.length;
}

export function calculateStd(arr: number[]): number {
  if (arr.length <= 1) return 1;
  const mean = calculateMean(arr);
  const variance = arr.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance) || 1;
}

export function computeTukeyAnalysis(data: number[], cFactor: number = 1.5): TukeyStatsSummary {
  const sorted = [...data].filter((v) => typeof v === 'number' && !isNaN(v) && isFinite(v)).sort((a, b) => a - b);
  const n = sorted.length;

  if (n === 0) {
    return {
      n: 0,
      sorted: [],
      q1: 0,
      q2: 0,
      q3: 0,
      iqr: 0,
      cercaInf: 0,
      cercaSup: 0,
      limInf: 0,
      limSup: 0,
      outliers: [],
      regulares: [],
      metadeInf: [],
      metadeSup: [],
      media: 0,
      desvioPadrao: 0,
      coefAssimetriaBowley: 0,
    };
  }

  const q2 = calculateMedian(sorted);
  const metadeInf = n % 2 !== 0 ? sorted.filter((x) => x < q2) : sorted.slice(0, Math.floor(n / 2));
  const metadeSup = n % 2 !== 0 ? sorted.filter((x) => x > q2) : sorted.slice(Math.floor(n / 2));

  const q1 = metadeInf.length > 0 ? calculateMedian(metadeInf) : q2;
  const q3 = metadeSup.length > 0 ? calculateMedian(metadeSup) : q2;
  const iqr = q3 - q1;

  const cercaInf = q1 - cFactor * iqr;
  const cercaSup = q3 + cFactor * iqr;

  const outliers = sorted.filter((x) => x < cercaInf || x > cercaSup);
  const regulares = sorted.filter((x) => x >= cercaInf && x <= cercaSup);
  const limInf = regulares.length > 0 ? Math.min(...regulares) : Math.min(...sorted);
  const limSup = regulares.length > 0 ? Math.max(...regulares) : Math.max(...sorted);

  const media = calculateMean(sorted);
  const desvioPadrao = calculateStd(sorted);

  // Bowley skewness: (Q3 + Q1 - 2*Q2) / (Q3 - Q1)
  const coefAssimetriaBowley = iqr !== 0 ? (q3 + q1 - 2 * q2) / iqr : 0;

  return {
    n,
    sorted,
    q1,
    q2,
    q3,
    iqr,
    cercaInf: parseFloat(cercaInf.toFixed(2)),
    cercaSup: parseFloat(cercaSup.toFixed(2)),
    limInf,
    limSup,
    outliers,
    regulares,
    metadeInf,
    metadeSup,
    media: parseFloat(media.toFixed(2)),
    desvioPadrao: parseFloat(desvioPadrao.toFixed(2)),
    coefAssimetriaBowley: parseFloat(coefAssimetriaBowley.toFixed(3)),
  };
}

export function computeKernelDensity(
  data: number[],
  pointsCount: number = 200,
  bwFactor: number = 0.4
): KdeData {
  if (data.length === 0) return { x: [], y: [] };
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal || 10;
  const start = minVal - range * 0.15;
  const end = maxVal + range * 0.15;

  const step = (end - start) / (pointsCount - 1);
  const xs: number[] = [];
  for (let i = 0; i < pointsCount; i++) {
    xs.push(start + i * step);
  }

  const std = calculateStd(data);
  const bw = Math.max(0.0001, bwFactor * std);
  const n = data.length;
  const factor = 1 / (n * bw * Math.sqrt(2 * Math.PI));

  const ys = xs.map((x) => {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const z = (x - data[i]) / bw;
      sum += Math.exp(-0.5 * z * z);
    }
    return sum * factor;
  });

  return { x: xs, y: ys };
}

export const PRESET_DATASETS: PresetDataset[] = [
  {
    id: 'uerj_original',
    title: 'Turma Mestrado PROFMAT (UERJ - Original)',
    description: 'Amostra real coletada dos 13 mestrandos com forte assimetria positiva à direita.',
    category: 'Real',
    data: [
      { nome: 'Betinha', tempo: 15 },
      { nome: 'Claudio', tempo: 20 },
      { nome: 'Gleicy', tempo: 20 },
      { nome: 'Leone', tempo: 25 },
      { nome: 'Thiago', tempo: 50 },
      { nome: 'Marco', tempo: 56 },
      { nome: 'Luan', tempo: 70 },
      { nome: 'Wellington', tempo: 80 },
      { nome: 'José', tempo: 90 },
      { nome: 'Leonardo', tempo: 90 },
      { nome: 'Pablo', tempo: 140 },
      { nome: 'Guilherme', tempo: 170 },
      { nome: 'Felippe', tempo: 210 },
    ],
  },
  {
    id: 'notas_avaliacao',
    title: 'Desempenho em Avaliação (Escala 0-100)',
    description: 'Notas de uma turma simulada com dispersão equilibrada e leve cauda inferior.',
    category: 'Didático',
    data: [
      { nome: 'Aluno 01', tempo: 32 },
      { nome: 'Aluno 02', tempo: 55 },
      { nome: 'Aluno 03', tempo: 60 },
      { nome: 'Aluno 04', tempo: 68 },
      { nome: 'Aluno 05', tempo: 72 },
      { nome: 'Aluno 06', tempo: 75 },
      { nome: 'Aluno 07', tempo: 78 },
      { nome: 'Aluno 08', tempo: 82 },
      { nome: 'Aluno 09', tempo: 85 },
      { nome: 'Aluno 10', tempo: 90 },
      { nome: 'Aluno 11', tempo: 95 },
    ],
  },
  {
    id: 'salarios_outlier',
    title: 'Renda Mensal com Outlier Severo (Salários em R$ x 100)',
    description: 'Exemplo clássico da estatística onde a média é distorcida mas a mediana resiste.',
    category: 'Contraste',
    data: [
      { nome: 'Estagiário A', tempo: 14 },
      { nome: 'Assistente B', tempo: 22 },
      { nome: 'Analista C', tempo: 35 },
      { nome: 'Analista D', tempo: 38 },
      { nome: 'Analista E', tempo: 42 },
      { nome: 'Especialista F', tempo: 55 },
      { nome: 'Coordenador G', tempo: 75 },
      { nome: 'Diretor Geral', tempo: 340 },
    ],
  },
  {
    id: 'simetrica_ideal',
    title: 'Distribuição Simétrica Gaussiana Teórica',
    description: 'Amostra ideal balanceada com Média = Mediana = Moda.',
    category: 'Teórico',
    data: [
      { nome: 'Ponto 01', tempo: 10 },
      { nome: 'Ponto 02', tempo: 20 },
      { nome: 'Ponto 03', tempo: 30 },
      { nome: 'Ponto 04', tempo: 40 },
      { nome: 'Ponto 05', tempo: 50 },
      { nome: 'Ponto 06', tempo: 60 },
      { nome: 'Ponto 07', tempo: 70 },
      { nome: 'Ponto 08', tempo: 80 },
      { nome: 'Ponto 09', tempo: 90 },
      { nome: 'Ponto 10', tempo: 100 },
      { nome: 'Ponto 11', tempo: 110 },
      { nome: 'Ponto 12', tempo: 120 },
      { nome: 'Ponto 13', tempo: 130 },
    ],
  },
];

export function generateLatexReport(stats: TukeyStatsSummary, title: string = 'Relatório de Análise Separatriz'): string {
  return `% Relatório Gerado Automaticamente - PROFMAT
\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath, amssymb}
\\usepackage{booktabs}
\\usepackage{tikz}

\\title{${title}}
\\author{Mestrado Profissional em Matemática em Rede Nacional (PROFMAT)}
\\date{\\today}

\\begin{document}
\\maketitle

\\section*{Resumo de Cinco Números e Cercas de Tukey}

\\begin{table}[h!]
\\centering
\\begin{tabular}{llr}
\\toprule
\\textbf{Medida Estatística} & \\textbf{Notação} & \\textbf{Valor Calculado} \\\\
\\midrule
Tamanho da Amostra & $n$ & ${stats.n} \\\\
Mínimo Regular & $\\min_{\\text{reg}}$ & ${stats.limInf} \\\\
Primeiro Quartil (25\\%) & $Q_1$ & ${stats.q1} \\\\
Mediana (50\\%) & $Q_2$ & ${stats.q2} \\\\
Terceiro Quartil (75\\%) & $Q_3$ & ${stats.q3} \\\\
Máximo Regular & $\\max_{\\text{reg}}$ & ${stats.limSup} \\\\
Amplitude Interquartílica & $IQR = Q_3 - Q_1$ & ${stats.iqr} \\\\
Cerca Inferior (Fator 1.5) & $Q_1 - 1{,}5 \\cdot IQR$ & ${stats.cercaInf} \\\\
Cerca Superior (Fator 1.5) & $Q_3 + 1{,}5 \\cdot IQR$ & ${stats.cercaSup} \\\\
Média Amostral & $\\bar{x}$ & ${stats.media} \\\\
Desvio Padrão Amostral & $s$ & ${stats.desvioPadrao} \\\\
Índice de Bowley & $B$ & ${stats.coefAssimetriaBowley} \\\\
\\bottomrule
\\end{tabular}
\\caption{Estatísticas descritivas e separatrizes.}
\\end{table}

\\section*{Identificação de Valores Discrepantes (Outliers)}
${
  stats.outliers.length > 0
    ? `Foram identificados os seguintes valores atípicos além das cercas de Tukey: \\textbf{${stats.outliers.join(', ')}}`
    : `Nenhum valor discrepante foi detectado na amostra sob o critério clássico de John Tukey (1977).`
}

\\end{document}
`;
}
