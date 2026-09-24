import React, { useState, useMemo } from 'react';
import { computeTukeyAnalysis, computeKernelDensity } from '../server/statsService';
import { MathView } from './MathView';
import { useTheme } from '../context/ThemeContext';
import {
  Download,
  RefreshCw,
  Plus,
  Trash2,
  FileCode,
  Check,
  Sliders,
  CheckCircle2,
  HelpCircle,
  BarChart2,
  TrendingUp,
} from 'lucide-react';

interface StudentItem {
  id: string;
  nome: string;
  tempo: number;
}

interface PresetConfig {
  id: string;
  selectLabel: string;
  tag: string;
  title: string;
  subtitle: string;
  unit: string;
  students: StudentItem[];
}

const DEFAULT_STUDENTS: StudentItem[] = [
  { id: '1', nome: 'Betinha', tempo: 15 },
  { id: '2', nome: 'Claudio', tempo: 20 },
  { id: '3', nome: 'Gleicy', tempo: 20 },
  { id: '4', nome: 'Leone', tempo: 25 },
  { id: '5', nome: 'Thiago', tempo: 50 },
  { id: '6', nome: 'Marco', tempo: 56 },
  { id: '7', nome: 'Luan', tempo: 70 },
  { id: '8', nome: 'Wellington', tempo: 80 },
  { id: '9', nome: 'José', tempo: 90 },
  { id: '10', nome: 'Leonardo', tempo: 90 },
  { id: '11', nome: 'Pablo', tempo: 140 },
  { id: '12', nome: 'Guilherme', tempo: 170 },
  { id: '13', nome: 'Felippe', tempo: 210 },
];

const PRESETS: Record<string, PresetConfig> = {
  uerj: {
    id: 'uerj',
    selectLabel: 'Conjunto: Turma UERJ Real',
    tag: 'Caso Prático 01 · Tabela Discreta · Polo UERJ',
    title: 'Tempo de Deslocamento ao Polo (Minutos)',
    subtitle: 'Localização de separatrizes discretas por frequência acumulada e comparação com a densidade empírica contínua.',
    unit: 'min',
    students: DEFAULT_STUDENTS,
  },
  notas: {
    id: 'notas',
    selectLabel: 'Conjunto: Notas Avaliação (0-100)',
    tag: 'Caso Prático 02 · Desempenho Escolar',
    title: 'Notas de Avaliação (Pontos de 0 a 100)',
    subtitle: 'Distribuição discreta de notas e análise de separatrizes acumuladas comparadas à densidade.',
    unit: 'pts',
    students: [
      { id: '1', nome: 'Aluno 01', tempo: 32 },
      { id: '2', nome: 'Aluno 02', tempo: 55 },
      { id: '3', nome: 'Aluno 03', tempo: 60 },
      { id: '4', nome: 'Aluno 04', tempo: 68 },
      { id: '5', nome: 'Aluno 05', tempo: 72 },
      { id: '6', nome: 'Aluno 06', tempo: 75 },
      { id: '7', nome: 'Aluno 07', tempo: 78 },
      { id: '8', nome: 'Aluno 08', tempo: 82 },
      { id: '9', nome: 'Aluno 09', tempo: 85 },
      { id: '10', nome: 'Aluno 10', tempo: 90 },
      { id: '11', nome: 'Aluno 11', tempo: 95 },
    ],
  },
  salarios: {
    id: 'salarios',
    selectLabel: 'Conjunto: Renda com Outlier Severo',
    tag: 'Caso Prático 03 · Estrutura Salarial',
    title: 'Renda com Outlier Severo (Mil R$)',
    subtitle: 'Frequências discretas com valor atípico extremo e comparação da curva de densidade.',
    unit: 'mil R$',
    students: [
      { id: '1', nome: 'Estagiário A', tempo: 14 },
      { id: '2', nome: 'Assistente B', tempo: 22 },
      { id: '3', nome: 'Analista C', tempo: 35 },
      { id: '4', nome: 'Analista D', tempo: 38 },
      { id: '5', nome: 'Analista E', tempo: 42 },
      { id: '6', nome: 'Especialista F', tempo: 55 },
      { id: '7', nome: 'Coordenador G', tempo: 75 },
      { id: '8', nome: 'Diretor Geral', tempo: 340 },
    ],
  },
  simetrica: {
    id: 'simetrica',
    selectLabel: 'Conjunto: Distribuição Simétrica',
    tag: 'Caso Prático 04 · Distribuição Teórica Simétrica',
    title: 'Distribuição Simétrica (Valores de 10 a 130)',
    subtitle: 'Conjunto balanceado demonstrando a convergência entre passos discretos e simetria contínua.',
    unit: 'unid.',
    students: [
      { id: '1', nome: 'P01', tempo: 10 },
      { id: '2', nome: 'P02', tempo: 20 },
      { id: '3', nome: 'P03', tempo: 30 },
      { id: '4', nome: 'P04', tempo: 40 },
      { id: '5', nome: 'P05', tempo: 50 },
      { id: '6', nome: 'P06', tempo: 60 },
      { id: '7', nome: 'P07', tempo: 70 },
      { id: '8', nome: 'P08', tempo: 80 },
      { id: '9', nome: 'P09', tempo: 90 },
      { id: '10', nome: 'P10', tempo: 100 },
      { id: '11', nome: 'P11', tempo: 110 },
      { id: '12', nome: 'P12', tempo: 120 },
      { id: '13', nome: 'P13', tempo: 130 },
    ],
  },
};

interface DiscreteTableRow {
  x: number;
  f: number;
  F: number;
  fPorc: number;
  porc: number;
}

