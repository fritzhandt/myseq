import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NavigationResponse {
  destination?: string;
  searchTerm?: string;
  category?: string;
  dateStart?: string;
  dateEnd?: string;
  employer?: string;
  location?: string;
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
    
    console.log('Received query:', query);

    if (!query) {
      console.log('No query provided');
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

    const systemPrompt = `You are an AI assistant for Southeast Queens community website. Analyze user queries and determine the best page destination with appropriate filters.

Available pages:
- "/my-elected-lookup" - For finding elected officials
- "/home" - For community events (accepts searchTerm, dateStart, dateEnd)
- "/jobs" - For employment opportunities (accepts searchTerm, employer, location)
- "/resources" - For community resources (accepts searchTerm, category)
- "/civics" - For civic organizations (accepts searchTerm)

Resource categories: "housing", "healthcare", "education", "social services", "legal services", "financial services", "food assistance", "transportation", "employment", "senior services", "youth services", "disability services", "mental health", "childcare", "immigration", "veterans", "lgbt", "arts", "environment", "sports", "other"

Rules:
1. For elected officials queries: use "/my-elected-lookup"
2. For events/activities: use "/home" with searchTerm and dates if mentioned
3. For jobs/employment: use "/jobs" with appropriate parameters:
   - Extract employer names (e.g., "UBS", "Amazon", "NYC Department", company names)
   - Extract location information (e.g., "Queens", "Manhattan", "Brooklyn", "NYC", specific neighborhoods)
   - For employer-focused queries like "is UBS hiring" or "UBS jobs", set employer and leave searchTerm empty
   - For job title queries like "teacher jobs", set searchTerm and leave employer empty
   - For location-specific queries, extract location
4. For resources/services: use "/resources" with searchTerm and appropriate category
5. For civic organizations/community boards: use "/civics" with searchTerm
6. Dates should be in YYYY-MM-DD format
7. If query is unclear, return error

Respond with JSON only in this format:
{
  "destination": "/page-path",
  "searchTerm": "job title or keywords if applicable", 
  "employer": "company/employer name if mentioned",
  "location": "location if mentioned",
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
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        max_tokens: 800,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorMessage = `OpenAI API error: ${response.status} - ${errorText}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('OpenAI Full Response:', JSON.stringify(data, null, 2));
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('Invalid response from OpenAI API');
    }
    
    const aiResponse = data.choices[0].message.content;

    console.log('AI Response:', aiResponse);

    // Check if aiResponse is empty or null
    if (!aiResponse || aiResponse.trim() === '') {
      console.error('Empty AI response received');
      return new Response(JSON.stringify({
        success: false,
        error: "I received an empty response from the AI. Please try again."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse the AI response
    let navigationResponse: NavigationResponse;
    try {
      // Clean the response in case there are extra characters
      const cleanResponse = aiResponse.trim();
      navigationResponse = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw AI response:', JSON.stringify(aiResponse));
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