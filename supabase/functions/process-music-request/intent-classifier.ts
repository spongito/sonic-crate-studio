
/**
 * Functions for intent type classification and intent-related keyword extraction
 */

const moodMap = {
  "happy": ["happy", "upbeat", "cheerful", "joyful", "uplifting"],
  "sad": ["sad", "melancholy", "somber", "depressing", "gloomy"],
  "calm": ["calm", "peaceful", "relaxing", "chill", "soothing"],
  "energetic": ["energetic", "lively", "dynamic", "excited", "pumped"],
  "romantic": ["romantic", "love", "sensual", "intimate"],
  "dark": ["dark", "moody", "atmospheric", "mysterious"],
  "uplifting": ["uplifting", "inspiring", "motivational", "empowering"],
  "nostalgic": ["nostalgic", "retro", "throwback", "classic"]
};

const commonGenres = [
  "rock", "pop", "hip hop", "rap", "jazz", "blues", "country", "r&b", "soul",
  "electronic", "dance", "techno", "house", "ambient", "classical", "folk",
  "reggae", "metal", "punk", "indie", "alternative", "disco", "funk",
  "afrobeat", "afrobeats", "amapiano", "dancehall", "soca", "reggaeton", 
  "dembow", "bachata", "kompa", "zouk", "kizomba", "highlife", "jùjú",
  "fuji", "soukous", "coupé-décalé", "gqom", "drill", "grime", "trap"
];

const activityKeywords = {
  "workout": ["workout", "gym", "exercise", "fitness", "training"],
  "study": ["study", "focus", "concentration", "reading", "work"],
  "wedding": ["wedding", "celebration", "ceremony", "reception", "love"],
  "party": ["party", "club", "dance", "festival", "celebration"],
  "meditation": ["meditation", "relax", "calm", "peace", "mindfulness"],
  "driving": ["driving", "road", "trip", "car", "journey"],
  "nighttime": ["night", "evening", "late", "sleep", "bedtime"]
};

export function classifyIntent(prompt: string): string {
  const promptLower = prompt.toLowerCase();
  const words = promptLower.split(/\s+/).filter(w => w.length > 1);

  if (promptLower.includes(" song") || 
      promptLower.includes(" track") || 
      promptLower.includes("play ") || 
      promptLower.match(/.*by\s+[a-z]/i)) {
    return "track_search";
  }
  for (const [activity, keywords] of Object.entries(activityKeywords)) {
    for (const keyword of keywords) {
      if (promptLower.includes(keyword)) {
        return "activity_search";
      }
    }
  }
  if (words.length >= 2 && !words.some(word => 
    commonGenres.some(genre => genre.includes(word)) || 
    Object.values(moodMap).flat().includes(word))) {
    return "artist_search";
  }
  return "theme_search";
}

export function extractPossibleArtists(prompt: string): string[] {
  const words = prompt.split(/\s+/);
  return words
    .filter(word => word.length > 3 && !commonGenres.some(g => g.includes(word.toLowerCase())));
}

export function extractPossibleTracks(prompt: string): string[] {
  const trackMatches = prompt.match(/["']([^"']+)["']/g);
  if (trackMatches) {
    return trackMatches.map(m => m.replace(/["']/g, ''));
  }
  const byMatch = prompt.match(/(.+?)\s+by\s+(.+)/i);
  if (byMatch) {
    return [byMatch[1].trim()];
  }
  return [];
}

export function extractMoodWords(prompt: string) {
  const promptLower = prompt.toLowerCase();
  const foundMoods = [];
  for (const [mood, keywords] of Object.entries(moodMap)) {
    for (const keyword of keywords) {
      if (promptLower.includes(keyword) && !foundMoods.includes(mood)) {
        foundMoods.push(mood);
      }
    }
  }
  return foundMoods.length > 0 ? foundMoods : ["neutral"];
}

export function extractGenre(prompt: string) {
  const promptLower = prompt.toLowerCase();
  for (const genre of commonGenres) {
    if (promptLower.includes(genre)) {
      return genre;
    }
  }
  return "";
}

export function extractKeywords(prompt: string) {
  const words = prompt.toLowerCase().split(/\s+/);
  const stopwords = ["a", "an", "the", "and", "or", "but", "for", "with", "in", "on", "at", "to", "of"];
  return words
    .filter(word => !stopwords.includes(word))
    .filter(word => word.length > 3)
    .slice(0, 5);
}

export function detectActivity(prompt: string): string | null {
  const promptLower = prompt.toLowerCase();
  for (const [activity, keywords] of Object.entries(activityKeywords)) {
    for (const keyword of keywords) {
      if (promptLower.includes(keyword)) {
        return activity;
      }
    }
  }
  return null;
}
