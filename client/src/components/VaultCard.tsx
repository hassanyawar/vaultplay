import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { updateVaultEntry, deleteVaultEntry } from '@/lib/api';
import type { VaultEntry, VaultStatus } from '@/types/game';

interface VaultCardProps {
  entry: VaultEntry;
  onUpdate: (id: number, updated: Partial<VaultEntry>) => void;
  onDelete: (id: number) => void;
}

const statusLabel: Record<VaultStatus, string> = {
  backlog: 'Backlog',
  playing: 'Playing',
  completed: 'Completed',
};

const statusStyle: Record<VaultStatus, string> = {
  backlog: 'bg-muted text-muted-foreground',
  playing: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
};

export function VaultCard({ entry, onUpdate, onDelete }: VaultCardProps) {
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesDraft, setNotesDraft] = useState(entry.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleStatusChange(status: VaultStatus) {
    onUpdate(entry.id, { status });
    try {
      await updateVaultEntry(entry.id, { status });
    } catch {
      onUpdate(entry.id, { status: entry.status });
    }
  }

  async function handleRatingChange(raw: string) {
    const rating = raw === '' ? null : parseInt(raw, 10);
    onUpdate(entry.id, { rating });
    try {
      await updateVaultEntry(entry.id, { rating });
    } catch {
      onUpdate(entry.id, { rating: entry.rating });
    }
  }

  async function handleNotesSave() {
    setSaving(true);
    try {
      await updateVaultEntry(entry.id, { notes: notesDraft || null });
      onUpdate(entry.id, { notes: notesDraft || null });
      setNotesOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteVaultEntry(entry.id);
      onDelete(entry.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex gap-4 rounded-lg border border-border bg-card p-4">
      <div className="w-16 h-20 shrink-0 rounded overflow-hidden bg-muted">
        {entry.cover_url ? (
          <img src={entry.cover_url} alt={entry.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            No img
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-sm text-foreground leading-snug truncate">
              {entry.title}
            </h3>
            {entry.release_year && (
              <p className="text-xs text-muted-foreground mt-0.5">{entry.release_year}</p>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-destructive shrink-0 h-7 px-2"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? '…' : '✕'}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyle[entry.status]}`}>
            {statusLabel[entry.status]}
          </span>

          <select
            value={entry.status}
            onChange={(e) => handleStatusChange(e.target.value as VaultStatus)}
            className="text-xs border border-input rounded px-2 py-0.5 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="backlog">Backlog</option>
            <option value="playing">Playing</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={entry.rating ?? ''}
            onChange={(e) => handleRatingChange(e.target.value)}
            className="text-xs border border-input rounded px-2 py-0.5 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">No rating</option>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} / 10
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3">
          {notesOpen ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder="Add notes…"
                rows={3}
                className="w-full text-xs border border-input rounded px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleNotesSave} disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setNotesDraft(entry.notes ?? '');
                    setNotesOpen(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setNotesOpen(true)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {entry.notes ? entry.notes : '+ Add notes'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
