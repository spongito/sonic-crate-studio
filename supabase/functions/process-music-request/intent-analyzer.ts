
// Intent analyzer main file: orchestration only, uses split helpers for maintainability

import {
  classifyIntent,
  extractPossibleArtists,
  extractPossibleTracks,
  extractMoodWords,
  extractGenre,
  extractKeywords,
  detectActivity
} from './intent-classifier.ts';
import { activityMappings } from './activity-mapping.ts';
import { analyzePromptWithGPT } from './gpt-analysis.ts';

function parseSetLength(lengthStr: string) {
  if (!lengthStr) return 90;
  const match = lengthStr.match(/^(\d+(?:\.\d+)?)h$/);
  if (match) return Math.round(parseFloat(match[1]) * 60);
  const minutesMatch = lengthStr.match(/^(\d+)m$/);
  if (minutesMatch) return parseInt(minutesMatch[1]);
  return 90;
}

function calculateObscurityLevel(commercialFactor: number) {
  if (commercialFactor === undefined || commercialFactor === null) return 0.5;
  return 1 - (commercialFactor / 100);
}

function calculateEnergyFromMoods(moods: string[]) {
  if (!moods || moods.length === 0) return 0.5;
  const energyMap: { [key: string]: number } = {
    "energetic": 0.9, "happy": 0.7, "uplifting": 0.7, "dark": 0.6,
    "romantic": 0.4, "calm": 0.2, "sad": 0.3, "nostalgic": 0.5, "neutral": 0.5
  };
  let totalEnergy = 0, countedMoods = 0;
  for (const mood of moods) {
    if (energyMap[mood] !== undefined) {
      totalEnergy += energyMap[mood];
      countedMoods++;
    }
  }
  return countedMoods > 0 ? totalEnergy / countedMoods : 0.5;
}

function calculateDanceabilityFromStyle(style: string) {
  switch (style) {
    case "club-ready": return 0.8;
    case "crate-dig": return 0.6;
    case "classic": return 0.5;
    default: return 0.5;
  }
}

function calculateValenceFromMoods(moods: string[]) {
  if (!moods || moods.length === 0) return 0.5;
  const valenceMap: { [key: string]: number } = {
    "happy": 0.9,"uplifting": 0.8,"energetic": 0.7,"nostalgic": 0.6,
    "romantic": 0.6,"calm": 0.5,"dark": 0.3,"sad": 0.2,"neutral": 0.5
  };
  let totalValence = 0, countedMoods = 0;
  for (const mood of moods) {
    if (valenceMap[mood] !== undefined) {
      totalValence += valenceMap[mood];
      countedMoods++;
    }
  }
  return countedMoods > 0 ? totalValence / countedMoods : 0.5;
}

export async function createStructuredIntent(prompt: string, advancedParams: any) {
  const baseIntent = {
    original_prompt: prompt,
    advanced_params: advancedParams,
    description: advancedParams.description || prompt,
    mood_tags: extractMoodWords(prompt),
    genre: advancedParams.genre || extractGenre(prompt) || "",
    style: advancedParams.mode || "club-ready",
    set_length_minutes: parseSetLength(advancedParams.length),
    obscurity: calculateObscurityLevel(advancedParams.commercialFactor),
    reference_artists: advancedParams.referenceArtists ? advancedParams.referenceArtists.split(',').map((a: string) => a.trim()) : [],
    keywords: extractKeywords(prompt),
    energy: calculateEnergyFromMoods(extractMoodWords(prompt)),
    danceability: calculateDanceabilityFromStyle(advancedParams.mode || "club-ready"),
    valence: calculateValenceFromMoods(extractMoodWords(prompt)),

    intent_type: classifyIntent(prompt),
    possible_artists: extractPossibleArtists(prompt),
    possible_tracks: extractPossibleTracks(prompt),
    activity_context: detectActivity(prompt)
  };

  if (baseIntent.activity_context && activityMappings[baseIntent.activity_context]) {
    const activityMap = activityMappings[baseIntent.activity_context];
    baseIntent.bpm_range = activityMap.bpm_range;
    baseIntent.energy = activityMap.energy;
    baseIntent.valence = activityMap.valence;
    if (!advancedParams.genre || advancedParams.genre === "any") {
      baseIntent.suggested_genres = activityMap.genres;
    }
  }

  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (openAIApiKey) {
    try {
      const enhancedIntent = await analyzePromptWithGPT(prompt, advancedParams, baseIntent);
      return { ...baseIntent, ...enhancedIntent };
    } catch (error) {
      console.error("Error analyzing prompt with GPT:", error);
      console.log("Falling back to basic intent analysis");
      return baseIntent;
    }
  }

  return baseIntent;
}
