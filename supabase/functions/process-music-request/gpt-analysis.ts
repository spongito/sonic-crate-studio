
/**
 * GPT-based intent enhancement logic for playlist curation
 */
export async function analyzePromptWithGPT(prompt: string, advancedParams: any, baseIntent: any) {
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
