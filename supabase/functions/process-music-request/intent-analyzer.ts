
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
  // Western genres
  "rock", "pop", "hip hop", "rap", "jazz", "blues", "country", "r&b", "soul",
  "electronic", "dance", "techno", "house", "ambient", "classical", "folk",
  "reggae", "metal", "punk", "indie", "alternative", "disco", "funk",
  
  // Diaspora-specific genres
  "afrobeat", "afrobeats", "amapiano", "dancehall", "soca", "reggaeton", 
  "dembow", "bachata", "kompa", "zouk", "kizomba", "highlife", "jùjú",
  "fuji", "soukous", "coupé-décalé", "gqom", "drill", "grime", "trap"
];

// Activity-based mapping for diaspora-aware music selection
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

// Keywords that suggest activity-based search
const activityKeywords = {
  "workout": ["workout", "gym", "exercise", "fitness", "training"],
  "study": ["study", "focus", "concentration", "reading", "work"],
  "wedding": ["wedding", "celebration", "ceremony", "reception", "love"],
  "party": ["party", "club", "dance", "festival", "celebration"],
  "meditation": ["meditation", "relax", "calm", "peace", "mindfulness"],
  "driving": ["driving", "road", "trip", "car", "journey"],
  "nighttime": ["night", "evening", "late", "sleep", "bedtime"]
};

