import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, imageUrls } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const FRONTEND_URL = Deno.env.get('FRONTEND_URL');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!FRONTEND_URL) {
      throw new Error('FRONTEND_URL is not configured');
    }

    // Handle single or multiple images
    const urls = imageUrls || (imageUrl ? [imageUrl] : []);
    
    if (urls.length === 0) {
      throw new Error('No image URL(s) provided');
    }

    // Helper function to validate and convert URLs
    const toFullUrl = (url: string): string | null => {
      // If it's already a full URL, return as-is
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      // Convert public folder paths to full URLs
      if (url.startsWith('/')) {
        const fullUrl = `${FRONTEND_URL}${url}`;
        console.log('Converted public folder image:', url, '->', fullUrl);
        return fullUrl;
      }
      return url;
    };

    const results = [];

    for (const url of urls) {
      const fullUrl = toFullUrl(url);
      
      // Skip if URL is invalid (null returned for public folder images)
      if (!fullUrl) {
        results.push({ url, altText: '' });
        continue;
      }
      
      console.log('Generating alt text for:', fullUrl);
      
      // Skip unsupported formats
      if (fullUrl.toLowerCase().endsWith('.avif') || fullUrl.toLowerCase().endsWith('.svg')) {
        console.log('Skipping unsupported format:', fullUrl);
        results.push({ url, altText: '' });
        continue;
      }
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Generate a concise, descriptive alt text for this image following WCAG guidelines. Describe what is visible without saying "image of". Keep it under 125 characters. Be specific and informative.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: fullUrl
                  }
                }
              ]
            }
          ],
          max_completion_tokens: 100,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: 'Payment required. Please add credits to your Lovable AI workspace.' }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const errorText = await response.text();
        console.error('AI gateway error:', response.status, errorText);
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      const altText = data.choices?.[0]?.message?.content?.trim() || '';
      
      console.log('Generated alt text:', altText);
      results.push({ url, altText });
    }

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-alt-text function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
