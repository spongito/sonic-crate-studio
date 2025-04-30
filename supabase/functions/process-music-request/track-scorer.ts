const notes = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];

export function scoreTracksBasedOnIntent(tracks: any[], intent: any) {
  // Keep track of artists we've seen to promote diversity
  const artistCounts: Record<string, number> = {};
  const artistFirstScore: Record<string, number> = {};
  
  // Keep track of release years to promote diversity
  const yearCounts: Record<string, number> = {};
  const yearFirstScore: Record<string, number> = {};
  
  return tracks.map((track, index) => {
    // Start with a base score
    let score = 50;
    let matchFactors: Record<string, number> = {};
    
    // Update artist and year tracking for diversity calculation
    const artistKey = track.artist?.toString() || 'unknown';
    artistCounts[artistKey] = (artistCounts[artistKey] || 0) + 1;
    if (artistCounts[artistKey] === 1) {
      artistFirstScore[artistKey] = score;
    }
    
    const releaseYear = track.release_year || 
      (track.album?.release_date ? parseInt(track.album.release_date.substring(0, 4)) : null);
    
    if (releaseYear) {
      const yearKey = releaseYear.toString();
      yearCounts[yearKey] = (yearCounts[yearKey] || 0) + 1;
      if (yearCounts[yearKey] === 1) {
        yearFirstScore[yearKey] = score;
      }
    }
    
    // Score audio features if available
    if (track.audio_features) {
      // Energy match
      if (intent.energy !== undefined && track.audio_features.energy !== undefined) {
        const energyDiff = Math.abs(intent.energy - track.audio_features.energy);
        const energyScore = 10 - (energyDiff * 20);
        score += energyScore;
        matchFactors.energy = energyScore;
      }
      
      // Danceability match
      if (intent.danceability !== undefined && track.audio_features.danceability !== undefined) {
        const danceabilityDiff = Math.abs(intent.danceability - track.audio_features.danceability);
        const danceabilityScore = 10 - (danceabilityDiff * 20);
        score += danceabilityScore;
        matchFactors.danceability = danceabilityScore;
      }
      
      // Valence (mood) match
      if (intent.valence !== undefined && track.audio_features.valence !== undefined) {
        const valenceDiff = Math.abs(intent.valence - track.audio_features.valence);
        const valenceScore = 10 - (valenceDiff * 20);
        score += valenceScore;
        matchFactors.valence = valenceScore;
      }
      
      // BPM match - higher score for tracks in the target BPM range
      if ((intent.bpm_range || intent.tempo_range) && track.audio_features.tempo) {
        const tempo = track.audio_features.tempo;
        const bpmRange = intent.bpm_range || intent.tempo_range;
        
        if (bpmRange.min && bpmRange.max) {
          if (tempo >= bpmRange.min && tempo <= bpmRange.max) {
            const bpmScore = 10;
            score += bpmScore;
            matchFactors.bpm = bpmScore;
          } else {
            // Calculate how far outside the range
            const minDiff = bpmRange.min ? Math.max(0, bpmRange.min - tempo) : 0;
            const maxDiff = bpmRange.max ? Math.max(0, tempo - bpmRange.max) : 0;
            const totalDiff = minDiff + maxDiff;
            const bpmScore = Math.max(0, 10 - Math.min(10, totalDiff / 10));
            score += bpmScore;
            matchFactors.bpm = bpmScore;
          }
        }
      }
      
      // Key signature match
      if (intent.key_preference && track.audio_features.key !== undefined) {
        const keyName = formatKey(track.audio_features.key, track.audio_features.mode);
        if (keyName.toLowerCase() === intent.key_preference.toLowerCase()) {
          const keyScore = 5;
          score += keyScore;
          matchFactors.key = keyScore;
        }
      }
    }
    
    // Popularity match based on target commerciality/obscurity
    if (track.popularity !== undefined && intent.commercialFactor !== undefined) {
      const targetPopularity = intent.commercialFactor;
      const popularityDiff = Math.abs(targetPopularity - track.popularity);
      const popularityScore = 10 - Math.min(10, popularityDiff / 10);
      score += popularityScore;
      matchFactors.popularity = popularityScore;
    } else if (track.popularity !== undefined && intent.obscurity !== undefined) {
      const targetPopularity = (1 - intent.obscurity) * 100;
      const popularityDiff = Math.abs(targetPopularity - track.popularity);
      const popularityScore = 10 - Math.min(10, popularityDiff / 10);
      score += popularityScore;
      matchFactors.popularity = popularityScore;
    }
    
    // Cultural context bias - bonus for tracks from target genre
    // This helps promote diaspora music when that's the intent
    if (intent.genres && Array.isArray(intent.genres) && intent.genres.length > 0) {
      // Bonus for tracks in target genres (maintaining cultural focus)
      const title = (track.title || track.name || '').toLowerCase();
      const artistName = (track.artist || []).join(' ').toLowerCase();
      
      // Look for genre keywords in track title or artist
      const genreMatch = intent.genres.some((genre: string) => {
        const genreKeywords = genre.toLowerCase().split(/\s+/);
        return genreKeywords.some(keyword => 
          title.includes(keyword) || artistName.includes(keyword)
        );
      });
      
      if (genreMatch) {
        const genreScore = 5;
        score += genreScore;
        matchFactors.genre = genreScore;
      }
    }
    
    // Apply diversity penalty if we've seen this artist or year before
    if (artistCounts[artistKey] > 1) {
      const artistDiversityPenalty = Math.min(15, (artistCounts[artistKey] - 1) * 5);
      score -= artistDiversityPenalty;
      matchFactors.artistDiversity = -artistDiversityPenalty;
    }
    
    if (releaseYear && yearCounts[releaseYear.toString()] > 3) {
      const yearDiversityPenalty = Math.min(5, (yearCounts[releaseYear.toString()] - 3) * 1);
      score -= yearDiversityPenalty;
      matchFactors.yearDiversity = -yearDiversityPenalty;
    }
    
    // Build reasoning message
    let reasoning = "Selected based on ";
    const factors = [];
    
    if (intent.mood_tags && intent.mood_tags.length > 0) {
      factors.push(`mood (${intent.mood_tags.join(', ')})`);
    }
    
    if (intent.genre && intent.genre !== "any") {
      factors.push(`genre (${intent.genre})`);
    } else if (intent.genres && intent.genres.length > 0) {
      factors.push(`genres (${intent.genres.slice(0, 2).join(', ')})`);
    }
    
    if (track.audio_features && track.audio_features.energy !== undefined) {
      factors.push(`energy level (${Math.round(track.audio_features.energy * 100)}%)`);
    }
    
    if (track.audio_features && track.audio_features.danceability !== undefined) {
      factors.push(`danceability (${Math.round(track.audio_features.danceability * 100)}%)`);
    }
    
    if (intent.activity_context) {
      factors.push(`activity (${intent.activity_context})`);
    }
    
    if (intent.intent_type === 'artist_search' && intent.possible_artists && intent.possible_artists.length > 0) {
      factors.push(`artist search (${intent.possible_artists.slice(0, 2).join(', ')})`);
    }
    
    reasoning += factors.join(', ');
    
    // Cap the score between 0 and 100
    score = Math.min(100, Math.max(0, Math.round(score)));
    
    return {
      ...track,
      match_score: score,
      score: score,
      match_factors: matchFactors,
      reasoning: reasoning
    };
  }).sort((a, b) => b.match_score - a.match_score);
}

