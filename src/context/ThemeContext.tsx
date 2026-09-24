import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  classroomMode: boolean;
  toggleClassroomMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('profmat-theme') as Theme;
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [classroomMode, setClassroomMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('profmat-classroom-mode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('profmat-theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (classroomMode) {
      root.classList.add('classroom-mode');
    } else {
      root.classList.remove('classroom-mode');
    }
    localStorage.setItem('profmat-classroom-mode', classroomMode.toString());
  }, [classroomMode]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleClassroomMode = () => {
    setClassroomMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, classroomMode, toggleClassroomMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
