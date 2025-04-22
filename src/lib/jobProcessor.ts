
import { SupabaseClient } from '@supabase/supabase-js';
import { JobStatus, IntentAnalysis } from '@/types/job';
import { IntentParser } from '@/lib/intent/parser';
import { orchestrateApiCalls } from '@/lib/jobProcessor/apiOrchestrator';

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

    // 2. Parse intent using our IntentParser
    const inputs = {
      prompt: job.prompt,
      platforms: job.settings?.platforms || ['spotify', 'youtube'],
      advancedParams: job.settings
    };
    const intent = IntentParser.parse(inputs);
    console.log(`Intent analyzed for job ${jobId}:`, intent);

    // 3. Orchestrate API calls to process the music request
    // This is where we'll implement our new orchestration logic
    const tracks = await orchestrateApiCalls(supabase, jobId, intent);

    // Return the processed tracks
    return {
      tracks,
      intent
    };

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
