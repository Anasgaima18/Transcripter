import { useState, useEffect } from 'react';

const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className={`
        fixed bottom-8 right-8 w-14 h-14 rounded-full
        flex items-center justify-center text-2xl z-[9999]
        transition-all duration-300 ease-out
        hover:-translate-y-2 hover:scale-110 hover:rotate-12
        active:scale-95 active:translate-y-0
        ${theme === 'light'
          ? 'bg-slate-800 text-yellow-400 shadow-lg shadow-slate-800/30 border border-slate-700'
          : 'bg-white text-indigo-600 shadow-lg shadow-white/30 border border-white/50'
        }
      `}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeToggle;