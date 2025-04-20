
const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');

// Function to search for videos on YouTube
export async function searchYouTubeVideos(query: string, limit = 20) {
  if (!YOUTUBE_API_KEY) {
    console.warn("YouTube API key not configured");
    return [];
  }

  try {
    // Add filters to target audio content only
    const enhancedQuery = `${query} official audio OR visualizer -"music video" -"live" -"reaction" -"cover"`;
    
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(enhancedQuery)}&maxResults=${limit}&type=video&videoCategoryId=10&videoDuration=medium&videoEmbeddable=true&key=${YOUTUBE_API_KEY}`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      console.error(`YouTube API error: ${response.status}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return [];
    }

    const data = await response.json();
    if (!data.items || !Array.isArray(data.items)) {
      console.error("Unexpected YouTube response structure:", data);
      return [];
    }

    // Get video details for additional metadata
    const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!detailsResponse.ok) {
      console.error(`YouTube details API error: ${detailsResponse.status}`);
      return data.items.map((item: any) => formatYouTubeVideo(item));
    }

    const detailsData = await detailsResponse.json();
    const detailsMap = new Map();
    
    if (detailsData.items && Array.isArray(detailsData.items)) {
      detailsData.items.forEach((item: any) => {
        detailsMap.set(item.id, item);
      });
    }

    return data.items
      .map((item: any) => {
        const details = detailsMap.get(item.id.videoId);
        return formatYouTubeVideo(item, details);
      })
      .filter(Boolean);
  } catch (error) {
    console.error("YouTube search error:", error);
    return [];
  }
}

// Function to format YouTube video data for our app
export function formatYouTubeVideo(item: any, details?: any) {
  if (!item || !item.id || !item.id.videoId || !item.snippet) {
    return null;
  }

  try {
    // Extract artist and title from the video title
    const { artist, title } = parseYouTubeVideoTitle(item.snippet.title);
    
    // Calculate audio confidence score
    const audioConfidenceScore = calculateAudioConfidence(item.snippet.title, item.snippet.description);
    
    // Estimate release year (if possible)
    const publishedAt = new Date(item.snippet.publishedAt);
    const releaseYear = publishedAt ? publishedAt.getFullYear() : undefined;
    
    // Duration parsing (if available from details)
    let duration;
    if (details && details.contentDetails && details.contentDetails.duration) {
      duration = formatYouTubeDuration(details.contentDetails.duration);
    }
    
    return {
      id: item.id.videoId,
      youtube_id: item.id.videoId,
      title: title || item.snippet.title,
      artist: artist || item.snippet.channelTitle,
      album: item.snippet.channelTitle, // Using channel as "album" placeholder
      cover_url: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      platform: 'youtube',
      platform_url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      release_year: releaseYear,
      duration: duration,
      audio_confidence_score: audioConfidenceScore,
      audio_features: {
        // YouTube doesn't provide BPM or key, set as undefined
        bpm: undefined,
        key: undefined, 
        mode: undefined
      },
      genre: [] // We don't have genre info from YouTube
    };
  } catch (error) {
    console.error("Error formatting YouTube video:", error);
    return null;
  }
}

// Helper function to parse YouTube titles into artist and track
function parseYouTubeVideoTitle(videoTitle: string): { artist: string; title: string } {
  const cleanTitle = videoTitle
    .replace(/\(Official Audio\)/i, '')
    .replace(/\(Audio\)/i, '')
    .replace(/\(Visualizer\)/i, '')
    .replace(/\(Official Visualizer\)/i, '')
    .replace(/\(Official Video\)/i, '')
    .replace(/\[Official Audio\]/i, '')
    .replace(/\[Audio\]/i, '')
    .trim();
  
  // Common patterns for title formats
  const patterns = [
    // Artist - Title
    /^(.+?)\s*[-–—]\s*(.+)$/,
    // Title by Artist
    /^(.+?)\s*by\s*(.+)$/i
  ];
  
  for (const pattern of patterns) {
    const match = cleanTitle.match(pattern);
    if (match) {
      // First pattern: Artist - Title
      if (pattern === patterns[0]) {
        return { artist: match[1].trim(), title: match[2].trim() };
      }
      // Second pattern: Title by Artist
      else if (pattern === patterns[1]) {
        return { title: match[1].trim(), artist: match[2].trim() };
      }
    }
  }
  
  // Fallback: return the whole string as title, artist unknown
  return { artist: "", title: cleanTitle };
}

// Calculate confidence that the video is audio-only
function calculateAudioConfidence(title: string, description?: string): number {
  let score = 50; // Base score
  
  const lowerTitle = title.toLowerCase();
  const lowerDesc = description?.toLowerCase() || '';
  
  // Positive indicators
  if (lowerTitle.includes('audio') || lowerTitle.includes('visualizer')) score += 20;
  if (lowerTitle.includes('official audio')) score += 10;
  if (lowerDesc.includes('audio') || lowerDesc.includes('listen')) score += 5;
  
  // Negative indicators
  if (lowerTitle.includes('music video')) score -= 30;
  if (lowerTitle.includes('live')) score -= 20;
  if (lowerTitle.includes('cover')) score -= 15;
  
  // Ensure score is within 0-100 range
  return Math.max(0, Math.min(100, score));
}

// Convert ISO 8601 duration to readable format (PT1H2M3S → 1:02:03)
function formatYouTubeDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";
  
  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const seconds = match[3] ? parseInt(match[3], 10) : 0;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
