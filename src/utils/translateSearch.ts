import { supabase } from '@/integrations/supabase/client';

/**
 * Translates a search query to English if it's in another language
 * Returns both the original query and the translated query (if different)
 */
export async function translateSearchQuery(query: string): Promise<string[]> {
  // If query is empty or very short, return as-is
  if (!query || query.trim().length < 2) {
    return [query];
  }

  try {
    // Check if the text contains non-ASCII characters (likely non-English)
    const hasNonAscii = /[^\x00-\x7F]/.test(query);
    
    // If it's all ASCII and common English words, skip translation
    if (!hasNonAscii) {
      return [query];
    }

    // Call edge function to translate to English
    const { data, error } = await supabase.functions.invoke('translate-query', {
      body: { query }
    });

    if (error) {
      console.error('Translation error:', error);
      return [query]; // Return original on error
    }

    const translatedQuery = data?.translatedQuery;
    
    // Return both original and translated for better search results
    if (translatedQuery && translatedQuery.toLowerCase() !== query.toLowerCase()) {
      return [query, translatedQuery];
    }

    return [query];
  } catch (error) {
    console.error('Translation failed:', error);
    return [query]; // Fallback to original query
  }
}
