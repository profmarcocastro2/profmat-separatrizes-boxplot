/**
 * Statistical calculations replicating scipy.stats and Tukey's method
 */

export function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) {
    return sorted[mid];
  }
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

export function standardDeviation(arr: number[]): number {
  if (arr.length <= 1) return 1;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance) || 1;
}

export interface TukeySummary {
  n: number;
  sorted: number[];
  q2: number;
  q1: number;
  q3: number;
  iqr: number;
  cercaInf: number;
  cercaSup: number;
  outliers: number[];
  regulares: number[];
  limInf: number;
  limSup: number;
  metadeInf: number[];
  metadeSup: number[];
}

export function computeTukeySummary(dados: number[]): TukeySummary {
  const sorted = [...dados].sort((a, b) => a - b);
  const n = sorted.length;
  if (n === 0) {
    return {
      n: 0,
      sorted: [],
      q2: 0,
      q1: 0,
      q3: 0,
      iqr: 0,
      cercaInf: 0,
      cercaSup: 0,
      outliers: [],
      regulares: [],
      limInf: 0,
      limSup: 0,
      metadeInf: [],
      metadeSup: [],
    };
  }

  const q2 = median(sorted);
  const metadeInf = n % 2 !== 0 ? sorted.filter((x) => x < q2) : sorted.slice(0, Math.floor(n / 2));
  const metadeSup = n % 2 !== 0 ? sorted.filter((x) => x > q2) : sorted.slice(Math.floor(n / 2));

  const q1 = metadeInf.length > 0 ? median(metadeInf) : q2;
  const q3 = metadeSup.length > 0 ? median(metadeSup) : q2;
  const iqr = q3 - q1;

  const cercaInf = q1 - 1.5 * iqr;
  const cercaSup = q3 + 1.5 * iqr;

  const outliers = sorted.filter((x) => x < cercaInf || x > cercaSup);
  const regulares = sorted.filter((x) => x >= cercaInf && x <= cercaSup);
  const limInf = regulares.length > 0 ? Math.min(...regulares) : Math.min(...sorted);
  const limSup = regulares.length > 0 ? Math.max(...regulares) : Math.max(...sorted);

  return {
    n,
    sorted,
    q2,
    q1,
    q3,
    iqr,
    cercaInf,
    cercaSup,
    outliers,
    regulares,
    limInf,
    limSup,
    metadeInf,
    metadeSup,
  };
}

/**
 * Gaussian Kernel Density Estimation (matching scipy.stats.gaussian_kde with bw_method=0.4)
 */
export function computeKDE(
  data: number[],
  pointsCount: number = 200,
  paddingPercent: number = 0.15,
  bwFactor: number = 0.4
): { x: number[]; y: number[] } {
  if (data.length === 0) return { x: [], y: [] };
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal || 10;
  const start = minVal - range * paddingPercent;
  const end = maxVal + range * paddingPercent;

  const step = (end - start) / (pointsCount - 1);
  const xs: number[] = [];
  for (let i = 0; i < pointsCount; i++) {
    xs.push(start + i * step);
  }

  const std = standardDeviation(data);
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

/**
 * Standard Normal PDF phi(z)
 */
export function normalPdf(z: number): number {
  return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z);
}

/**
 * Error function approximation
 */
export function erf(x: number): number {
  // Abramowitz and Stegun formula 7.1.26
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);

  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

  return sign * y;
}

/**
 * Standard Normal Cumulative Distribution Function (CDF) Phi(z)
 */
export function normalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}
