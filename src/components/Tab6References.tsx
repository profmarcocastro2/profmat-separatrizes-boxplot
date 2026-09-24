import React, { useState } from 'react';
import { BookMarked, ShieldCheck, Copy, Check, FileCode, GraduationCap, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const Tab6References: React.FC = () => {
  const { classroomMode } = useTheme();
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Referências completas em ordem alfabética estrita segundo a ABNT NBR 6023:2018
  const abntText = `BARBETTA, Pedro Alberto. Estatística aplicada às ciências sociais. 8. ed. Florianópolis: Editora da UFSC, 2012.

BOWLEY, Arthur Lyon. Elements of statistics. London: P. S. King & Son, 1901.

BUSSAB, Wilton de Oliveira; MORETTIN, Pedro Alberto. Estatística básica. 9. ed. São Paulo: Saraiva, 2017.

HOAGLIN, David C.; IGLEWICZ, Boris; TUKEY, John W. Performance of alternative principles of the rule for identification of outliers. Journal of the American Statistical Association, v. 81, n. 396, p. 991-999, 1986. DOI: https://doi.org/10.1080/01621459.1986.10478363.

MORGADO, Augusto César de Oliveira et al. Análise combinatória e probabilidade. 10. ed. Rio de Janeiro: SBM, 2016. (Coleção do Professor de Matemática).

PEARSON, Karl. Contributions to the mathematical theory of evolution: II. Skew variation in homogeneous material. Philosophical Transactions of the Royal Society of London A, v. 186, p. 343-414, 1895. DOI: https://doi.org/10.1098/rsta.1895.0010.

PROVENZA, Marcello Montillo. Probabilidade e Estatística: notas de aula. Rio de Janeiro: Universidade do Estado do Rio de Janeiro (UERJ) / PROFMAT, 2026. 6 fascículos em PDF. Material didático de circulação interna.

TUKEY, John Wilder. Exploratory data analysis. Reading, MA: Addison-Wesley, 1977.`;

  // Entradas em formato BibTeX padrão para Overleaf / LaTeX (PROFMAT)
  const bibtexText = `@book{barbetta2012,
  title     = {Estatística aplicada às ciências sociais},
  author    = {Barbetta, Pedro Alberto},
  edition   = {8},
  year      = {2012},
  publisher = {Editora da UFSC},
  address   = {Florianópolis}
}

@book{bowley1901,
  title     = {Elements of Statistics},
  author    = {Bowley, Arthur Lyon},
  year      = {1901},
  publisher = {P. S. King & Son},
  address   = {London}
}

@book{bussab2017,
  title     = {Estatística Básica},
  author    = {Bussab, Wilton de Oliveira and Morettin, Pedro Alberto},
  edition   = {9},
  year      = {2017},
  publisher = {Saraiva},
  address   = {São Paulo}
}

@article{hoaglin1986,
  title     = {Performance of Alternative Principles of the Rule for Identification of Outliers},
  author    = {Hoaglin, David C. and Iglewicz, Boris and Tukey, John W.},
  journal   = {Journal of the American Statistical Association},
  volume    = {81},
  number    = {396},
  pages     = {991--999},
  year      = {1986},
  doi       = {10.1080/01621459.1986.10478363}
}

@book{morgado2016,
  title     = {Análise Combinatória e Probabilidade},
  author    = {Morgado, Augusto César de Oliveira and Carvalho, Paulo Cezar Pinto and Pinto, Pedro Castelo Branco and Fernandez, Pedro},
  edition   = {10},
  series    = {Coleção do Professor de Matemática},
  year      = {2016},
  publisher = {Sociedade Brasileira de Matemática (SBM)},
  address   = {Rio de Janeiro}
}

@article{pearson1895,
  title     = {Contributions to the Mathematical Theory of Evolution: II. Skew Variation in Homogeneous Material},
  author    = {Pearson, Karl},
  journal   = {Philosophical Transactions of the Royal Society of London A},
  volume    = {186},
  pages     = {343--414},
  year      = {1895},
  doi       = {10.1098/rsta.1895.0010}
}

@misc{provenza2026,
  title        = {Probabilidade e Estatística: notas de aula},
  author       = {Provenza, Marcello Montillo},
  year         = {2026},
  howpublished = {6 fascículos em PDF, Universidade do Estado do Rio de Janeiro (UERJ) / PROFMAT},
  address      = {Rio de Janeiro},
  note         = {Material didático de circulação interna}
}

@book{tukey1977,
  title     = {Exploratory Data Analysis},
  author    = {Tukey, John Wilder},
  year      = {1977},
  publisher = {Addison-Wesley},
  address   = {Reading, MA}
}`;

  const produtoEducacionalText = `CASTRO, Marco et al. Medidas Separatrizes, Boxplot e Fator 1.5 de Tukey: aplicativo educacional interativo e comparativo para o ensino de estatística. Rio de Janeiro: Universidade do Estado do Rio de Janeiro (UERJ) / PROFMAT, 2026. Recurso Educacional Aberto (REA). Disponível em: https://ais-dev-g4k6omc4muxv4pduaq4pqw-38769255869.us-east1.run.app. Acesso em: 23 set. 2026.`;

  const capesText = `DECLARAÇÃO DE USO DE FERRAMENTAS DE INTELIGÊNCIA ARTIFICIAL GENERATIVA
(Em estrita conformidade com as Diretrizes de Integridade Científica da CAPES e alinhada ao Art. 9º da Portaria CNPq nº 2.664/2026)

Trabalho / Produto Educacional: Medidas Separatrizes, Boxplot e Fator 1.5 de Tukey
Programa: Mestrado Profissional em Matemática em Rede Nacional (PROFMAT)
Instituição Associada: Universidade do Estado do Rio de Janeiro (UERJ)

Declaro que utilizei a ferramenta de Inteligência Artificial Generativa Google Gemini exclusivamente como apoio instrumental para:
1. Concepção didática da interface visual e organização do tempo pedagógico de apresentação;
2. Geração de templates computacionais em TypeScript/React e estruturação de código SVG vetorial;
3. Diagramação e formatação em sintaxe LaTeX/KaTeX das deduções analíticas integrais.

Declaro que a concepção pedagógica, a escolha dos dados da turma real, a curadoria do problema matemático, a verificação dos cálculos numéricos e as interpretações estatísticas foram integralmente coordenadas, revisadas e validadas pelo autor humano, que assume responsabilidade científica, ética e autoral plena pelo trabalho.`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <div className={`space-y-6 ${classroomMode ? 'text-base' : 'text-sm'}`}>
      {/* Cabeçalho da Aba */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Seção Acadêmica 06</span>
          <span aria-hidden="true">·</span>
          <span>ABNT NBR 6023:2018</span>
          <span aria-hidden="true">·</span>
          <span>Integridade CAPES/CNPq</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
          Fundamentação Bibliográfica e Transparência Acadêmica
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
          Arcabouço teórico de referência no PROFMAT, exportações normatizadas e declaração formal de integridade científica.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800/90 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        
        {/* 1. SEÇÃO DE REFERÊNCIAS BIBLIOGRÁFICAS (ORDEM ALFABÉTICA ESTRITA) */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Referências Bibliográficas (ABNT NBR 6023:2018)</span>
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(bibtexText, 'bibtex')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition"
                title="Copiar todas as entradas em formato BibTeX para Overleaf/LaTeX"
              >
                {copiedType === 'bibtex' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <FileCode className="w-3.5 h-3.5 text-indigo-500" />}
                <span>{copiedType === 'bibtex' ? 'BibTeX Copiado!' : 'Copiar BibTeX (.bib)'}</span>
              </button>
              <button
                onClick={() => copyToClipboard(abntText, 'abnt')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-lg transition"
                title="Copiar lista formatada em texto ABNT"
              >
                {copiedType === 'abnt' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedType === 'abnt' ? 'ABNT Copiada!' : 'Copiar ABNT'}</span>
              </button>
            </div>
          </div>

          <ul className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 pl-3 border-l-2 border-indigo-500/60">
            <li>
              BARBETTA, Pedro Alberto. <strong>Estatística aplicada às ciências sociais</strong>. 8. ed. Florianópolis: Editora da UFSC, 2012.
            </li>
            <li>
              BOWLEY, Arthur Lyon. <strong>Elements of statistics</strong>. London: P. S. King & Son, 1901.
            </li>
            <li>
              BUSSAB, Wilton de Oliveira; MORETTIN, Pedro Alberto. <strong>Estatística básica</strong>. 9. ed. São Paulo: Saraiva, 2017.
            </li>
            <li>
              HOAGLIN, David C.; IGLEWICZ, Boris; TUKEY, John W. Performance of alternative principles of the rule for identification of outliers. <strong>Journal of the American Statistical Association</strong>, v. 81, n. 396, p. 991-999, 1986. DOI: <a href="https://doi.org/10.1080/01621459.1986.10478363" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">https://doi.org/10.1080/01621459.1986.10478363</a>.
            </li>
            <li>
              MORGADO, Augusto César de Oliveira et al. <strong>Análise combinatória e probabilidade</strong>. 10. ed. Rio de Janeiro: SBM, 2016. (Coleção do Professor de Matemática).
            </li>
            <li>
              PEARSON, Karl. Contributions to the mathematical theory of evolution: II. Skew variation in homogeneous material. <strong>Philosophical Transactions of the Royal Society of London A</strong>, v. 186, p. 343-414, 1895. DOI: <a href="https://doi.org/10.1098/rsta.1895.0010" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">https://doi.org/10.1098/rsta.1895.0010</a>.
            </li>
            <li>
              PROVENZA, Marcello Montillo. <strong>Probabilidade e Estatística</strong>: notas de aula. Rio de Janeiro: Universidade do Estado do Rio de Janeiro (UERJ) / PROFMAT, 2026. 6 fascículos em PDF. Material didático de circulação interna.
            </li>
            <li>
              TUKEY, John Wilder. <strong>Exploratory data analysis</strong>. Reading, MA: Addison-Wesley, 1977.
            </li>
          </ul>
        </div>

        <hr className="border-slate-200 dark:border-slate-700" />

        {/* 2. DECLARAÇÃO CAPES / CNPq SOBRE IA GENERATIVA */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Declaração de Transparência e Integridade Científica (CAPES / CNPq)</span>
            </h3>
            <button
              onClick={() => copyToClipboard(capesText, 'capes')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition"
            >
              {copiedType === 'capes' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
              <span>{copiedType === 'capes' ? 'Texto Copiado!' : 'Copiar Declaração'}</span>
            </button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 p-5 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed space-y-3">
            <div className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide text-xs">
              Declaração de Uso de Ferramentas de Inteligência Artificial Generativa
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 italic">
              (Em estrita conformidade com as Diretrizes de Integridade Científica da CAPES e alinhada ao Art. 9º da Portaria CNPq nº 2.664/2026)
            </div>
            <p>
              Declaro que utilizei a ferramenta de Inteligência Artificial Generativa <strong>Google Gemini</strong> exclusivamente como apoio instrumental para concepção didática da interface, estruturação de componentes SVG vetoriais, diagramação LaTeX e otimização de templates computacionais.
            </p>
            <div className="font-semibold text-emerald-950 dark:text-emerald-200 bg-emerald-50/80 dark:bg-emerald-950/40 p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-800/80 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Todos os cálculos teóricos, modelos conceituais, análises descritivas e interpretações foram integralmente revisados, verificados e validados pelo autor humano, que assume responsabilidade científica, ética e autoral plena pelo trabalho acadêmico.
              </span>
            </div>
          </div>
        </div>

        {/* 4. FICHA DE CITAÇÃO DO PRODUTO EDUCACIONAL (REA - PROFMAT) */}
        <div className="bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 p-4 sm:p-5 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide">
              Como Referenciar Este Recurso Educacional Aberto (ABNT NBR 6023:2018)
            </span>
            <button
              onClick={() => copyToClipboard(produtoEducacionalText, 'rea')}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 hover:underline"
            >
              {copiedType === 'rea' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedType === 'rea' ? 'Copiado!' : 'Copiar Referência do REA'}</span>
            </button>
          </div>
          <p className="text-xs font-mono text-slate-700 dark:text-slate-300 leading-relaxed bg-white/80 dark:bg-slate-900/60 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/40 select-all">
            {produtoEducacionalText}
          </p>
        </div>

      </div>
    </div>
  );
};

