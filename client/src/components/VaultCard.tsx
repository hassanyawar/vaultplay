import { useState } from 'react';
import { Trash2, Pencil } from 'lucide-react';
import { updateVaultEntry, deleteVaultEntry } from '@/lib/api';
import type { VaultEntry, VaultStatus } from '@/types/game';

interface VaultCardProps {
  entry: VaultEntry;
  onUpdate: (id: number, updated: Partial<VaultEntry>) => void;
  onDelete: (id: number) => void;
}

function thumbInitials(title: string): string {
  const words = title.trim().split(/\s+/);
  if (words.length === 1) return title.slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function VaultCard({ entry, onUpdate, onDelete }: VaultCardProps) {
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesDraft, setNotesDraft] = useState(entry.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleStatusChange(newStatus: VaultStatus) {
    const prev = entry.status;
    onUpdate(entry.id, { status: newStatus });
    try {
      await updateVaultEntry(entry.id, { status: newStatus });
    } catch {
      onUpdate(entry.id, { status: prev });
    }
  }

  async function handleRatingChange(raw: string) {
    const rating = raw === '' ? null : parseInt(raw, 10);
    const prev = entry.rating;
    onUpdate(entry.id, { rating });
    try {
      await updateVaultEntry(entry.id, { rating });
    } catch {
      onUpdate(entry.id, { rating: prev });
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

  const badgeClass = `vault-badge vault-badge-${entry.status}`;

  return (
    <div className="vault-row">
      {/* Gold corner brackets */}
      <span className="vault-row-corner vault-corner-tl" aria-hidden />
      <span className="vault-row-corner vault-corner-tr" aria-hidden />
      <span className="vault-row-corner vault-corner-bl" aria-hidden />
      <span className="vault-row-corner vault-corner-br" aria-hidden />

      {/* Thumbnail */}
      <div className="vault-thumb">
        {entry.cover_url ? (
          <img src={entry.cover_url} alt={entry.title} loading="lazy" />
        ) : (
          <div className="vault-thumb-fallback">{thumbInitials(entry.title)}</div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <h3 className="vault-row-title">{entry.title}</h3>
            <p className="vault-row-year">{entry.release_year ?? '—'}</p>
          </div>

          {/* Remove button */}
          <button
            className="vault-remove-btn"
            onClick={() => void handleDelete()}
            disabled={deleting}
            aria-label={`Remove ${entry.title} from vault`}
            title="Remove from vault"
          >
            {deleting ? '…' : <Trash2 size={14} />}
          </button>
        </div>

        {/* Controls row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 12 }}>
          {/* Status badge (read-only label) */}
          <span className={badgeClass}>{entry.status}</span>

          {/* Status select */}
          <div className="vault-select-wrap">
            <select
              value={entry.status}
              onChange={(e) => void handleStatusChange(e.target.value as VaultStatus)}
              aria-label="Change status"
            >
              <option value="backlog">Backlog</option>
              <option value="playing">Playing</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Rating select */}
          <div className="vault-select-wrap">
            <select
              value={entry.rating ?? ''}
              onChange={(e) => void handleRatingChange(e.target.value)}
              aria-label="Set rating"
            >
              <option value="">— rate —</option>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n} / 10</option>
              ))}
            </select>
          </div>

          {/* Notes add button — only shown when no notes and editor is closed */}
          {!entry.notes && !notesOpen && (
            <button
              className="vault-notes-btn"
              onClick={() => setNotesOpen(true)}
              aria-label="Add note"
            >
              + add note
            </button>
          )}
        </div>

        {/* Inline note preview — always visible when notes exist */}
        {entry.notes && !notesOpen && (
          <div
            className="vault-notes-preview"
            onClick={() => setNotesOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setNotesOpen(true)}
            aria-label="Edit note"
            title="Click to edit"
          >
            <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <span>{entry.notes}</span>
              <Pencil size={11} style={{ flexShrink: 0, marginTop: 2, opacity: 0.5 }} />
            </span>
          </div>
        )}

        {/* Notes editor */}
        {notesOpen && (
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <textarea
              className="vault-notes-area"
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              placeholder="// jot down thoughts, tips, or progress…"
              rows={3}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => void handleNotesSave()}
                disabled={saving}
                className="vault-toolbtn vault-toolbtn-active"
                style={{ padding: '6px 16px', fontSize: 12 }}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => { setNotesDraft(entry.notes ?? ''); setNotesOpen(false); }}
                className="vault-toolbtn"
                style={{ padding: '6px 14px', fontSize: 12 }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
