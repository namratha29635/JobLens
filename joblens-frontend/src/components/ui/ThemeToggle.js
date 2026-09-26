import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '', style = {} }) {
  const context = useTheme();
  const theme = context?.theme || 'light';
  const setTheme = context?.setTheme || (() => {});
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      className={`theme-toggle-btn ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        border: '1px solid var(--border)',
        background: 'var(--bg-card)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-subtle)',
        transition: 'all 0.25s ease',
        flexShrink: 0,
        padding: 0,
        ...style,
      }}
    >
      {isDark ? (
        <Sun size={17} style={{ color: '#f59e0b' }} />
      ) : (
        <Moon size={17} style={{ color: '#6366f1' }} />
      )}
    </button>
  );
}
