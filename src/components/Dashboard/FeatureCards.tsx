
import React from 'react';
import { Music, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const FeatureCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Discover Music Card */}
      <div className="rounded-xl overflow-hidden bg-gradient-to-br from-gold/80 to-gold-dark shadow-lg">
        <div className="p-6 flex flex-col h-full">
          <h2 className="text-xl font-semibold mb-2 text-black">Discover music that moves you</h2>
          <p className="text-black/70 mb-4">Build playlists with intention. Organize your sound.</p>
          
          <Link to="/library" className="mt-auto">
            <Button 
              className="bg-black/20 hover:bg-black/30 text-black" 
              variant="secondary"
            >
              <Music className="mr-2 h-4 w-4" /> Browse Library
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Create Playlist Card */}
      <div className="rounded-xl overflow-hidden bg-gradient-to-br from-gold/80 to-gold-dark shadow-lg">
        <div className="p-6 flex flex-col h-full">
          <h2 className="text-xl font-semibold mb-2 text-black">Create New Playlist</h2>
          <p className="text-black/70 mb-4">Curate the perfect set for your next gig</p>
          
          <Link to="/music-finder" className="mt-auto">
            <Button 
              className="bg-black/20 hover:bg-black/30 text-black" 
              variant="secondary"
            >
              <Plus className="mr-2 h-4 w-4" /> New Playlist
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
