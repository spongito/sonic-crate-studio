
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
  "reggae", "metal", "punk", "indie", "alternative", "disco", "funk", "afrobeat"
];

export async function createStructuredIntent(prompt: string, advancedParams: any) {
  const baseIntent = {
    original_prompt: prompt,
    advanced_params: advancedParams,
    description: advancedParams.description || prompt,
    mood_tags: extractMoodWords(prompt),
    genre: advancedParams.genre || extractGenre(prompt) || prompt,
    style: advancedParams.mode || "club-ready",
    set_length_minutes: parseSetLength(advancedParams.length),
    obscurity: calculateObscurityLevel(advancedParams.commercialFactor),
    reference_artists: advancedParams.referenceArtists ? advancedParams.referenceArtists.split(',').map((a: string) => a.trim()) : [],
    keywords: extractKeywords(prompt),
    energy: calculateEnergyFromMoods(extractMoodWords(prompt)),
    danceability: calculateDanceabilityFromStyle(advancedParams.mode || "club-ready"),
    valence: calculateValenceFromMoods(extractMoodWords(prompt))
  };

  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (openAIApiKey) {
    try {
      const enhancedIntent = await analyzePromptWithGPT(prompt, advancedParams);
      return { ...baseIntent, ...enhancedIntent };
    } catch (error) {
      console.error("Error analyzing prompt with GPT:", error);
      console.log("Falling back to basic intent analysis");
      return baseIntent;
    }
  }
  
  return baseIntent;
}

async function analyzePromptWithGPT(prompt: string, advancedParams: any) {
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
            content: `You are a music curation assistant that analyzes user prompts about playlist desires. 
            Extract the following information and return it as a JSON object:
            - mood: array of mood descriptors (e.g. ["energetic", "uplifting", "dark"])
            - genres: array of likely genres (e.g. ["house", "techno", "ambient"])
            - energy: number between 0-1 (0 for calm, 1 for high energy)
            - danceability: number between 0-1 (how danceable the music should be)
            - valence: number between 0-1 (0 for sad/negative, 1 for happy/positive)
            - tempo_range: object with min and max BPM if specified
            - key_preference: music key if specified (e.g. "C Major")
            - era_preference: decade or era if specified (e.g. "90s" or "modern")
            
            Return ONLY the JSON object with no other text.`
          },
          { 
            role: "user", 
            content: `Analyze this playlist request: "${prompt}". 
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
    
    return {
      mood_tags: intentObject.mood || [],
      genres: intentObject.genres || [],
      energy: intentObject.energy !== undefined ? intentObject.energy : 0.5,
      danceability: intentObject.danceability !== undefined ? intentObject.danceability : 0.5,
      valence: intentObject.valence !== undefined ? intentObject.valence : 0.5,
      tempo_range: intentObject.tempo_range || { min: 0, max: 300 },
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
