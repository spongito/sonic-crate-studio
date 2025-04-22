import { JobType } from '@/types/job';
import { activityMappings } from '@/lib/activityMapping';

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

interface UIInputs {
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

export class IntentService {
  static classifyIntent(prompt: string): JobType {
    const lowercasePrompt = prompt.toLowerCase();

    if (lowercasePrompt.includes('by') || 
        lowercasePrompt.includes('song') || 
        lowercasePrompt.includes('track')) {
      return 'track_search';
    }

    const activityKeywords = Object.keys(activityMappings);
    for (const activity of activityKeywords) {
      if (lowercasePrompt.includes(activity)) {
        return 'activity_search';
      }
    }

    return 'theme_search';
  }

  static parse(inputs: UIInputs): ParsedIntent {
    const type = this.classifyIntent(inputs.prompt);
    const baseIntent: Intent = {
      prompt: inputs.prompt,
      platforms: inputs.platforms || ['spotify', 'youtube_audio']
    };

    if (inputs.advancedParams) {
      const filters: Intent['filters'] = {};
      const { activeFilters } = inputs.advancedParams;

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

  private static analyzeIntent(prompt: string, jobType: JobType): IntentAnalysis {
    switch (jobType) {
      case 'activity_search':
        return this.analyzeActivityIntent(prompt);
      case 'track_search':
        return this.analyzeTrackIntent(prompt);
      case 'theme_search':
        return this.analyzeThemeIntent(prompt);
      default:
        return this.defaultIntent();
    }
  }

  private static analyzeActivityIntent(prompt: string): IntentAnalysis {
    const lowercasePrompt = prompt.toLowerCase();
    
    const activities = Object.keys(activityMappings);
    const matchedActivity = activities.find(activity => 
      lowercasePrompt.includes(activity)
    );

    if (matchedActivity) {
      const activityDetails = activityMappings[matchedActivity];
      return {
        type: 'activity_search',
        genres: activityDetails.genres,
        bpm_range: activityDetails.bpm_range,
        energy: activityDetails.energy,
        valence: activityDetails.valence
      };
    }

    return this.defaultIntent();
  }

  private static analyzeTrackIntent(prompt: string): IntentAnalysis {
    return {
      type: 'track_search',
      genres: [],
      energy: 0.5,
      valence: 0.5
    };
  }

  private static analyzeThemeIntent(prompt: string): IntentAnalysis {
    return {
      type: 'theme_search',
      genres: [],
      energy: 0.5,
      valence: 0.5
    };
  }

  private static defaultIntent(): IntentAnalysis {
    return {
      type: 'theme_search',
      genres: [],
      energy: 0.5,
      valence: 0.5
    };
  }

  private static extractPossibleArtists(prompt: string): string[] {
    // Implement logic to extract possible artists from the prompt
    return [];
  }

  private static extractPossibleTracks(prompt: string): string[] {
    // Implement logic to extract possible tracks from the prompt
    return [];
  }

  private static extractMoodWords(prompt: string): string[] {
    // Implement logic to extract mood words from the prompt
    return [];
  }

  private static extractGenre(prompt: string): string {
    // Implement logic to extract genre from the prompt
    return '';
  }

  private static extractKeywords(prompt: string): string[] {
    // Implement logic to extract keywords from the prompt
    return [];
  }

  private static detectActivity(prompt: string): string {
    // Implement logic to detect activity from the prompt
    return '';
  }
}
