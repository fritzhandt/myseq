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

interface ResourceSearchRequest {
  query: string;
  category?: string;
}

interface ResourceSearchResponse {
  success: boolean;
  resources?: any[];
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, category }: ResourceSearchRequest = await req.json();
    
    console.log('AI Resource Search - Query:', query, 'Category:', category);

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

    // First, get all resources from the database
    let resourcesQuery = supabase
      .from('resources')
      .select('*');

    // Apply category filter if specified
    if (category) {
      resourcesQuery = resourcesQuery.contains('categories', [category]);
    }

    const { data: allResources, error: resourceError } = await resourcesQuery;

    if (resourceError) {
      console.error('Database error:', resourceError);
      return new Response(JSON.stringify({
        success: false,
        error: "Error fetching resources from database"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    if (!allResources || allResources.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        resources: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Use AI to analyze and match resources
    const systemPrompt = `You are helping a person find community resources. Here are all the available resources. A person may search for services that don't exactly match the organization name or description. Please return related and matching resource IDs.

Return a JSON array of resource IDs that match or are related to the user's query, ordered by relevance:
[
  "resource_id_1",
  "resource_id_2", 
  "resource_id_3"
]

Only include resources that are reasonably related to the search query. If no resources match, return an empty array.`;

    const resourcesForAI = allResources.map(resource => ({
      id: resource.id,
      organization_name: resource.organization_name,
      description: resource.description,
      categories: resource.categories
    }));

    const userPrompt = `User is looking for: "${query}"\n\nAvailable resources:\n${JSON.stringify(resourcesForAI, null, 2)}`;

    console.log('Sending to OpenAI - Resources count:', allResources.length, 'Query:', query);

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

    let matchedResourceIds: string[] = [];
    try {
      // Strip markdown code blocks if present
      let cleanResponse = aiResponse.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Try to parse as array of resource IDs
      const parsed = JSON.parse(cleanResponse);
      if (Array.isArray(parsed)) {
        matchedResourceIds = parsed;
      } else {
        console.error('AI response is not an array:', parsed);
        throw new Error('Invalid AI response format');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw AI response:', aiResponse);
      
      // Fallback to basic text search if AI fails
      const fallbackResources = allResources.filter(resource => {
        const searchText = `${resource.organization_name} ${resource.description} ${resource.categories.join(' ')}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
      });
      
      return new Response(JSON.stringify({
        success: true,
        resources: fallbackResources
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get the full resource data for matched resources
    const finalResources = allResources.filter(resource => matchedResourceIds.includes(resource.id));

    console.log(`Matched ${finalResources.length} resources out of ${allResources.length} total resources`);

    return new Response(JSON.stringify({
      success: true,
      resources: finalResources
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in ai-resource-search function:', error);
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