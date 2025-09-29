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

const TARGET_LANGUAGES = ['es', 'ht', 'he'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting bulk translation process...');

    // Get all unique English content that needs translation
    const { data: existingTranslations, error: fetchError } = await supabase
      .from('translations')
      .select('content_key, original_text, page_path, target_language')
      .eq('source_language', 'en');

    if (fetchError) throw fetchError;

    // Group by content to identify what's missing
    const contentMap = new Map<string, { original_text: string; page_path: string | null; languages: Set<string> }>();
    
    existingTranslations?.forEach(item => {
      const key = `${item.content_key}::${item.original_text}`;
      if (!contentMap.has(key)) {
        contentMap.set(key, {
          original_text: item.original_text,
          page_path: item.page_path,
          languages: new Set()
        });
      }
      contentMap.get(key)!.languages.add(item.target_language);
    });

    // Find missing translations
    const translationsNeeded: Array<{
      content_key: string;
      original_text: string;
      target_language: string;
      page_path: string | null;
    }> = [];

    contentMap.forEach((content, key) => {
      const content_key = key.split('::')[0];
      TARGET_LANGUAGES.forEach(lang => {
        if (!content.languages.has(lang)) {
          translationsNeeded.push({
            content_key,
            original_text: content.original_text,
            target_language: lang,
            page_path: content.page_path
          });
        }
      });
    });

    console.log(`Found ${translationsNeeded.length} translations needed`);

    if (translationsNeeded.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'All content is already translated',
          total: 0,
          completed: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process translations in batches
    let completed = 0;
    const batchSize = 5;
    const languageNames: Record<string, string> = {
      'es': 'Spanish',
      'ht': 'Haitian Creole (Kreyòl)',
      'he': 'Hebrew'
    };

    for (let i = 0; i < translationsNeeded.length; i += batchSize) {
      const batch = translationsNeeded.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (item) => {
        try {
          const targetLanguageName = languageNames[item.target_language];
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
${item.original_text}`;

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

          if (response.ok) {
            const data = await response.json();
            const translatedText = data.choices[0].message.content.trim();

            await supabase.from('translations').upsert({
              content_key: item.content_key,
              original_text: item.original_text,
              translated_text: translatedText,
              source_language: 'en',
              target_language: item.target_language,
              page_path: item.page_path,
            }, {
              onConflict: 'content_key,target_language,source_language,original_text'
            });

            completed++;
            console.log(`Completed ${completed}/${translationsNeeded.length}: ${item.target_language}`);
          } else {
            console.error(`Failed to translate to ${item.target_language}:`, await response.text());
          }
        } catch (err) {
          console.error(`Error translating:`, err);
        }
      }));

      // Small delay between batches to respect rate limits
      if (i + batchSize < translationsNeeded.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Bulk translation completed',
        total: translationsNeeded.length,
        completed
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Bulk translation error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Translation failed';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
