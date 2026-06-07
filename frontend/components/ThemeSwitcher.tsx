'use client';

import { useEffect, useState } from 'react';

const themes = [
  { value: 'pixel-dark', label: '🌙 Pixel Dark' },
  { value: 'pixel-light', label: '☀️ Pixel Light' },
  { value: 'retro-neon', label: '💚 Retro Neon' },
];

export default function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState('pixel-dark');

  useEffect(() => {
    const saved = localStorage.getItem('questlog-theme');
    if (saved && themes.some(t => t.value === saved)) {
      setCurrentTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      document.documentElement.setAttribute('data-theme', currentTheme);
    }
  }, []);

  const changeTheme = (theme: string) => {
    setCurrentTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('questlog-theme', theme);
  };

  return (
    <div className="theme-switcher">
      <select
        value={currentTheme}
        onChange={(e) => changeTheme(e.target.value)}
        className="pixel-input"
        style={{ fontSize: '0.8rem', padding: '0.3rem' }}
      >
        {themes.map(theme => (
          <option key={theme.value} value={theme.value}>
            {theme.label}
          </option>
        ))}
      </select>
    </div>
  );
}