import type { IDiscoveryService } from './interface';
import type { Recommendation, StalledGame, GenreAffinity } from './types';
import { RuleBasedDiscoveryService } from './rule-based';

// AI-powered discovery service. Each method falls back to RuleBasedDiscoveryService
// until the Claude API implementation is written. This means adding ANTHROPIC_API_KEY
// to .env is always safe — the app stays functional while AI calls are built out
// incrementally, one method at a time.
export class AiDiscoveryService implements IDiscoveryService {
  private fallback = new RuleBasedDiscoveryService();

  async getNextToPlay(): Promise<Recommendation[]> {
    // TODO: call Claude API with vault data to generate ranked recommendations
    return this.fallback.getNextToPlay();
  }

  async getStalledGames(): Promise<StalledGame[]> {
    // TODO: call Claude API to surface and contextualise stalled games
    return this.fallback.getStalledGames();
  }

  async getGenreAffinity(): Promise<GenreAffinity[]> {
    // TODO: call Claude API to analyse and explain genre preferences
    return this.fallback.getGenreAffinity();
  }
}
