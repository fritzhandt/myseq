import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content_key, original_text, target_language, page_path } = await req.json();

    console.log(`Translating "${original_text.substring(0, 50)}..." to ${target_language}`);

    // Return original text if target is English
    if (target_language === 'en') {
      return new Response(
        JSON.stringify({ translated_text: original_text }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if translation already exists in cache
    const { data: existingTranslation } = await supabase
      .from('translations')
      .select('translated_text')
      .eq('content_key', content_key)
      .eq('original_text', original_text)
      .eq('target_language', target_language)
      .eq('source_language', 'en')
      .maybeSingle();

    if (existingTranslation) {
      console.log('Using cached translation');
      return new Response(
        JSON.stringify({ translated_text: existingTranslation.translated_text }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Language names for better prompts
    const languageNames: Record<string, string> = {
      'es': 'Spanish',
      'ht': 'Haitian Creole (Kreyòl)',
      'he': 'Hebrew'
    };

    const targetLanguageName = languageNames[target_language] || target_language;

    // Translate using OpenAI
    const prompt = `You are a professional translator. Translate the following English text to ${targetLanguageName}.

Instructions:
- Maintain the original tone and intent
- Preserve any HTML tags or special formatting exactly as they appear
- For Haitian Creole: Use standard Kreyòl orthography
- For Hebrew: Use proper right-to-left text formatting
- Keep proper nouns unchanged unless they have standard translations
- Preserve line breaks and spacing
- Return ONLY the translated text, no explanations or additional text

Text to translate:
${original_text}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: 'You are a professional translator. Return only the translated text with no additional commentary.' },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`Translation failed: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.choices[0].message.content.trim();

    console.log(`Translation successful: "${translatedText.substring(0, 50)}..."`);

    // Store translation in cache
    const { error: insertError } = await supabase
      .from('translations')
      .upsert({
        content_key,
        original_text,
        translated_text: translatedText,
        source_language: 'en',
        target_language,
        page_path,
      }, {
        onConflict: 'content_key,target_language,source_language,original_text'
      });

    if (insertError) {
      console.error('Error storing translation:', insertError);
    }

    return new Response(
      JSON.stringify({ translated_text: translatedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Translation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});