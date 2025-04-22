
import { Track } from './table';

export type JobStatus = 
  | 'pending' 
  | 'analysis' 
  | 'processing' 
  | 'merging_results' 
  | 'ready_for_review' 
  | 'done' 
  | 'error';

export type JobType = 
  | 'artist_search' 
  | 'track_search' 
  | 'theme_search' 
  | 'activity_search';

export interface Job {
  id: string;
  name: string;
  status: JobStatus;
  job_type?: JobType;
  prompt: string;
  user_username: string;
  error_message?: string;
  results: Track[];
  settings: Record<string, any>;
  genres: string[];
  audio_features?: Record<string, any>;
  partial: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobEventData {
  job_id: string;
  event_type: string;
  event_data: Record<string, any>;
  created_at: string;
}

export interface IntentAnalysis {
  type: JobType;
  genres: string[];
  bpm_range?: { min: number; max: number };
  energy: number;
  valence: number;
}
