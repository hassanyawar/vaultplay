import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { saveGame } from '@/lib/api';
import type { GameSearchResult } from '@/types/game';

interface GameCardProps {
  game: GameSearchResult;
}

export function GameCard({ game }: GameCardProps) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'exists' | 'error'>('idle');

  async function handleSave() {
    setStatus('saving');
    try {
      const result = await saveGame(game);
      setStatus(result.alreadyExists ? 'exists' : 'saved');
    } catch {
      setStatus('error');
    }
  }

  const buttonLabel = {
    idle: 'Add to Vault',
    saving: 'Saving…',
    saved: 'Added ✓',
    exists: 'Already in Vault',
    error: 'Error — Retry',
  }[status];

  return (
    <div className="flex flex-col rounded-lg border border-border bg-card overflow-hidden">
      <div className="aspect-[3/4] bg-muted">
        {game.coverUrl ? (
          <img src={game.coverUrl} alt={game.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 p-3 flex-1">
        <h3 className="font-semibold text-sm leading-snug text-foreground">{game.title}</h3>

        {game.releaseYear && (
          <p className="text-xs text-muted-foreground">{game.releaseYear}</p>
        )}

        {game.platforms.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {game.platforms.slice(0, 4).map((p) => (
              <span
                key={p}
                className="text-xs bg-muted text-muted-foreground rounded px-1.5 py-0.5"
              >
                {p}
              </span>
            ))}
            {game.platforms.length > 4 && (
              <span className="text-xs text-muted-foreground">+{game.platforms.length - 4}</span>
            )}
          </div>
        )}

        <div className="mt-auto pt-2">
          <Button
            size="sm"
            className="w-full"
            onClick={handleSave}
            disabled={status === 'saving' || status === 'saved' || status === 'exists'}
            variant={status === 'error' ? 'outline' : 'default'}
          >
            {buttonLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
