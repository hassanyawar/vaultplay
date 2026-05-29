import type { IDiscoveryService } from './interface';
import type { Recommendation, StalledGame, GenreAffinity } from './types';
import { RuleBasedDiscoveryService } from './rule-based';

// AI-powered discovery service. Each method falls back to RuleBasedDiscoveryService
// until the Claude API implementation is written. This means adding ANTHROPIC_API_KEY
// to .env is always safe — the app stays functional while AI calls are built out
// incrementally, one method at a time.
export class AiDiscoveryService implements IDiscoveryService {
  private fallback = new RuleBasedDiscoveryService();

  async getNextToPlay(userId: number): Promise<Recommendation[]> {
    return this.fallback.getNextToPlay(userId);
  }

  async getStalledGames(userId: number): Promise<StalledGame[]> {
    return this.fallback.getStalledGames(userId);
  }

  async getGenreAffinity(userId: number): Promise<GenreAffinity[]> {
    return this.fallback.getGenreAffinity(userId);
  }
}
