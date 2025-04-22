
import { supabase } from '@/integrations/supabase/client';
import { Job, JobStatus, IntentAnalysis } from '@/types/job';
import { Track } from '@/types/table';

export class JobProcessor {
  static async createJob(
    prompt: string, 
    jobType: string, 
    settings: Record<string, any> = {}
  ): Promise<Job> {
    // Get the current user session
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
    if (!userId) {
      throw new Error('User must be authenticated to create a job');
    }

    const { data, error } = await supabase
      .from('jobs')
      .insert({
        name: `Job for: ${prompt.slice(0, 50)}...`,
        status: 'pending' as JobStatus,
        job_type: jobType,
        prompt,
        user_username: userId,
        settings,
        partial: false
      })
      .select('*')
      .single();

    if (error) throw new Error(`Failed to create job: ${error.message}`);
    return data as Job;
  }

  static async updateJobStatus(
    jobId: string, 
    status: JobStatus, 
    partialResults?: Track[], 
    errorMessage?: string
  ): Promise<Job> {
    const updateData: Partial<Job> = { 
      status,
      partial: !!partialResults?.length
    };

    if (partialResults) {
      updateData.results = partialResults;
    }

    if (errorMessage) {
      updateData.error_message = errorMessage;
    }

    const { data, error } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', jobId)
      .select('*')
      .single();

    if (error) throw new Error(`Failed to update job: ${error.message}`);
    return data as Job;
  }

  static async checkUserJobConcurrency(
    userId: string, 
    maxConcurrentJobs: number = 3
  ): Promise<boolean> {
    const { count, error } = await supabase
      .from('jobs')
      .select('*', { count: 'exact' })
      .eq('user_username', userId)
      .in('status', ['pending', 'processing', 'analysis']);

    if (error) throw new Error(`Failed to check job concurrency: ${error.message}`);
    return (count || 0) < maxConcurrentJobs;
  }

  static async addJobEvent(
    jobId: string, 
    eventType: string, 
    eventData: Record<string, any>
  ) {
    const { error } = await supabase
      .rpc('add_job_event', {
        p_job_id: jobId,
        p_event_type: eventType,
        p_event_data: eventData
      });

    if (error) throw new Error(`Failed to log job event: ${error.message}`);
  }
}
