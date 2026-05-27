import type { IDiscoveryService } from './interface';
import type { Recommendation, StalledGame, GenreAffinity } from './types';

// Stub — implement when ANTHROPIC_API_KEY is available.
// Must satisfy IDiscoveryService so the factory can swap it in without
// touching routes or frontend.
export class AiDiscoveryService implements IDiscoveryService {
  async getNextToPlay(): Promise<Recommendation[]> {
    throw new Error('AiDiscoveryService: not yet implemented');
  }

  async getStalledGames(): Promise<StalledGame[]> {
    throw new Error('AiDiscoveryService: not yet implemented');
  }

  async getGenreAffinity(): Promise<GenreAffinity[]> {
    throw new Error('AiDiscoveryService: not yet implemented');
  }
}
