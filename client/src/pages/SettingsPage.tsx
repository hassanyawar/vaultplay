import { useState } from 'react';
import { Eye, EyeOff, Check, X, Monitor, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { changePassword } from '@/lib/api';
import type { ThemeMode } from '@/hooks/useTheme';

function getInitials(username?: string): string {
  if (!username) return '?';
  return username.slice(0, 2).toUpperCase();
}

function measureStrength(p: string): 0 | 1 | 2 | 3 | 4 {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8) s++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s as 0 | 1 | 2 | 3 | 4;
}

function strengthInfo(s: number): { pct: number; color: string; label: string } {
  if (s === 0) return { pct: 0, color: 'transparent', label: '' };
  if (s <= 1) return { pct: 25, color: 'var(--vp-warn)', label: 'Weak' };
  if (s <= 3) return { pct: 65, color: 'var(--vp-gold)', label: 'Fair' };
  return { pct: 100, color: 'var(--vp-ok)', label: 'Strong' };
}

const THEME_OPTS: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { value: 'dark',   label: 'Dark',   icon: <Moon    size={22} strokeWidth={2} /> },
  { value: 'light',  label: 'Light',  icon: <Sun     size={22} strokeWidth={2} /> },
  { value: 'system', label: 'System', icon: <Monitor size={22} strokeWidth={2} /> },
];

export function SettingsPage() {
  const { user } = useAuth();
  const { mode, setMode } = useTheme();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = measureStrength(next);
  const { pct, color, label } = strengthInfo(strength);
  const passwordsMatch = confirm.length > 0 && next === confirm;
  const passwordsMismatch = confirm.length > 0 && next !== confirm;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (next !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      await changePassword(current, next);
      setSuccess(true);
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <div style={{ maxWidth: 900 }} className="mx-auto px-4 sm:px-6 pb-10">

        {/* Page header */}
        <header style={{ padding: '40px 0 4px' }}>
          <p className="sett-eyebrow">// account &amp; preferences</p>
          <h1 className="sett-title">Settings</h1>
        </header>

        {/* 2-column grid */}
        <div className="sett-col">

          {/* ── Left rail ── */}
          <div className="sett-rail">

            {/* Account identity card */}
            <section className="sett-card">
              <span className="sett-corner sett-c-tl" />
              <span className="sett-corner sett-c-tr" />
              <span className="sett-corner sett-c-bl" />
              <span className="sett-corner sett-c-br" />

              <h2 className="sett-card-title">Account</h2>

              <div className="sett-profile">
                <div className="sett-avatar">{getInitials(user?.username)}</div>
                <div>
                  <div className="sett-profile-name">{user?.username}</div>
                  <div className="sett-profile-email">{user?.email}</div>
                </div>
              </div>
            </section>

            {/* Appearance card */}
            <section className="sett-card">
              <h2 className="sett-card-title">Appearance</h2>
              <p className="sett-card-note">Choose how VAULTPLAY looks. System follows your device.</p>
              <div className="sett-theme-opts">
                {THEME_OPTS.map(({ value, label: optLabel, icon }) => (
                  <button
                    key={value}
                    type="button"
                    className={`sett-topt${mode === value ? ' sett-topt-active' : ''}`}
                    onClick={() => setMode(value)}
                    aria-pressed={mode === value}
                  >
                    {icon}
                    {optLabel}
                  </button>
                ))}
              </div>
            </section>

          </div>

          {/* ── Right: Change password card ── */}
          <section className="sett-card sett-card-pw">
            <h2 className="sett-card-title">Change password</h2>

            <form onSubmit={handleSubmit} noValidate>

              {/* Current password */}
              <div className="sett-field">
                <label className="sett-field-label" htmlFor="sett-cur">Current password</label>
                <div className="sett-ifield">
                  <input
                    id="sett-cur"
                    type={showCurrent ? 'text' : 'password'}
                    value={current}
                    onChange={(e) => setCurrent(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="sett-input"
                  />
                  <button
                    type="button"
                    className="sett-eye"
                    aria-label={showCurrent ? 'Hide password' : 'Show password'}
                    onClick={() => setShowCurrent((v) => !v)}
                  >
                    {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div className="sett-field">
                <label className="sett-field-label" htmlFor="sett-new">New password</label>
                <div className="sett-ifield">
                  <input
                    id="sett-new"
                    type={showNext ? 'text' : 'password'}
                    value={next}
                    onChange={(e) => setNext(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Min. 8 characters"
                    className="sett-input"
                  />
                  <button
                    type="button"
                    className="sett-eye"
                    aria-label={showNext ? 'Hide password' : 'Show password'}
                    onClick={() => setShowNext((v) => !v)}
                  >
                    {showNext ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="sett-meter">
                  <span
                    className="sett-meter-bar"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
                {label && (
                  <div className="sett-meter-label" style={{ color }}>
                    Strength: {label}
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="sett-field">
                <label className="sett-field-label" htmlFor="sett-conf">Confirm new password</label>
                <div className="sett-ifield">
                  <input
                    id="sett-conf"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="sett-input"
                  />
                  <button
                    type="button"
                    className="sett-eye"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    onClick={() => setShowConfirm((v) => !v)}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordsMatch && (
                  <div className="sett-match" style={{ color: 'var(--vp-ok)' }}>
                    <Check size={13} strokeWidth={2.4} />
                    Passwords match
                  </div>
                )}
                {passwordsMismatch && (
                  <div className="sett-match" style={{ color: 'var(--vp-warn)' }}>
                    <X size={13} strokeWidth={2.4} />
                    Passwords don't match
                  </div>
                )}
              </div>

              {error && <p className="sett-error">{error}</p>}
              {success && <p className="sett-success">// password updated</p>}

              <button type="submit" disabled={loading} className="sett-submit">
                {loading ? 'Updating…' : 'Update password'}
              </button>
            </form>
          </section>

        </div>
      </div>
    </div>
  );
}
