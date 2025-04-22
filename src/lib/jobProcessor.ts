
import { SupabaseClient } from '@supabase/supabase-js';
import { JobStatus, IntentAnalysis } from '@/types/job';
import { IntentService } from '@/lib/intentParser';

/**
 * Process a job by getting the job details, analyzing the intent,
 * and processing the music request
 */
export async function processJob(supabase: SupabaseClient, jobId: string) {
  try {
    // 1. Get job details and update status to processing
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      throw new Error(`Failed to fetch job: ${jobError?.message}`);
    }

    await supabase
      .from('jobs')
      .update({ status: 'processing' as JobStatus })
      .eq('id', jobId);

    // 2. Parse intent using our existing IntentService
    const jobType = IntentService.classifyIntent(job.prompt);
    const intent = IntentService.analyzeIntent(job.prompt, jobType);
    console.log(`Intent analyzed for job ${jobId}:`, intent);

    // 3. Process tracks by calling the edge function
    const platforms = job.settings?.platforms || ['spotify', 'youtube'];
    
    // Call the Supabase edge function to process the music request
    const { data: results, error: processingError } = await supabase.functions.invoke('process-music-request', {
      body: {
        prompt: job.prompt,
        advancedParams: job.settings || {},
        platforms
      }
    });

    if (processingError || !results) {
      throw new Error(`Failed to process music request: ${processingError?.message || 'Unknown error'}`);
    }

    // 4. Update job with results and completed status
    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        status: 'completed' as JobStatus,
        results: results.tracks,
        genres: results.intent?.genres || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    if (updateError) {
      throw new Error(`Failed to update job results: ${updateError.message}`);
    }

    return results;

  } catch (error) {
    console.error(`Error processing job ${jobId}:`, error);

    // Update job with error status
    await supabase
      .from('jobs')
      .update({
        status: 'error' as JobStatus,
        error_message: error.message,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    throw error;
  }
}
