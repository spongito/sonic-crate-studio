
import { Heart } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// This should match your DB's track row
type TrackType = {
  id: string;
  title: string;
  artist: string[];
  album: string;
  bpm?: number | null;
  key_signature?: string | null;
  image_url?: string | null;
  genre?: string[] | null;
  release_year?: number | null;
  duration?: number;
};

type TrackCardProps = {
  track: TrackType;
  camelot?: boolean; // Show alternate key formats
};

export function TrackCard({ track, camelot }: TrackCardProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(true); // All library tracks are liked by definition
  const [loading, setLoading] = useState(false);

  const handleToggleLike = async () => {
    if (!user) return;
    setLoading(true);
    if (liked) {
      // Unlike: Remove from liked_tracks table
      await supabase
        .from("liked_tracks")
        .delete()
        .eq("user_id", user.id)
        .eq("track_id", track.id);
      setLiked(false);
    } else {
      // Like: Add to liked_tracks table
      await supabase
        .from("liked_tracks")
        .insert({ user_id: user.id, track_id: track.id });
      setLiked(true);
    }
    setLoading(false);
  };

  // Show either key signature or Camelot code (stubbed for now)
  const keyLabel = camelot
    ? camelotFromMusicalKey(track.key_signature)
    : track.key_signature || "—";

  // Helper to format artist arrays
  const artistStr = Array.isArray(track.artist)
    ? track.artist.join(", ")
    : track.artist || "";

  return (
    <div className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3 hover:bg-white/10 transition-all">
      <div className="flex items-center gap-3">
        <img
          src={track.image_url || "/placeholder.svg"}
          alt={track.title}
          className="w-12 h-12 rounded object-cover bg-white/15"
        />
        <div>
          <h3 className="font-semibold text-white">{track.title}</h3>
          <div className="text-sm text-white/60">{artistStr}</div>
        </div>
      </div>
      <div className="hidden md:flex gap-3 items-center">
        <span className="px-2 py-1 text-xs bg-white/10 text-white rounded">{track.bpm || "—"} BPM</span>
        <span className="px-2 py-1 text-xs bg-white/10 text-white rounded">{keyLabel}</span>
        <span className="px-2 py-1 text-xs bg-white/10 text-white rounded">{track.release_year || "—"}</span>
      </div>
      <button
        className={`ml-3 p-1 rounded-full ${liked ? "text-gold" : "text-white/50"} hover:text-gold`}
        onClick={handleToggleLike}
        disabled={loading}
        title={liked ? "Unlike" : "Like"}
      >
        <Heart fill={liked ? "#FFD700" : "none"} className="w-6 h-6" />
      </button>
    </div>
  );
}

// Convert Major/Minor key to Camelot (simplified stub)
function camelotFromMusicalKey(key?: string | null) {
  if (!key) return "—";
  // Proper conversion table recommended
  if (key.includes("C")) return "8A";
  if (key.includes("G")) return "9B";
  if (key.includes("D")) return "10A";
  return key;
}
