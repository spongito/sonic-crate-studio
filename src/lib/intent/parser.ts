
import { IntentClassifier } from './classifier';
import { ContentExtractor } from './extractors';
import { type UIInputs, type ParsedIntent } from './types';
import { activityMappings } from '@/lib/activityMapping';

export class IntentParser {
  /**
   * Main function to parse UI inputs into a normalized intent object
   */
  static parse(inputs: UIInputs): ParsedIntent {
    const type = IntentClassifier.classify(inputs.prompt);
    const baseIntent: ParsedIntent = {
      type,
      prompt: inputs.prompt,
      platforms: inputs.platforms || ['spotify', 'youtube_audio']
    };

    // Process advanced filters if present
    if (inputs.advancedParams) {
      const filters: ParsedIntent['filters'] = {};
      const { activeFilters } = inputs.advancedParams;

      // Only include filters that are explicitly toggled on
      if (activeFilters.commercial && inputs.advancedParams.commercialFactor !== undefined) {
        filters.commercialBalance = inputs.advancedParams.commercialFactor / 100;
      }

      if (activeFilters.releaseYear && inputs.advancedParams.releaseYearRange) {
        filters.releaseYearRange = inputs.advancedParams.releaseYearRange;
      }

      if (activeFilters.genre && inputs.advancedParams.genre) {
        filters.genres = [inputs.advancedParams.genre];
      }

      if (activeFilters.location && inputs.advancedParams.locations?.[0]) {
        filters.location = inputs.advancedParams.locations[0];
      }

      if (activeFilters.bpm && inputs.advancedParams.bpmRange) {
        filters.bpmRange = inputs.advancedParams.bpmRange;
      }

      if (Object.keys(filters).length > 0) {
        baseIntent.filters = filters;
      }
    }

    // Add type-specific processing
    switch (type) {
      case 'artist_search':
        return {
          ...baseIntent,
          seeds: {
            artists: ContentExtractor.extractPossibleArtists(inputs.prompt)
          }
        };

      case 'track_search':
        return {
          ...baseIntent,
          seeds: {
            tracks: ContentExtractor.extractPossibleTracks(inputs.prompt)
          }
        };

      case 'activity_search': {
        const activity = ContentExtractor.detectActivity(inputs.prompt);
        const activityParams = activity ? activityMappings[activity] : null;

        return {
          ...baseIntent,
          filters: {
            ...baseIntent.filters,
            genres: activityParams?.genres || [],
            bpmRange: activityParams?.bpm_range ? 
              [activityParams.bpm_range.min, activityParams.bpm_range.max] : 
              undefined
          }
        };
      }

      case 'theme_search':
      default:
        return baseIntent;
    }
  }
}
