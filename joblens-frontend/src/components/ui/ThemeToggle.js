import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '', style = {} }) {
  const { theme, setTheme } = useTheme();
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
        gap: '6px',
        padding: '7px 12px',
        borderRadius: '999px',
        border: '1px solid var(--border)',
        background: 'var(--bg-card)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 600,
        boxShadow: 'var(--shadow-subtle)',
        transition: 'all 0.25s ease',
        ...style,
      }}
    >
      {isDark ? (
        <>
          <Sun size={15} style={{ color: '#f59e0b' }} />
          <span>Light</span>
        </>
      ) : (
        <>
          <Moon size={15} style={{ color: '#6366f1' }} />
          <span>Dark</span>
        </>
      )}
    </button>
  );
}
