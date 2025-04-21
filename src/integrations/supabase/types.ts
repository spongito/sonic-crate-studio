export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      playlist_tracks: {
        Row: {
          created_at: string
          id: string
          match_score: number | null
          playlist_id: string
          position: number
          track_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_score?: number | null
          playlist_id: string
          position: number
          track_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_score?: number | null
          playlist_id?: string
          position?: number
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_tracks_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_tracks_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks_master"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_tracks_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "trending_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          created_at: string
          description: string | null
          genres: string[]
          id: string
          is_public: boolean
          name: string
          prompt: string
          results: Json
          settings: Json | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          genres?: string[]
          id?: string
          is_public?: boolean
          name: string
          prompt?: string
          results?: Json
          settings?: Json | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          genres?: string[]
          id?: string
          is_public?: boolean
          name?: string
          prompt?: string
          results?: Json
          settings?: Json | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          curator_style: string | null
          exports_count: number | null
          full_name: string | null
          id: string
          is_premium: boolean | null
          minutes_spent_digging: number | null
          most_common_genre: string | null
          most_used_prompt: string | null
          playlists_generated: number
          songs_discovered: number | null
          stripe_customer_id: string | null
          subscription_status: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          curator_style?: string | null
          exports_count?: number | null
          full_name?: string | null
          id: string
          is_premium?: boolean | null
          minutes_spent_digging?: number | null
          most_common_genre?: string | null
          most_used_prompt?: string | null
          playlists_generated?: number
          songs_discovered?: number | null
          stripe_customer_id?: string | null
          subscription_status?: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          curator_style?: string | null
          exports_count?: number | null
          full_name?: string | null
          id?: string
          is_premium?: boolean | null
          minutes_spent_digging?: number | null
          most_common_genre?: string | null
          most_used_prompt?: string | null
          playlists_generated?: number
          songs_discovered?: number | null
          stripe_customer_id?: string | null
          subscription_status?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      search_queries: {
        Row: {
          bpm_max: number | null
          bpm_min: number | null
          commercial_factor: number | null
          genre: string | null
          id: string
          length_minutes: number | null
          location: string[] | null
          platforms: string[] | null
          query_text: string | null
          reference_artists: string[] | null
          reference_tracks: string[] | null
          release_year_max: number | null
          release_year_min: number | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          bpm_max?: number | null
          bpm_min?: number | null
          commercial_factor?: number | null
          genre?: string | null
          id?: string
          length_minutes?: number | null
          location?: string[] | null
          platforms?: string[] | null
          query_text?: string | null
          reference_artists?: string[] | null
          reference_tracks?: string[] | null
          release_year_max?: number | null
          release_year_min?: number | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          bpm_max?: number | null
          bpm_min?: number | null
          commercial_factor?: number | null
          genre?: string | null
          id?: string
          length_minutes?: number | null
          location?: string[] | null
          platforms?: string[] | null
          query_text?: string | null
          reference_artists?: string[] | null
          reference_tracks?: string[] | null
          release_year_max?: number | null
          release_year_min?: number | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          id: string
          status: string
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tracks_master: {
        Row: {
          acousticness: number | null
          album: string
          artist: string[]
          bpm: number | null
          created_at: string
          danceability: number | null
          energy: number | null
          external_url: string
          genre: string[] | null
          id: string
          image_url: string | null
          instrumentalness: number | null
          key_signature: string | null
          platform: Database["public"]["Enums"]["platform_type"]
          popularity: number | null
          preview_url: string | null
          release_year: number | null
          spotify_id: string | null
          title: string
          updated_at: string
          valence: number | null
        }
        Insert: {
          acousticness?: number | null
          album: string
          artist: string[]
          bpm?: number | null
          created_at?: string
          danceability?: number | null
          energy?: number | null
          external_url: string
          genre?: string[] | null
          id?: string
          image_url?: string | null
          instrumentalness?: number | null
          key_signature?: string | null
          platform?: Database["public"]["Enums"]["platform_type"]
          popularity?: number | null
          preview_url?: string | null
          release_year?: number | null
          spotify_id?: string | null
          title: string
          updated_at?: string
          valence?: number | null
        }
        Update: {
          acousticness?: number | null
          album?: string
          artist?: string[]
          bpm?: number | null
          created_at?: string
          danceability?: number | null
          energy?: number | null
          external_url?: string
          genre?: string[] | null
          id?: string
          image_url?: string | null
          instrumentalness?: number | null
          key_signature?: string | null
          platform?: Database["public"]["Enums"]["platform_type"]
          popularity?: number | null
          preview_url?: string | null
          release_year?: number | null
          spotify_id?: string | null
          title?: string
          updated_at?: string
          valence?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      trending_tracks: {
        Row: {
          acousticness: number | null
          album: string | null
          artist: string[] | null
          avg_match_score: number | null
          bpm: number | null
          created_at: string | null
          danceability: number | null
          energy: number | null
          external_url: string | null
          id: string | null
          image_url: string | null
          instrumentalness: number | null
          key_signature: string | null
          platform: Database["public"]["Enums"]["platform_type"] | null
          playlist_count: number | null
          popularity: number | null
          preview_url: string | null
          spotify_id: string | null
          title: string | null
          updated_at: string | null
          valence: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_most_common_genre: {
        Args: { user_uuid: string }
        Returns: string
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      platform_type: "spotify" | "apple_music" | "youtube" | "audiomack"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      platform_type: ["spotify", "apple_music", "youtube", "audiomack"],
    },
  },
} as const
