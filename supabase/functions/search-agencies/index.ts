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
    const { query, preferredLevel } = await req.json();
    
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

    // Get PDF content to enhance the search
    const { data: pdfContent } = await supabase
      .from('pdf_content')
      .select('content, hyperlinks')
      .limit(1)
      .single();

    let contextualInfo = '';
    if (pdfContent && pdfContent.content) {
      contextualInfo = `

ADDITIONAL CONTEXT FROM NYC AGENCIES DOCUMENT:
${pdfContent.content}

HYPERLINKS AVAILABLE:
${pdfContent.hyperlinks ? JSON.stringify(pdfContent.hyperlinks, null, 2) : 'None'}

NYC 311 COMPLAINT MAPPINGS:
${pdfContent.hyperlinks && pdfContent.hyperlinks.complaint_311_map ? 
  Object.entries(pdfContent.hyperlinks.complaint_311_map).map(([type, data]) => 
    `${type}: ${data.url} - ${data.description}`
  ).join('\n') : 'None'}

Use this context to better match user queries with the right agencies. For NYC 311 matches, use the specific complaint URLs when available.`;
    }

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

    // Call OpenAI to analyze and rank agencies with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    let openaiResponse;
    try {
      openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
            content: `You are an expert in government services and agencies. Your task is to analyze a user's issue and match it with the most appropriate government agencies.

AGENCIES LIST:
${agencyList}

${contextualInfo}

Instructions:
1. Analyze the user's query and identify which agencies are most relevant
2. Rank agencies by relevance (1-100 confidence score)
3. Only include agencies with confidence score >= 80
${preferredLevel === 'city' ? `
4. SPECIAL NYC 311 PRIORITY RULE: Since the user prefers city-level agencies, ALWAYS check if NYC 311 can handle this issue.
   - If NYC 311 matches AND other city agencies also match, prioritize NYC 311 as the PRIMARY recommendation
   - NYC 311 should be listed FIRST when it's relevant, as it's the direct portal for most NYC complaints
   - Include reasoning that explains NYC 311 is the direct way to report this type of issue to the city
5. For city-level issues, prefer NYC agencies over state or federal ones when multiple levels could apply` : '4. Focus on agencies that match the user\'s preferred government level when possible'}
${preferredLevel === 'city' ? '6' : '5'}. Return results in JSON format with this structure:
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
          max_tokens: 1000,
          temperature: 0.3
        }),
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('OpenAI API fetch error:', fetchError);
      return new Response(
        JSON.stringify({ 
          error: 'AI service timeout or connection error',
          message: 'Please try rephrasing your inquiry with more specific details.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    clearTimeout(timeoutId);

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error('OpenAI API error:', error);
      console.error('OpenAI API status:', openaiResponse.status);
      return new Response(
        JSON.stringify({ error: 'AI analysis failed', details: error }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const aiResult = await openaiResponse.json();
    console.log('Full OpenAI response:', JSON.stringify(aiResult, null, 2));
    
    const aiContent = aiResult.choices?.[0]?.message?.content;
    
    console.log('AI Response:', aiContent);

    // Check for empty or null AI response
    if (!aiContent || aiContent.trim().length === 0) {
      console.error('Empty AI response received');
      return new Response(
        JSON.stringify({
          results: [],
          totalFound: 0,
          message: 'Unable to analyze your query at this time. Please try rephrasing your inquiry with more specific details.',
          confidence: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    let parsedResults;
    try {
      parsedResults = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw AI content:', aiContent);
      
      // Return fallback response instead of error
      return new Response(
        JSON.stringify({
          results: [],
          totalFound: 0,
          message: 'Unable to process your query properly. Please try rephrasing your inquiry with more specific details.',
          confidence: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Map AI results back to agency data
    const matchedAgencies = parsedResults.results.map((result: any) => {
      const agency = agencies[result.agency_index - 1]; // Convert to 0-based index
      
      // If this is NYC 311 and we have PDF content with specific complaint mappings
      let finalWebsite = agency.website;
      if (agency.name === 'NYC 311' && pdfContent && pdfContent.hyperlinks && pdfContent.hyperlinks.complaint_311_map) {
        const complaint311Map = pdfContent.hyperlinks.complaint_311_map;
        
        // Try to match the user's query to a specific complaint type
        const userQuery = query.toLowerCase();
        let bestMatch = null;
        let bestMatchScore = 0;
        
        // Look for keyword matches in complaint types
        for (const [complaintType, data] of Object.entries(complaint311Map)) {
          const typeWords = complaintType.split(/\s+/);
          const queryWords = userQuery.split(/\s+/);
          
          let matchCount = 0;
          for (const typeWord of typeWords) {
            if (queryWords.some(qWord => 
              qWord.includes(typeWord.toLowerCase()) || 
              typeWord.toLowerCase().includes(qWord)
            )) {
              matchCount++;
            }
          }
          
          const matchScore = matchCount / typeWords.length;
          if (matchScore > bestMatchScore && matchScore >= 0.3) {
            bestMatchScore = matchScore;
            bestMatch = data;
          }
        }
        
        if (bestMatch) {
          finalWebsite = bestMatch.url;
          console.log(`Matched 311 query to specific complaint: ${bestMatch.title} -> ${bestMatch.url}`);
        }
      }
      
      return {
        ...agency,
        website: finalWebsite,
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