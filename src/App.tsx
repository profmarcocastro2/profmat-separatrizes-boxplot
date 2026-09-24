import React, { useState, useRef } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Tab1RealSample } from './components/Tab1RealSample';
import { Tab2SimpleTable } from './components/Tab2SimpleTable';
import { Tab3GroupedData } from './components/Tab3GroupedData';
import { Tab4Triptych } from './components/Tab4Triptych';
import { Tab5TukeyFactor } from './components/Tab5TukeyFactor';
import { Tab6References } from './components/Tab6References';
import {
  BarChart3,
  Table2,
  Layers,
  GitCompare,
  HelpCircle,
  BookCheck,
  Sun,
  Moon,
  Tv,
} from 'lucide-react';

const TABS = [
  { id: 1, label: '1. Amostra Real & Boxplot', icon: BarChart3 },
  { id: 2, label: '2. Tabela Simples (Discreta)', icon: Table2 },
  { id: 3, label: '3. Dados Agrupados (Classes)', icon: Layers },
  { id: 4, label: '4. Tríptico de Assimetria', icon: GitCompare },
  { id: 5, label: '5. Fator 1.5 (John Tukey)', icon: HelpCircle },
  { id: 6, label: '6. ABNT & Declaração CAPES', icon: BookCheck },
];

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(1);
  const { theme, toggleTheme, classroomMode, toggleClassroomMode } = useTheme();
  const navRef = useRef<HTMLElement | null>(null);
  const tabButtonRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});

  const handleTabClick = (tabId: number) => {
    setActiveTab(tabId);
    // Quando a aba 5 ou a aba 6 for clicada, desloca suavemente o carrossel de abas
    // para a direita extrema, garantindo que a Aba 6 fique 100% visível e acessível na tela
    if (tabId === 5 || tabId === 6) {
      setTimeout(() => {
        if (navRef.current) {
          navRef.current.scrollTo({
            left: navRef.current.scrollWidth,
            behavior: 'smooth',
          });
        }
      }, 40);
    } else if (tabId === 1) {
      setTimeout(() => {
        if (navRef.current) {
          navRef.current.scrollTo({
            left: 0,
            behavior: 'smooth',
          });
        }
      }, 40);
    } else {
      setTimeout(() => {
        tabButtonRefs.current[tabId]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }, 40);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header */}
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">PROFMAT</span>
                <span aria-hidden="true">/</span>
                <span>Probabilidade e Estatística</span>
                <span aria-hidden="true">/</span>
                <span>Polo UERJ</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
                Medidas Separatrizes, Boxplot & Fator 1.5 de Tukey
              </h1>
            </div>

            {/* Quick Controls: Dark mode & Classroom mode */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                onClick={toggleClassroomMode}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition shadow-xs ${
                  classroomMode
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-500 font-bold ring-2 ring-amber-400/50'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
                title="Ampliar fontes, fórmulas KaTeX e traçados gráficos para projetores e lousas digitais"
              >
                <Tv className={`w-3.5 h-3.5 ${classroomMode ? 'text-slate-950' : 'text-indigo-500'}`} />
                <span>{classroomMode ? 'Modo Aula: LIGADO' : 'Modo Aula (Projetor)'}</span>
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                title={theme === 'dark' ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
                aria-label="Alternar tema"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </button>
            </div>
          </div>

          {/* Abas de Navegação */}
          <nav
            ref={navRef}
            className="flex space-x-1 sm:space-x-2 overflow-x-auto mt-4 scrollbar-none border-b border-transparent scroll-smooth"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabButtonRefs.current[tab.id] = el;
                  }}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 shrink-0 ${
                    isActive
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Banner Didático quando o Modo Aula está ligado */}
      {classroomMode && (
        <div className="bg-amber-500 text-slate-950 border-b border-amber-600 px-4 py-2 text-xs sm:text-sm font-medium shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Tv className="w-4 h-4 shrink-0" />
              <span>
                <strong>Modo Aula Ativo:</strong> Escala visual ampliada (+12%), equações KaTeX em destaque (+25%), linhas de Boxplot mais grossas e números com contraste reforçado para excelente legibilidade em projetores e fundo de sala.
              </span>
            </div>
            <button
              onClick={toggleClassroomMode}
              className="text-xs font-bold underline hover:text-slate-800 shrink-0 ml-2"
            >
              Desativar
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 1 && <Tab1RealSample />}
        {activeTab === 2 && <Tab2SimpleTable />}
        {activeTab === 3 && <Tab3GroupedData />}
        {activeTab === 4 && <Tab4Triptych />}
        {activeTab === 5 && <Tab5TukeyFactor />}
        {activeTab === 6 && <Tab6References />}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Projeto Didático PROFMAT • Mestrado Profissional em Matemática em Rede Nacional
          </div>
          <div className="flex items-center gap-3">
            <span>Polo UERJ</span>
            <span aria-hidden="true">·</span>
            <span>Versão Web Interativa Full-Stack</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <MainContent />
    </ThemeProvider>
  );
};

export default App;
