
import { IntentParser } from './intent/parser';
import type { UIInputs } from './intent/types';

describe('IntentParser', () => {
  describe('parse', () => {
    const defaultInputs: UIInputs = {
      prompt: '',
      platforms: ['spotify'],
      advancedParams: {
        activeFilters: {
          genre: false,
          location: false,
          releaseYear: false,
          commercial: false,
          references: false,
          bpm: false,
        }
      }
    };

    it('should parse artist search correctly', () => {
      const inputs = {
        ...defaultInputs,
        prompt: 'drake playlist'
      };

      const result = IntentParser.parse(inputs);

      expect(result.type).toBe('artist_search');
      expect(result.seeds?.artists).toBeDefined();
      expect(result.prompt).toBe(inputs.prompt);
    });

    it('should parse theme search correctly', () => {
      const inputs = {
        ...defaultInputs,
        prompt: 'golden hour vibe'
      };

      const result = IntentParser.parse(inputs);

      expect(result.type).toBe('theme_search');
      expect(result.seeds).toBeUndefined();
      expect(result.prompt).toBe(inputs.prompt);
    });

    it('should parse activity search and apply mappings', () => {
      const inputs = {
        ...defaultInputs,
        prompt: 'workout mix'
      };

      const result = IntentParser.parse(inputs);

      expect(result.type).toBe('activity_search');
      expect(result.filters?.genres).toBeDefined();
      expect(result.filters?.bpmRange).toBeDefined();
    });

    it('should include active filters and omit inactive ones', () => {
      const inputs = {
        ...defaultInputs,
        prompt: 'chill mix',
        advancedParams: {
          commercialFactor: 75,
          releaseYearRange: [2000, 2020] as [number, number],
          genre: 'jazz',
          locations: ['US'],
          bpmRange: [60, 120] as [number, number],
          activeFilters: {
            genre: true,
            location: true,
            releaseYear: false,
            commercial: true,
            references: false,
            bpm: false,
          }
        }
      };

      const result = IntentParser.parse(inputs);

      expect(result.filters?.commercialBalance).toBe(0.75);
      expect(result.filters?.genres).toEqual(['jazz']);
      expect(result.filters?.location).toBe('US');
      expect(result.filters?.releaseYearRange).toBeUndefined();
      expect(result.filters?.bpmRange).toBeUndefined();
    });
  });
});