export const Tab2SimpleTable: React.FC = () => {
  const { theme, classroomMode } = useTheme();
  const isDark = theme === 'dark';

  const [selectedPresetId, setSelectedPresetId] = useState<string>('uerj');
  const [students, setStudents] = useState<StudentItem[]>(DEFAULT_STUDENTS);
  const [newNome, setNewNome] = useState('');
  const [newTempo, setNewTempo] = useState('');
  const [selectedK, setSelectedK] = useState<number>(2); // Default Q2
  const [hoverVal, setHoverVal] = useState<number | null>(null);
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);
  const [customMultiplier, setCustomMultiplier] = useState<number>(1.5);
  const [sweepValue, setSweepValue] = useState<number | null>(null);

  const currentPreset = PRESETS[selectedPresetId] || PRESETS.uerj;
  const sampleNumbers = useMemo(() => students.map((s) => s.tempo), [students]);

  // Tukey statistics
  const stats = useMemo(() => {
    return computeTukeyAnalysis(sampleNumbers, customMultiplier);
  }, [sampleNumbers, customMultiplier]);

  // KDE computation
  const kde = useMemo(() => computeKernelDensity(stats.sorted, 200, 0.4), [stats.sorted]);

  // Discrete Table Generation
  const discreteTable: DiscreteTableRow[] = useMemo(() => {
    if (stats.n === 0) return [];
    const counts: Record<number, number> = {};
    stats.sorted.forEach((v) => {
      counts[v] = (counts[v] || 0) + 1;
    });
    const uniqueVals = Object.keys(counts)
      .map(Number)
      .sort((a, b) => a - b);
    let accum = 0;
    return uniqueVals.map((x) => {
      const f = counts[x];
      accum += f;
      return {
        x,
        f,
        F: accum,
        fPorc: (f / stats.n) * 100,
        porc: (accum / stats.n) * 100,
      };
    });
  }, [stats.sorted, stats.n]);

  // Discrete Quartile calculation: target position p * n and first row with F_i >= posTarget
  const pTarget = selectedK * 0.25;
  const posTarget = selectedK * (stats.n / 4);
  const targetRowIndex = useMemo(() => {
    const idx = discreteTable.findIndex((row) => row.F >= posTarget);
    return idx !== -1 ? idx : Math.max(0, discreteTable.length - 1);
  }, [discreteTable, posTarget]);
  const targetRow = discreteTable[targetRowIndex] || { x: 0, f: 0, F: 0, fPorc: 0, porc: 0 };

  // Sweep value clamped within [cercaInf, cercaSup]
  const currentSweep = useMemo(() => {
    if (sweepValue === null) return stats.q2;
    return Math.min(Math.max(sweepValue, stats.cercaInf), stats.cercaSup);
  }, [sweepValue, stats.cercaInf, stats.cercaSup, stats.q2]);

  // Count observations <= currentSweep
  const countLessOrEqual = useMemo(() => {
    return stats.sorted.filter((v) => v <= currentSweep).length;
  }, [stats.sorted, currentSweep]);

  const pctObservations = useMemo(() => {
    if (stats.n === 0) return '0.0';
    return ((countLessOrEqual / stats.n) * 100).toFixed(1);
  }, [countLessOrEqual, stats.n]);

  // Approximate swept KDE area percentage
  const pctKdeArea = useMemo(() => {
    if (kde.x.length < 2) return '0.0';
    let totalArea = 0;
    let sweptArea = 0;
    for (let i = 0; i < kde.x.length - 1; i++) {
      const dx = kde.x[i + 1] - kde.x[i];
      const avgY = (kde.y[i] + kde.y[i + 1]) / 2;
      const trap = dx * avgY;
      totalArea += trap;
      if (kde.x[i + 1] <= currentSweep) {
        sweptArea += trap;
      } else if (kde.x[i] < currentSweep) {
        const frac = (currentSweep - kde.x[i]) / dx;
        sweptArea += trap * frac;
      }
    }
    if (totalArea <= 0) return '0.0';
    return Math.min(100, Math.max(0, (sweptArea / totalArea) * 100)).toFixed(1);
  }, [kde, currentSweep]);

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newTempo);
    if (!isNaN(val) && val >= 0) {
      const name = newNome.trim() || `Observação ${students.length + 1}`;
      setStudents([...students, { id: Math.random().toString(36).substring(2, 9), nome: name, tempo: val }]);
      setNewNome('');
      setNewTempo('');
    }
  };

  const handleRemoveByValue = (val: number) => {
    if (students.length <= 4) {
      alert('Mantenha ao menos 4 observações para manter o cálculo dos quartis consistente.');
      return;
    }
    const idx = students.findIndex((s) => s.tempo === val);
    if (idx !== -1) {
      const copy = [...students];
      copy.splice(idx, 1);
      setStudents(copy);
    }
  };

  const handleReset = () => {
    setSelectedPresetId('uerj');
    setStudents(DEFAULT_STUDENTS);
    setCustomMultiplier(1.5);
    setSweepValue(null);
    setSelectedK(2);
  };

  const handleCopyLatex = () => {
    const text = `\\begin{table}[h!]
\\centering
\\begin{tabular}{rrrrr}
\\toprule
$x_i$ (${currentPreset.unit}) & $f_i$ & $F_i$ & $f_i(\\%)$ & $F_i(\\%)$ \\\\
\\midrule
${discreteTable.map((r) => `${r.x} & ${r.f} & ${r.F} & ${r.fPorc.toFixed(1)}\\% & ${r.porc.toFixed(1)}\\%`).join(' \\\\\n')}
\\bottomrule
\\end{tabular}
\\caption{Tabela de Distribuição Simples de Frequências - ${currentPreset.title}}
\\end{table}

% Posição e Separatriz Calculada:
% Posição Teórica: p * n = ${(pTarget).toFixed(2)} * ${stats.n} = ${posTarget.toFixed(2)}
% Condição Discreta: F_i >= ${posTarget.toFixed(2)} => Q_${selectedK} = ${targetRow.x} ${currentPreset.unit}`;
    navigator.clipboard.writeText(text);
    setCopiedStatus('latex');
    setTimeout(() => setCopiedStatus(null), 2500);
  };

  const handleExportCSV = () => {
    const csvContent =
      `data:text/csv;charset=utf-8,Valor_${currentPreset.unit},Frequencia_Simples,Frequencia_Acumulada,Percentual_Simples,Percentual_Acumulado\n` +
      discreteTable.map((r) => `${r.x},${r.f},${r.F},${r.fPorc.toFixed(2)}%,${r.porc.toFixed(2)}%`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `profmat_${selectedPresetId}_tabela_discreta.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVG dimensions for Main Graphic (KDE + Boxplot)
  const width = 880;
  const height = classroomMode ? 460 : 400;
  const padLeft = 55;
  const padRight = 55;
  const padTop = classroomMode ? 55 : 50;
  const padBottom = classroomMode ? 65 : 55;
  const innerWidth = width - padLeft - padRight;
  const innerHeight = height - padTop - padBottom;

  const minX = Math.min(stats.limInf, stats.cercaInf < 0 ? stats.cercaInf - 5 : 0, Math.min(...stats.sorted)) - 10;
  const maxX = Math.max(stats.limSup, stats.cercaSup, Math.max(...stats.sorted)) + 20;
  const maxY = Math.max(...kde.y, 0.01);

  const toX = (val: number) => {
    const ratio = (val - minX) / (maxX - minX);
    return padLeft + Math.max(0, Math.min(1, ratio)) * innerWidth;
  };

  const kdeBottomY = padTop + innerHeight * 0.65;
  const kdeTopY = padTop + 10;
  const kdeHeight = kdeBottomY - kdeTopY;

  const toKdeY = (density: number) => kdeBottomY - (density / maxY) * kdeHeight;

  const boxCenterY = padTop + innerHeight * 0.85;
  const boxHeight = classroomMode ? 48 : 36;

  // Full KDE outline path
  const kdePath = useMemo(() => {
    if (kde.x.length === 0) return '';
    let d = `M ${toX(kde.x[0])} ${kdeBottomY}`;
    kde.x.forEach((x, i) => {
      d += ` L ${toX(x)} ${toKdeY(kde.y[i])}`;
    });
    d += ` L ${toX(kde.x[kde.x.length - 1])} ${kdeBottomY} Z`;
    return d;
  }, [kde, minX, maxX, maxY]);

  const kdeStrokePath = useMemo(() => {
    if (kde.x.length === 0) return '';
    let d = `M ${toX(kde.x[0])} ${toKdeY(kde.y[0])}`;
    for (let i = 1; i < kde.x.length; i++) {
      d += ` L ${toX(kde.x[i])} ${toKdeY(kde.y[i])}`;
    }
    return d;
  }, [kde, minX, maxX, maxY]);

  // Swept KDE path (from start up to currentSweep)
  const sweptKdePath = useMemo(() => {
    if (kde.x.length === 0) return '';
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < kde.x.length; i++) {
      const xi = kde.x[i];
      const yi = kde.y[i];
      if (xi <= currentSweep) {
        pts.push({ x: xi, y: yi });
      } else {
        if (i > 0) {
          const xPrev = kde.x[i - 1];
          const yPrev = kde.y[i - 1];
          const t = (currentSweep - xPrev) / (xi - xPrev);
          const yInterp = yPrev + t * (yi - yPrev);
          pts.push({ x: currentSweep, y: yInterp });
        }
        break;
      }
    }
    if (pts.length === 0) return '';
    let d = `M ${toX(pts[0].x)} ${kdeBottomY}`;
    pts.forEach((p) => {
      d += ` L ${toX(p.x)} ${toKdeY(p.y)}`;
    });
    d += ` L ${toX(pts[pts.length - 1].x)} ${kdeBottomY} Z`;
    return d;
  }, [kde, currentSweep, minX, maxX, maxY, kdeBottomY]);

  // X ticks for main chart
  const ticks = useMemo(() => {
    const range = maxX - minX;
    const step = range > 200 ? 50 : range > 100 ? 25 : 10;
    const firstTick = Math.ceil(minX / step) * step;
    const result: number[] = [];
    for (let t = firstTick; t <= maxX; t += step) {
      result.push(t);
    }
    return result;
  }, [minX, maxX]);

  // Dimensions for Cumulative Step Function Chart (Ogiva Discreta)
  const stepW = 560;
  const stepH = classroomMode ? 320 : 270;
  const sPadLeft = 45;
  const sPadRight = 35;
  const sPadTop = 25;
  const sPadBottom = 45;
  const sInnerW = stepW - sPadLeft - sPadRight;
  const sInnerH = stepH - sPadTop - sPadBottom;

  const toStepX = (idx: number) => {
    if (discreteTable.length <= 1) return sPadLeft + sInnerW / 2;
    return sPadLeft + (idx / (discreteTable.length - 1)) * sInnerW;
  };
  const toStepY = (freqAcum: number) => {
    if (stats.n === 0) return stepH - sPadBottom;
    return stepH - sPadBottom - (freqAcum / stats.n) * sInnerH;
  };

  return (
    <div className={`space-y-6 ${classroomMode ? 'text-base' : 'text-sm'}`}>
      {/* Header Info */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            <span>{currentPreset.tag}</span>
            <span aria-hidden="true">·</span>
            <span>Varredura por Frequência Acumulada</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            {currentPreset.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
            {currentPreset.subtitle}
          </p>
        </div>

        {/* Action Controls & Preset Dropdown */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Selector */}
          <select
            value={selectedPresetId}
            onChange={(e) => {
              const selectedId = e.target.value;
              setSelectedPresetId(selectedId);
              if (PRESETS[selectedId]) {
                setStudents(PRESETS[selectedId].students);
              }
              setSweepValue(null);
            }}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="uerj">Conjunto: Turma UERJ Real</option>
            <option value="notas">Conjunto: Notas Avaliação (0-100)</option>
            <option value="salarios">Conjunto: Renda com Outlier Severo</option>
            <option value="simetrica">Conjunto: Distribuição Simétrica</option>
          </select>

          <button
            onClick={handleCopyLatex}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            title="Copiar tabela em código LaTeX"
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

      {/* 1. SEÇÃO CENTRAL NOBRE: GRÁFICO SVG + SLIDER DE VARREDURA + CARDS DE MÉTRICAS */}
      <div className="bg-white dark:bg-slate-800/95 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
        {/* Cabeçalho do Painel & Legenda Unificada */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 dark:border-slate-700/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Visualização Dinâmica com Varredura de Densidade e Separatrizes
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Arraste o slide para varrer a área acumulada da curva de densidade da Cerca Inferior até a Cerca Superior.
            </p>
          </div>

          {/* Legenda das Linhas */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
              <span className="w-3.5 h-0.5 border-b-2 border-dashed border-amber-500 inline-block" />
              Cerca Inf ({stats.cercaInf})
            </span>
            <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-medium">
              <span className="w-3.5 h-0.5 border-b-2 border-dashed border-teal-500 inline-block" />
              Mín ({stats.limInf}) / Máx ({stats.limSup})
            </span>
            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
              <span className="w-3.5 h-0.5 border-b-2 border-dashed border-blue-600 inline-block" />
              Q₁ ({stats.q1}) & Q₃ ({stats.q3})
            </span>
            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
              <span className="w-3.5 h-0.5 border-b-2 border-dashed border-purple-600 inline-block" />
              Mediana Q₂ ({stats.q2})
            </span>
            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
              <span className="w-3.5 h-0.5 border-b-2 border-dashed border-rose-500 inline-block" />
              Cerca Sup ({stats.cercaSup})
            </span>
          </div>
        </div>

        {/* CONTROLE DO SLIDER DE VARREDURA */}
        <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-indigo-600 text-white font-mono font-bold text-sm sm:text-base rounded-lg shadow-xs flex items-center gap-1.5">
                <span>t = {currentSweep.toFixed(1)} {currentPreset.unit}</span>
              </div>
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">Área sob a curva: {pctKdeArea}%</span>
                <span className="mx-2 text-slate-400">·</span>
                <span>{countLessOrEqual} de {stats.n} observações ({pctObservations}%)</span>
              </div>
            </div>

            {/* Atalhos Rápidos para Saltos nos Marcos */}
            <div className="flex flex-wrap items-center gap-1 text-xs">
              <span className="text-[11px] font-semibold text-slate-400 mr-1 uppercase">Saltar:</span>
              <button
                type="button"
                onClick={() => setSweepValue(stats.cercaInf)}
                className="px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-mono hover:bg-amber-100 transition"
                title="Ir para Cerca Inferior"
              >
                Cerca Inf
              </button>
              <button
                type="button"
                onClick={() => setSweepValue(stats.limInf)}
                className="px-2 py-0.5 rounded border border-teal-300 dark:border-teal-800/80 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-mono hover:bg-teal-100 transition"
                title="Ir para Mínimo Regular"
              >
                Mín ({stats.limInf})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSweepValue(stats.q1);
                  setSelectedK(1);
                }}
                className="px-2 py-0.5 rounded border border-blue-300 dark:border-blue-800/80 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 font-mono hover:bg-blue-100 transition font-bold"
                title="Ir para Primeiro Quartil Q1"
              >
                Q₁ ({stats.q1})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSweepValue(stats.q2);
                  setSelectedK(2);
                }}
                className="px-2 py-0.5 rounded border border-purple-300 dark:border-purple-800/80 bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 font-mono hover:bg-purple-100 transition font-bold"
                title="Ir para Mediana Q2"
              >
                Q₂ ({stats.q2})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSweepValue(stats.q3);
                  setSelectedK(3);
                }}
                className="px-2 py-0.5 rounded border border-blue-300 dark:border-blue-800/80 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 font-mono hover:bg-blue-100 transition font-bold"
                title="Ir para Terceiro Quartil Q3"
              >
                Q₃ ({stats.q3})
              </button>
              <button
                type="button"
                onClick={() => setSweepValue(stats.limSup)}
                className="px-2 py-0.5 rounded border border-teal-300 dark:border-teal-800/80 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-mono hover:bg-teal-100 transition"
                title="Ir para Máximo Regular"
              >
                Máx ({stats.limSup})
              </button>
              <button
                type="button"
                onClick={() => setSweepValue(stats.cercaSup)}
                className="px-2 py-0.5 rounded border border-rose-300 dark:border-rose-800/80 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 font-mono hover:bg-rose-100 transition"
                title="Ir para Cerca Superior"
              >
                Cerca Sup
              </button>
            </div>
          </div>

          {/* Barra de Range / Slider */}
          <div className="space-y-1">
            <input
              type="range"
              min={stats.cercaInf}
              max={stats.cercaSup}
              step={0.5}
              value={currentSweep}
              onChange={(e) => setSweepValue(parseFloat(e.target.value))}
              className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span>Cerca Inf: {stats.cercaInf} {currentPreset.unit}</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">Posição Atual: {currentSweep.toFixed(1)} {currentPreset.unit}</span>
              <span>Cerca Sup: {stats.cercaSup} {currentPreset.unit}</span>
            </div>
          </div>
        </div>

        {/* GRÁFICO SVG INTEGRADO */}
        <div className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto select-none"
            style={{ minWidth: '680px', maxHeight: '450px' }}
          >
            <defs>
              {/* Gradiente da área varrida */}
              <linearGradient id="sweepGradientTab2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.12" />
              </linearGradient>
            </defs>

            {/* Gridlines verticais */}
            {ticks.map((tick) => {
              const xPos = toX(tick);
              return (
                <g key={tick}>
                  <line
                    x1={xPos}
                    y1={padTop}
                    x2={xPos}
                    y2={height - padBottom}
                    stroke={isDark ? '#334155' : '#E2E8F0'}
                    strokeDasharray="4 4"
                  />
                  <line
                    x1={xPos}
                    y1={height - padBottom}
                    x2={xPos}
                    y2={height - padBottom + (classroomMode ? 8 : 6)}
                    stroke={isDark ? '#64748B' : '#94A3B8'}
                    strokeWidth={classroomMode ? 2 : 1}
                  />
                  <text
                    x={xPos}
                    y={height - padBottom + (classroomMode ? 24 : 20)}
                    textAnchor="middle"
                    className={`${classroomMode ? 'text-sm font-bold' : 'text-[11px]'} font-mono fill-slate-600 dark:fill-slate-300`}
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            {/* Eixo horizontal base */}
            <line
              x1={padLeft}
              y1={height - padBottom}
              x2={width - padRight}
              y2={height - padBottom}
              stroke={isDark ? '#475569' : '#CBD5E1'}
              strokeWidth={classroomMode ? '2.5' : '1.5'}
            />
            {/* TÍTULO NO EIXO DO GRÁFICO (SINCRONIZADO COM O TÍTULO PRINCIPAL) */}
            <text
              x={width / 2}
              y={height - (classroomMode ? 14 : 10)}
              textAnchor="middle"
              className={`${classroomMode ? 'text-sm font-bold' : 'text-xs font-medium'} fill-slate-700 dark:fill-slate-300`}
            >
              {currentPreset.title}
            </text>

            {/* Curva de Densidade Base (KDE total) */}
            <path
              d={kdePath}
              fill={isDark ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.08)'}
            />
            <path
              d={kdeStrokePath}
              fill="none"
              stroke="#94A3B8"
              strokeWidth={classroomMode ? '2.5' : '1.8'}
              strokeDasharray="2 2"
            />

            {/* ÁREA VARRIDA PELO SLIDER SOB A CURVA KDE */}
            {sweptKdePath && (
              <path
                d={sweptKdePath}
                fill="url(#sweepGradientTab2)"
                stroke="#4F46E5"
                strokeWidth={classroomMode ? '3.5' : '2.5'}
              />
            )}

            {/* LINHAS TRACEJADAS VERTICAIS: CERCAS E MARCOS CALCULADOS */}
            {/* 1. Cerca Inferior */}
            {stats.cercaInf >= minX && (
              <g>
                <line
                  x1={toX(stats.cercaInf)}
                  y1={padTop - 8}
                  x2={toX(stats.cercaInf)}
                  y2={height - padBottom}
                  stroke="#F59E0B"
                  strokeWidth={classroomMode ? '2.5' : '1.8'}
                  strokeDasharray="4 4"
                />
                <text
                  x={toX(stats.cercaInf) - 4}
                  y={padTop - 12}
                  textAnchor="end"
                  className={`${classroomMode ? 'text-xs font-black' : 'text-[10px] font-bold'} fill-amber-600 dark:fill-amber-400`}
                >
                  Cerca Inf ({stats.cercaInf})
                </text>
              </g>
            )}

            {/* 2. Mínimo Regular */}
            <g>
              <line
                x1={toX(stats.limInf)}
                y1={padTop + 4}
                x2={toX(stats.limInf)}
                y2={height - padBottom}
                stroke="#0D9488"
                strokeWidth={classroomMode ? '2.5' : '1.8'}
                strokeDasharray="4 4"
              />
              <text
                x={toX(stats.limInf)}
                y={padTop + 2}
                textAnchor="middle"
                className={`${classroomMode ? 'text-xs font-black' : 'text-[10px] font-bold'} fill-teal-600 dark:fill-teal-400`}
              >
                Mín ({stats.limInf})
              </text>
            </g>

            {/* 3. Primeiro Quartil Q1 */}
            <g>
              <line
                x1={toX(stats.q1)}
                y1={padTop - 8}
                x2={toX(stats.q1)}
                y2={height - padBottom}
                stroke="#2563EB"
                strokeWidth={classroomMode ? '2.5' : '1.8'}
                strokeDasharray="4 4"
              />
              <text
                x={toX(stats.q1)}
                y={padTop - 12}
                textAnchor="middle"
                className={`${classroomMode ? 'text-xs font-black' : 'text-[10px] font-bold'} fill-blue-600 dark:fill-blue-400`}
              >
                Q₁ ({stats.q1})
              </text>
            </g>

            {/* 4. Mediana Q2 */}
            <g>
              <line
                x1={toX(stats.q2)}
                y1={padTop - 20}
                x2={toX(stats.q2)}
                y2={height - padBottom}
                stroke="#9333EA"
                strokeWidth={classroomMode ? '3.5' : '2.4'}
                strokeDasharray="5 3"
              />
              <text
                x={toX(stats.q2)}
                y={padTop - 24}
                textAnchor="middle"
                className={`${classroomMode ? 'text-xs font-black' : 'text-[11px] font-bold'} fill-purple-600 dark:fill-purple-400`}
              >
                Mediana Q₂ ({stats.q2})
              </text>
            </g>

            {/* 5. Terceiro Quartil Q3 */}
            <g>
              <line
                x1={toX(stats.q3)}
                y1={padTop - 8}
                x2={toX(stats.q3)}
                y2={height - padBottom}
                stroke="#2563EB"
                strokeWidth={classroomMode ? '2.5' : '1.8'}
                strokeDasharray="4 4"
              />
              <text
                x={toX(stats.q3)}
                y={padTop - 12}
                textAnchor="middle"
                className={`${classroomMode ? 'text-xs font-black' : 'text-[10px] font-bold'} fill-blue-600 dark:fill-blue-400`}
              >
                Q₃ ({stats.q3})
              </text>
            </g>

            {/* 6. Máximo Regular */}
            <g>
              <line
                x1={toX(stats.limSup)}
                y1={padTop + 4}
                x2={toX(stats.limSup)}
                y2={height - padBottom}
                stroke="#0D9488"
                strokeWidth={classroomMode ? '2.5' : '1.8'}
                strokeDasharray="4 4"
              />
              <text
                x={toX(stats.limSup)}
                y={padTop + 2}
                textAnchor="middle"
                className={`${classroomMode ? 'text-xs font-black' : 'text-[10px] font-bold'} fill-teal-600 dark:fill-teal-400`}
              >
                Máx ({stats.limSup})
              </text>
            </g>

            {/* 7. Cerca Superior */}
            {stats.cercaSup <= maxX && (
              <g>
                <line
                  x1={toX(stats.cercaSup)}
                  y1={padTop - 8}
                  x2={toX(stats.cercaSup)}
                  y2={height - padBottom}
                  stroke="#E11D48"
                  strokeWidth={classroomMode ? '2.5' : '1.8'}
                  strokeDasharray="4 4"
                />
                <text
                  x={toX(stats.cercaSup) + 4}
                  y={padTop - 12}
                  className={`${classroomMode ? 'text-xs font-black' : 'text-[10px] font-bold'} fill-rose-600 dark:fill-rose-400`}
                >
                  Cerca Sup ({stats.cercaSup})
                </text>
              </g>
            )}

            {/* BOXPLOT HORIZONTAL */}
            {/* Haste inferior (whisker min regular até Q1) */}
            <line
              x1={toX(stats.limInf)}
              y1={boxCenterY}
              x2={toX(stats.q1)}
              y2={boxCenterY}
              stroke="#6366F1"
              strokeWidth={classroomMode ? '3.5' : '2.2'}
            />
            {/* T-bar inferior */}
            <line
              x1={toX(stats.limInf)}
              y1={boxCenterY - boxHeight / 3}
              x2={toX(stats.limInf)}
              y2={boxCenterY + boxHeight / 3}
              stroke="#6366F1"
              strokeWidth={classroomMode ? '3.5' : '2.2'}
            />

            {/* Haste superior (Q3 até whisker max regular) */}
            <line
              x1={toX(stats.q3)}
              y1={boxCenterY}
              x2={toX(stats.limSup)}
              y2={boxCenterY}
              stroke="#6366F1"
              strokeWidth={classroomMode ? '3.5' : '2.2'}
            />
            {/* T-bar superior */}
            <line
              x1={toX(stats.limSup)}
              y1={boxCenterY - boxHeight / 3}
              x2={toX(stats.limSup)}
              y2={boxCenterY + boxHeight / 3}
              stroke="#6366F1"
              strokeWidth={classroomMode ? '3.5' : '2.2'}
            />

            {/* Caixa IQR (Q1 a Q3) */}
            <rect
              x={toX(stats.q1)}
              y={boxCenterY - boxHeight / 2}
              width={Math.max(2, toX(stats.q3) - toX(stats.q1))}
              height={boxHeight}
              fill={isDark ? 'rgba(99, 102, 241, 0.28)' : 'rgba(79, 70, 229, 0.2)'}
              stroke="#6366F1"
              strokeWidth={classroomMode ? '3.5' : '2.2'}
              rx="4"
            />

            {/* Linha da Mediana Q2 no Boxplot */}
            <line
              x1={toX(stats.q2)}
              y1={boxCenterY - boxHeight / 2}
              x2={toX(stats.q2)}
              y2={boxCenterY + boxHeight / 2}
              stroke="#4338CA"
              strokeWidth={classroomMode ? '5' : '3.5'}
            />

            {/* CURSOR VERTICAL MÓVEL DA VARREDURA (SLIDER) */}
            <g>
              <line
                x1={toX(currentSweep)}
                y1={kdeTopY}
                x2={toX(currentSweep)}
                y2={boxCenterY + boxHeight / 2 + 8}
                stroke="#4F46E5"
                strokeWidth={classroomMode ? '3.5' : '2.5'}
              />
              {/* Marcador no eixo */}
              <circle
                cx={toX(currentSweep)}
                cy={boxCenterY}
                r={classroomMode ? 7 : 5}
                fill="#4F46E5"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              {/* Badge indicadora no topo da linha */}
              <rect
                x={toX(currentSweep) - 42}
                y={kdeTopY - 18}
                width="84"
                height="18"
                rx="4"
                fill="#4F46E5"
              />
              <text
                x={toX(currentSweep)}
                y={kdeTopY - 5}
                textAnchor="middle"
                className="text-[10px] font-mono font-bold fill-white"
              >
                {currentSweep.toFixed(1)} {currentPreset.unit}
              </text>
            </g>

            {/* Outliers (Diamantes Vermelhos) */}
            {stats.outliers.map((outlierVal, i) => {
              const cx = toX(outlierVal);
              const cy = boxCenterY;
              const isHovered = hoverVal === outlierVal;
              return (
                <g
                  key={i}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverVal(outlierVal)}
                  onMouseLeave={() => setHoverVal(null)}
                >
                  <polygon
                    points={`${cx},${cy - 8} ${cx + 8},${cy} ${cx},${cy + 8} ${cx - 8},${cy}`}
                    fill="#E11D48"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                  {isHovered && (
                    <g>
                      <rect
                        x={cx - 60}
                        y={cy - 36}
                        width="120"
                        height="24"
                        rx="5"
                        fill="#0F172A"
                        className="opacity-95"
                      />
                      <text
                        x={cx}
                        y={cy - 20}
                        textAnchor="middle"
                        className="text-[11px] fill-white font-semibold"
                      >
                        Outlier: {outlierVal} {currentPreset.unit}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* RETÂNGULOS DE INFORMAÇÃO (MÍNIMO, MÁXIMO, QUARTIS, IQR, CERCAS) - PROXIMIDADE IMEDIATA COM O GRÁFICO */}
        <div className="space-y-3 pt-2">
          {/* Fileira 1: Cinco Números de Tukey (Mínimo, Q1, Mediana Q2, Q3, Máximo) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
            {/* Mínimo Regular */}
            <div
              className={`p-3 rounded-xl border text-center transition-all ${
                currentSweep >= stats.limInf
                  ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/40 ring-1 ring-teal-500/50'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-center gap-1 text-xs text-teal-700 dark:text-teal-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span>Mínimo Regular</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono block mt-0.5">
                {stats.limInf} {currentPreset.unit}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Menor valor não atípico</span>
            </div>

            {/* Primeiro Quartil Q1 */}
            <div
              className={`p-3 rounded-xl border text-center transition-all ${
                currentSweep >= stats.q1
                  ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-blue-500/50'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-center gap-1 text-xs text-blue-700 dark:text-blue-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Q₁ (25%)</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono block mt-0.5">
                {stats.q1} {currentPreset.unit}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">25% das observações</span>
            </div>

            {/* Mediana Q2 */}
            <div
              className={`p-3 rounded-xl border text-center transition-all ${
                currentSweep >= stats.q2
                  ? 'border-purple-500 bg-purple-50/80 dark:bg-purple-950/50 ring-2 ring-purple-500/60 shadow-xs'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-center gap-1 text-xs text-purple-700 dark:text-purple-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
                <span>Mediana Q₂ (50%)</span>
              </div>
              <span className="text-xl sm:text-2xl font-extrabold text-purple-700 dark:text-purple-300 font-mono block mt-0.5">
                {stats.q2} {currentPreset.unit}
              </span>
              <span className="text-[10px] text-purple-600/80 dark:text-purple-400">Centro do rol (50%)</span>
            </div>

            {/* Terceiro Quartil Q3 */}
            <div
              className={`p-3 rounded-xl border text-center transition-all ${
                currentSweep >= stats.q3
                  ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-blue-500/50'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-center gap-1 text-xs text-blue-700 dark:text-blue-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Q₃ (75%)</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono block mt-0.5">
                {stats.q3} {currentPreset.unit}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">75% das observações</span>
            </div>

            {/* Máximo Regular */}
            <div
              className={`p-3 rounded-xl border text-center transition-all ${
                currentSweep >= stats.limSup
                  ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/40 ring-1 ring-teal-500/50'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-center gap-1 text-xs text-teal-700 dark:text-teal-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span>Máximo Regular</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono block mt-0.5">
                {stats.limSup} {currentPreset.unit}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Maior valor dentro da cerca</span>
            </div>
          </div>

          {/* Fileira 2: Parâmetros Complementares (IQR, Cerca Inferior, Cerca Superior, Outliers) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {/* IQR */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                Amplitude Interquartílica (IQR)
              </span>
              <span className="text-lg font-bold text-slate-800 dark:text-slate-100 font-mono">
                {stats.iqr} {currentPreset.unit}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Q₃ − Q₁ = {stats.q3} − {stats.q1}</span>
            </div>

            {/* Cerca Inferior */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-amber-200 dark:border-amber-900/50 shadow-2xs">
              <span className="text-xs text-amber-700 dark:text-amber-400 block font-medium">
                Cerca Inferior (Tukey)
              </span>
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono">
                {stats.cercaInf} {currentPreset.unit}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Q₁ − {customMultiplier} × IQR</span>
            </div>

            {/* Cerca Superior */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-rose-200 dark:border-rose-900/50 shadow-2xs">
              <span className="text-xs text-rose-700 dark:text-rose-400 block font-medium">
                Cerca Superior (Tukey)
              </span>
              <span className="text-lg font-bold text-rose-600 dark:text-rose-400 font-mono">
                {stats.cercaSup} {currentPreset.unit}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Q₃ + {customMultiplier} × IQR</span>
            </div>

            {/* Outliers Identificados */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                Outliers na Amostra
              </span>
              <span className="text-lg font-bold font-mono">
                {stats.outliers.length > 0 ? (
                  <span className="text-rose-600 dark:text-rose-400">{stats.outliers.join(', ')} {currentPreset.unit}</span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400">Nenhum</span>
                )}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                {stats.outliers.length} valor(es) além das cercas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SEÇÃO DE ANÁLISE DISCRETA: TABELA SIMPLES + SELETOR DE QUARTIS + MEMORIAL + OGIVA DEGRAU */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Tabela de Distribuição Simples de Frequências */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Tabela de Distribuição Simples
                </span>
              </div>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-medium">
                n = {stats.n} observações
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-100 dark:border-slate-700 rounded-xl">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3 text-left">Valor (<MathView math="x_i" />)</th>
                    <th className="py-2.5 px-3 text-right">Freq. Simples (<MathView math="f_i" />)</th>
                    <th className="py-2.5 px-3 text-right">Freq. Acum. (<MathView math="F_i" />)</th>
                    <th className="py-2.5 px-3 text-right">% Simples (<MathView math="f_i\%" />)</th>
                    <th className="py-2.5 px-3 text-right">% Acum. (<MathView math="F_i\%" />)</th>
                    <th className="py-2.5 px-2 text-center w-8">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-mono">
                  {discreteTable.map((row, idx) => {
                    const isSelectedQuartile = idx === targetRowIndex;
                    const isSwept = row.x <= currentSweep;
                    return (
                      <tr
                        key={idx}
                        className={`transition-colors cursor-pointer ${
                          isSelectedQuartile
                            ? 'bg-indigo-50 dark:bg-indigo-950/70 font-bold text-indigo-900 dark:text-indigo-200 border-l-4 border-l-indigo-600'
                            : isSwept
                            ? 'bg-slate-50/70 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/40 text-slate-700 dark:text-slate-300'
                        }`}
                        onClick={() => setSweepValue(row.x)}
                        title={`Clique para varrer até ${row.x} ${currentPreset.unit}`}
                      >
                        <td className="py-2 px-3 font-semibold">
                          {row.x} {currentPreset.unit}
                          {isSelectedQuartile && (
                            <span className="ml-2 inline-block px-1.5 py-0.2 text-[10px] rounded bg-indigo-600 text-white font-sans font-bold">
                              Q{selectedK}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right">{row.f}</td>
                        <td className="py-2 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400">{row.F}</td>
                        <td className="py-2 px-3 text-right text-slate-500 dark:text-slate-400">{row.fPorc.toFixed(1)}%</td>
                        <td className="py-2 px-3 text-right font-semibold">{row.porc.toFixed(1)}%</td>
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveByValue(row.x);
                            }}
                            className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                            title={`Remover 1 ocorrência de ${row.x}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Adicionar Nova Medição para Testes */}
          <form onSubmit={handleAddStudent} className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
              <span>Inserir Nova Observação na Amostra:</span>
              <span className="text-[10px] text-slate-400">ex: testar alteração na tabela</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newNome}
                onChange={(e) => setNewNome(e.target.value)}
                placeholder="Rótulo / Identificador"
                className="flex-1 px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <input
                type="number"
                value={newTempo}
                onChange={(e) => setNewTempo(e.target.value)}
                placeholder={currentPreset.unit}
                className="w-28 px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-mono bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>
          </form>
        </div>

        {/* Memória de Cálculo + Ogiva Escalonada (Degrau) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Card Memorial de Cálculo com Seletor de Quartis */}
          <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-700/80 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Localização da Separatriz Discreta</span>
              </h3>

              {/* Seletor de Quartil Q1, Q2, Q3, Q4 */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
                {[1, 2, 3, 4].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      setSelectedK(k);
                      // Sincronizar o sweep do gráfico contínuo com o valor
                      const posT = k * (stats.n / 4);
                      const rowIdx = discreteTable.findIndex((r) => r.F >= posT);
                      if (rowIdx !== -1 && discreteTable[rowIdx]) {
                        setSweepValue(discreteTable[rowIdx].x);
                      }
                    }}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                      selectedK === k
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    Q{k} ({(k * 25)}%)
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm space-y-3">
              <div>
                <strong className="text-slate-800 dark:text-slate-200">1. Posição Teórica Amostral:</strong>
                <div className="my-1.5 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center font-mono">
                  <MathView math={`\\text{Posição} = p \\cdot n = ${(pTarget).toFixed(2)} \\times ${stats.n} = ${posTarget.toFixed(2)}`} />
                </div>
              </div>
              <div>
                <strong className="text-slate-800 dark:text-slate-200">2. Condição Canônica de Varredura Discreta:</strong>
                <div className="my-1.5 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center font-mono">
                  <MathView math={`F_i \\ge ${posTarget.toFixed(2)} \\implies F = ${targetRow.F} \\quad (x_i = ${targetRow.x} \\text{ ${currentPreset.unit}})`} />
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Valor Identificado na Tabela:</span>
                <span className="font-mono text-base sm:text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                  <MathView math={`Q_${selectedK} = ${targetRow.x} \\text{ ${currentPreset.unit}}`} />
                </span>
              </div>
            </div>
          </div>

          {/* Gráfico SVG da Varredura Escalonada (Função Degrau / Ogiva de Frequências) */}
          <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Ogiva de Frequência Acumulada Escalonada (Função Degrau)
                </span>
              </div>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold font-mono">
                Degrau em <MathView math={`F = ${targetRow.F}`} />
              </span>
            </div>

            <div className="w-full overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40">
              <svg viewBox={`0 0 ${stepW} ${stepH}`} className="w-full h-auto select-none" style={{ minWidth: '460px' }}>
                {/* Linhas de grade horizontal para F */}
                {[0, Math.round(stats.n * 0.25), Math.round(stats.n * 0.5), Math.round(stats.n * 0.75), stats.n].map((fVal) => {
                  const yPos = toStepY(fVal);
                  return (
                    <g key={fVal}>
                      <line
                        x1={sPadLeft}
                        y1={yPos}
                        x2={stepW - sPadRight}
                        y2={yPos}
                        stroke={isDark ? '#334155' : '#E2E8F0'}
                        strokeDasharray="3 3"
                      />
                      <text
                        x={sPadLeft - 8}
                        y={yPos + 4}
                        textAnchor="end"
                        className="text-[10px] fill-slate-400 font-mono"
                      >
                        {fVal}
                      </text>
                    </g>
                  );
                })}

                {/* Eixo horizontal base */}
                <line
                  x1={sPadLeft}
                  y1={stepH - sPadBottom}
                  x2={stepW - sPadRight}
                  y2={stepH - sPadBottom}
                  stroke={isDark ? '#475569' : '#CBD5E1'}
                  strokeWidth="1.5"
                />

                {/* Linha alvo da posição teórica posTarget = p * n */}
                <line
                  x1={sPadLeft}
                  y1={toStepY(posTarget)}
                  x2={stepW - sPadRight}
                  y2={toStepY(posTarget)}
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <text
                  x={stepW - sPadRight - 5}
                  y={toStepY(posTarget) - 5}
                  textAnchor="end"
                  className="text-[10px] fill-amber-600 dark:fill-amber-400 font-bold font-mono"
                >
                  Posição Alvo: {posTarget.toFixed(2)}
                </text>

                {/* Degraus da Frequência Acumulada */}
                {discreteTable.map((row, idx) => {
                  const xPos = toStepX(idx);
                  const yPos = toStepY(row.F);
                  const isTarget = idx === targetRowIndex;
                  const isPast = idx <= targetRowIndex;
                  return (
                    <g
                      key={idx}
                      className="cursor-pointer"
                      onClick={() => {
                        setSweepValue(row.x);
                      }}
                    >
                      <rect
                        x={xPos - 12}
                        y={yPos}
                        width="24"
                        height={stepH - sPadBottom - yPos}
                        fill={
                          isTarget
                            ? isDark ? 'rgba(99, 102, 241, 0.85)' : 'rgba(79, 70, 229, 0.85)'
                            : isPast
                            ? isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.22)'
                            : isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(226, 232, 240, 0.6)'
                        }
                        stroke={isTarget ? '#4F46E5' : 'transparent'}
                        strokeWidth="2"
                        rx="3"
                      />
                      <text
                        x={xPos}
                        y={stepH - sPadBottom + 16}
                        textAnchor="middle"
                        className={`text-[9px] font-mono ${
                          isTarget ? 'fill-indigo-600 dark:fill-indigo-400 font-bold' : 'fill-slate-500'
                        }`}
                      >
                        {row.x}
                      </text>
                      {/* Rótulo do valor F sobre a barra */}
                      <text
                        x={xPos}
                        y={yPos - 4}
                        textAnchor="middle"
                        className={`text-[9px] font-mono font-bold ${
                          isTarget ? 'fill-indigo-600 dark:fill-indigo-400' : 'fill-slate-400'
                        }`}
                      >
                        {row.F}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
              A linha tracejada amarela indica a posição teórica (<MathView math={`p \\cdot n = ${posTarget.toFixed(2)}`} />). O primeiro degrau que atinge ou ultrapassa este patamar define o quartil discreto.
            </p>
          </div>
        </div>
      </div>

      {/* Nota Pedagógica PROFMAT */}
      <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl text-indigo-950 dark:text-indigo-200 text-xs sm:text-sm leading-relaxed space-y-2">
        <div className="font-bold flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          Por que NÃO se faz interpolação linear em variáveis discretas?
        </div>
        <p>
          Em tabelas simples de distribuição discreta, cada valor de <MathView math="x_i" /> representa uma realização pontual isolada. Interpolar linearmente criaria uma falsa continuidade entre valores que não existem na amostra real (como inferir &ldquo;22,7 minutos&rdquo; entre 20 e 25 min sem que haja suporte empírico contínuo). Portanto, a regra matemática canônica para variáveis discretas é rigorosamente a da <strong>primeira frequência acumulada que atinge ou supera a posição desejada</strong> (<MathView math="F_i \ge p \cdot n" />). O gráfico de densidade contínua no topo serve justamente como elemento didático de contraste para evidenciar a aproximação suave versus a realidade discreta em degraus.
        </p>
      </div>
    </div>
  );
};
