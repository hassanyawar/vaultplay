import { RuleBasedDiscoveryService } from './rule-based';
import { AiDiscoveryService } from './ai';
import type { IDiscoveryService } from './interface';

export const discoveryService: IDiscoveryService = process.env.ANTHROPIC_API_KEY
  ? new AiDiscoveryService()
  : new RuleBasedDiscoveryService();

export type { IDiscoveryService };
export type { Recommendation, StalledGame, GenreAffinity, DiscoverySummary } from './types';
