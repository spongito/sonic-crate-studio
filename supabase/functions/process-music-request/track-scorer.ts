
const notes = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];

export function scoreTracksBasedOnIntent(tracks: any[], intent: any) {
  return tracks.map(track => {
    let score = 50; // Base score
    
    if (track.audio_features) {
      if (intent.energy !== undefined && track.audio_features.energy !== undefined) {
        const energyDiff = Math.abs(intent.energy - track.audio_features.energy);
        score += 10 - (energyDiff * 20);
      }
      
      if (intent.danceability !== undefined && track.audio_features.danceability !== undefined) {
        const danceabilityDiff = Math.abs(intent.danceability - track.audio_features.danceability);
        score += 10 - (danceabilityDiff * 20);
      }
      
      if (intent.valence !== undefined && track.audio_features.valence !== undefined) {
        const valenceDiff = Math.abs(intent.valence - track.audio_features.valence);
        score += 10 - (valenceDiff * 20);
      }
      
      if (intent.tempo_range && track.audio_features.tempo) {
        const tempo = track.audio_features.tempo;
        if (intent.tempo_range.min && intent.tempo_range.max) {
          if (tempo >= intent.tempo_range.min && tempo <= intent.tempo_range.max) {
            score += 10;
          } else {
            const minDiff = intent.tempo_range.min ? Math.max(0, intent.tempo_range.min - tempo) : 0;
            const maxDiff = intent.tempo_range.max ? Math.max(0, tempo - intent.tempo_range.max) : 0;
            const totalDiff = minDiff + maxDiff;
            score += Math.max(0, 10 - Math.min(10, totalDiff / 10));
          }
        }
      }
      
      if (intent.key_preference && track.audio_features.key !== undefined) {
        const keyName = formatKey(track.audio_features.key, track.audio_features.mode);
        if (keyName.toLowerCase() === intent.key_preference.toLowerCase()) {
          score += 5;
        }
      }
    }
    
    if (track.popularity !== undefined) {
      const targetPopularity = (1 - intent.obscurity) * 100;
      const popularityDiff = Math.abs(targetPopularity - track.popularity);
      score += 10 - Math.min(10, popularityDiff / 10);
    }
    
    let reasoning = "Selected based on ";
    const factors = [];
    
    if (intent.mood_tags && intent.mood_tags.length > 0) {
      factors.push(`mood (${intent.mood_tags.join(', ')})`);
    }
    
    if (intent.genre && intent.genre !== "any") {
      factors.push(`genre (${intent.genre})`);
    }
    
    if (track.audio_features && track.audio_features.energy !== undefined) {
      factors.push(`energy level (${Math.round(track.audio_features.energy * 100)}%)`);
    }
    
    if (track.audio_features && track.audio_features.danceability !== undefined) {
      factors.push(`danceability (${Math.round(track.audio_features.danceability * 100)}%)`);
    }
    
    reasoning += factors.join(', ');
    
    score = Math.min(100, Math.max(0, Math.round(score)));
    
    return {
      ...track,
      match_score: score,
      score: score,
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
  let name = "";
  
  if (intent.genre && intent.genre !== "any") {
    name += intent.genre.charAt(0).toUpperCase() + intent.genre.slice(1) + " ";
  }
  
  if (intent.mood_tags && intent.mood_tags.length > 0) {
    name += intent.mood_tags[0].charAt(0).toUpperCase() + intent.mood_tags[0].slice(1) + " ";
  }
  
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
  
  if (name.length < 10) {
    const date = new Date();
    name += ` - ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
  
  return name.trim();
}
