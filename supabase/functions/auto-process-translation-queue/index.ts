import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting auto-process translation queue...');

    // Get pending translations from queue
    const { data: pendingTranslations, error: queueError } = await supabase
      .rpc('get_pending_translations', { batch_size: 50 });

    if (queueError) {
      console.error('Error fetching pending translations:', queueError);
      throw queueError;
    }

    if (!pendingTranslations || pendingTranslations.length === 0) {
      console.log('No pending translations found');
      return new Response(JSON.stringify({ 
        message: 'No pending translations',
        processed: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing ${pendingTranslations.length} pending translations`);

    let completed = 0;
    let failed = 0;

    // Process each translation
    for (const item of pendingTranslations) {
      try {
        // Check if translation already exists
        const { data: existing } = await supabase
          .from('translations')
          .select('id')
          .eq('content_key', item.content_key)
          .eq('target_language', item.target_language)
          .single();

        if (existing) {
          // Mark as completed since translation already exists
          await supabase
            .from('translation_queue')
            .update({ 
              status: 'completed',
              processed_at: new Date().toISOString()
            })
            .eq('id', item.id);
          completed++;
          continue;
        }

        // Call OpenAI for translation
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are a professional translator. Translate the given text to ${item.target_language}. 
                         Maintain the original meaning, tone, and formatting. 
                         Return only the translated text without explanations.
                         Language codes: es=Spanish, ht=Haitian Creole, he=Hebrew`
              },
              {
                role: 'user',
                content: item.original_text
              }
            ],
            max_tokens: 1000,
            temperature: 0.3,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();
        const translatedText = data.choices[0].message.content;

        // Store translation
        await supabase
          .from('translations')
          .insert({
            content_key: item.content_key,
            original_text: item.original_text,
            translated_text: translatedText,
            source_language: 'en',
            target_language: item.target_language,
            page_path: item.page_path,
          });

        // Mark queue item as completed
        await supabase
          .from('translation_queue')
          .update({ 
            status: 'completed',
            processed_at: new Date().toISOString()
          })
          .eq('id', item.id);

        completed++;
        console.log(`Translated: ${item.content_key} -> ${item.target_language}`);

      } catch (error) {
        console.error(`Failed to translate ${item.content_key}:`, error);
        
        // Mark as failed
        await supabase
          .from('translation_queue')
          .update({ 
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
            processed_at: new Date().toISOString()
          })
          .eq('id', item.id);

        failed++;
      }
    }

    console.log(`Auto-processing completed: ${completed} succeeded, ${failed} failed`);

    return new Response(JSON.stringify({ 
      message: 'Auto-processing completed',
      completed,
      failed,
      total: pendingTranslations.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in auto-process-translation-queue function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});