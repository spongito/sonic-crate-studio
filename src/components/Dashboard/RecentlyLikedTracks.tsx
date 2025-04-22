
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

// Sample data for recently liked tracks - in a real app, this would come from the database
const sampleTracks = [
  {
    id: '1',
    title: 'Deep Dive',
    artist: 'Oceanic Waves',
    cover_url: 'https://picsum.photos/seed/track1/60',
    bpm: 124,
    key: 'C Minor',
    year: '2023',
    duration: 367, // in seconds
    liked: true,
  },
  {
    id: '2',
    title: 'Midnight Rush',
    artist: 'Neon Drive',
    cover_url: 'https://picsum.photos/seed/track2/60',
    bpm: 128,
    key: 'G Major',
    year: '2022',
    duration: 392,
    liked: true,
  },
  {
    id: '3',
    title: 'Cosmic Symphony',
    artist: 'Stardust Collective',
    cover_url: 'https://picsum.photos/seed/track3/60',
    bpm: 110,
    key: 'D Minor',
    year: '2023',
    duration: 458,
    liked: true,
  },
  {
    id: '4',
    title: 'Electric Soul',
    artist: 'Voltage',
    cover_url: 'https://picsum.photos/seed/track4/60',
    bpm: 140,
    key: 'A Minor',
    year: '2022',
    duration: 345,
    liked: true,
  },
  {
    id: '5',
    title: 'Summer Breeze',
    artist: 'Coastal Vibes',
    cover_url: 'https://picsum.photos/seed/track5/60',
    bpm: 118,
    key: 'F Major',
    year: '2023',
    duration: 392,
    liked: true,
  },
];

export const RecentlyLikedTracks: React.FC = () => {
  const [likedTracks, setLikedTracks] = useState(sampleTracks);

  const toggleLike = (trackId: string) => {
    setLikedTracks(tracks => 
      tracks.map(track => 
        track.id === trackId 
          ? { ...track, liked: !track.liked } 
          : track
      )
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Recently Liked Tracks</h2>
        <Link 
          to="/library?tab=liked" 
          className="text-xs text-gold hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="space-y-2">
        {likedTracks.map((track) => (
          <div 
            key={track.id}
            className="flex items-center justify-between p-3 rounded-lg transition-all hover:bg-white/5"
          >
            <div className="flex items-center space-x-3">
              <img 
                src={track.cover_url} 
                alt={track.title}
                className="w-12 h-12 rounded object-cover"
              />
              <div>
                <h3 className="font-medium text-white">{track.title}</h3>
                <p className="text-sm text-white/60">{track.artist}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex space-x-4">
                <span className="text-xs bg-white/10 px-2 py-1 rounded">
                  {track.bpm} BPM
                </span>
                <span className="text-xs bg-white/10 px-2 py-1 rounded">
                  {track.key}
                </span>
                <span className="text-xs bg-white/10 px-2 py-1 rounded">
                  {track.year}
                </span>
                <span className="text-xs bg-white/10 px-2 py-1 rounded">
                  {formatDuration(track.duration)}
                </span>
              </div>

              <button
                onClick={() => toggleLike(track.id)}
                className="text-white hover:text-gold transition-colors"
              >
                <Heart 
                  className={track.liked ? "fill-gold text-gold" : "text-white/60"} 
                  size={18} 
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

