
import { useState, useMemo } from "react";
import { Track } from "@/types/table";
import { useLogger } from "@/hooks/useLogger";

export function useLibraryFilters(allTracks: Track[]) {
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [bpmRange, setBpmRange] = useState<[number, number]>([90, 140]);
  const [yearRange, setYearRange] = useState<[number, number]>([1950, new Date().getFullYear()]);
  const [genre, setGenre] = useState("");
  const [keySignature, setKeySignature] = useState("");
  const logger = useLogger("LibraryFilters");

  // Filter tracks based on search and other filters
  const filteredTracks = useMemo(() => {
    if (!allTracks || allTracks.length === 0) return [];
    
    let result = [...allTracks];
    
    // Filter by search term
    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase().trim();
      logger.debug(`Filtering tracks by search term: "${searchLower}"`);
      
      result = result.filter(track => {
        const titleMatch = track.title?.toLowerCase().includes(searchLower);
        const artistMatch = Array.isArray(track.artist) 
          ? track.artist.some(a => a.toLowerCase().includes(searchLower))
          : track.artist?.toLowerCase().includes(searchLower);
        const albumMatch = track.album?.toLowerCase().includes(searchLower);
        
        return titleMatch || artistMatch || albumMatch;
      });
      
      logger.debug(`Found ${result.length} tracks matching search term "${searchLower}"`);
    }
    
    // Filter by date range if specified
    if (dateRange.from || dateRange.to) {
      result = result.filter(track => {
        if (!track.created_at) return false;
        
        const trackDate = new Date(track.created_at);
        
        if (dateRange.from && trackDate < dateRange.from) return false;
        if (dateRange.to && trackDate > dateRange.to) return false;
        
        return true;
      });
    }
    
    // Filter by BPM range if specified
    if (bpmRange && bpmRange.length === 2) {
      result = result.filter(track => {
        if (!track.bpm) return true; // Keep tracks with no BPM info
        return track.bpm >= bpmRange[0] && track.bpm <= bpmRange[1];
      });
    }
    
    // Filter by year range if specified
    if (yearRange && yearRange.length === 2) {
      result = result.filter(track => {
        const year = track.release_year || track.year;
        if (!year) return true; // Keep tracks with no year info
        return year >= yearRange[0] && year <= yearRange[1];
      });
    }
    
    // Filter by genre if specified
    if (genre && genre !== '') {
      const genreLower = genre.toLowerCase();
      result = result.filter(track => {
        if (!track.genre) return false;
        
        if (Array.isArray(track.genre)) {
          return track.genre.some(g => g.toLowerCase().includes(genreLower));
        }
        
        return track.genre.toLowerCase().includes(genreLower);
      });
    }
    
    // Filter by key signature if specified
    if (keySignature && keySignature !== '') {
      result = result.filter(track => {
        if (!track.key_signature) return false;
        return track.key_signature.includes(keySignature);
      });
    }
    
    return result;
  }, [allTracks, search, dateRange, bpmRange, yearRange, genre, keySignature, logger]);

  // Add a separate filter for liked tracks that also applies our filters
  const filteredLikedTracks = useMemo(() => {
    return filteredTracks.filter(track => track.liked);
  }, [filteredTracks]);

  // Create a filter object for debug display
  const filters = {
    search,
    bpmMin: bpmRange[0].toString(),
    bpmMax: bpmRange[1].toString(),
    yearMin: yearRange[0].toString(),
    yearMax: yearRange[1].toString(),
    genre: genre ? [genre] : [],
    key: keySignature,
    energy: [],
    mood: [],
    camelotMode: false
  };

  return {
    showFilters,
    setShowFilters,
    search,
    setSearch,
    dateRange,
    setDateRange,
    bpmRange,
    setBpmRange,
    yearRange,
    setYearRange,
    genre,
    setGenre,
    keySignature,
    setKeySignature,
    filteredTracks,
    filteredLikedTracks,
    filters
  };
}
