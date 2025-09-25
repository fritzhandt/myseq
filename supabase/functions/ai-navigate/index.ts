import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NavigationResponse {
  destination: string;
  searchTerm?: string;
  category?: string;
  dateStart?: string;
  dateEnd?: string;
  success: boolean;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Please provide a search query" 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    const systemPrompt = `You are an AI assistant for Southeast Queens community website. Analyze user queries and determine the best page destination with appropriate filters.

Available pages:
- "/my-elected-lookup" - For finding elected officials
- "/home" - For community events (accepts searchTerm, dateStart, dateEnd)
- "/jobs" - For employment opportunities (accepts searchTerm)
- "/resources" - For community resources (accepts searchTerm, category)
- "/civics" - For civic organizations (accepts searchTerm)

Resource categories: "housing", "healthcare", "education", "social services", "legal services", "financial services", "food assistance", "transportation", "employment", "senior services", "youth services", "disability services", "mental health", "childcare", "immigration", "veterans", "lgbt", "arts", "environment", "sports", "other"

Rules:
1. For elected officials queries: use "/my-elected-lookup"
2. For events/activities: use "/home" with searchTerm and dates if mentioned
3. For jobs/employment: use "/jobs" with searchTerm
4. For resources/services: use "/resources" with searchTerm and appropriate category
5. For civic organizations/community boards: use "/civics" with searchTerm
6. Dates should be in YYYY-MM-DD format
7. Extract keywords for searchTerm from the user query
8. If query is unclear, return error

Respond with JSON only in this format:
{
  "destination": "/page-path",
  "searchTerm": "extracted keywords", 
  "category": "category if resources",
  "dateStart": "YYYY-MM-DD if date mentioned",
  "dateEnd": "YYYY-MM-DD if date range",
  "success": true
}

For errors:
{
  "success": false,
  "error": "explanation message"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-nano-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        max_completion_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorMessage = `OpenAI API error: ${response.status}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI Response:', aiResponse);

    // Parse the AI response
    let navigationResponse: NavigationResponse;
    try {
      navigationResponse = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      navigationResponse = {
        success: false,
        error: "I couldn't understand your request. Please try rephrasing it."
      };
    }

    // Validate the response
    if (navigationResponse.success && !navigationResponse.destination) {
      navigationResponse = {
        success: false,
        error: "I couldn't determine where to direct you. Please be more specific."
      };
    }

    return new Response(JSON.stringify(navigationResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-navigate function:', error);
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