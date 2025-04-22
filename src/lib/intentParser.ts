import { activityMappings } from '@/lib/activityMapping';
import { JobType } from '@/types/job';

export interface UIInputs {
  prompt: string;
  platforms?: ('spotify' | 'youtube_audio')[];
  advancedParams?: {
    commercialFactor?: number;
    releaseYearRange?: [number, number];
    genre?: string;
    locations?: string[];
    bpmRange?: [number, number];
    referenceArtists?: string;
    referenceTracks?: string;
    activeFilters: {
      genre: boolean;
      location: boolean;
      releaseYear: boolean;
      commercial: boolean;
      references: boolean;
      bpm: boolean;
    };
  };
}

export interface Intent {
  prompt: string;
  platforms: ('spotify' | 'youtube_audio')[];
  seeds?: { 
    artists?: string[]; 
    tracks?: string[] 
  };
  filters?: {
    commercialBalance?: number;
    releaseYearRange?: [number, number];
    genres?: string[];
    location?: string;
    bpmRange?: [number, number];
  };
}

export type IntentType = 'artist_search' | 'track_search' | 'theme_search' | 'activity_search';
export type ParsedIntent = Intent & { type: IntentType };

export class IntentService {
  /**
   * Classifies the input prompt into one of four intent types
   */
  static classifyIntent(prompt: string): IntentType {
    const lowercasePrompt = prompt.toLowerCase();

    // Check for explicit artist/track search indicators
    if (lowercasePrompt.includes('by') || 
        lowercasePrompt.includes('song') || 
        lowercasePrompt.includes('track')) {
      return 'track_search';
    }

    // Check for activity-based search
    const activityKeywords = Object.keys(activityMappings);
    for (const activity of activityKeywords) {
      if (lowercasePrompt.includes(activity)) {
        return 'activity_search';
      }
    }

    // Default to theme search
    return 'theme_search';
  }

  /**
   * Main function to parse UI inputs into a normalized intent object
   */
  static parse(inputs: UIInputs): ParsedIntent {
    const type = this.classifyIntent(inputs.prompt);
    const baseIntent: Intent = {
      prompt: inputs.prompt,
      platforms: inputs.platforms || ['spotify', 'youtube_audio']
    };

    // Process advanced filters if present
    if (inputs.advancedParams) {
      const filters: Intent['filters'] = {};
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
          type,
          seeds: {
            artists: this.extractPossibleArtists(inputs.prompt)
          }
        };

      case 'track_search':
        return {
          ...baseIntent,
          type,
          seeds: {
            tracks: this.extractPossibleTracks(inputs.prompt)
          }
        };

      case 'activity_search': {
        const activity = this.detectActivity(inputs.prompt);
        const activityParams = activity ? activityMappings[activity] : null;

        return {
          ...baseIntent,
          type,
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
        return {
          ...baseIntent,
          type
        };
    }
  }

  private static extractPossibleArtists(prompt: string): string[] {
    // Implement logic to extract possible artists from the prompt
    return [];
  }

  private static extractPossibleTracks(prompt: string): string[] {
    // Implement logic to extract possible tracks from the prompt
    return [];
  }

  private static detectActivity(prompt: string): string | null {
    const promptLower = prompt.toLowerCase();
    for (const activity of Object.keys(activityMappings)) {
      if (promptLower.includes(activity)) {
        return activity;
      }
    }
    return null;
  }

  public static analyzeIntent(prompt: string, jobType: JobType): any {
    throw new Error("Method not implemented.");
  }
}
