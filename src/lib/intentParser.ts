
import { JobType, IntentAnalysis } from '@/types/job';
import { activityMappings } from '@/lib/activityMapping';

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
