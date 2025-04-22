import { JobType, IntentAnalysis } from '@/types/job';
import { activityMappings } from './activityMapping';

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

  static analyzeIntent(prompt: string, jobType: JobType): IntentAnalysis {
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
    // Basic track search intent
    return {
      type: 'track_search',
      genres: [],
      energy: 0.5,
      valence: 0.5
    };
  }

  private static analyzeThemeIntent(prompt: string): IntentAnalysis {
    // Basic theme search intent
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
}

// Reusing the existing activity mappings
const activityMappings = {
  "workout": {
    genres: ["drill", "trap", "afrobeat", "dancehall", "gqom"],
    bpm_range: { min: 120, max: 150 },
    energy: 0.8,
    valence: 0.7
  },
  "study": {
    genres: ["lo-fi", "chill hip hop", "jazz", "boom bap", "soul"],
    bpm_range: { min: 60, max: 90 },
    energy: 0.3,
    valence: 0.5
  },
  "wedding": {
    genres: ["afro-pop", "soca", "r&b", "soul", "reggae"],
    bpm_range: { min: 85, max: 115 },
    energy: 0.6,
    valence: 0.8
  },
  "party": {
    genres: ["dancehall", "amapiano", "afrobeats", "dembow", "trap", "soca"],
    bpm_range: { min: 105, max: 130 },
    energy: 0.8,
    valence: 0.8
  },
  "meditation": {
    genres: ["spiritual jazz", "ambient", "traditional", "soul"],
    bpm_range: { min: 50, max: 70 },
    energy: 0.2,
    valence: 0.4
  },
  "driving": {
    genres: ["r&b", "hip hop", "afro", "grime"],
    bpm_range: { min: 75, max: 105 },
    energy: 0.5,
    valence: 0.4
  },
  "nighttime": {
    genres: ["r&b", "chill trap", "afrobeats", "alternative r&b"],
    bpm_range: { min: 75, max: 105 },
    energy: 0.4,
    valence: 0.4
  }
};
