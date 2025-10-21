import { supabase } from '@/integrations/supabase/client';

export const generateAltText = async (imageUrl: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-alt-text', {
      body: { imageUrl }
    });

    if (error) {
      console.error('Error generating alt text:', error);
      return null;
    }

    return data.results?.[0]?.altText || null;
  } catch (error) {
    console.error('Error generating alt text:', error);
    return null;
  }
};

export const generateBulkAltText = async (imageUrls: string[]): Promise<Array<{ url: string; altText: string }>> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-alt-text', {
      body: { imageUrls }
    });

    if (error) {
      console.error('Error generating bulk alt text:', error);
      return [];
    }

    return data.results || [];
  } catch (error) {
    console.error('Error generating bulk alt text:', error);
    return [];
  }
};
