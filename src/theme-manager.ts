export type Theme = 'light' | 'dark' | 'system';

const THEME_KEY = 't3code-theme';

export function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {}
  return 'system';
}

export function setTheme(theme: Theme): void {
  try { localStorage.setItem(THEME_KEY, theme); } catch {}
  applyTheme(theme);
}

function getSystemTheme(): 'light' | 'dark' {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch { return 'light'; }
}

export function applyTheme(theme: Theme): void {
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  document.documentElement.setAttribute('data-theme', resolved);
}

export function initThemeManager(): void {
  const theme = getStoredTheme();
  applyTheme(theme);
  
  if (theme === 'system') {
    try {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme('system'));
    } catch {}
  }
}
