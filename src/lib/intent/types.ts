
export type IntentType = 'artist_search' | 'track_search' | 'theme_search' | 'activity_search';

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

export type ParsedIntent = Intent & { type: IntentType };
