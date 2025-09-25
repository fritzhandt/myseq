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
  minSalary?: number;
  maxSalary?: number;
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
    const { query, location, employer, minSalary, maxSalary, category }: JobSearchRequest = await req.json();
    
    console.log('AI Job Search - Query:', query, 'Filters:', { location, employer, minSalary, maxSalary, category });

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

    // Use AI to analyze and match jobs
    const systemPrompt = `You are an AI job matching system. Given a user's search query and a list of job listings, your task is to:

1. Find jobs that semantically match the user's query, even if they don't contain exact keywords
2. Consider related job titles, skills, and responsibilities
3. Score each job on relevance (0-100)
4. Return only jobs with a relevance score of 30 or higher
5. Sort results by relevance score (highest first)

Examples of semantic matching:
- "accountant" should match "bookkeeper", "financial analyst", "accounting clerk"
- "teacher" should match "educator", "instructor", "tutor", "academic specialist" 
- "nurse" should match "healthcare worker", "medical assistant", "patient care"
- "driver" should match "transportation", "delivery", "logistics"

User Query: "${query}"

Respond with a JSON array of job IDs with their relevance scores:
[
  {"id": "job_id", "score": 85, "reason": "Brief explanation of match"},
  {"id": "job_id", "score": 72, "reason": "Brief explanation of match"}
]

Only include jobs with score >= 30. If no jobs meet the threshold, return an empty array.`;

    const jobsForAI = allJobs.map(job => ({
      id: job.id,
      title: job.title || '',
      description: job.description || '',
      employer: job.employer || '',
      location: job.location || ''
    }));

    const userPrompt = `Jobs to analyze:\n${JSON.stringify(jobsForAI, null, 2)}`;

    console.log('Sending to OpenAI - Jobs count:', allJobs.length);

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
        max_tokens: 2000,
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

    let matchedJobs: { id: string; score: number; reason: string }[] = [];
    try {
      matchedJobs = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw AI response:', aiResponse);
      
      // Fallback to basic text search if AI fails
      const fallbackJobs = allJobs.filter(job => {
        const searchText = `${job.title} ${job.description} ${job.employer}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
      });
      
      return new Response(JSON.stringify({
        success: true,
        jobs: fallbackJobs
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Apply salary filters to matched jobs
    let filteredMatchedJobs = matchedJobs;
    if (minSalary || maxSalary) {
      filteredMatchedJobs = matchedJobs.filter(match => {
        const job = allJobs.find(j => j.id === match.id);
        if (!job || !job.salary) return true; // Include jobs without salary info
        
        const salaryStr = job.salary.toString().replace(/[^0-9.-]/g, '');
        const jobSalary = parseFloat(salaryStr);
        
        if (isNaN(jobSalary)) return true; // Include jobs with unparseable salary
        
        if (minSalary && jobSalary < minSalary) return false;
        if (maxSalary && jobSalary > maxSalary) return false;
        
        return true;
      });
    }

    // Get the full job data for matched jobs
    const matchedJobIds = filteredMatchedJobs.map(match => match.id);
    const finalJobs = allJobs
      .filter(job => matchedJobIds.includes(job.id))
      .sort((a, b) => {
        const scoreA = filteredMatchedJobs.find(m => m.id === a.id)?.score || 0;
        const scoreB = filteredMatchedJobs.find(m => m.id === b.id)?.score || 0;
        return scoreB - scoreA; // Sort by score descending
      });

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