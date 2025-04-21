
import { useState } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  // Save/visibility features coming soon
}

export function GeneratedPlaylistTable({
  tracks,
  userLikedTrackIds = [],
  onLikeChange,
}: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pending, setPending] = useState<{ [trackId: string]: boolean }>({});

  // Compute like state for each track (real logic)
  function isTrackLiked(id: string): boolean {
    if (!user) return false;
    return userLikedTrackIds.includes(id);
  }

  // Like/Unlike handler
  async function handleLike(track: GeneratedTrack, liked: boolean) {
    if (!user) {
      toast({
        title: "Sign up or log in to like tracks!",
        description: "Create an account to save tracks to your library.",
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
        toast({ title: "Track added to My Library" });
        onLikeChange?.(track.id, true);
      } else {
        // Unlike: delete row
        await supabase
          .from("liked_tracks")
          .delete()
          .eq("user_id", user.id)
          .eq("track_id", track.id);
        toast({ title: "Track removed from My Library" });
        onLikeChange?.(track.id, false);
      }
    } catch (err) {
      toast({
        title: "Something went wrong",
        description: "Could not update liked tracks.",
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

  return (
    <div className="rounded-lg bg-white/5 p-4 border border-white/10 mt-6 overflow-x-auto">
      {/* Placeholders for Save Playlist/Public toggle */}
      <div className="flex justify-end gap-2 mb-4">
        {/* To be fully implemented: */}
        <button
          className="px-3 py-1 rounded bg-gold/80 hover:bg-gold text-black font-semibold text-sm transition disabled:opacity-60"
          disabled
        >
          Save Playlist
        </button>
        <button
          className="px-3 py-1 rounded border border-white/20 bg-white/10 text-white/80 font-semibold text-sm transition disabled:opacity-60"
          disabled
        >
          Public
        </button>
      </div>
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left px-2 py-2 text-xs font-bold text-white/70">#</th>
            <th className="text-left px-2 py-2 text-xs font-bold text-white/70">Track</th>
            <th className="text-left px-2 py-2 text-xs font-bold text-white/70">Artist</th>
            <th className="text-left px-2 py-2 text-xs font-bold text-white/70">Album</th>
            <th className="text-left px-2 py-2 text-xs font-bold text-white/70">Platform</th>
            <th className="text-left px-2 py-2 text-xs font-bold text-white/70">BPM</th>
            <th className="text-left px-2 py-2 text-xs font-bold text-white/70">Key</th>
            <th className="text-left px-2 py-2 text-xs font-bold text-white/70">Genre</th>
            <th className="text-left px-2 py-2 text-xs font-bold text-white/70">Year</th>
            <th className="text-left px-2 py-2 text-xs font-bold text-white/70">Duration</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((track, i) => (
            <tr key={track.id} className="border-b border-white/5 hover:bg-white/10 transition group">
              <td className="px-2 py-2 text-sm text-white/80">{i + 1}</td>
              <td className="px-2 py-2 flex items-center gap-3">
                {track.image_url && (
                  <img
                    src={track.image_url}
                    alt={track.title}
                    className="w-9 h-9 rounded object-cover bg-white/10"
                  />
                )}
                <span className="text-white">{track.title}</span>
              </td>
              <td className="px-2 py-2 text-sm text-white/80">
                {Array.isArray(track.artist) ? track.artist.join(", ") : track.artist}
              </td>
              <td className="px-2 py-2 text-sm text-white/60">{track.album}</td>
              <td className="px-2 py-2 text-sm">
                <span title={track.platform}>
                  {/* Platform icons, e.g. Spotify/Youtube */}
                  {track.platform === "spotify" && <span className="inline-block w-5 h-5 bg-green-600 rounded-full" />}
                  {track.platform === "youtube" && <span className="inline-block w-5 h-5 bg-red-600 rounded-full" />}
                  {!track.platform && <span className="inline-block w-5 h-5 bg-white/20 rounded-full" />}
                </span>
              </td>
              <td className="px-2 py-2 text-sm text-white/80">{track.bpm ?? "—"}</td>
              <td className="px-2 py-2 text-sm text-white/80">{track.key_signature ?? "—"}</td>
              <td className="px-2 py-2 text-sm text-white/80">
                {track.genre?.join(", ") ?? "—"}
              </td>
              <td className="px-2 py-2 text-sm text-white/80">{track.release_year ?? "—"}</td>
              <td className="px-2 py-2 text-sm text-white/80">{formatDuration(track.duration)}</td>
              <td className="px-2 py-2">
                <button
                  aria-label={isTrackLiked(track.id) ? "Unlike" : "Like"}
                  className={`rounded-full p-1 transition 
                    ${isTrackLiked(track.id) ? "text-gold" : "text-white/50"} 
                    hover:text-gold`}
                  onClick={() => handleLike(track, isTrackLiked(track.id))}
                  disabled={pending[track.id]}
                >
                  <Heart fill={isTrackLiked(track.id) ? "#FFD700" : "none"} className="w-6 h-6" />
                </button>
              </td>
            </tr>
          ))}
          {tracks.length === 0 && (
            <tr>
              <td colSpan={11} className="p-8 text-center text-white/70">
                No tracks found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

