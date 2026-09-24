import React, { useState, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { MathView } from './MathView';
import { calculateMean, calculateMedian, calculateStd, computeKernelDensity } from '../server/statsService';
import {
  Sliders,
  Download,
  FileCode,
  Check,
  RefreshCw,
  GitCompare,
  TrendingUp,
  Scale,
  BookOpen,
  HelpCircle,
  Activity,
  Calculator,
} from 'lucide-react';

interface DatasetMeta {
  id: string;
  name: string;
  subtitle: string;
  relation: string;
  relationFormula: string;
  theme: {
    primary: string;
    stroke: string;
    gradientStart: string;
    gradientStop: string;
    badgeBg: string;
    badgeText: string;
    border: string;
    accent: string;
  };
  pedagogicText: string;
  raw: number[];
}

export const Tab4Triptych: React.FC = () => {
  const { theme, classroomMode } = useTheme();
  const isDark = theme === 'dark';

  // Global Sincronized Percentile Slider (0% to 100%)
  const [globalPercentile, setGlobalPercentile] = useState<number>(50); // Default at Median (50%)
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ datasetId: string; val: number } | null>(null);

  // 1. Data Definitions
  const rawPos = useMemo(() => [15, 20, 20, 25, 50, 56, 70, 80, 90, 90, 140, 170, 210], []);
  const rawSim = useMemo(() => [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130], []);
  const rawNeg = useMemo(() => [15, 55, 85, 135, 135, 145, 155, 169, 175, 200, 205, 205, 210], []);

  const datasets: DatasetMeta[] = useMemo(
    () => [
      {
        id: 'simetrica',
        name: 'Distribuição Simétrica',
        subtitle: 'Contra-cenário Ideal (Balanço Perfeito)',
        relation: 'Média ≈ Mediana ≈ Moda',
        relationFormula: '\\bar{x} \\approx \\text{Med} \\approx \\text{Mo}',
        theme: {
          primary: '#2563EB',
          stroke: '#3B82F6',
          gradientStart: '#3B82F6',
          gradientStop: '#93C5FD',
          badgeBg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          badgeText: 'text-blue-600 dark:text-blue-400',
          border: 'border-blue-200 dark:border-blue-800/80',
          accent: '#2563EB',
        },
        pedagogicText:
          'Distribuição equilibrada em torno do centro (70 min). As caudas esquerda e direita possuem comprimentos e massas probabilísticas idênticas, fazendo com que as medidas de centro coincidam perfeitamente.',
        raw: rawSim,
      },
      {
        id: 'positiva',
        name: 'Assimétrica Positiva (Real)',
        subtitle: 'Amostra Real PROFMAT (Polo UERJ)',
        relation: 'Média > Mediana > Moda',
        relationFormula: '\\bar{x} > \\text{Med} > \\text{Mo}',
        theme: {
          primary: '#0D9488',
          stroke: '#14B8A6',
          gradientStart: '#0D9488',
          gradientStop: '#5EEAD4',
          badgeBg: 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
          badgeText: 'text-teal-600 dark:text-teal-400',
          border: 'border-teal-200 dark:border-teal-800/80',
          accent: '#0D9488',
        },
        pedagogicText:
          'Nossa amostra empírica real: a aglomeração principal ocorre em tempos curtos (Moda ≈ 20 min). Entretanto, a cauda longa de colegas viajando até 3h30 traciona a Média (79,7 min) para cima da Mediana (70 min).',
        raw: rawPos,
      },
      {
        id: 'negativa',
        name: 'Assimétrica Negativa',
        subtitle: 'Contra-cenário Invertido (Cauda à Esquerda)',
        relation: 'Média < Mediana < Moda',
        relationFormula: '\\bar{x} < \\text{Med} < \\text{Mo}',
        theme: {
          primary: '#E11D48',
          stroke: '#F43F5E',
          gradientStart: '#E11D48',
          gradientStop: '#FDA4AF',
          badgeBg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          badgeText: 'text-rose-600 dark:text-rose-400',
          border: 'border-rose-200 dark:border-rose-800/80',
          accent: '#E11D48',
        },
        pedagogicText:
          'Cenário inverso didático: a vasta maioria dos alunos reside longe do polo (Moda ≈ 205 min). Raras exceções habitando no entorno esticam a cauda esquerda, puxando a Média (145,3 min) para baixo da Mediana (155 min).',
        raw: rawNeg,
      },
    ],
    [rawSim, rawPos, rawNeg]
  );

  // Compute stats for all datasets
  const processedDatasets = useMemo(() => {
    return datasets.map((d) => {
      const sorted = [...d.raw].sort((a, b) => a - b);
      const n = sorted.length;
      const media = calculateMean(sorted);
      const mediana = calculateMedian(sorted);
      const std = calculateStd(sorted);

      // Quartiles
      const metadeInf = n % 2 !== 0 ? sorted.filter((x) => x < mediana) : sorted.slice(0, Math.floor(n / 2));
      const metadeSup = n % 2 !== 0 ? sorted.filter((x) => x > mediana) : sorted.slice(Math.floor(n / 2));
      const q1 = metadeInf.length > 0 ? calculateMedian(metadeInf) : mediana;
      const q3 = metadeSup.length > 0 ? calculateMedian(metadeSup) : mediana;
      const iqr = q3 - q1;
      const cercaInf = q1 - 1.5 * iqr;
      const cercaSup = q3 + 1.5 * iqr;

      const outliers = sorted.filter((x) => x < cercaInf || x > cercaSup);
      const regulares = sorted.filter((x) => x >= cercaInf && x <= cercaSup);
      const limInf = regulares.length > 0 ? Math.min(...regulares) : Math.min(...sorted);
      const limSup = regulares.length > 0 ? Math.max(...regulares) : Math.max(...sorted);

      // Mode: peak of KDE or highest frequency
      const kde = computeKernelDensity(sorted, 160, 0.4);
      let modeVal = mediana;
      if (kde.x.length > 0) {
        let maxDensityIdx = 0;
        for (let i = 1; i < kde.y.length; i++) {
          if (kde.y[i] > kde.y[maxDensityIdx]) {
            maxDensityIdx = i;
          }
        }
        modeVal = kde.x[maxDensityIdx];
      }

      // Bowley Quartile Skewness: (Q3 + Q1 - 2*Q2) / (Q3 - Q1)
      const bowley = iqr !== 0 ? (q3 + q1 - 2 * mediana) / iqr : 0;

      // Pearson First Skewness: (Media - Moda) / std
      const pearson1 = std !== 0 ? (media - modeVal) / std : 0;

      // Pearson Second Skewness: 3 * (Media - Mediana) / std
      const pearson2 = std !== 0 ? (3 * (media - mediana)) / std : 0;

      // Calculate current cut-off value based on global percentile (0 to 100)
      const pos = (globalPercentile / 100) * (n - 1);
      const idxLow = Math.floor(pos);
      const idxHigh = Math.ceil(pos);
      const frac = pos - idxLow;
      const cutVal = sorted[idxLow] + frac * (sorted[idxHigh] - sorted[idxLow]);

      // Count observations <= cutVal
      const obsCount = sorted.filter((x) => x <= cutVal).length;
      const obsPct = ((obsCount / n) * 100).toFixed(1);

      // Compute Swept KDE area percentage
      let sweptArea = 0;
      let totalArea = 0;
      if (kde.x.length > 1) {
        for (let i = 0; i < kde.x.length - 1; i++) {
          const dx = kde.x[i + 1] - kde.x[i];
          const avgY = (kde.y[i] + kde.y[i + 1]) / 2;
          const trap = dx * avgY;
          totalArea += trap;
          if (kde.x[i + 1] <= cutVal) {
            sweptArea += trap;
          } else if (kde.x[i] < cutVal) {
            const part = (cutVal - kde.x[i]) / dx;
            sweptArea += trap * part;
          }
        }
      }
      const kdeAreaPct = totalArea > 0 ? Math.min(100, Math.max(0, (sweptArea / totalArea) * 100)).toFixed(1) : '0.0';

      return {
        ...d,
        sorted,
        n,
        media,
        mediana,
        moda: modeVal,
        std,
        q1,
        q2: mediana,
        q3,
        iqr,
        cercaInf,
        cercaSup,
        limInf,
        limSup,
        outliers,
        regulares,
        bowley,
        pearson1,
        pearson2,
        cutVal,
        obsCount,
        obsPct,
        kdeAreaPct,
        kde,
      };
    });
  }, [datasets, globalPercentile]);

  const handleReset = () => {
    setGlobalPercentile(50);
  };

  const handleCopyLatex = () => {
    const text = `\\begin{table}[h!]
\\centering
\\caption{Síntese Comparativa dos Regimes de Assimetria - Tríptico PROFMAT}
\\begin{tabular}{lccccccc}
\\toprule
Regime & $\\bar{x}$ (Média) & $\\text{Med}$ ($Q_2$) & $\\text{Mo}$ (Moda) & $s$ (Desvio) & $A_B$ (Bowley) & $A_{S1}$ (Pearson 1º) & $A_{S2}$ (Pearson 2º) \\\\
\\midrule
Simétrica & ${processedDatasets[0].media.toFixed(1)} & ${processedDatasets[0].mediana.toFixed(1)} & ${processedDatasets[0].moda.toFixed(1)} & ${processedDatasets[0].std.toFixed(1)} & ${processedDatasets[0].bowley.toFixed(3)} & ${processedDatasets[0].pearson1.toFixed(3)} & ${processedDatasets[0].pearson2.toFixed(3)} \\\\
Assimétrica Positiva (Real UERJ) & ${processedDatasets[1].media.toFixed(1)} & ${processedDatasets[1].mediana.toFixed(1)} & ${processedDatasets[1].moda.toFixed(1)} & ${processedDatasets[1].std.toFixed(1)} & ${processedDatasets[1].bowley.toFixed(3)} & ${processedDatasets[1].pearson1.toFixed(3)} & ${processedDatasets[1].pearson2.toFixed(3)} \\\\
Assimétrica Negativa & ${processedDatasets[2].media.toFixed(1)} & ${processedDatasets[2].mediana.toFixed(1)} & ${processedDatasets[2].moda.toFixed(1)} & ${processedDatasets[2].std.toFixed(1)} & ${processedDatasets[2].bowley.toFixed(3)} & ${processedDatasets[2].pearson1.toFixed(3)} & ${processedDatasets[2].pearson2.toFixed(3)} \\\\
\\bottomrule
\\end{tabular}
\\end{table}

% Relação Empírica de Karl Pearson:
% Simétrica:            \\bar{x} \\approx \\text{Med} \\approx \\text{Mo}
% Assimétrica Positiva: \\bar{x} > \\text{Med} > \\text{Mo}
% Assimétrica Negativa: \\bar{x} < \\text{Med} < \\text{Mo}

% Coeficientes de Assimetria:
% Bowley:     A_B = \\frac{Q_3 + Q_1 - 2 Q_2}{IQR}
% Pearson 1º: A_{S1} = \\frac{\\bar{x} - \\text{Mo}}{s}
% Pearson 2º: A_{S2} = \\frac{3(\\bar{x} - Q_2)}{s}`;

    navigator.clipboard.writeText(text);
    setCopiedStatus('latex');
    setTimeout(() => setCopiedStatus(null), 2500);
  };

  const handleExportCSV = () => {
    const csvContent =
      `data:text/csv;charset=utf-8,Regime,Media,Mediana,Moda,DesvioPadrao,Q1,Q3,IQR,CercaInf,CercaSup,Bowley,Pearson1,Pearson2\n` +
      processedDatasets
        .map(
          (d) =>
            `"${d.name}",${d.media.toFixed(2)},${d.mediana.toFixed(2)},${d.moda.toFixed(2)},${d.std.toFixed(2)},${d.q1.toFixed(2)},${d.q3.toFixed(2)},${d.iqr.toFixed(2)},${d.cercaInf.toFixed(2)},${d.cercaSup.toFixed(2)},${d.bowley.toFixed(3)},${d.pearson1.toFixed(3)},${d.pearson2.toFixed(3)}`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'profmat_triptico_comparativo_assimetrias.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`space-y-6 ${classroomMode ? 'text-base' : 'text-sm'}`}>
      {/* 1. Header do Tríptico */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            <span>Tríptico Didático 04</span>
            <span aria-hidden="true">·</span>
            <span>Assimetrias de Pearson & Morfologia do Boxplot</span>
            <span aria-hidden="true">·</span>
            <span>PROFMAT</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Tríptico Comparativo: Boxplot vs. Curva de Densidade
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
            Confronto morfológico simultâneo sob três regimes de simetria. O painel central retrata a{' '}
            <strong className="text-slate-800 dark:text-slate-200">realidade empírica da nossa amostra UERJ</strong>,
            ladeada por contra-cenários didáticos.
          </p>
        </div>

        {/* Ações Rápidas */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyLatex}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            title="Copiar tabela e fórmulas em LaTeX"
          >
            {copiedStatus === 'latex' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <FileCode className="w-3.5 h-3.5 text-indigo-500" />}
            <span>{copiedStatus === 'latex' ? 'LaTeX Copiado!' : 'Copiar LaTeX'}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Baixar CSV</span>
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Restaurar</span>
          </button>
        </div>
      </div>

      {/* 2. CONTROLE CENTRAL GLOBAL: SLIDER DE VARREDURA PERCENTÍLICA SINCRONIZADA */}
      <div className="bg-white dark:bg-slate-800/95 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100 dark:border-slate-700/80 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Varredura Dinâmica Sincronizada nos Três Painéis
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Mova o percentil global para observar como a mesma fatia acumulada se comporta espacialmente na distribuição simétrica versus assimétrica.
            </p>
          </div>

          {/* Legenda Unificada das Linhas */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
              <span className="w-3 h-0.5 border-b-2 border-dashed border-amber-500 inline-block" />
              Moda (<MathView math="\text{Mo}" />)
            </span>
            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold">
              <span className="w-3 h-0.5 border-b-2 border-dashed border-purple-600 inline-block" />
              Mediana (<MathView math="Q_2" />)
            </span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-3 h-0.5 border-b-2 border-dashed border-emerald-600 inline-block" />
              Média (<MathView math="\bar{x}" />)
            </span>
          </div>
        </div>

        {/* Controle do Slider & Botões de Salto nos Marcos */}
        <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 bg-indigo-600 text-white font-mono font-bold text-sm sm:text-base rounded-lg shadow-xs flex items-center gap-1.5">
                <span>Percentil p = {globalPercentile.toFixed(1)}%</span>
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                {globalPercentile === 50 ? (
                  <span className="text-purple-600 dark:text-purple-400 font-bold">Posição Mediana (Q₂ = 50%)</span>
                ) : globalPercentile === 25 ? (
                  <span className="text-blue-600 dark:text-blue-400 font-bold">Primeiro Quartil (Q₁ = 25%)</span>
                ) : globalPercentile === 75 ? (
                  <span className="text-blue-600 dark:text-blue-400 font-bold">Terceiro Quartil (Q₃ = 75%)</span>
                ) : (
                  <span>Varredura Contínua Acumulada</span>
                )}
              </div>
            </div>

            {/* Atalhos Rápidos */}
            <div className="flex flex-wrap items-center gap-1 text-xs">
              <span className="text-[11px] font-semibold text-slate-400 mr-1 uppercase">Marcos:</span>
              <button
                type="button"
                onClick={() => setGlobalPercentile(0)}
                className={`px-2 py-1 rounded border transition font-mono ${
                  globalPercentile === 0
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                Mín (0%)
              </button>
              <button
                type="button"
                onClick={() => setGlobalPercentile(25)}
                className={`px-2 py-1 rounded border transition font-mono font-semibold ${
                  globalPercentile === 25
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-50'
                }`}
              >
                Q₁ (25%)
              </button>
              <button
                type="button"
                onClick={() => setGlobalPercentile(50)}
                className={`px-2.5 py-1 rounded border transition font-mono font-bold ${
                  globalPercentile === 50
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-50'
                }`}
              >
                Mediana Q₂ (50%)
              </button>
              <button
                type="button"
                onClick={() => setGlobalPercentile(75)}
                className={`px-2 py-1 rounded border transition font-mono font-semibold ${
                  globalPercentile === 75
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-50'
                }`}
              >
                Q₃ (75%)
              </button>
              <button
                type="button"
                onClick={() => setGlobalPercentile(100)}
                className={`px-2 py-1 rounded border transition font-mono ${
                  globalPercentile === 100
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                Máx (100%)
              </button>
            </div>
          </div>

          {/* Barra Range */}
          <div className="space-y-1">
            <input
              type="range"
              min={0}
              max={100}
              step={0.5}
              value={globalPercentile}
              onChange={(e) => setGlobalPercentile(parseFloat(e.target.value))}
              className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span>0% (Início)</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">Q₁ (25%)</span>
              <span className="text-purple-600 dark:text-purple-400 font-bold">Mediana (50%)</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">Q₃ (75%)</span>
              <span>100% (Fim)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. OS TRÊS PAINÉIS DO TRÍPTICO LADO A LADO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {processedDatasets.map((dataset) => {
          // SVG Dimensions per panel
          const width = 430;
          const height = classroomMode ? 320 : 280;
          const padLeft = 35;
          const padRight = 35;
          const padTop = 32;
          const padBottom = 42;
          const innerWidth = width - padLeft - padRight;
          const innerHeight = height - padTop - padBottom;

          // Compute X range for current dataset
          const minVal = Math.min(...dataset.sorted);
          const maxVal = Math.max(...dataset.sorted);
          const minX = Math.min(minVal, dataset.cercaInf < 0 ? dataset.cercaInf - 5 : 0) - 10;
          const maxX = Math.max(maxVal, dataset.cercaSup) + 15;
          const maxY = Math.max(...dataset.kde.y, 0.005);

          const toX = (val: number) => {
            const ratio = (val - minX) / (maxX - minX);
            return padLeft + Math.max(0, Math.min(1, ratio)) * innerWidth;
          };

          const kdeBottomY = padTop + innerHeight * 0.65;
          const kdeTopY = padTop + 5;
          const kdeH = kdeBottomY - kdeTopY;
          const toKdeY = (dens: number) => kdeBottomY - (dens / maxY) * kdeH;

          const boxCenterY = padTop + innerHeight * 0.86;
          const boxH = classroomMode ? 26 : 22;

          // Full KDE path
          let kdeFull = '';
          if (dataset.kde.x.length > 0) {
            kdeFull = `M ${toX(dataset.kde.x[0])} ${kdeBottomY}`;
            dataset.kde.x.forEach((x, i) => {
              kdeFull += ` L ${toX(x)} ${toKdeY(dataset.kde.y[i])}`;
            });
            kdeFull += ` L ${toX(dataset.kde.x[dataset.kde.x.length - 1])} ${kdeBottomY} Z`;
          }

          let kdeStroke = '';
          if (dataset.kde.x.length > 0) {
            kdeStroke = `M ${toX(dataset.kde.x[0])} ${toKdeY(dataset.kde.y[0])}`;
            for (let i = 1; i < dataset.kde.x.length; i++) {
              kdeStroke += ` L ${toX(dataset.kde.x[i])} ${toKdeY(dataset.kde.y[i])}`;
            }
          }

          // Swept KDE path
          let sweptPath = '';
          if (dataset.kde.x.length > 0) {
            const pts: { x: number; y: number }[] = [];
            for (let i = 0; i < dataset.kde.x.length; i++) {
              const xi = dataset.kde.x[i];
              const yi = dataset.kde.y[i];
              if (xi <= dataset.cutVal) {
                pts.push({ x: xi, y: yi });
              } else {
                if (i > 0) {
                  const xPrev = dataset.kde.x[i - 1];
                  const yPrev = dataset.kde.y[i - 1];
                  const t = (dataset.cutVal - xPrev) / (xi - xPrev);
                  const yInterp = yPrev + t * (yi - yPrev);
                  pts.push({ x: dataset.cutVal, y: yInterp });
                }
                break;
              }
            }
            if (pts.length > 0) {
              sweptPath = `M ${toX(pts[0].x)} ${kdeBottomY}`;
              pts.forEach((p) => {
                sweptPath += ` L ${toX(p.x)} ${toKdeY(p.y)}`;
              });
              sweptPath += ` L ${toX(pts[pts.length - 1].x)} ${kdeBottomY} Z`;
            }
          }

          // Ticks for X axis
          const step = (maxX - minX) > 160 ? 40 : 25;
          const firstTick = Math.ceil(minX / step) * step;
          const ticks: number[] = [];
          for (let t = firstTick; t <= maxX; t += step) {
            ticks.push(t);
          }

          // Jitter offsets
          const jitterOffsets = [-6, 5, -3, 6, -5, 4, -4, 6, -2, 4, -5, 3, -4];

          return (
            <div
              key={dataset.id}
              className={`bg-white dark:bg-slate-800/90 rounded-2xl border ${dataset.theme.border} shadow-sm p-4 sm:p-5 flex flex-col justify-between space-y-4 transition-all`}
            >
              {/* Header do Painel */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${dataset.theme.badgeBg}`}>
                    {dataset.name}
                  </span>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    Área: <span className="font-bold text-slate-700 dark:text-slate-200">{dataset.kdeAreaPct}%</span>
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300">{dataset.subtitle}</h4>

                {/* Badge de Posição do Corte Sincronizado */}
                <div className="mt-2.5 flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">
                    Ponto de Corte (<MathView math={`t`} />):
                  </span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                    {dataset.cutVal.toFixed(1)} min ({dataset.obsCount}/{dataset.n} obs · {dataset.obsPct}%)
                  </span>
                </div>

                {/* SVG DO PAINEL */}
                <div className="mt-3 w-full bg-slate-50/70 dark:bg-slate-900/50 rounded-xl p-1.5 border border-slate-100 dark:border-slate-800">
                  <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
                    <defs>
                      <linearGradient id={`grad-${dataset.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={dataset.theme.gradientStart} stopOpacity="0.45" />
                        <stop offset="100%" stopColor={dataset.theme.gradientStop} stopOpacity="0.1" />
                      </linearGradient>
                    </defs>

                    {/* Gridlines e ticks */}
                    {ticks.map((tk) => {
                      const xPos = toX(tk);
                      return (
                        <g key={tk}>
                          <line
                            x1={xPos}
                            y1={padTop}
                            x2={xPos}
                            y2={height - padBottom}
                            stroke={isDark ? '#334155' : '#E2E8F0'}
                            strokeDasharray="3 3"
                          />
                          <text
                            x={xPos}
                            y={height - padBottom + 14}
                            textAnchor="middle"
                            className="text-[10px] font-mono fill-slate-400 dark:fill-slate-500"
                          >
                            {tk}
                          </text>
                        </g>
                      );
                    })}

                    {/* Eixo horizontal */}
                    <line
                      x1={padLeft}
                      y1={height - padBottom}
                      x2={width - padRight}
                      y2={height - padBottom}
                      stroke={isDark ? '#475569' : '#CBD5E1'}
                      strokeWidth="1.2"
                    />

                    {/* Curva KDE base */}
                    <path d={kdeFull} fill={isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(203, 213, 225, 0.2)'} />
                    <path
                      d={kdeStroke}
                      fill="none"
                      stroke={isDark ? '#64748B' : '#94A3B8'}
                      strokeWidth="1.8"
                      strokeDasharray="2 2"
                    />

                    {/* Área Varrida pelo Percentil */}
                    {sweptPath && (
                      <path
                        d={sweptPath}
                        fill={`url(#grad-${dataset.id})`}
                        stroke={dataset.theme.primary}
                        strokeWidth="2.4"
                      />
                    )}

                    {/* LINHAS TRACEJADAS DE TENDÊNCIA CENTRAL */}
                    {/* 1. Moda (Mo) */}
                    <line
                      x1={toX(dataset.moda)}
                      y1={padTop - 8}
                      x2={toX(dataset.moda)}
                      y2={height - padBottom}
                      stroke="#F59E0B"
                      strokeWidth="1.6"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={toX(dataset.moda)}
                      y={padTop - 11}
                      textAnchor="middle"
                      className="text-[9px] font-bold fill-amber-600 dark:fill-amber-400"
                    >
                      Mo ({dataset.moda.toFixed(0)})
                    </text>

                    {/* 2. Mediana (Q2) */}
                    <line
                      x1={toX(dataset.mediana)}
                      y1={padTop - 18}
                      x2={toX(dataset.mediana)}
                      y2={height - padBottom}
                      stroke="#9333EA"
                      strokeWidth="2.2"
                      strokeDasharray="4 2"
                    />
                    <text
                      x={toX(dataset.mediana)}
                      y={padTop - 21}
                      textAnchor="middle"
                      className="text-[10px] font-extrabold fill-purple-600 dark:fill-purple-400"
                    >
                      Med ({dataset.mediana.toFixed(0)})
                    </text>

                    {/* 3. Média (x̄) */}
                    <line
                      x1={toX(dataset.media)}
                      y1={padTop - 8}
                      x2={toX(dataset.media)}
                      y2={height - padBottom}
                      stroke="#059669"
                      strokeWidth="1.8"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={toX(dataset.media)}
                      y={padTop - 11}
                      textAnchor="middle"
                      className="text-[9px] font-bold fill-emerald-600 dark:fill-emerald-400"
                    >
                      x̄ ({dataset.media.toFixed(0)})
                    </text>

                    {/* BOXPLOT HORIZONTAL */}
                    {/* Whisker Esquerdo */}
                    <line
                      x1={toX(dataset.limInf)}
                      y1={boxCenterY}
                      x2={toX(dataset.q1)}
                      y2={boxCenterY}
                      stroke={dataset.theme.primary}
                      strokeWidth="2"
                    />
                    <line
                      x1={toX(dataset.limInf)}
                      y1={boxCenterY - boxH / 3}
                      x2={toX(dataset.limInf)}
                      y2={boxCenterY + boxH / 3}
                      stroke={dataset.theme.primary}
                      strokeWidth="2"
                    />

                    {/* Whisker Direito */}
                    <line
                      x1={toX(dataset.q3)}
                      y1={boxCenterY}
                      x2={toX(dataset.limSup)}
                      y2={boxCenterY}
                      stroke={dataset.theme.primary}
                      strokeWidth="2"
                    />
                    <line
                      x1={toX(dataset.limSup)}
                      y1={boxCenterY - boxH / 3}
                      x2={toX(dataset.limSup)}
                      y2={boxCenterY + boxH / 3}
                      stroke={dataset.theme.primary}
                      strokeWidth="2"
                    />

                    {/* Caixa IQR */}
                    <rect
                      x={toX(dataset.q1)}
                      y={boxCenterY - boxH / 2}
                      width={Math.max(2, toX(dataset.q3) - toX(dataset.q1))}
                      height={boxH}
                      fill={isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.12)'}
                      stroke={dataset.theme.primary}
                      strokeWidth="1.8"
                      rx="3"
                    />

                    {/* Linha da Mediana Q2 no Boxplot */}
                    <line
                      x1={toX(dataset.mediana)}
                      y1={boxCenterY - boxH / 2}
                      x2={toX(dataset.mediana)}
                      y2={boxCenterY + boxH / 2}
                      stroke="#9333EA"
                      strokeWidth="3.2"
                    />

                    {/* Marcador da Média (Diamante Esmeralda no Boxplot) */}
                    <polygon
                      points={`${toX(dataset.media)},${boxCenterY - 6} ${toX(dataset.media) + 5},${boxCenterY} ${toX(dataset.media)},${boxCenterY + 6} ${toX(dataset.media) - 5},${boxCenterY}`}
                      fill="#059669"
                      stroke="#FFFFFF"
                      strokeWidth="1.2"
                    />

                    {/* Pontos de dados (Jitter) */}
                    {dataset.sorted.map((val, idx) => {
                      const cx = toX(val);
                      const cy = boxCenterY + (jitterOffsets[idx % jitterOffsets.length] || 0);
                      const isHovered = hoveredPoint?.datasetId === dataset.id && hoveredPoint?.val === val;
                      return (
                        <g
                          key={idx}
                          onMouseEnter={() => setHoveredPoint({ datasetId: dataset.id, val })}
                          onMouseLeave={() => setHoveredPoint(null)}
                          className="cursor-pointer"
                        >
                          <circle
                            cx={cx}
                            cy={cy}
                            r="3.2"
                            fill={dataset.theme.primary}
                            stroke="#FFFFFF"
                            strokeWidth="1"
                            opacity={isHovered ? 1 : 0.75}
                          />
                          {isHovered && (
                            <g>
                              <rect
                                x={cx - 30}
                                y={cy - 24}
                                width="60"
                                height="18"
                                rx="4"
                                fill="#0F172A"
                                className="opacity-95"
                              />
                              <text
                                x={cx}
                                y={cy - 12}
                                textAnchor="middle"
                                className="text-[10px] font-mono fill-white font-bold"
                              >
                                {val} min
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}

                    {/* Cursor Vertical Móvel do Corte */}
                    <line
                      x1={toX(dataset.cutVal)}
                      y1={kdeTopY}
                      x2={toX(dataset.cutVal)}
                      y2={boxCenterY + boxH / 2 + 5}
                      stroke={dataset.theme.primary}
                      strokeWidth="2"
                    />
                    <circle
                      cx={toX(dataset.cutVal)}
                      cy={boxCenterY}
                      r="4"
                      fill={dataset.theme.primary}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>

                {/* Relação de Pearson e Métricas Rápidas */}
                <div className="mt-3 space-y-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Relação de Pearson:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                      <MathView math={dataset.relationFormula} />
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">Média (x̄)</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">{dataset.media.toFixed(1)}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 block font-medium">Mediana (Q₂)</span>
                      <span className="font-mono font-bold text-purple-700 dark:text-purple-300">{dataset.mediana.toFixed(1)}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-medium">Moda (Mo)</span>
                      <span className="font-mono font-bold text-amber-700 dark:text-amber-300">{dataset.moda.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box Pedagógico Contextual */}
              <div className="mt-2 text-xs p-3 rounded-xl border-l-4 leading-relaxed bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 border-l-indigo-500 text-slate-600 dark:text-slate-300">
                {dataset.pedagogicText}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. SEÇÃO SÍNTESE COMPARATIVA: MATRIZ ANALÍTICA LADO A LADO */}
      <div className="bg-white dark:bg-slate-800/95 p-5 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-700/80 pb-4">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5" />
              <span>Confronto Epistemológico Consolidado</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Matriz Comparativa das Medidas de Assimetria e Dispersão</span>
            </h3>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Amostras Padronizadas (<MathView math="n = 13" /> observações)
          </div>
        </div>

        {/* Tabela de Medidas Comparativas */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 shadow-inner">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-700 select-none">
              <tr>
                <th className="py-3 px-3 sm:px-4 whitespace-nowrap text-left">Regime Morfológico</th>
                <th className="py-3 px-2 sm:px-3 text-center whitespace-nowrap">
                  <span className="inline-flex items-center justify-center gap-0.5">
                    Média (<MathView math="\bar{x}" />)
                  </span>
                </th>
                <th className="py-3 px-2 sm:px-3 text-center whitespace-nowrap">
                  <span className="inline-flex items-center justify-center gap-0.5">
                    Mediana (<MathView math="Q_2" />)
                  </span>
                </th>
                <th className="py-3 px-2 sm:px-3 text-center whitespace-nowrap">
                  <span className="inline-flex items-center justify-center gap-0.5">
                    Moda (<MathView math="\text{Mo}" />)
                  </span>
                </th>
                <th className="py-3 px-2 sm:px-3 text-center whitespace-nowrap">
                  <span className="inline-flex items-center justify-center gap-0.5">
                    Desvio Padrão (<MathView math="s" />)
                  </span>
                </th>
                <th className="py-3 px-2 sm:px-3 text-center whitespace-nowrap">
                  <MathView math="IQR" />
                </th>
                <th className="py-3 px-2 sm:px-3 text-center whitespace-nowrap font-bold text-indigo-600 dark:text-indigo-400">
                  <span className="inline-flex items-center justify-center gap-0.5">
                    Bowley (<MathView math="A_B" />)
                  </span>
                </th>
                <th className="py-3 px-2 sm:px-3 text-center whitespace-nowrap font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="inline-flex items-center justify-center gap-0.5">
                    Pearson 1º (<MathView math="A_{S1}" />)
                  </span>
                </th>
                <th className="py-3 px-2 sm:px-3 text-center whitespace-nowrap font-bold text-teal-600 dark:text-teal-400">
                  <span className="inline-flex items-center justify-center gap-0.5">
                    Pearson 2º (<MathView math="A_{S2}" />)
                  </span>
                </th>
                <th className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">Orientação da Cauda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {processedDatasets.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition">
                  <td className="py-2.5 px-3 sm:px-4 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.theme.primary }} />
                    <span>{d.name}</span>
                  </td>
                  <td className="py-2.5 px-2 sm:px-3 text-center font-mono text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap">
                    {d.media.toFixed(1)} min
                  </td>
                  <td className="py-2.5 px-2 sm:px-3 text-center font-mono text-purple-600 dark:text-purple-400 font-bold whitespace-nowrap">
                    {d.mediana.toFixed(1)} min
                  </td>
                  <td className="py-2.5 px-2 sm:px-3 text-center font-mono text-amber-600 dark:text-amber-400 whitespace-nowrap">
                    {d.moda.toFixed(1)} min
                  </td>
                  <td className="py-2.5 px-2 sm:px-3 text-center font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {d.std.toFixed(1)} min
                  </td>
                  <td className="py-2.5 px-2 sm:px-3 text-center font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {d.iqr.toFixed(1)} min
                  </td>
                  <td className="py-2.5 px-2 sm:px-3 text-center font-mono font-bold whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        Math.abs(d.bowley) < 0.05
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          : d.bowley > 0
                          ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {d.bowley > 0 ? `+${d.bowley.toFixed(3)}` : d.bowley.toFixed(3)}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 sm:px-3 text-center font-mono font-bold whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        Math.abs(d.pearson1) < 0.05
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          : d.pearson1 > 0
                          ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {d.pearson1 > 0 ? `+${d.pearson1.toFixed(3)}` : d.pearson1.toFixed(3)}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 sm:px-3 text-center font-mono font-bold whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        Math.abs(d.pearson2) < 0.05
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          : d.pearson2 > 0
                          ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {d.pearson2 > 0 ? `+${d.pearson2.toFixed(3)}` : d.pearson2.toFixed(3)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center whitespace-nowrap">
                    {d.id === 'simetrica' ? (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
                        Balanceada (Isométrica)
                      </span>
                    ) : d.id === 'positiva' ? (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-semibold border border-teal-200 dark:border-teal-800">
                        Alongada à Direita (Superior)
                      </span>
                    ) : (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-semibold border border-rose-200 dark:border-rose-800">
                        Alongada à Esquerda (Inferior)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* NOTA EPISTEMOLÓGICA PROFMAT EM DESTAQUE: MODA EM DADOS CONTÍNUOS VS AMODALIDADE DISCRETA */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-300 dark:border-amber-700/70 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200 font-bold text-sm sm:text-base">
            <div className="p-1.5 rounded-lg bg-amber-200/60 dark:bg-amber-800/60 text-amber-800 dark:text-amber-100">
              <HelpCircle className="w-5 h-5" />
            </div>
            <span>Nota Epistemológica PROFMAT: Por que Apresentar Moda se a Amostra Real é Contínua e Amodal?</span>
          </div>
          <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-2.5 leading-relaxed">
            <p>
              <strong>1. O Paradoxo do Rol Discreto:</strong> Em variáveis contínuas (como tempo de viagem em minutos), a probabilidade teórica de repetição exata de um mesmo valor real é estritamente nula (<MathView math="P(X = x) = 0" />). Na nossa turma real, as poucas repetições (<MathView math="20" /> e <MathView math="90\text{ min}" />) decorrem do arredondamento do relógio, fazendo com que o rol bruto seja tecnicamente <em>amodal</em> ou com modas pontuais espúrias que não representam o comportamento geral da população.
            </p>
            <p>
              <strong>2. A Moda Contínua da Densidade Kernel (KDE):</strong> Para resolver esse problema analítico fundamental, a Teoria Estatística define a moda contínua como a abscissa do ponto de máxima densidade de probabilidade (<MathView math="\hat{\text{Mo}} = \arg\max_{x} \hat{f}(x)" />). O valor de Moda apresentado em cada painel (<MathView math="47{,}9\text{ min}" /> na distribuição real) corresponde exatamente ao <strong>pico mais elevado da curva contínua</strong>, identificando onde se aglomera a maior densidade de alunos.
            </p>
            <p>
              <strong>3. A Solução Canônica de Karl Pearson e Bowley:</strong> Ciente de que a moda empírica é instável ou frequentemente indefinida em pequenas amostras, Karl Pearson demonstrou que em distribuições moderadamente assimétricas vale a relação empírica <MathView math="\bar{x} - \text{Mo} \approx 3(\bar{x} - Q_2)" /> e propôs o <strong>Segundo Coeficiente de Pearson (<MathView math="A_{S2}" />)</strong>, que <em>substitui a moda pela robustez da Mediana (<MathView math="Q_2" />)</em>. Da mesma forma, <strong>Arthur Bowley (<MathView math="A_B" />)</strong> e o <strong>Boxplot de Tukey</strong> apoiam-se exclusivamente nos quartis (<MathView math="Q_1, Q_2, Q_3" />), ficando completamente imunes a qualquer questão de amodalidade.
            </p>
          </div>
        </div>

        {/* QUADRO TEÓRICO COMPLETO: 4 RETÂNGULOS COM AS FÓRMULAS E CÁLCULOS DETALHADOS */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Fundamentos de Cálculo: Medidas de Posição, Dispersão e Assimetria
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1: Cálculo e Natureza da Moda */}
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs sm:text-sm">
                  <Activity className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>1. Cálculo da Moda Contínua e Estimativa Modal</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-mono">
                  Pico da KDE
                </span>
              </div>
              <div className="bg-white dark:bg-slate-800/90 p-3 rounded-xl border border-amber-100 dark:border-amber-900/60 text-center font-mono">
                <MathView math="\hat{\text{Mo}} = \arg\max_{x} \hat{f}(x) \quad \text{e} \quad \text{Mo}_{\text{Pearson}} \approx 3 Q_2 - 2 \bar{x}" block />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Determina o ponto de maior concentração de massa na curva suave. Na amostra real, <MathView math="\hat{\text{Mo}} \approx 47{,}9\text{ min}" /> marca o cume da densidade KDE, enquanto a aproximação de Pearson fornece <MathView math="3(70{,}0) - 2(79{,}7) = 50{,}6\text{ min}" />, confirmando a ordenação canônica <MathView math="\text{Mo} < Q_2 < \bar{x}" />.
              </p>
            </div>

            {/* Box 2: Cálculo do Desvio Padrão */}
            <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sky-800 dark:text-sky-300 font-bold text-xs sm:text-sm">
                  <Scale className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>2. Cálculo do Desvio Padrão Amostral (<MathView math="s" />)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200 font-mono">
                  Dispersão Linear
                </span>
              </div>
              <div className="bg-white dark:bg-slate-800/90 p-3 rounded-xl border border-sky-100 dark:border-sky-900/60 text-center font-mono">
                <MathView math="s = \sqrt{\frac{1}{n - 1} \sum_{i=1}^{n} (x_i - \bar{x})^2} \quad \left(s_{\text{real}} = 61{,}1\text{ min}\right)" block />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Quantifica a dispersão média das observações ao redor da média <MathView math="\bar{x}" />. No cálculo dos coeficientes de Pearson (<MathView math="A_{S1}" /> e <MathView math="A_{S2}" />), a divisão por <MathView math="s" /> atua como o padronizador adimensional, permitindo comparar assimetrias entre variáveis com escalas distintas.
              </p>
            </div>

            {/* Box 3: Coeficiente de Bowley */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-300 font-bold text-xs sm:text-sm">
                  <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>3. Coeficiente Quartílica de Bowley (<MathView math="A_B" />)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 font-mono">
                  Boxplot puro
                </span>
              </div>
              <div className="bg-white dark:bg-slate-800/90 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/60 text-center font-mono">
                <MathView math="A_B = \frac{(Q_3 - Q_2) - (Q_2 - Q_1)}{Q_3 - Q_1} = \frac{Q_3 + Q_1 - 2Q_2}{IQR}" block />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Mede a assimetria baseando-se exclusivamente na caixa do Boxplot (<MathView math="Q_1, Q_2, Q_3" />). Se a metade superior da caixa for mais ampla que a inferior (<MathView math="Q_3 - Q_2 > Q_2 - Q_1" />), tem-se <MathView math="A_B > 0" />. É totalmente imune a modas e a valores extremos nas caudas.
              </p>
            </div>

            {/* Box 4: Coeficientes de Pearson */}
            <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-bold text-xs sm:text-sm">
                  <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>4. Primeiro e Segundo Coeficientes de Pearson</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 font-mono">
                  Média vs Mediana
                </span>
              </div>
              <div className="bg-white dark:bg-slate-800/90 p-3 rounded-xl border border-teal-100 dark:border-teal-900/60 text-center font-mono">
                <MathView math="A_{S1} = \frac{\bar{x} - \text{Mo}}{s} \quad \text{e} \quad A_{S2} = \frac{3(\bar{x} - Q_2)}{s}" block />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                O 1º Coeficiente (<MathView math="A_{S1} = +0{,}520" />) quantifica o distanciamento da Média pelo pico modal. O 2º Coeficiente (<MathView math="A_{S2} = +0{,}476" />) substitui a moda pela Mediana (<MathView math="Q_2" />), garantindo alta estabilidade matemática mesmo em amostras discretas amodais.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
