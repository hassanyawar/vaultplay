import type { Recommendation, StalledGame, GenreAffinity } from './types';

export interface IDiscoveryService {
  getNextToPlay(): Promise<Recommendation[]>;
  getStalledGames(): Promise<StalledGame[]>;
  getGenreAffinity(): Promise<GenreAffinity[]>;
}
