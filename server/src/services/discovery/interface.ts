import type { Recommendation, StalledGame, GenreAffinity } from './types';

export interface IDiscoveryService {
  getNextToPlay(userId: number): Promise<Recommendation[]>;
  getStalledGames(userId: number): Promise<StalledGame[]>;
  getGenreAffinity(userId: number): Promise<GenreAffinity[]>;
}
