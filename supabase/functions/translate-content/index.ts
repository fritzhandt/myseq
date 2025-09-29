import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content_key, original_text, target_language, page_path } = await req.json();
    
    console.log(`Translating "${original_text}" to ${target_language}`);

    // Check if translation already exists
    const { data: existingTranslation } = await supabase
      .from('translations')
      .select('translated_text')
      .eq('content_key', content_key)
      .eq('original_text', original_text)
      .eq('target_language', target_language)
      .eq('page_path', page_path || null)
      .single();

    if (existingTranslation) {
      console.log('Found cached translation');
      return new Response(JSON.stringify({
        translated_text: existingTranslation.translated_text,
        cached: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Don't translate if target language is English
    if (target_language === 'en') {
      return new Response(JSON.stringify({
        translated_text: original_text,
        cached: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use Google Translate API
    const googleApiKey = Deno.env.get('GOOGLE_TRANSLATE_API_KEY');
    if (!googleApiKey) {
      throw new Error('Google Translate API key not configured');
    }

    const translateUrl = `https://translation.googleapis.com/language/translate/v2?key=${googleApiKey}`;
    
    const response = await fetch(translateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: original_text,
        source: 'en',
        target: target_language,
        format: 'text'
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Google Translate API error:', error);
      throw new Error(`Translation failed: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.data.translations[0].translatedText;

    console.log(`Translation result: "${translatedText}"`);

    // Store translation in database using upsert
    const { error: insertError } = await supabase
      .from('translations')
      .upsert({
        content_key,
        original_text,
        translated_text: translatedText,
        target_language,
        page_path: page_path || null,
        source_language: 'en'
      }, {
        onConflict: 'content_key,original_text,target_language,page_path'
      });

    if (insertError) {
      console.error('Error storing translation:', insertError);
      // Continue anyway - return the translation even if we can't cache it
    }

    return new Response(JSON.stringify({
      translated_text: translatedText,
      cached: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Translation failed',
      translated_text: null
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});