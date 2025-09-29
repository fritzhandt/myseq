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
    console.log('Processing translation queue...');

    // Get pending translations from queue
    const { data: pendingTranslations, error: fetchError } = await supabase
      .rpc('get_pending_translations', { batch_size: 10 });

    if (fetchError) {
      console.error('Error fetching pending translations:', fetchError);
      throw fetchError;
    }

    if (!pendingTranslations || pendingTranslations.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending translations in queue' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${pendingTranslations.length} pending translations`);

    const languageNames: Record<string, string> = {
      'es': 'Spanish',
      'ht': 'Haitian Creole (Kreyòl)',
      'he': 'Hebrew'
    };

    let processed = 0;
    let errors = 0;

    // Process each translation
    for (const item of pendingTranslations) {
      try {
        // Check if translation already exists (avoid duplicates)
        const { data: existing } = await supabase
          .from('translations')
          .select('id')
          .eq('content_key', item.content_key)
          .eq('original_text', item.original_text)
          .eq('target_language', item.target_language)
          .eq('source_language', 'en')
          .maybeSingle();

        if (existing) {
          // Translation already exists, mark queue item as completed
          await supabase
            .from('translation_queue')
            .update({ 
              status: 'completed', 
              processed_at: new Date().toISOString() 
            })
            .eq('id', item.id);
          processed++;
          continue;
        }

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
            temperature: 0.3,
            max_tokens: 2000,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Translation failed for ${item.target_language}:`, errorText);
          
          // Mark as failed in queue
          await supabase
            .from('translation_queue')
            .update({ 
              status: 'failed', 
              error_message: `OpenAI API error: ${response.status}`,
              processed_at: new Date().toISOString() 
            })
            .eq('id', item.id);
          
          errors++;
          continue;
        }

        const data = await response.json();
        const translatedText = data.choices[0].message.content.trim();

        // Store translation
        const { error: insertError } = await supabase
          .from('translations')
          .insert({
            content_key: item.content_key,
            original_text: item.original_text,
            translated_text: translatedText,
            source_language: 'en',
            target_language: item.target_language,
            page_path: item.page_path,
          });

        if (insertError) {
          console.error('Error storing translation:', insertError);
          await supabase
            .from('translation_queue')
            .update({ 
              status: 'failed', 
              error_message: `Database error: ${insertError.message}`,
              processed_at: new Date().toISOString() 
            })
            .eq('id', item.id);
          errors++;
        } else {
          // Mark as completed in queue
          await supabase
            .from('translation_queue')
            .update({ 
              status: 'completed', 
              processed_at: new Date().toISOString() 
            })
            .eq('id', item.id);
          processed++;
        }

        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`Error processing translation ${item.id}:`, error);
        await supabase
          .from('translation_queue')
          .update({ 
            status: 'failed', 
            error_message: error instanceof Error ? error.message : 'Unknown error',
            processed_at: new Date().toISOString() 
          })
          .eq('id', item.id);
        errors++;
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Translation queue processed',
        processed,
        errors,
        total: pendingTranslations.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Queue processor error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Queue processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});