import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full transition-colors duration-200 
        text-gray-600 hover:bg-gray-200 
        dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun size={20} className="transition-transform duration-500 rotate-0 hover:rotate-90" />
      ) : (
        <Moon size={20} className="transition-transform duration-500 rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
};

export default ThemeToggle;