export function formatKey(key: number, mode: number) {
  if (key === undefined || mode === undefined || key < 0 || key >= notes.length) {
    return "Unknown";
  }
  return `${notes[key]} ${mode === 1 ? "Major" : "Minor"}`;
}

export function generatePlaylistName(intent: any) {
  // Get the original search query
  const query = intent.original_prompt || "";
  
  // Truncate the query if it's too long
  const truncatedQuery = query.length > 40 ? query.substring(0, 37) + "..." : query;
  
  // Get current date and time in a readable format
  const currentDate = new Date();
  const dateTimeStr = currentDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  // If we have a meaningful query, use it as the base for the name
  if (truncatedQuery.length > 0) {
    return `${truncatedQuery} - ${dateTimeStr}`;
  }
  
  // Otherwise fall back to the previous naming logic
  let name = "";
  
  if (intent.activity_context) {
    name += `${intent.activity_context.charAt(0).toUpperCase() + intent.activity_context.slice(1)} `;
  }
  
  if (intent.genres && intent.genres.length > 0) {
    name += intent.genres[0].charAt(0).toUpperCase() + intent.genres[0].slice(1) + " ";
  } else if (intent.genre && intent.genre !== "any") {
    name += intent.genre.charAt(0).toUpperCase() + intent.genre.slice(1) + " ";
  }
  
  if (intent.mood_tags && intent.mood_tags.length > 0) {
    name += intent.mood_tags[0].charAt(0).toUpperCase() + intent.mood_tags[0].slice(1) + " ";
  }
  
  // Add descriptor based on intent type
  if (intent.intent_type === 'artist_search' && intent.possible_artists && intent.possible_artists.length > 0) {
    name += `${intent.possible_artists[0]} Mix`;
  } else {
    switch (intent.style) {
      case "club-ready":
        name += "Club Mix";
        break;
      case "crate-dig":
        name += "Deep Cuts";
        break;
      case "classic":
        name += "Classics";
        break;
      default:
        name += "Playlist";
    }
  }
  
  // Always add date/time to the name
  return `${name.trim()} - ${dateTimeStr}`;
}
