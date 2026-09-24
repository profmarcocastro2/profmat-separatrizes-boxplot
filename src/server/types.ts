export interface StudentDataPoint {
  nome: string;
  tempo: number;
}

export interface TukeyStatsSummary {
  n: number;
  sorted: number[];
  q1: number;
  q2: number;
  q3: number;
  iqr: number;
  cercaInf: number;
  cercaSup: number;
  limInf: number;
  limSup: number;
  outliers: number[];
  regulares: number[];
  metadeInf: number[];
  metadeSup: number[];
  media: number;
  desvioPadrao: number;
  coefAssimetriaBowley: number;
}

export interface KdeData {
  x: number[];
  y: number[];
}

export interface PresetDataset {
  id: string;
  title: string;
  description: string;
  category: string;
  data: StudentDataPoint[];
}
