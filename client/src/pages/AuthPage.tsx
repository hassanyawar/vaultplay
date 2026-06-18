import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';

type Mode = 'signin' | 'signup';

function AuthField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        className="auth-field-label"
        style={{
          display: 'block',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '11px',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--auth-muted)',
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const baseInputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--auth-input-bg)',
  border: '1px solid var(--auth-input-edge)',
  borderRadius: '11px',
  color: 'var(--auth-text)',
  fontSize: '15px',
  fontFamily: "'Inter', system-ui, sans-serif",
  transition: 'border-color 0.18s, box-shadow 0.18s, background 0.18s',
};

function PasswordToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2"
      style={{ color: 'var(--auth-faint)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', lineHeight: 0 }}
      aria-label={show ? 'Hide password' : 'Show password'}
    >
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );
}

export function AuthPage() {
  const { login, register } = useAuth();
  const { theme, toggle } = useTheme();

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Remove #root border-inline so the full-bleed background shows cleanly
  useEffect(() => {
    const root = document.getElementById('root');
    root?.classList.add('auth-mode');
    return () => root?.classList.remove('auth-mode');
  }, []);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setPassword('');
    setConfirm('');
    setShowPassword(false);
    setShowConfirm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (mode === 'signup' && password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signin') {
        await login(email, password);
      } else {
        await register(email, username, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : mode === 'signin' ? 'Login failed' : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="auth-page relative min-h-screen flex items-start sm:items-center justify-center"
      style={{ padding: '28px 18px', color: 'var(--auth-text)' }}
    >
      {/* Full-viewport void background */}
      <div
        className="fixed inset-0 -z-10"
        style={{ background: 'var(--auth-void)', transition: 'background 0.35s ease' }}
      />

      {/* Aurora blobs */}
      <div
        className="auth-aurora-container fixed pointer-events-none"
        style={{ inset: '-30%', zIndex: 0, filter: 'blur(90px)' }}
      >
        <span
          className="auth-aurora-1 absolute rounded-full"
          style={{
            width: '46vw', height: '46vw',
            left: '-6%', top: '-8%',
            background: 'radial-gradient(circle, #5A3FD6, transparent 62%)',
            mixBlendMode: 'screen',
          }}
        />
        <span
          className="auth-aurora-2 absolute rounded-full"
          style={{
            width: '40vw', height: '40vw',
            right: '-8%', bottom: '-12%',
            background: 'radial-gradient(circle, #E89A2B, transparent 60%)',
            opacity: 0.45,
            mixBlendMode: 'screen',
          }}
        />
        <span
          className="auth-aurora-3 absolute rounded-full"
          style={{
            width: '30vw', height: '30vw',
            left: '40%', top: '50%',
            background: 'radial-gradient(circle, #8B6CFF, transparent 64%)',
            mixBlendMode: 'screen',
          }}
        />
      </div>

      {/* Grid floor */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          backgroundImage:
            'linear-gradient(var(--auth-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--auth-grid-line) 1px, transparent 1px)',
          backgroundSize: '46px 46px',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 42%, #000 30%, transparent 78%)',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 42%, #000 30%, transparent 78%)',
        }}
      />

      {/* Vignette */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0, background: 'var(--auth-vignette)', transition: 'background 0.35s ease' }}
      />

      {/* Theme toggle */}
      <button
        onClick={toggle}
        aria-label="Switch color theme"
        className="fixed z-50 w-[42px] h-[42px] rounded-xl grid place-items-center cursor-pointer transition-[border-color] hover:-translate-y-px"
        style={{
          top: '22px',
          right: '22px',
          background: 'var(--auth-toggle-bg)',
          border: '1px solid var(--auth-toggle-edge)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          color: 'var(--auth-text)',
          transition: 'transform 0.15s ease, border-color 0.15s ease, background 0.35s ease',
        }}
      >
        {theme === 'dark' ? (
          /* In dark mode: show sun → click switches to light */
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2v2.6M12 19.4V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.6M19.4 12H22M4.2 19.8 6 18M18 6l1.8-1.8" />
          </svg>
        ) : (
          /* In light mode: show moon → click switches to dark */
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
        )}
      </button>

      {/* Main content */}
      <main className="relative w-full max-w-[430px]" style={{ zIndex: 2 }}>

        {/* Brand */}
        <div className="text-center mb-3 sm:mb-[30px]">
          <div className="flex justify-center items-center gap-[10px] mb-2 sm:mb-[18px]">
            <svg width="26" height="26" viewBox="0 0 24 24">
              <defs>
                <linearGradient id="vp-bolt-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#A78BFF" />
                  <stop offset="1" stopColor="#FFC15E" />
                </linearGradient>
              </defs>
              <path d="M13 2 4 14h6l-1 8 9-12h-6z" fill="url(#vp-bolt-grad)" />
            </svg>
          </div>
          <div
            className="flex justify-center"
            style={{
              fontFamily: "'Chakra Petch', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(38px, 9vw, 58px)',
              letterSpacing: '0.14em',
              lineHeight: 0.9,
            }}
          >
            <span style={{ color: 'var(--auth-text)' }}>VAULT</span>
            <span
              style={{
                background: 'linear-gradient(120deg, var(--auth-violet-bright), var(--auth-gold))',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              PLAY
            </span>
          </div>
          <p
            style={{
              marginTop: '14px',
              color: 'var(--auth-muted)',
              fontSize: '13px',
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: '0.03em',
            }}
          >
            Track games you're playing, completed, and want to play next.
          </p>
        </div>

        {/* Auth card */}
        <section
          className="auth-card relative rounded-[18px]"
          style={{
            background: 'var(--auth-panel)',
            border: '1px solid var(--auth-panel-edge)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            boxShadow: 'var(--auth-card-shadow), inset 0 1px 0 var(--auth-inner-top)',
            transition: 'background 0.35s ease, border-color 0.35s ease',
          }}
        >
          {/* Corner brackets */}
          <span className="absolute top-[9px] left-[9px] w-[18px] h-[18px] pointer-events-none" style={{ borderTop: '2px solid var(--auth-bracket)', borderLeft: '2px solid var(--auth-bracket)', borderTopLeftRadius: 6 }} />
          <span className="absolute top-[9px] right-[9px] w-[18px] h-[18px] pointer-events-none" style={{ borderTop: '2px solid var(--auth-bracket)', borderRight: '2px solid var(--auth-bracket)', borderTopRightRadius: 6 }} />
          <span className="absolute bottom-[9px] left-[9px] w-[18px] h-[18px] pointer-events-none" style={{ borderBottom: '2px solid var(--auth-bracket)', borderLeft: '2px solid var(--auth-bracket)', borderBottomLeftRadius: 6 }} />
          <span className="absolute bottom-[9px] right-[9px] w-[18px] h-[18px] pointer-events-none" style={{ borderBottom: '2px solid var(--auth-bracket)', borderRight: '2px solid var(--auth-bracket)', borderBottomRightRadius: 6 }} />

          {/* Status bar */}
          <div
            className="flex items-center gap-2 mb-1"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '10.5px',
              letterSpacing: '0.18em',
              color: 'var(--auth-faint)',
              textTransform: 'uppercase',
            }}
          >
            <span
              className="auth-dot shrink-0 rounded-full"
              style={{ width: '7px', height: '7px', background: 'var(--auth-ok)' }}
            />
            <span>vault secure</span>
          </div>

          {/* Heading */}
          <h1
            style={{
              fontFamily: "'Chakra Petch', sans-serif",
              fontWeight: 600,
              fontSize: '23px',
              letterSpacing: '0.02em',
              margin: '0 0 16px 0',
              color: 'var(--auth-text)',
            }}
          >
            {mode === 'signin' ? 'Welcome back' : 'New player'}
          </h1>

          {/* Form */}
          <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-2 sm:gap-3">

            <AuthField label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="auth-input"
                style={baseInputStyle}
              />
            </AuthField>

            {mode === 'signup' && (
              <AuthField label="Player tag">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="e.g. nightraider"
                  className="auth-input"
                  style={baseInputStyle}
                />
              </AuthField>
            )}

            <AuthField label="Password">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  className="auth-input"
                  style={{ ...baseInputStyle, paddingRight: '44px' }}
                />
                <PasswordToggle show={showPassword} onToggle={() => setShowPassword((p) => !p)} />
              </div>
            </AuthField>

            {mode === 'signup' && (
              <AuthField label="Confirm password">
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="auth-input"
                    style={{ ...baseInputStyle, paddingRight: '44px' }}
                  />
                  <PasswordToggle show={showConfirm} onToggle={() => setShowConfirm((p) => !p)} />
                </div>
              </AuthField>
            )}

            {error && (
              <p style={{ fontSize: '13px', color: '#f87171' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="auth-submit w-full rounded-xl disabled:opacity-50 mt-2 sm:mt-[10px]"
              style={{
                padding: '13px 15px',
                fontFamily: "'Chakra Petch', sans-serif",
                fontWeight: 600,
                fontSize: '15px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#0A0912',
                background: 'linear-gradient(120deg, #A78BFF, #8B6CFF 55%, #FFC15E)',
                backgroundSize: '160% 100%',
                backgroundPosition: '0 0',
                border: 'none',
                cursor: loading ? 'wait' : 'pointer',
                boxShadow: '0 12px 30px -10px rgba(139, 108, 255, 0.7)',
              }}
            >
              {loading
                ? (mode === 'signin' ? 'Entering…' : 'Creating…')
                : (mode === 'signin' ? 'Enter vault' : 'Create vault')}
            </button>
          </form>

          {/* Mode switcher */}
          <p className="text-center mt-3 sm:mt-[22px]" style={{ color: 'var(--auth-muted)', fontSize: '13.5px' }}>
            {mode === 'signin' ? (
              <>
                No account yet?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--auth-violet)', fontWeight: 600, fontSize: 'inherit', textDecoration: 'none' }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.textDecoration = 'underline')}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.textDecoration = 'none')}
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have a vault?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--auth-violet)', fontWeight: 600, fontSize: 'inherit', textDecoration: 'none' }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.textDecoration = 'underline')}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.textDecoration = 'none')}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </section>
      </main>
    </div>
  );
}
