import { useState, useEffect } from 'react';

export type ThemeMode = 'dark' | 'light' | 'system';
type EffectiveTheme = 'dark' | 'light';

function getOsTheme(): EffectiveTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialMode(): ThemeMode {
  try {
    const stored = localStorage.getItem('vp-theme-mode');
    if (stored === 'dark' || stored === 'light' || stored === 'system') return stored;
    // Migrate from old key
    const old = localStorage.getItem('theme');
    if (old === 'dark' || old === 'light') return old;
  } catch {
    // localStorage unavailable in sandboxed contexts
  }
  return 'system';
}

function resolveEffective(mode: ThemeMode): EffectiveTheme {
  return mode === 'system' ? getOsTheme() : mode;
}

function applyClass(eff: EffectiveTheme) {
  if (eff === 'dark') document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
}

export function useTheme() {
  const [mode, setModeState] = useState<ThemeMode>(getInitialMode);

  useEffect(() => {
    applyClass(resolveEffective(mode));
    try {
      localStorage.setItem('vp-theme-mode', mode);
      localStorage.removeItem('theme');
    } catch {
      // localStorage unavailable in sandboxed contexts
    }
  }, [mode]);

  // Track OS changes when in system mode
  useEffect(() => {
    if (mode !== 'system') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onOsChange = () => applyClass(mql.matches ? 'dark' : 'light');
    mql.addEventListener('change', onOsChange);
    return () => mql.removeEventListener('change', onOsChange);
  }, [mode]);

  // Toggle flips current effective theme to explicit opposite
  const toggle = () => setModeState((m) => (resolveEffective(m) === 'dark' ? 'light' : 'dark'));

  return { theme: resolveEffective(mode), mode, setMode: setModeState, toggle };
}
