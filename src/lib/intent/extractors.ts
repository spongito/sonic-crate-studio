
export class ContentExtractor {
  static extractPossibleArtists(prompt: string): string[] {
    // For now return empty array as per original implementation
    // TODO: Implement robust artist name extraction
    return [];
  }

  static extractPossibleTracks(prompt: string): string[] {
    // For now return empty array as per original implementation
    // TODO: Implement robust track name extraction
    return [];
  }

  static detectActivity(prompt: string): string | null {
    const promptLower = prompt.toLowerCase();
    const activityWords = [
      'workout', 'study', 'wedding', 'party',
      'meditation', 'driving', 'nighttime'
    ];

    for (const activity of activityWords) {
      if (promptLower.includes(activity)) {
        return activity;
      }
    }
    return null;
  }
}
