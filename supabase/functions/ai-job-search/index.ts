import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JobSearchRequest {
  query: string;
  location?: string;
  employer?: string;
  category?: 'city' | 'state';
}

interface JobSearchResponse {
  success: boolean;
  jobs?: any[];
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, location, employer, category }: JobSearchRequest = await req.json();
    
    console.log('AI Job Search - Query:', query, 'Filters:', { location, employer, category });

    if (!query) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Please provide a search query" 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      return new Response(JSON.stringify({
        success: false,
        error: "AI service is not configured properly"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // First, get all jobs from the database
    let jobsQuery = supabase
      .from('jobs')
      .select('*');

    // Apply category filter if specified
    if (category) {
      jobsQuery = jobsQuery.eq('category', category);
    }

    // Apply other filters
    if (location) {
      jobsQuery = jobsQuery.ilike('location', `%${location}%`);
    }
    if (employer) {
      jobsQuery = jobsQuery.ilike('employer', `%${employer}%`);
    }

    const { data: allJobs, error: jobError } = await jobsQuery;

    if (jobError) {
      console.error('Database error:', jobError);
      return new Response(JSON.stringify({
        success: false,
        error: "Error fetching jobs from database"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    if (!allJobs || allJobs.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        jobs: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Use AI to analyze and match jobs based on titles only
    const systemPrompt = `You are helping a person find a job. Here are all the job titles available. A person may type in a job that doesn't exactly match the title. Please return related job titles and matching ones.

Return a JSON array of job IDs that match or are related to the user's query, ordered by relevance:
[
  "job_id_1",
  "job_id_2", 
  "job_id_3"
]

Only include jobs that are reasonably related to the search query. If no jobs match, return an empty array.`;

    const jobTitlesForAI = allJobs.map(job => ({
      id: job.id,
      title: job.title,
      employer: job.employer
    }));

    const userPrompt = `User is looking for: "${query}"\n\nAvailable jobs:\n${JSON.stringify(jobTitlesForAI, null, 2)}`;

    console.log('Sending to OpenAI - Jobs count:', allJobs.length, 'Query:', query);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiData = await response.json();
    console.log('OpenAI response received');

    if (!aiData.choices || !aiData.choices[0] || !aiData.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }

    const aiResponse = aiData.choices[0].message.content;
    console.log('AI Response:', aiResponse);

    let matchedJobIds: string[] = [];
    try {
      // Try to parse as array of job IDs
      const parsed = JSON.parse(aiResponse);
      if (Array.isArray(parsed)) {
        matchedJobIds = parsed;
      } else {
        console.error('AI response is not an array:', parsed);
        throw new Error('Invalid AI response format');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw AI response:', aiResponse);
      
      // Fallback to basic text search if AI fails
      const fallbackJobs = allJobs.filter(job => {
        const searchText = `${job.title} ${job.employer}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
      });
      
      return new Response(JSON.stringify({
        success: true,
        jobs: fallbackJobs
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get the full job data for matched jobs
    const finalJobs = allJobs.filter(job => matchedJobIds.includes(job.id));

    console.log(`Matched ${finalJobs.length} jobs out of ${allJobs.length} total jobs`);

    return new Response(JSON.stringify({
      success: true,
      jobs: finalJobs
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in ai-job-search function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Something went wrong processing your request. Please try again.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});