import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  iconOnly?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', iconOnly = false }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className={className}>
      <span className="material-icons mr-3">
        {theme === 'light' ? 'dark_mode' : 'light_mode'}
      </span>
      {!iconOnly && (
        <span>
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
