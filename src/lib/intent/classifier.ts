
import { IntentType } from './types';
import { activityMappings } from '@/lib/activityMapping';

export class IntentClassifier {
  static classify(prompt: string): IntentType {
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
}