export async function createStructuredIntent(prompt: string, advancedParams: any) {
  // Base intent structure with improved categorization
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
    
    // New fields for intent classification and enhanced search
    intent_type: classifyIntent(prompt),
    possible_artists: extractPossibleArtists(prompt),
    possible_tracks: extractPossibleTracks(prompt),
    activity_context: detectActivity(prompt)
  };

  // Apply activity-based settings if detected
  if (baseIntent.activity_context && activityMappings[baseIntent.activity_context]) {
    const activityMap = activityMappings[baseIntent.activity_context];
    baseIntent.bpm_range = activityMap.bpm_range;
    baseIntent.energy = activityMap.energy;
    baseIntent.valence = activityMap.valence;
    
    // Only set genre if not already specified in advanced params
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

function classifyIntent(prompt: string): string {
  const promptLower = prompt.toLowerCase();
  const words = promptLower.split(/\s+/).filter(w => w.length > 1);
  
  // Check for track search intent (explicit mention of song or track)
  if (promptLower.includes(" song") || 
      promptLower.includes(" track") || 
      promptLower.includes("play ") || 
      promptLower.match(/.*by\s+[a-z]/i)) {
    return "track_search";
  }
  
  // Check for activity search
  for (const [activity, keywords] of Object.entries(activityKeywords)) {
    for (const keyword of keywords) {
      if (promptLower.includes(keyword)) {
        return "activity_search";
      }
    }
  }
  
  // Check if it's likely an artist search (2+ words that don't match common descriptors)
  if (words.length >= 2 && !words.some(word => 
    commonGenres.some(genre => genre.includes(word)) || 
    Object.values(moodMap).flat().includes(word))) {
    return "artist_search";
  }
  
  // Default to theme search
  return "theme_search";
}

function extractPossibleArtists(prompt: string): string[] {
  // Simple extraction - will be enhanced by GPT analysis
  const words = prompt.split(/\s+/);
  return words
    .filter(word => word.length > 3 && !commonGenres.some(g => g.includes(word.toLowerCase())));
}

function extractPossibleTracks(prompt: string): string[] {
  // Extract potential track titles
  const trackMatches = prompt.match(/["']([^"']+)["']/g);
  if (trackMatches) {
    return trackMatches.map(m => m.replace(/["']/g, ''));
  }
  
  // Look for "by" pattern: "X by Y" where X is track and Y is artist
  const byMatch = prompt.match(/(.+?)\s+by\s+(.+)/i);
  if (byMatch) {
    return [byMatch[1].trim()];
  }
  
  return [];
}

function detectActivity(prompt: string): string | null {
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

async function analyzePromptWithGPT(prompt: string, advancedParams: any, baseIntent: any) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: `You are a music curation AI that specializes in Black American, Afro-Caribbean, 
            Afro-Latinx, and African diaspora music culture. Analyze the user's playlist request and 
            provide detailed music recommendations. Your analysis should include:
            
            1. intent_type: One of ["artist_search", "track_search", "theme_search", "activity_search"]
            2. artists: Array of possible artist names mentioned (empty if none)
            3. tracks: Array of possible track names mentioned (empty if none)
            4. genres: Array of relevant genres with focus on diaspora music (afrobeat, amapiano, dancehall, soca, etc)
            5. mood: Array of mood descriptors  
            6. energy: Number between 0-1 (0 for calm, 1 for high energy)
            7. danceability: Number between 0-1 (how danceable the music should be)
            8. valence: Number between 0-1 (0 for sad/negative, 1 for happy/positive)
            9. bpm_range: Object with min and max BPM if applicable
            10. activity: Detected activity (workout, party, study, etc) or null
            11. cultural_context: Brief insight into the cultural significance if applicable
            
            Return ONLY the JSON object with no other text.`
          },
          { 
            role: "user", 
            content: `Analyze this playlist request with cultural awareness: "${prompt}". 
            Consider these additional parameters: 
            Mode: ${advancedParams.mode || "club-ready"}
            Genre: ${advancedParams.genre || "not specified"}
            Commercial Factor: ${advancedParams.commercialFactor}/100 (higher means more commercial)
            Reference Artists: ${advancedParams.referenceArtists || "none"}`
          }
        ],
        temperature: 0.3,
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    const intentText = data.choices[0].message.content.trim();
    
    let intentObject;
    try {
      const jsonMatch = intentText.match(/```(?:json)?\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[2]) : intentText;
      intentObject = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Error parsing GPT response as JSON:", parseError);
      console.log("Raw response:", intentText);
      throw new Error("Failed to parse intent from GPT response");
    }
    
    // Map GPT output to our intent structure
    return {
      intent_type: intentObject.intent_type || baseIntent.intent_type,
      possible_artists: intentObject.artists || baseIntent.possible_artists,
      possible_tracks: intentObject.tracks || baseIntent.possible_tracks,
      genres: intentObject.genres || [],
      mood_tags: intentObject.mood || baseIntent.mood_tags,
      energy: intentObject.energy !== undefined ? intentObject.energy : baseIntent.energy,
      danceability: intentObject.danceability !== undefined ? intentObject.danceability : baseIntent.danceability,
      valence: intentObject.valence !== undefined ? intentObject.valence : baseIntent.valence,
      bpm_range: intentObject.bpm_range || baseIntent.bpm_range,
      activity_context: intentObject.activity || baseIntent.activity_context,
      cultural_context: intentObject.cultural_context || null,
      key_preference: intentObject.key_preference || null,
      era_preference: intentObject.era_preference || null
    };
  } catch (error) {
    console.error("Error in GPT analysis:", error);
    throw error;
  }
}

function extractMoodWords(prompt: string) {
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

function extractGenre(prompt: string) {
  const promptLower = prompt.toLowerCase();
  for (const genre of commonGenres) {
    if (promptLower.includes(genre)) {
      return genre;
    }
  }
  return "";
}

function extractKeywords(prompt: string) {
  const words = prompt.toLowerCase().split(/\s+/);
  const stopwords = ["a", "an", "the", "and", "or", "but", "for", "with", "in", "on", "at", "to", "of"];
  
  return words
    .filter(word => !stopwords.includes(word))
    .filter(word => word.length > 3)
    .slice(0, 5);
}

function parseSetLength(lengthStr: string) {
  if (!lengthStr) return 90;
  
  const match = lengthStr.match(/^(\d+(?:\.\d+)?)h$/);
  if (match) {
    return Math.round(parseFloat(match[1]) * 60);
  }
  
  const minutesMatch = lengthStr.match(/^(\d+)m$/);
  if (minutesMatch) {
    return parseInt(minutesMatch[1]);
  }
  
  return 90;
}

function calculateObscurityLevel(commercialFactor: number) {
  if (commercialFactor === undefined || commercialFactor === null) return 0.5;
  return 1 - (commercialFactor / 100);
}

function calculateEnergyFromMoods(moods: string[]) {
  if (!moods || moods.length === 0) return 0.5;
  
  const energyMap: { [key: string]: number } = {
    "energetic": 0.9,
    "happy": 0.7,
    "uplifting": 0.7,
    "dark": 0.6,
    "romantic": 0.4,
    "calm": 0.2,
    "sad": 0.3,
    "nostalgic": 0.5,
    "neutral": 0.5
  };
  
  let totalEnergy = 0;
  let countedMoods = 0;
  
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
    case "club-ready":
      return 0.8;
    case "crate-dig":
      return 0.6;
    case "classic":
      return 0.5;
    default:
      return 0.5;
  }
}

function calculateValenceFromMoods(moods: string[]) {
  if (!moods || moods.length === 0) return 0.5;
  
  const valenceMap: { [key: string]: number } = {
    "happy": 0.9,
    "uplifting": 0.8,
    "energetic": 0.7,
    "nostalgic": 0.6,
    "romantic": 0.6,
    "calm": 0.5,
    "dark": 0.3,
    "sad": 0.2,
    "neutral": 0.5
  };
  
  let totalValence = 0;
  let countedMoods = 0;
  
  for (const mood of moods) {
    if (valenceMap[mood] !== undefined) {
      totalValence += valenceMap[mood];
      countedMoods++;
    }
  }
  
  return countedMoods > 0 ? totalValence / countedMoods : 0.5;
}
