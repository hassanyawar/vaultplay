import { pool } from '../../db/client';
import type { IDiscoveryService } from './interface';
import type { Recommendation, StalledGame, GenreAffinity } from './types';

export class RuleBasedDiscoveryService implements IDiscoveryService {
  async getNextToPlay(userId: number): Promise<Recommendation[]> {
    type Row = {
      game_id: number; rawg_id: number; title: string; cover_url: string | null;
      platforms: string[]; genres: string[]; release_year: number | null;
      score: number; liked_genres: string[];
    };
    const result = await pool.query<Row>(`
      WITH liked_genres AS (
        SELECT unnest(g.genres) AS genre, AVG(ve.rating) AS avg_rating
        FROM vault_entries ve
        JOIN games g ON g.id = ve.game_id
        WHERE ve.status = 'completed' AND ve.rating IS NOT NULL AND ve.user_id = $1
        GROUP BY genre
        ORDER BY avg_rating DESC
      ),
      backlog AS (
        SELECT
          ve.id AS vault_entry_id,
          g.id AS game_id,
          g.rawg_id, g.title, g.cover_url, g.platforms, g.genres, g.release_year
        FROM vault_entries ve
        JOIN games g ON g.id = ve.game_id
        WHERE ve.status = 'backlog' AND ve.user_id = $1
      ),
      scored AS (
        SELECT
          b.*,
          COALESCE(SUM(lg.avg_rating), 0) AS score,
          array_agg(lg.genre) FILTER (WHERE lg.genre IS NOT NULL) AS liked_genres
        FROM backlog b
        LEFT JOIN liked_genres lg ON lg.genre = ANY(b.genres)
        GROUP BY b.vault_entry_id, b.game_id, b.rawg_id, b.title,
                 b.cover_url, b.platforms, b.genres, b.release_year
      )
      SELECT * FROM scored ORDER BY score DESC, game_id ASC LIMIT 5
    `, [userId]);

    return result.rows.map((row) => ({
      gameId: row.game_id,
      rawgId: row.rawg_id,
      title: row.title,
      coverUrl: row.cover_url,
      platforms: row.platforms,
      genres: row.genres,
      releaseYear: row.release_year,
      score: Number(row.score),
      reason: this.buildReason(row.genres, row.liked_genres ?? []),
    }));
  }

  async getStalledGames(userId: number): Promise<StalledGame[]> {
    const result = await pool.query<{
      id: number;
      game_id: number;
      title: string;
      cover_url: string | null;
      days_since_update: number;
    }>(`
      SELECT
        ve.id,
        g.id AS game_id,
        g.title,
        g.cover_url,
        EXTRACT(DAY FROM NOW() - ve.updated_at)::int AS days_since_update
      FROM vault_entries ve
      JOIN games g ON g.id = ve.game_id
      WHERE ve.status = 'playing' AND ve.user_id = $1
        AND EXTRACT(DAY FROM NOW() - ve.updated_at) >= 7
      ORDER BY ve.updated_at ASC
      LIMIT 5
    `, [userId]);

    return result.rows.map((row) => ({
      vaultEntryId: row.id,
      gameId: row.game_id,
      title: row.title,
      coverUrl: row.cover_url,
      daysSinceUpdate: row.days_since_update,
    }));
  }

  async getGenreAffinity(userId: number): Promise<GenreAffinity[]> {
    const result = await pool.query<{
      genre: string;
      average_rating: number;
      total_rated: number;
      total_in_vault: number;
    }>(`
      SELECT
        genre,
        ROUND(AVG(rating) FILTER (WHERE rating IS NOT NULL), 1) AS average_rating,
        COUNT(*) FILTER (WHERE rating IS NOT NULL) AS total_rated,
        COUNT(*) AS total_in_vault
      FROM (
        SELECT unnest(g.genres) AS genre, ve.rating
        FROM vault_entries ve
        JOIN games g ON g.id = ve.game_id
        WHERE ve.user_id = $1
      ) sub
      GROUP BY genre
      HAVING COUNT(*) FILTER (WHERE rating IS NOT NULL) > 0
      ORDER BY average_rating DESC, total_rated DESC
    `, [userId]);

    return result.rows.map((row) => ({
      genre: row.genre,
      averageRating: Number(row.average_rating),
      totalRated: Number(row.total_rated),
      totalInVault: Number(row.total_in_vault),
    }));
  }

  private buildReason(gameGenres: string[], likedGenres: string[]): string {
    const overlap = gameGenres.filter((g) => likedGenres.includes(g));
    if (overlap.length === 0) return 'In your backlog';
    if (overlap.length === 1) return `Matches your taste in ${overlap[0]}`;
    return `Matches your taste in ${overlap.slice(0, -1).join(', ')} and ${overlap[overlap.length - 1]}`;
  }
}
