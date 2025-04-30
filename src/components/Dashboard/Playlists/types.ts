
import { Json } from '@/integrations/supabase/types';

export interface DashboardPlaylist {
  id: string;
  name: string;
  cover_image_url?: string;
  created_at: string;
  results: any[];
}

export interface PlaylistFromDB {
  id: string;
  name: string;
  cover_image_url?: string;
  created_at: string;
  results: Json;
  description: string;
  genres: string[];
  is_public: boolean;
  prompt: string;
  settings: Json;
  tags: string[];
  updated_at: string;
  user_id: string;
}
