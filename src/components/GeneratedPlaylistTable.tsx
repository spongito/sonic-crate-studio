
import { useState } from "react";
import { Heart, Music } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Minimal track type for table
export type GeneratedTrack = {
  id: string;
  title: string;
  artist: string[];
  album: string;
  platform?: string;
  image_url?: string | null;
  bpm?: number | null;
  key_signature?: string | null;
  genre?: string[] | null;
  release_year?: number | null;
  duration?: number | null;
  isLiked?: boolean; // optional client flag
};

interface Props {
  tracks: GeneratedTrack[];
  userLikedTrackIds?: string[];
  onLikeChange?: (trackId: string, liked: boolean) => void;
  showControls?: boolean; // Controls visibility of Save Playlist and Public buttons
  playlistName?: string;
  fullWidth?: boolean; // Controls container width
  className?: string;
}

export function GeneratedPlaylistTable({
  tracks,
  userLikedTrackIds = [],
  onLikeChange,
  showControls = true,
  playlistName = "",
  fullWidth = true,
  className = "",
}: Props) {
  const { user } = useAuth();
  const [pending, setPending] = useState<{ [trackId: string]: boolean }>({});

  // Compute like state for each track
  function isTrackLiked(id: string): boolean {
    if (!user) return false;
    return userLikedTrackIds.includes(id);
  }

  // Like/Unlike handler
  async function handleLike(track: GeneratedTrack, liked: boolean) {
    if (!user) {
      toast("Sign up or log in to like tracks!", {
        description: "Create an account to save tracks to your library."
      });
      return;
    }
    setPending((prev) => ({ ...prev, [track.id]: true }));
    try {
      if (!liked) {
        // Like: add row in liked_tracks
        await supabase.from("liked_tracks").insert({
          user_id: user.id,
          track_id: track.id,
        });
        toast("Track added to My Library");
        onLikeChange?.(track.id, true);
      } else {
        // Unlike: delete row
        await supabase
          .from("liked_tracks")
          .delete()
          .eq("user_id", user.id)
          .eq("track_id", track.id);
        toast("Track removed from My Library");
        onLikeChange?.(track.id, false);
      }
    } catch (err) {
      toast("Something went wrong", {
        description: "Could not update liked tracks."
      });
    }
    setPending((prev) => ({ ...prev, [track.id]: false }));
  }

  // Format duration for display
  function formatDuration(secs?: number | null) {
    if (!secs || isNaN(secs)) return "—";
    const m = Math.floor(secs / 60);
    const s = Math.round(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  // Get platform icon
  function getPlatformIcon(platform?: string) {
    switch (platform?.toLowerCase()) {
      case "spotify":
        return <span className="inline-block w-5 h-5 bg-green-600 rounded-full" />;
      case "youtube":
        return <span className="inline-block w-5 h-5 bg-red-600 rounded-full" />;
      default:
        return <span className="inline-block w-5 h-5 bg-white/20 rounded-full" />;
    }
  }

  return (
    <div className={`${fullWidth ? "w-full" : ""} ${className}`}>
      {/* Playlist header with controls */}
      {showControls && (
        <div className="flex justify-between items-center mb-4">
          {playlistName && (
            <h2 className="text-2xl font-bold text-gradient">{playlistName}</h2>
          )}
          <div className="flex gap-2">
            <button
              className="px-3 py-1.5 rounded bg-gold/90 hover:bg-gold text-black font-semibold text-sm transition"
            >
              Save Playlist
            </button>
            <button
              className="px-3 py-1.5 rounded border border-white/20 bg-white/10 text-white/80 font-semibold text-sm transition"
            >
              Public
            </button>
          </div>
        </div>
      )}

      <div className="w-full overflow-x-auto bg-black/30 backdrop-blur-sm rounded-md border border-white/10">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b border-white/10 text-left text-sm text-white/60">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Track</th>
              <th className="px-4 py-3 font-medium">Artist</th>
              <th className="px-4 py-3 font-medium">Album</th>
              <th className="px-4 py-3 font-medium">Platform</th>
              <th className="px-4 py-3 font-medium">BPM</th>
              <th className="px-4 py-3 font-medium">Key</th>
              <th className="px-4 py-3 font-medium">Genre</th>
              <th className="px-4 py-3 font-medium">Year</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {tracks.length > 0 ? (
              tracks.map((track, i) => (
                <tr 
                  key={track.id} 
                  className="border-b border-white/5 hover:bg-white/5 transition group"
                >
                  <td className="px-4 py-2 text-sm text-white/70">{i + 1}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      {track.image_url ? (
                        <img
                          src={track.image_url}
                          alt={track.title}
                          className="w-10 h-10 rounded object-cover bg-white/10"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center">
                          <Music className="w-5 h-5 text-white/40" />
                        </div>
                      )}
                      <span className="text-white font-medium">{track.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm text-white/80">
                    {Array.isArray(track.artist) ? track.artist.join(", ") : track.artist}
                  </td>
                  <td className="px-4 py-2 text-sm text-white/60">{track.album || "—"}</td>
                  <td className="px-4 py-2 text-center">
                    {getPlatformIcon(track.platform)}
                  </td>
                  <td className="px-4 py-2 text-sm text-white/70">{track.bpm || "—"}</td>
                  <td className="px-4 py-2 text-sm text-white/70">{track.key_signature || "—"}</td>
                  <td className="px-4 py-2 text-sm text-white/70">
                    {track.genre?.join(", ") || "—"}
                  </td>
                  <td className="px-4 py-2 text-sm text-white/70">{track.release_year || "—"}</td>
                  <td className="px-4 py-2 text-sm text-white/70">{formatDuration(track.duration)}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      aria-label={isTrackLiked(track.id) ? "Unlike" : "Like"}
                      className={`rounded-full p-1 transition 
                        ${isTrackLiked(track.id) ? "text-gold" : "text-white/50 opacity-0 group-hover:opacity-100"} 
                        hover:text-gold`}
                      onClick={() => handleLike(track, isTrackLiked(track.id))}
                      disabled={pending[track.id]}
                      title={isTrackLiked(track.id) ? "Remove from My Library" : "Add to My Library"}
                    >
                      <Heart 
                        fill={isTrackLiked(track.id) ? "#FFD700" : "none"} 
                        className="w-5 h-5" 
                      />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className="p-8 text-center text-white/60">
                  No tracks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
