import React, { useState, useMemo } from 'react';
import { computeTukeyAnalysis, computeKernelDensity } from '../server/statsService';
import { MathView } from './MathView';
import { useTheme } from '../context/ThemeContext';
import {
  Download,
  RefreshCw,
  FileCode,
  Check,
  Sliders,
  CheckCircle2,
  GitCompare,
  Lightbulb,
  Table,
  TrendingUp,
  Scale,
  BookOpen,
  Layers,
  ArrowRight,
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

interface GroupedClass {
  classeId: number;
  rotulo: string;
  li: number;
  ls: number;
  xi: number;
  fi: number;
  Fi: number;
  fPorc: number;
  porc: number;
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
    tag: 'Caso Prático 01 · Variável Agrupada em Classes · Polo UERJ',
    title: 'Tempo de Deslocamento ao Polo (Minutos)',
    subtitle: 'Interpolação linear contínua em classes e confronto visual com a densidade e o rol original.',
    unit: 'min',
    students: DEFAULT_STUDENTS,
  },
  notas: {
    id: 'notas',
    selectLabel: 'Conjunto: Notas Avaliação (0-100)',
    tag: 'Caso Prático 02 · Desempenho Escolar',
    title: 'Notas de Avaliação (Pontos de 0 a 100)',
    subtitle: 'Distribuição agrupada por faixas de notas e análise da ogiva acumulada.',
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
    subtitle: 'Impacto de intervalos alargados na presença de outliers extremos.',
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
    subtitle: 'Comparativo onde o modelo contínuo agrupado coincide quase perfeitamente com o rol original.',
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

export const Tab3GroupedData: React.FC = () => {
  const { theme, classroomMode } = useTheme();
  const isDark = theme === 'dark';

  const [selectedPresetId, setSelectedPresetId] = useState<string>('uerj');
  const [students, setStudents] = useState<StudentItem[]>(DEFAULT_STUDENTS);
  const [selectedK, setSelectedK] = useState<number>(2); // Default Q2
  const [hoverVal, setHoverVal] = useState<number | null>(null);
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);
  const [customMultiplier] = useState<number>(1.5);
  const [sweepValue, setSweepValue] = useState<number | null>(null);

  const currentPreset = PRESETS[selectedPresetId] || PRESETS.uerj;
  const sampleNumbers = useMemo(() => students.map((s) => s.tempo), [students]);

  // Tukey statistics for the raw data
  const stats = useMemo(() => {
    return computeTukeyAnalysis(sampleNumbers, customMultiplier);
  }, [sampleNumbers, customMultiplier]);

  // KDE computation
  const kde = useMemo(() => computeKernelDensity(stats.sorted, 200, 0.4), [stats.sorted]);

  // Generate Grouped Classes according to dataset
  const { classesData, amplitudeH } = useMemo(() => {
    const n = stats.sorted.length;
    if (n === 0) return { classesData: [], amplitudeH: 1 };

    if (selectedPresetId === 'uerj') {
      const h = 40;
      const rawClasses = [
        { id: 1, li: 15, ls: 55 },
        { id: 2, li: 55, ls: 95 },
        { id: 3, li: 95, ls: 135 },
        { id: 4, li: 135, ls: 175 },
        { id: 5, li: 175, ls: 215 },
      ];
      let accum = 0;
      const list: GroupedClass[] = rawClasses.map((c) => {
        // Last interval is closed at both ends, others [li, ls)
        const fi = stats.sorted.filter((v) =>
          c.id === rawClasses.length ? v >= c.li && v <= c.ls : v >= c.li && v < c.ls
        ).length;
        accum += fi;
        return {
          classeId: c.id,
          rotulo: `${c.li} ⊢ ${c.ls}`,
          li: c.li,
          ls: c.ls,
          xi: (c.li + c.ls) / 2,
          fi,
          Fi: accum,
          fPorc: (fi / n) * 100,
          porc: (accum / n) * 100,
        };
      });
      return { classesData: list, amplitudeH: h };
    }

    if (selectedPresetId === 'notas') {
      const h = 15;
      const rawClasses = [
        { id: 1, li: 30, ls: 45 },
        { id: 2, li: 45, ls: 60 },
        { id: 3, li: 60, ls: 75 },
        { id: 4, li: 75, ls: 90 },
        { id: 5, li: 90, ls: 105 },
      ];
      let accum = 0;
      const list: GroupedClass[] = rawClasses.map((c) => {
        const fi = stats.sorted.filter((v) =>
          c.id === rawClasses.length ? v >= c.li && v <= c.ls : v >= c.li && v < c.ls
        ).length;
        accum += fi;
        return {
          classeId: c.id,
          rotulo: `${c.li} ⊢ ${c.ls}`,
          li: c.li,
          ls: c.ls,
          xi: (c.li + c.ls) / 2,
          fi,
          Fi: accum,
          fPorc: (fi / n) * 100,
          porc: (accum / n) * 100,
        };
      });
      return { classesData: list, amplitudeH: h };
    }

    if (selectedPresetId === 'salarios') {
      const h = 70;
      const rawClasses = [
        { id: 1, li: 0, ls: 70 },
        { id: 2, li: 70, ls: 140 },
        { id: 3, li: 140, ls: 210 },
        { id: 4, li: 210, ls: 280 },
        { id: 5, li: 280, ls: 350 },
      ];
      let accum = 0;
      const list: GroupedClass[] = rawClasses.map((c) => {
        const fi = stats.sorted.filter((v) =>
          c.id === rawClasses.length ? v >= c.li && v <= c.ls : v >= c.li && v < c.ls
        ).length;
        accum += fi;
        return {
          classeId: c.id,
          rotulo: `${c.li} ⊢ ${c.ls}`,
          li: c.li,
          ls: c.ls,
          xi: (c.li + c.ls) / 2,
          fi,
          Fi: accum,
          fPorc: (fi / n) * 100,
          porc: (accum / n) * 100,
        };
      });
      return { classesData: list, amplitudeH: h };
    }

    // Default: Simetrica or arbitrary
    const h = 25;
    const rawClasses = [
      { id: 1, li: 10, ls: 35 },
      { id: 2, li: 35, ls: 60 },
      { id: 3, li: 60, ls: 85 },
      { id: 4, li: 85, ls: 110 },
      { id: 5, li: 110, ls: 135 },
    ];
    let accum = 0;
    const list: GroupedClass[] = rawClasses.map((c) => {
      const fi = stats.sorted.filter((v) =>
        c.id === rawClasses.length ? v >= c.li && v <= c.ls : v >= c.li && v < c.ls
      ).length;
      accum += fi;
      return {
        classeId: c.id,
        rotulo: `${c.li} ⊢ ${c.ls}`,
        li: c.li,
        ls: c.ls,
        xi: (c.li + c.ls) / 2,
        fi,
        Fi: accum,
        fPorc: (fi / n) * 100,
        porc: (accum / n) * 100,
      };
    });
    return { classesData: list, amplitudeH: h };
  }, [stats.sorted, selectedPresetId]);

  // Linear Interpolation for Quartile Q_k
  const n = stats.n;
  const h = amplitudeH;
  const posDesejada = (selectedK * n) / 4;

  const classIndex = useMemo(() => {
    const idx = classesData.findIndex((c) => c.Fi >= posDesejada);
    return idx !== -1 ? idx : Math.max(0, classesData.length - 1);
  }, [classesData, posDesejada]);

  const classeQuartil = classesData[classIndex] || {
    classeId: 1,
    rotulo: '',
    li: 0,
    ls: 0,
    xi: 0,
    fi: 1,
    Fi: 1,
    fPorc: 0,
    porc: 0,
  };
  const fant = classIndex > 0 ? classesData[classIndex - 1].Fi : 0;
  const fclasse = classeQuartil.fi;
  const Lk = classeQuartil.li;

  // Interpolação linear contínua
  const valorInterpolado = useMemo(() => {
    if (fclasse <= 0) return Lk;
    return Lk + ((posDesejada - fant) / fclasse) * h;
  }, [Lk, posDesejada, fant, fclasse, h]);

  // Valor exato no rol ordenado para confronto didático
  const exatoRol = useMemo(() => {
    if (selectedPresetId === 'uerj') {
      const uerjExatos: Record<number, number> = {
        1: 22.5,
        2: 70,
        3: 90, // Posição 10ª no rol ou interpolação clássica
        4: 210,
      };
      return uerjExatos[selectedK] ?? 70;
    }
    if (selectedK === 1) return stats.q1;
    if (selectedK === 2) return stats.q2;
    if (selectedK === 3) return stats.q3;
    return stats.sorted[stats.sorted.length - 1] || 0;
  }, [selectedPresetId, selectedK, stats]);

  const erroAbs = Math.abs(valorInterpolado - exatoRol);
  const erroRelPct = exatoRol > 0 ? (erroAbs / exatoRol) * 100 : 0;

  // Clamped Sweep Value
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

  const handleReset = () => {
    setSelectedPresetId('uerj');
    setStudents(DEFAULT_STUDENTS);
    setSweepValue(null);
    setSelectedK(2);
  };

  const handleCopyLatex = () => {
    const text = `\\begin{table}[h!]
\\centering
\\begin{tabular}{lrrrrr}
\\toprule
Classe & Intervalo (${currentPreset.unit}) & $x_i$ & $f_i$ & $F_i$ & $F_i(\\%)$ \\\\
\\midrule
${classesData.map((r) => `${r.classeId}^a & [${r.li} \\vdash ${r.ls}) & ${r.xi} & ${r.fi} & ${r.Fi} & ${r.porc.toFixed(1)}\\%`).join(' \\\\\n')}
\\bottomrule
\\end{tabular}
\\caption{Tabela de Dados Agrupados em Classes - ${currentPreset.title}}
\\end{table}

% Interpolação Linear de Quartil (Q_${selectedK}):
% Posição Desejada: (${selectedK} * ${n}) / 4 = ${posDesejada.toFixed(2)}
% Classe Contendo o Quartil: ${classeQuartil.classeId}^a classe [${classeQuartil.li} \\vdash ${classeQuartil.ls})
% Fórmula: Q_${selectedK} = L_k + [ ( (k*n)/4 - F_{ant} ) / f_{classe} ] * h
% Q_${selectedK} = ${Lk} + [ ( ${posDesejada.toFixed(2)} - ${fant} ) / ${fclasse} ] * ${h} = ${valorInterpolado.toFixed(2)} ${currentPreset.unit}
% Confronto Didático com Rol Exato: ${exatoRol.toFixed(2)} ${currentPreset.unit} (Divergência: ${erroAbs.toFixed(2)} ${currentPreset.unit})`;

    navigator.clipboard.writeText(text);
    setCopiedStatus('latex');
    setTimeout(() => setCopiedStatus(null), 2500);
  };

  const handleExportCSV = () => {
    const csvContent =
      `data:text/csv;charset=utf-8,Classe,Limite_Inferior,Limite_Superior,Ponto_Medio,Freq_Simples,Freq_Acumulada,Percentual_Simples,Percentual_Acumulado\n` +
      classesData.map((r) => `${r.classeId},${r.li},${r.ls},${r.xi},${r.fi},${r.Fi},${r.fPorc.toFixed(2)}%,${r.porc.toFixed(2)}%`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `profmat_${selectedPresetId}_dados_agrupados.csv`);
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

  // Swept KDE path
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

  // Dimensions for Continuous Ogive Chart (Polígono de Frequências Acumuladas)
  const ogiveW = 540;
  const ogiveH = classroomMode ? 320 : 270;
  const oPadLeft = 50;
  const oPadRight = 35;
  const oPadTop = 30;
  const oPadBottom = 45;
  const oInnerW = ogiveW - oPadLeft - oPadRight;
  const oInnerH = ogiveH - oPadTop - oPadBottom;

  const oMinX = classesData.length > 0 ? classesData[0].li : 0;
  const oMaxX = classesData.length > 0 ? classesData[classesData.length - 1].ls : 100;

  const toOgiveX = (val: number) => {
    const ratio = (val - oMinX) / (oMaxX - oMinX);
    return oPadLeft + Math.max(0, Math.min(1, ratio)) * oInnerW;
  };
  const toOgiveY = (fAcum: number) => {
    if (stats.n === 0) return ogiveH - oPadBottom;
    return ogiveH - oPadBottom - (fAcum / stats.n) * oInnerH;
  };

  // Build Ogive points: starts at (classesData[0].li, 0), then (ls, Fi)
  const ogivePoints = useMemo(() => {
    if (classesData.length === 0) return [];
    const pts = [{ x: classesData[0].li, y: 0 }];
    classesData.forEach((c) => {
      pts.push({ x: c.ls, y: c.Fi });
    });
    return pts;
  }, [classesData]);

  const ogivePolylineStr = useMemo(() => {
    return ogivePoints.map((p) => `${toOgiveX(p.x)},${toOgiveY(p.y)}`).join(' ');
  }, [ogivePoints, oMinX, oMaxX, stats.n]);

  return (
    <div className={`space-y-6 ${classroomMode ? 'text-base' : 'text-sm'}`}>
      {/* Header Info & Actions */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            <span>{currentPreset.tag}</span>
            <span aria-hidden="true">·</span>
            <span>Interpolação Linear de Ogiva</span>
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
            title="Copiar tabela e interpolação em LaTeX"
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
              <linearGradient id="sweepGradientTab3" x1="0" y1="0" x2="0" y2="1">
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

            {/* Faixas de classes no fundo do gráfico de densidade */}
            {classesData.map((c, idx) => {
              const x1 = toX(c.li);
              const x2 = toX(c.ls);
              const isQuartilClass = idx === classIndex;
              return (
                <g key={c.classeId}>
                  <rect
                    x={x1}
                    y={kdeBottomY}
                    width={Math.max(0, x2 - x1)}
                    height={height - padBottom - kdeBottomY}
                    fill={isQuartilClass ? (isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)') : 'transparent'}
                    stroke={isDark ? '#334155' : '#E2E8F0'}
                    strokeWidth="1"
                  />
                  <line
                    x1={x1}
                    y1={kdeBottomY}
                    x2={x1}
                    y2={height - padBottom}
                    stroke={isDark ? '#475569' : '#CBD5E1'}
                    strokeDasharray="2 2"
                  />
                </g>
              );
            })}

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
                fill="url(#sweepGradientTab3)"
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
          {/* Fileira 1: Cinco Números de Tukey */}
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
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Menor valor regular</span>
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
              <span className="text-[10px] text-purple-600/80 dark:text-purple-400">Centro do conjunto (50%)</span>
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
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Maior valor regular</span>
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
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Q₁ − 1.5 × IQR</span>
            </div>

            {/* Cerca Superior */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-rose-200 dark:border-rose-900/50 shadow-2xs">
              <span className="text-xs text-rose-700 dark:text-rose-400 block font-medium">
                Cerca Superior (Tukey)
              </span>
              <span className="text-lg font-bold text-rose-600 dark:text-rose-400 font-mono">
                {stats.cercaSup} {currentPreset.unit}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Q₃ + 1.5 × IQR</span>
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

      {/* 2. SEÇÃO DE ANÁLISE EM CLASSES: TABELA DE INTERVALOS + MEMORIAL + OGIVA DE GALTON */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Tabela de Classes */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Tabela de Intervalos de Classe (<MathView math={`h = ${h}`} /> {currentPreset.unit})
                </span>
              </div>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-medium">
                n = {n} observações
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-100 dark:border-slate-700 rounded-xl">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3 text-left">Classe</th>
                    <th className="py-2.5 px-3 text-left">Intervalo [{currentPreset.unit})</th>
                    <th className="py-2.5 px-3 text-center">Ponto Médio (<MathView math="x_i" />)</th>
                    <th className="py-2.5 px-3 text-right">Freq. Simples (<MathView math="f_i" />)</th>
                    <th className="py-2.5 px-3 text-right">Freq. Acum. (<MathView math="F_i" />)</th>
                    <th className="py-2.5 px-3 text-right">% Acum. (<MathView math="F_i\%" />)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-mono">
                  {classesData.map((c, idx) => {
                    const isSelected = idx === classIndex;
                    return (
                      <tr
                        key={c.classeId}
                        onClick={() => {
                          // Ajustar sweep para o ponto médio da classe
                          setSweepValue(c.xi);
                        }}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50/90 dark:bg-indigo-950/70 font-bold text-indigo-900 dark:text-indigo-200 border-l-4 border-l-indigo-600'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/40 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center gap-1">
                            {c.classeId}ª
                            {isSelected && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-600 text-white font-bold inline-flex items-center">
                                <MathView math={`Q_${selectedK}`} />
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold">{c.rotulo}</td>
                        <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400">{c.xi}</td>
                        <td className="py-2.5 px-3 text-right">{c.fi}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400">{c.Fi}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{c.porc.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Destaque dos Parâmetros da Classe Selecionada */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Limite Inf. (<MathView math="L_k" />)</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{Lk} {currentPreset.unit}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Freq. Ant. (<MathView math="F_{\text{ant}}" />)</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{fant}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Freq. Classe (<MathView math="f_{\text{classe}}" />)</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{fclasse}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Amplitude (<MathView math="h" />)</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{h} {currentPreset.unit}</span>
            </div>
          </div>
        </div>

        {/* Lado Direito: Seletor de Quartil + Memorial de Cálculo + Ogiva Contínua */}
        <div className="lg:col-span-6 space-y-4">
          {/* Card do Cálculo de Interpolação */}
          <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-700/80 pb-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Interpolação Linear de Separatriz (<MathView math={`Q_${selectedK}`} />)</span>
              </h3>

              {/* Botões Seletor de Quartil */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-lg border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
                {[1, 2, 3, 4].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      setSelectedK(k);
                      // Sincronizar o sweep do gráfico contínuo com o valor interpolado
                      const targetPos = (k * n) / 4;
                      const idx = classesData.findIndex((c) => c.Fi >= targetPos);
                      if (idx !== -1) {
                        const cl = classesData[idx];
                        const prevF = idx > 0 ? classesData[idx - 1].Fi : 0;
                        const interp = cl.fi > 0 ? cl.li + ((targetPos - prevF) / cl.fi) * h : cl.li;
                        setSweepValue(interp);
                      }
                    }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                      selectedK === k
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <span className="inline-flex items-center gap-1">
                      <MathView math={`Q_${k}`} />
                      <span>({k * 25}%)</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Memorial Analítico */}
            <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center font-mono">
                <MathView
                  math={`Q_${selectedK} = L_k + \\left( \\frac{\\frac{${selectedK} \\cdot n}{4} - F_{\\text{ant}}}{f_{\\text{classe}}} \\right) \\cdot h`}
                  block
                />
              </div>

              <div className="space-y-1.5 pl-1">
                <div>
                  • <strong>Posição alvo:</strong>{' '}
                  <span className="font-mono font-semibold">
                    ({selectedK} × {n}) / 4 = {posDesejada.toFixed(2)}
                  </span>{' '}
                  <span className="text-slate-500 dark:text-slate-400">
                    (localizada na {classeQuartil.classeId}ª classe [{classeQuartil.li} ⊢ {classeQuartil.ls}))
                  </span>
                </div>
                <div>
                  • <strong>Substituição numérica:</strong>
                  <div className="my-1.5 py-1.5 px-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-center font-mono border border-slate-200 dark:border-slate-700/60">
                    <MathView
                      math={`Q_${selectedK} = ${Lk} + \\left( \\frac{${posDesejada.toFixed(2)} - ${fant}}{${fclasse}} \\right) \\cdot ${h}`}
                      block
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Resultado Interpolado:</span>
                <span className="font-mono text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                  <MathView math={`Q_${selectedK} \\approx ${valorInterpolado.toFixed(2)} \\text{ ${currentPreset.unit}}`} />
                </span>
              </div>
            </div>
          </div>

          {/* Gráfico da Ogiva de Galton (Polígono de Frequências Acumuladas) */}
          <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  Ogiva Contínua de Galton & Ponto de Interpolação
                </h4>
              </div>
              <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                F({valorInterpolado.toFixed(1)}) = {posDesejada.toFixed(2)}
              </span>
            </div>

            <div className="w-full overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40">
              <svg viewBox={`0 0 ${ogiveW} ${ogiveH}`} className="w-full h-auto select-none" style={{ minWidth: '420px' }}>
                {/* Linhas de grade horizontal (porcentagens) */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                  const yVal = pct * n;
                  const yPos = toOgiveY(yVal);
                  return (
                    <g key={pct}>
                      <line
                        x1={oPadLeft}
                        y1={yPos}
                        x2={ogiveW - oPadRight}
                        y2={yPos}
                        stroke={isDark ? '#334155' : '#E2E8F0'}
                        strokeDasharray="3 3"
                      />
                      <text
                        x={oPadLeft - 8}
                        y={yPos + 4}
                        textAnchor="end"
                        className="text-[10px] font-mono fill-slate-400"
                      >
                        {yVal.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* Eixos */}
                <line
                  x1={oPadLeft}
                  y1={ogiveH - oPadBottom}
                  x2={ogiveW - oPadRight}
                  y2={ogiveH - oPadBottom}
                  stroke={isDark ? '#475569' : '#CBD5E1'}
                  strokeWidth="1.5"
                />
                <line
                  x1={oPadLeft}
                  y1={oPadTop}
                  x2={oPadLeft}
                  y2={ogiveH - oPadBottom}
                  stroke={isDark ? '#475569' : '#CBD5E1'}
                  strokeWidth="1.5"
                />

                {/* Eixo X labels das classes */}
                {ogivePoints.map((p, i) => (
                  <g key={i}>
                    <line
                      x1={toOgiveX(p.x)}
                      y1={ogiveH - oPadBottom}
                      x2={toOgiveX(p.x)}
                      y2={ogiveH - oPadBottom + 5}
                      stroke={isDark ? '#64748B' : '#94A3B8'}
                    />
                    <text
                      x={toOgiveX(p.x)}
                      y={ogiveH - oPadBottom + 16}
                      textAnchor="middle"
                      className="text-[10px] font-mono fill-slate-500 dark:fill-slate-400"
                    >
                      {p.x}
                    </text>
                  </g>
                ))}

                {/* Polígono da Ogiva */}
                <polyline
                  points={ogivePolylineStr}
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth="2.5"
                />

                {/* Pontos nas junções das classes */}
                {ogivePoints.map((p, i) => (
                  <circle
                    key={i}
                    cx={toOgiveX(p.x)}
                    cy={toOgiveY(p.y)}
                    r="4"
                    fill="#4F46E5"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                ))}

                {/* Linha horizontal tracejada para o alvo: y = posDesejada */}
                <line
                  x1={oPadLeft}
                  y1={toOgiveY(posDesejada)}
                  x2={toOgiveX(valorInterpolado)}
                  y2={toOgiveY(posDesejada)}
                  stroke="#9333EA"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />

                {/* Linha vertical tracejada descendo para x = valorInterpolado */}
                <line
                  x1={toOgiveX(valorInterpolado)}
                  y1={toOgiveY(posDesejada)}
                  x2={toOgiveX(valorInterpolado)}
                  y2={ogiveH - oPadBottom}
                  stroke="#9333EA"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />

                {/* Ponto de interseção interpolado */}
                <circle
                  cx={toOgiveX(valorInterpolado)}
                  cy={toOgiveY(posDesejada)}
                  r="6"
                  fill="#9333EA"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />

                {/* Rótulo no eixo X do valor interpolado */}
                <rect
                  x={toOgiveX(valorInterpolado) - 28}
                  y={ogiveH - oPadBottom + 22}
                  width="56"
                  height="16"
                  rx="3"
                  fill="#9333EA"
                />
                <text
                  x={toOgiveX(valorInterpolado)}
                  y={ogiveH - oPadBottom + 34}
                  textAnchor="middle"
                  className="text-[9px] font-mono font-bold fill-white"
                >
                  {valorInterpolado.toFixed(1)} {currentPreset.unit}
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 3. QUADRO CONFRONTO DIDÁTICO DESTACADO AO FINAL DA TELA */}
      <div className="bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/80 dark:from-slate-800/95 dark:via-slate-800/90 dark:to-indigo-950/40 p-6 sm:p-8 rounded-3xl border-2 border-indigo-200 dark:border-indigo-800/80 shadow-md space-y-6">
        {/* Cabeçalho do Confronto Didático com Badges e Título Nobre */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-indigo-100 dark:border-slate-700/80 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5" />
              <span>Síntese Epistemológica & Confronto Didático</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
              <GitCompare className="w-6 h-6 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>Confronto Didático: Rol Ordenado vs. Classes Agrupadas</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Comparação metodológica entre a posição real discreta no rol original e a hipótese de distribuição contínua uniforme intraclasse para{' '}
              <strong className="text-indigo-600 dark:text-indigo-400 font-semibold inline-flex items-center gap-1">
                <MathView math={`Q_${selectedK}`} /> ({selectedK * 25}%)
              </strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto shrink-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-indigo-100 dark:border-slate-700/80 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Quartil em Análise:</span>
            </div>
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-purple-600 text-white font-mono font-bold text-sm shadow-xs whitespace-nowrap shrink-0">
              <span className="inline-flex items-center text-sm font-bold text-white tracking-tight">
                <MathView math={`Q_${selectedK}`} />
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-purple-200 shrink-0 mx-0.5" />
              <span className="font-mono font-bold text-sm tracking-tight inline-flex items-baseline gap-1">
                <span>{valorInterpolado.toFixed(2)}</span>
                <span className="font-sans text-xs font-normal text-purple-200">{currentPreset.unit}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Três Cards Comparativos Centrais (Exato vs. Interpolado vs. Divergência) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Valor Exato (Rol) */}
          <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                <span>Valor Exato (Rol)</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-[10px]">Real</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono mt-1">
                {exatoRol.toFixed(1)}{' '}
                <span className="text-sm font-normal text-slate-500 dark:text-slate-400">{currentPreset.unit}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              Posição real calculada sobre a amostra pontual individual ({stats.n} observações).
            </p>
          </div>

          {/* Card 2: Valor Interpolado (Classes) */}
          <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border-2 border-indigo-500/40 dark:border-indigo-500/60 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                <span>Valor Interpolado (Classes)</span>
                <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 font-mono text-[10px] text-indigo-700 dark:text-indigo-300 font-bold">
                  Linear
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono mt-1">
                {valorInterpolado.toFixed(2)}{' '}
                <span className="text-sm font-normal text-indigo-400">{currentPreset.unit}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              Interpolação linear de ogiva na {classeQuartil.classeId}ª classe [{classeQuartil.li} ⊢ {classeQuartil.ls}).
            </p>
          </div>

          {/* Card 3: Divergência Amostral */}
          <div
            className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between ${
              erroAbs === 0
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className={erroAbs === 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}>
                  Divergência Amostral (Δ)
                </span>
                <span
                  className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                    erroAbs === 0
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                  }`}
                >
                  {erroRelPct.toFixed(1)}% desvio
                </span>
              </div>
              <div
                className={`text-2xl sm:text-3xl font-extrabold font-mono mt-1 ${
                  erroAbs === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {erroAbs.toFixed(2)}{' '}
                <span className="text-sm font-normal text-slate-500 dark:text-slate-400">{currentPreset.unit}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-3 pt-3 border-t border-amber-200/60 dark:border-amber-900/60">
              <MathView math="|V_{\text{interp}} - V_{\text{exato}}|" /> decorrente da discretização em faixas.
            </p>
          </div>
        </div>

        {/* Barra Visual Comparativa dos Dois Valores no Eixo da Classe */}
        <div className="bg-white dark:bg-slate-800/90 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Visualização Comparativa da Discrepância na {classeQuartil.classeId}ª Classe:</span>
            </span>
            <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
              Faixa [{classeQuartil.li}, {classeQuartil.ls}] {currentPreset.unit}
            </span>
          </div>

          <div className="relative pt-6 pb-4">
            {/* Linha do Intervalo da Classe */}
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full" />

            {/* Marcador do Valor Exato */}
            {classeQuartil.ls > classeQuartil.li && (
              <>
                <div
                  className="absolute top-1 transform -translate-x-1/2 flex flex-col items-center"
                  style={{
                    left: `${Math.min(100, Math.max(0, ((exatoRol - classeQuartil.li) / (classeQuartil.ls - classeQuartil.li)) * 100))}%`,
                  }}
                >
                  <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded shadow-2xs whitespace-nowrap">
                    Exato: {exatoRol.toFixed(1)}
                  </span>
                  <div className="w-3 h-3 rounded-full bg-slate-800 dark:bg-slate-200 border-2 border-white dark:border-slate-900 mt-0.5" />
                </div>

                {/* Marcador do Valor Interpolado */}
                <div
                  className="absolute top-1 transform -translate-x-1/2 flex flex-col items-center"
                  style={{
                    left: `${Math.min(100, Math.max(0, ((valorInterpolado - classeQuartil.li) / (classeQuartil.ls - classeQuartil.li)) * 100))}%`,
                  }}
                >
                  <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/80 px-1.5 py-0.5 rounded shadow-2xs whitespace-nowrap">
                    Interp: {valorInterpolado.toFixed(1)}
                  </span>
                  <div className="w-3 h-3 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-900 mt-0.5" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quadro Epistemológico Detalhado para o Professor e Aluno PROFMAT */}
        <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 p-4 sm:p-5 rounded-2xl flex items-start gap-3.5">
          <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <h5 className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Fundamentação Teórica: Por que ocorre a divergência de {erroAbs.toFixed(2)} {currentPreset.unit}?</span>
            </h5>
            <p>
              A fórmula tradicional de interpolação linear contínua em classes assume a <strong>hipótese da distribuição uniforme (retangular)</strong> das observações dentro de cada intervalo. Na prática escolar ou em amostras reais (como a turma do Polo UERJ), as observações frequentemente se concentram assimetricamente nas bordas do intervalo ou em valores específicos (ex: tempos 56, 70, 80, 90, 90 na classe [55 ⊢ 95)).
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              <strong>Nota Pedagógica PROFMAT:</strong> A comparação entre o gráfico da densidade empírica contínua e a ogiva demonstra aos estudantes que a interpolação em classes é uma aproximação prática, cuja precisão varia conforme a amplitude da classe (<MathView math="h" />) e a uniformidade interna dos dados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
