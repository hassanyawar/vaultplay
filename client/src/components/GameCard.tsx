import { useState } from 'react';
import { Plus, Check, AlertCircle } from 'lucide-react';
import { saveGame } from '@/lib/api';
import type { GameSearchResult } from '@/types/game';

interface GameCardProps {
  game: GameSearchResult;
}

function coverInitials(title: string): string {
  const words = title.trim().split(/\s+/);
  if (words.length === 1) return title.slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function GameCard({ game }: GameCardProps) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'exists' | 'error'>('idle');

  async function handleSave(e: React.MouseEvent) {
    e.stopPropagation();
    if (status === 'saving' || status === 'saved' || status === 'exists') return;
    setStatus('saving');
    try {
      const result = await saveGame(game);
      setStatus(result.alreadyExists ? 'exists' : 'saved');
    } catch {
      setStatus('error');
    }
  }

  const addBtnClass = [
    'game-add-btn',
    status === 'saved' ? 'game-add-btn-saved' : '',
    status === 'exists' ? 'game-add-btn-exists' : '',
    status === 'error' ? 'game-add-btn-error' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const addBtnIcon =
    status === 'saved' || status === 'exists' ? (
      <Check strokeWidth={2.8} />
    ) : status === 'error' ? (
      <AlertCircle strokeWidth={2.5} />
    ) : (
      <Plus strokeWidth={2.8} />
    );

  const addBtnLabel =
    status === 'saved'
      ? 'Added to vault'
      : status === 'exists'
        ? 'Already in vault'
        : status === 'error'
          ? 'Error — tap to retry'
          : `Add ${game.title} to vault`;

  const genre = game.genres[0] ?? null;

  return (
    <article className="game-tile">
      {/* Cover */}
      <div className="game-cover">
        {game.coverUrl ? (
          <img src={game.coverUrl} alt={game.title} loading="lazy" />
        ) : (
          <div className="game-cover-fallback">{coverInitials(game.title)}</div>
        )}

        {/* Genre tag */}
        {genre && <span className="game-genre-tag">{genre}</span>}

        {/* Gold corner brackets (hover-reveal via CSS) */}
        <span className="game-cover-corner corner-tl" aria-hidden />
        <span className="game-cover-corner corner-tr" aria-hidden />
        <span className="game-cover-corner corner-bl" aria-hidden />
        <span className="game-cover-corner corner-br" aria-hidden />

        {/* Add-to-vault button */}
        <button
          className={addBtnClass}
          onClick={(e) => void handleSave(e)}
          aria-label={addBtnLabel}
          title={addBtnLabel}
        >
          {addBtnIcon}
        </button>
      </div>

      {/* Info */}
      <div className="game-info">
        <h3>{game.title}</h3>
        {game.releaseYear && <p className="game-info-year">{game.releaseYear}</p>}

        {game.platforms.length > 0 && (
          <div className="hidden sm:flex flex-wrap gap-1 mt-1.5">
            {game.platforms.slice(0, 3).map((p) => (
              <span key={p} className="game-platform-tag">{p}</span>
            ))}
            {game.platforms.length > 3 && (
              <span className="game-platform-tag">+{game.platforms.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
