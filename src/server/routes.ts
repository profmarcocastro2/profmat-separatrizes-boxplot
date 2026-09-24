import { Router, Request, Response } from 'express';
import {
  computeTukeyAnalysis,
  computeKernelDensity,
  PRESET_DATASETS,
  generateLatexReport,
} from './statsService';

export const apiRouter = Router();

// GET /api/presets - Returns available preset datasets
apiRouter.get('/presets', (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: PRESET_DATASETS,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Falha ao recuperar conjuntos de dados predefinidos.',
    });
  }
});

// POST /api/stats/summary - Validates and computes statistical summary
apiRouter.post('/stats/summary', (req: Request, res: Response): void => {
  try {
    const { values, cFactor } = req.body;

    if (!Array.isArray(values)) {
      res.status(400).json({
        success: false,
        error: 'O parâmetro "values" deve ser um array numérico.',
      });
      return;
    }

    const numericValues = values
      .map((v) => Number(v))
      .filter((v) => !isNaN(v) && isFinite(v));

    if (numericValues.length < 3) {
      res.status(400).json({
        success: false,
        error: 'Forneça ao menos 3 valores numéricos válidos para o cálculo das separatrizes.',
      });
      return;
    }

    const factor = typeof cFactor === 'number' && cFactor > 0 ? cFactor : 1.5;
    const stats = computeTukeyAnalysis(numericValues, factor);
    const kde = computeKernelDensity(stats.sorted, 200);

    res.json({
      success: true,
      data: {
        stats,
        kde,
      },
    });
  } catch (error) {
    console.error('Erro no cálculo estatístico:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno ao processar a amostra estatística.',
    });
  }
});

// POST /api/export/latex - Generates LaTeX code for the report
apiRouter.post('/export/latex', (req: Request, res: Response): void => {
  try {
    const { values, title, cFactor } = req.body;

    if (!Array.isArray(values)) {
      res.status(400).json({
        success: false,
        error: 'Array de valores obrigatório.',
      });
      return;
    }

    const numericValues = values
      .map((v) => Number(v))
      .filter((v) => !isNaN(v) && isFinite(v));

    const stats = computeTukeyAnalysis(numericValues, cFactor || 1.5);
    const latex = generateLatexReport(stats, title || 'Análise Descritiva e Separatrizes');

    res.json({
      success: true,
      data: {
        latex,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao gerar o documento LaTeX.',
    });
  }
});
