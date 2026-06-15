'use client';
import React, { useEffect, useState } from 'react';
import { InventoryItem, shopApi } from '@/lib/api';
import { isLoggedIn } from '@/lib/auth';

const DEFAULT_THEMES = [
  { value: 'pixel-dark', label: '🌙 Pixel Dark' },
];

export default function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState('pixel-dark');
  const [availableThemes, setAvailableThemes] = useState(DEFAULT_THEMES);

  useEffect(() => {
    const loadThemes = async () => {
      if (!isLoggedIn()) return;
      try {
        const transformInventory = (inv: any): InventoryItem => ({
          id: inv.id,
          itemId: inv.itemId,
          name: inv.item.name,
          description: inv.item.description,
          icon: inv.item.icon,
          active: inv.active,
          type: inv.item.type,
          purchasedAt: inv.createdAt,
        });
        const inventory = await shopApi.getInventory('USER').then(data => data.map(transformInventory));
        const cosmetics = inventory.filter(i => i.type === 'COSMETIC');
        console.log('Loaded cosmetics:', cosmetics);
        const extraThemes = cosmetics
          .map(item => {
            console.log('Found cosmetic item:', item.name);
            if (item.name === 'Pixel Light Theme') return { value: 'pixel-light', label: '☀️ Pixel Light' };
            if (item.name === 'Retro Neon Theme') return { value: 'retro-neon', label: '💚 Retro Neon' };
            return null;
          })
          .filter((theme): theme is { value: string; label: string } => theme !== null);
        setAvailableThemes([...DEFAULT_THEMES, ...extraThemes]);
      } catch (e) {
        console.warn('Could not load cosmetics', e);
      }
    };
    loadThemes();
  }, []);

  const changeTheme = (theme: string) => {
    setCurrentTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('questlog-theme', theme);
  };

  // restore saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('questlog-theme');
    if (saved && availableThemes.some(t => t.value === saved)) {
      setCurrentTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, [availableThemes]);

  return (
    <div className="theme-switcher">
      <select value={currentTheme} onChange={(e) => changeTheme(e.target.value)} className="pixel-input">
        {availableThemes.map(theme => (
          <option key={theme.value} value={theme.value}>{theme.label}</option>
        ))}
      </select>
    </div>
  );
}