import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Searching for:', query);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all agencies from database
    const { data: agencies, error: dbError } = await supabase
      .from('government_agencies')
      .select('*')
      .order('name');

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch agencies' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!agencies || agencies.length === 0) {
      return new Response(
        JSON.stringify({ 
          results: [], 
          confidence: 0,
          message: 'No agencies found in database' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create agency list for AI analysis
    const agencyList = agencies.map((agency, index) => 
      `${index + 1}. ${agency.name} (${agency.level}): ${agency.description}`
    ).join('\n\n');

    // Call OpenAI to analyze and rank agencies
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-nano-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `You are an expert in government services and agencies. Your task is to analyze a user's issue and match it with the most appropriate government agencies.

AGENCIES LIST:
${agencyList}

Instructions:
1. Analyze the user's query and identify which agencies are most relevant
2. Rank agencies by relevance (1-100 confidence score)
3. Only include agencies with confidence score >= 80
4. Return results in JSON format with this structure:
{
  "results": [
    {
      "agency_index": number,
      "confidence": number,
      "reasoning": "brief explanation why this agency matches"
    }
  ]
}

Be very precise - only return agencies that truly match the user's issue. If no agency has 80%+ confidence, return empty results array.`
          },
          {
            role: 'user',
            content: `User's issue: "${query}"`
          }
        ],
        max_completion_tokens: 1000
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error('OpenAI API error:', error);
      return new Response(
        JSON.stringify({ error: 'AI analysis failed' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const aiResult = await openaiResponse.json();
    const aiContent = aiResult.choices[0].message.content;
    
    console.log('AI Response:', aiContent);

    let parsedResults;
    try {
      parsedResults = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return new Response(
        JSON.stringify({ error: 'Failed to analyze query' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Map AI results back to agency data
    const matchedAgencies = parsedResults.results.map((result: any) => {
      const agency = agencies[result.agency_index - 1]; // Convert to 0-based index
      return {
        ...agency,
        confidence: result.confidence,
        reasoning: result.reasoning
      };
    }).sort((a: any, b: any) => b.confidence - a.confidence); // Sort by confidence desc

    // Determine how many results to show based on confidence levels
    let resultsToShow = [];
    let message = '';

    if (matchedAgencies.length === 0) {
      message = 'No agencies found that match your issue with sufficient confidence. Please try rephrasing your inquiry with more specific details.';
    } else {
      const topConfidence = matchedAgencies[0].confidence;
      
      if (topConfidence >= 95) {
        // Show 1 result
        resultsToShow = matchedAgencies.slice(0, 1);
      } else if (topConfidence >= 90) {
        // Show 2 results + rephrase message
        resultsToShow = matchedAgencies.slice(0, 2);
        if (resultsToShow.length > 1) {
          message = 'Multiple agencies might be able to help. Consider rephrasing your inquiry to be more specific.';
        }
      } else if (topConfidence >= 80) {
        // Show 3 results + rephrase message
        resultsToShow = matchedAgencies.slice(0, 3);
        if (resultsToShow.length > 1) {
          message = 'Several agencies might be relevant. Try rephrasing your inquiry with more specific details.';
        }
      } else {
        // Show 5 results + rephrase message
        resultsToShow = matchedAgencies.slice(0, 5);
        message = 'Multiple agencies might be able to help. Please rephrase your inquiry to be more specific about your issue.';
      }
    }

    console.log(`Returning ${resultsToShow.length} results with top confidence: ${matchedAgencies[0]?.confidence || 0}`);

    return new Response(
      JSON.stringify({
        results: resultsToShow,
        totalFound: matchedAgencies.length,
        message,
        confidence: matchedAgencies[0]?.confidence || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in search-agencies function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});