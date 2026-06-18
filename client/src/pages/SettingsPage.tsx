import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { changePassword } from '@/lib/api';

export function SettingsPage() {
  const { user } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (next !== confirm) {
      setError('New passwords do not match');
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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-8">Settings</h1>

      <div className="max-w-sm mx-auto">
        <div className="rounded-xl border border-border bg-card px-6 py-7">
          <h2 className="text-base font-semibold text-foreground mb-1">Account</h2>
          <p className="text-sm text-muted-foreground mb-6">{user?.email}</p>

          <h3 className="text-sm font-semibold text-foreground mb-4">Change password</h3>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Current password
              </label>
              <input
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••••"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                New password
              </label>
              <input
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Min. 8 characters"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Confirm new password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}
            {success && <p className="text-xs text-green-600">Password updated successfully.</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-foreground text-background px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 mt-1"
            >
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
